import type { Credenciais } from '../types/autenticacao'

const API_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')
const TEMPO_LIMITE_JAVA_MS = 240_000

interface OpcoesRequisicao extends RequestInit {
  credenciais?: Credenciais
}

export class ApiError extends Error {
  readonly status: number
  readonly detalhes: unknown

  constructor(mensagem: string, status: number, detalhes: unknown) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.detalhes = detalhes
  }
}

function autorizacaoBasic({ email, senha }: Credenciais): string {
  const bytes = new TextEncoder().encode(`${email.trim()}:${senha}`)
  let dados = ''
  for (const byte of bytes) dados += String.fromCharCode(byte)
  return `Basic ${btoa(dados)}`
}

function mensagemDeErro(detalhes: unknown, status: number): string {
  if (typeof detalhes === 'string' && detalhes.trim()) return detalhes

  if (Array.isArray(detalhes)) {
    const mensagens = detalhes.filter((item) => typeof item === 'string' && item.trim())
    if (mensagens.length) return mensagens.join('\n')
  }

  if (detalhes && typeof detalhes === 'object') {
    const corpo = detalhes as Record<string, unknown>
    const mensagem = [corpo.mensagem, corpo.message, corpo.detail, corpo.error]
      .find((valor): valor is string => typeof valor === 'string' && Boolean(valor.trim()))
    if (mensagem) return mensagem
  }

  return `A API respondeu com o status ${status}.`
}

export async function apiRequest<T>(
  caminho: `/${string}`,
  { credenciais, signal, ...init }: OpcoesRequisicao = {},
): Promise<T> {
  if (!API_URL) throw new Error('Defina VITE_API_URL para conectar à API da ConsultaViva.')

  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json, text/plain')
  if (init.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (credenciais) headers.set('Authorization', autorizacaoBasic(credenciais))

  const cache = (init.method ?? 'GET').toUpperCase() === 'GET' ? init.cache ?? 'no-store' : init.cache
  return executarFetch<T>(`${API_URL}${caminho}`, { ...init, headers, signal, cache }, TEMPO_LIMITE_JAVA_MS)
}

export async function executarFetch<T>(
  url: string,
  { signal, ...init }: RequestInit,
  tempoLimiteMs: number,
): Promise<T> {
  const limite = AbortSignal.timeout(tempoLimiteMs)
  const sinal = signal ? AbortSignal.any([signal, limite]) : limite
  let resposta: Response
  let texto: string

  try {
    resposta = await fetch(url, {
      ...init,
      signal: sinal,
      credentials: 'omit',
    })
    texto = resposta.status === 204 ? '' : await resposta.text()
  } catch (erro) {
    if (signal?.aborted && sinal.reason === signal.reason) throw erro
    if (limite.aborted) throw new Error('A API demorou para responder. Tente novamente.')
    throw new Error('Não foi possível conectar à API. Verifique sua conexão e tente novamente.')
  }

  const tipo = resposta.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
  let dados: unknown = texto || undefined
  if (texto && (tipo === 'application/json' || tipo?.endsWith('+json'))) {
    try {
      dados = JSON.parse(texto) as unknown
    } catch {
      if (resposta.ok) throw new ApiError('A API retornou um JSON inválido.', resposta.status, undefined)
    }
  }

  if (!resposta.ok) throw new ApiError(mensagemDeErro(dados, resposta.status), resposta.status, dados)

  return dados as T
}

export function apiJsonBody(dados: unknown): string {
  return JSON.stringify(dados)
}
