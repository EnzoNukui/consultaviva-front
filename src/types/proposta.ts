import type { ModalidadeAtendimento } from './agendamento'
import type { LocalDateTime } from './api'

export type TipoAlternativa = 'MANUTENCAO' | 'REMARCACAO' | 'CONVERSAO' | 'REMARCACAO_CONVERSAO'
export type StatusProposta = 'EM_ANALISE' | 'OFERTADA' | 'CONFIRMADA' | 'EXPIRADA' | 'CANCELADA'
export type StatusAutorizacao = 'PENDENTE' | 'AUTORIZADA' | 'NEGADA' | 'NAO_APLICAVEL'
export type StatusAceitePaciente = 'PENDENTE' | 'ACEITA' | 'RECUSADA'

export interface PropostaAtendimento {
  idProposta: number
  tipoAlternativa: TipoAlternativa
  modalidade: ModalidadeAtendimento
  justificativa: string
  dataCriacao: LocalDateTime
  statusProposta: StatusProposta
  statusAutorizacao: StatusAutorizacao
  dataAutorizacao: LocalDateTime | null
  statusAceitePaciente: StatusAceitePaciente
  dataResposta: LocalDateTime | null
  dataInicioReserva: LocalDateTime | null
  dataFimReserva: LocalDateTime | null
  dataLimiteAceite: LocalDateTime | null
  dataConfirmacao: LocalDateTime | null
  idSolicitacao: number
  idHorario: number
  idAnalista: number | null
  idAutorizador: number | null
}

export type AtualizarPropostaRequest = Pick<PropostaAtendimento, 'justificativa'>
