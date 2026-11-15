import { timestampDaAgenda } from '../../../services/agendaPacienteService'
import type { ConsultaComHorario } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { horarioService } from '../../../services/horarioService'
import { listarOfertasDaSolicitacao, ofertaVigente, prazoDaOferta } from '../../../services/propostasDoPaciente'
import { unidadeService } from '../../../services/unidadeService'
import type { Agendamento, ModalidadeAtendimento } from '../../../types/agendamento'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import type { HorarioAtendimento } from '../../../types/horario'
import type { PropostaAtendimento } from '../../../types/proposta'
import type { SolicitacaoAjuda } from '../../../types/solicitacao'
import type { Unidade } from '../../../types/unidade'

export interface HorarioDaProposta {
  horario: HorarioAtendimento | null
  modalidade: ModalidadeAtendimento
  unidade: Unidade | null
}

export interface PropostaDoPaciente {
  proposta: PropostaAtendimento
  pedido: SolicitacaoAjuda
  agendamento: Agendamento
  consultaAtual: HorarioDaProposta
  alternativa: HorarioDaProposta
}

export type SituacaoOferta = 'pendente' | 'aceita' | 'confirmada' | 'recusada' | 'encerrada' | 'cancelada' | 'indisponivel'

const dataHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short' })

export function formatarDataHoraProposta(instante: number) {
  return dataHora.format(instante)
}

export function situacaoDaOferta(item: PropostaDoPaciente, agora: number): SituacaoOferta {
  const { proposta, pedido, agendamento, consultaAtual, alternativa } = item
  const prazo = prazoDaOferta(proposta)

  if (proposta.statusProposta === 'CONFIRMADA') return 'confirmada'
  if (proposta.statusAceitePaciente === 'RECUSADA') return 'recusada'
  if (proposta.statusProposta === 'CANCELADA') return 'cancelada'
  if (proposta.statusProposta === 'EXPIRADA' || (prazo !== null && prazo <= agora)) return 'encerrada'
  if (!ofertaVigente(proposta, agora) || pedido.statusSolicitacao !== 'EM_ANALISE' || agendamento.statusAgendamento !== 'AGENDADO'
    || !consultaAtual.horario || !(timestampDaAgenda(consultaAtual.horario.dataInicio) > agora)
    || !alternativa.horario || !(timestampDaAgenda(alternativa.horario.dataInicio) > agora)) return 'indisponivel'

  return proposta.statusAceitePaciente === 'ACEITA' ? 'aceita' : 'pendente'
}

function dadoOpcional<T>(requisicao: Promise<T>) {
  return requisicao.catch((erro: unknown) => {
    if (erro instanceof ApiError && erro.status === 404) return null
    throw erro
  })
}

export async function carregarPropostasDaSolicitacao(
  pedido: SolicitacaoAjuda,
  consulta: ConsultaComHorario & { unidade: Unidade | null },
  opcoes: OpcoesAutenticadas,
) {
  const { agendamento, horario, unidade } = consulta
  const ofertas = await listarOfertasDaSolicitacao(pedido.idSolicitacao, opcoes)
  const idsHorarios = new Set(ofertas.map((proposta) => proposta.idHorario))
  idsHorarios.delete(horario.idHorario)
  const horarios = new Map<number, HorarioAtendimento | null>([[horario.idHorario, horario]])
  for (const id of idsHorarios) {
    opcoes.signal?.throwIfAborted()
    horarios.set(id, await dadoOpcional(horarioService.buscarPorId(id, opcoes)))
  }

  const idsUnidades = new Set<number>()
  for (const proposta of ofertas) {
    const alternativa = horarios.get(proposta.idHorario)
    if (alternativa && proposta.modalidade === 'PRESENCIAL') idsUnidades.add(alternativa.idUnidade)
  }

  const unidades = new Map<number, Unidade | null>()
  if (agendamento.modalidade === 'PRESENCIAL') {
    unidades.set(horario.idUnidade, unidade)
    idsUnidades.delete(horario.idUnidade)
  }
  for (const id of idsUnidades) {
    opcoes.signal?.throwIfAborted()
    unidades.set(id, await dadoOpcional(unidadeService.buscarPorId(id, opcoes)))
  }

  return ofertas.map((proposta): PropostaDoPaciente => {
    const horarioAlternativo = horarios.get(proposta.idHorario) ?? null
    const localAlternativo = proposta.modalidade === 'PRESENCIAL' && horarioAlternativo
      ? unidades.get(horarioAlternativo.idUnidade) ?? null : null
    return {
      proposta, pedido, agendamento,
      consultaAtual: { horario, modalidade: agendamento.modalidade, unidade },
      alternativa: { horario: horarioAlternativo, modalidade: proposta.modalidade, unidade: localAlternativo },
    }
  })
}
