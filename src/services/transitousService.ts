import { executarFetch } from './apiClient'

const base = (import.meta.env.VITE_TRANSITOUS_API_URL?.trim() || 'https://api.transitous.org').replace(/\/+$/, '')
const fusoDaAgenda = 'America/Sao_Paulo'
const formatoFuso = new Intl.DateTimeFormat('en', { timeZone: fusoDaAgenda, timeZoneName: 'longOffset' })
const formatoHorario = new Intl.DateTimeFormat('pt-BR', { timeZone: fusoDaAgenda, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const formatoData = new Intl.DateTimeFormat('pt-BR', { timeZone: fusoDaAgenda, day: 'numeric', month: 'short' })

export interface Coordenadas {
  lat: number
  lon: number
}

interface ResultadoEndereco extends Coordenadas {
  name: string
  type: 'ADDRESS' | 'PLACE' | 'STOP'
  country?: string
  street?: string
  houseNumber?: string
  areas?: { name: string; adminLevel: number }[]
}

export interface PontoTrajeto extends Coordenadas {
  nome: string
}

export interface EtapaTrajeto {
  mode: 'BUS' | 'WALK'
  from: { name: string }
  to: { name: string }
  startTime: string
  endTime: string
  duration: number
  displayName?: string
  routeShortName?: string
  headsign?: string
  realTime?: boolean
}

export interface Itinerario {
  startTime: string
  endTime: string
  duration: number
  transfers: number
  legs: EtapaTrajeto[]
}

// A agenda codifica horas locais como se fossem UTC para comparar datas do Java.
export function instanteDaConsulta(horaLocal: number) {
  const local = new Date(horaLocal).toISOString().slice(0, 19)
  const fuso = formatoFuso.formatToParts(horaLocal).find((parte) => parte.type === 'timeZoneName')?.value
  return Date.parse(local + (fuso === 'GMT' ? 'Z' : fuso?.replace('GMT', '') ?? '-03:00'))
}

export function horarioDoTrajeto(instante: string | number) {
  return formatoHorario.format(typeof instante === 'string' ? Date.parse(instante) : instante)
}

export function diaDoTrajeto(instante: string | number) {
  return formatoData.format(typeof instante === 'string' ? Date.parse(instante) : instante)
}

export function estaNaRegiaoDeSaoPaulo(local: Coordenadas) {
  return Number.isFinite(local.lat) && Number.isFinite(local.lon)
    && local.lat >= -24.2 && local.lat <= -23.1 && local.lon >= -47.2 && local.lon <= -45.9
}

function consultar<T>(rota: string, parametros: URLSearchParams, signal: AbortSignal) {
  return executarFetch<T>(`${base}${rota}?${parametros}`, {
    headers: { Accept: 'application/json' }, signal, referrerPolicy: 'origin',
  }, 20_000)
}

export async function localizarEndereco(texto: string, signal: AbortSignal): Promise<PontoTrajeto[]> {
  const parametros = new URLSearchParams({ text: texto.trim().replace(/\s*·\s*/g, ', '),
    language: 'pt', type: 'ADDRESS,PLACE', numResults: '10' })
  const resultados = await consultar<ResultadoEndereco[]>('/api/v1/geocode', parametros, signal)
  const pontos = resultados.flatMap((local) => {
    if (local.country !== 'BR' || !estaNaRegiaoDeSaoPaulo(local) || (local.type !== 'ADDRESS' && local.type !== 'PLACE')) return []
    const logradouro = local.street ? [local.street, local.houseNumber].filter(Boolean).join(', ')
      : local.name.replace(/\s*,?\s+-\s*$/, '').trim()
    const municipio = local.areas?.find((area) => area.adminLevel === 8)?.name
    const bairro = local.areas?.find((area) => area.adminLevel === 9)?.name
    const nome = [logradouro, bairro, municipio].filter(Boolean).join(' · ')
    return [{ lat: local.lat, lon: local.lon, nome }]
  })
  return [...new Map(pontos.map((ponto) => [ponto.nome, ponto])).values()].slice(0, 5)
}

export async function buscarTrajetoDeOnibus(origem: Coordenadas, destino: Coordenadas, chegarAte: number, signal: AbortSignal) {
  const coordenadas = ({ lat, lon }: Coordenadas) => `${lat.toFixed(5)},${lon.toFixed(5)}`
  const parametros = new URLSearchParams({
    fromPlace: coordenadas(origem), toPlace: coordenadas(destino), arriveBy: 'true',
    time: new Date(chegarAte).toISOString(), transitModes: 'BUS', timetableView: 'false',
  })
  const { itineraries } = await consultar<{ itineraries: Itinerario[] }>('/api/v6/plan', parametros, signal)
  const agora = Date.now()
  return itineraries.filter(({ startTime, endTime, legs }) =>
    Date.parse(startTime) >= agora && Date.parse(endTime) <= chegarAte && legs.some((etapa) => etapa.mode === 'BUS'),
  ).toSorted((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime) || a.transfers - b.transfers)[0] ?? null
}
