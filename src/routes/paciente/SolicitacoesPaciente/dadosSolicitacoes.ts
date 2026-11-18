import { agendamentoService } from '../../../services/agendamentoService'
import { carregarAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { listarOfertasDaSolicitacao } from '../../../services/propostasDoPaciente'
import { solicitacaoService } from '../../../services/solicitacaoService'
import type { Agendamento } from '../../../types/agendamento'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import type { PropostaAtendimento } from '../../../types/proposta'
import type { SolicitacaoAjuda } from '../../../types/solicitacao'

const formatoDataHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short',
})

export function dataHoraDaSolicitacao(data: string) {
  return formatoDataHora.format(timestampDaAgenda(data))
}

export function solicitacaoAtiva({ statusSolicitacao }: SolicitacaoAjuda) {
  return statusSolicitacao === 'ABERTA' || statusSolicitacao === 'EM_ANALISE'
}

export function listarSolicitacoesDoAgendamento(idAgendamento: number, opcoes: OpcoesAutenticadas) {
  return solicitacaoService.listarPorAgendamento(idAgendamento, opcoes).catch((erro: unknown) => {
    if (erro instanceof ApiError && erro.status === 404) return []
    throw erro
  })
}

export async function listarSolicitacoesDosAgendamentos(agendamentos: Agendamento[], opcoes: OpcoesAutenticadas) {
  const solicitacoes: SolicitacaoAjuda[] = []

  for (const { idAgendamento } of agendamentos) {
    opcoes.signal?.throwIfAborted()
    const pedidos = await listarSolicitacoesDoAgendamento(idAgendamento, opcoes)
    solicitacoes.push(...pedidos)
  }

  return solicitacoes
}

export async function carregarSolicitacoesPaciente(opcoes: OpcoesAutenticadas) {
  const agendamentos = await agendamentoService.listarDoPaciente(opcoes)
  const solicitacoes = await listarSolicitacoesDosAgendamentos(agendamentos, opcoes)

  const idsComPedido = new Set(solicitacoes.map(({ idAgendamento }) => idAgendamento))
  const { consultas, semHorario } = await carregarAgenda(agendamentos.filter(({ idAgendamento, statusAgendamento }) =>
    statusAgendamento === 'AGENDADO' || idsComPedido.has(idAgendamento),
  ), opcoes)

  solicitacoes.sort((a, b) => Number(solicitacaoAtiva(b)) - Number(solicitacaoAtiva(a))
    || timestampDaAgenda(b.dataAbertura) - timestampDaAgenda(a.dataAbertura))

  return { solicitacoes, consultas, semHorario }
}

export async function carregarOfertasEmAnalise(solicitacoes: SolicitacaoAjuda[], opcoes: OpcoesAutenticadas) {
  const ofertas = new Map<number, PropostaAtendimento[]>()
  for (const { idSolicitacao, statusSolicitacao } of solicitacoes) {
    if (statusSolicitacao !== 'EM_ANALISE') continue
    opcoes.signal?.throwIfAborted()
    ofertas.set(idSolicitacao, await listarOfertasDaSolicitacao(idSolicitacao, opcoes))
  }
  return ofertas
}

export function carregarTiposDificuldade(opcoes: OpcoesAutenticadas) {
  return solicitacaoService.listarTiposDificuldade(opcoes).catch((erro: unknown) => {
    if (erro instanceof ApiError && erro.status === 404) return []
    throw erro
  })
}
