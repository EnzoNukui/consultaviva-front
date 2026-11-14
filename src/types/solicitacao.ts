import type { ModalidadeAtendimento } from './agendamento'
import type { LocalDateTime } from './api'

export type SituacaoEncerramento = 'SEM_SOLUCAO' | 'CANCELADA'
export type StatusSolicitacao = 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA' | SituacaoEncerramento

export interface SolicitacaoAjuda {
  idSolicitacao: number
  dataAbertura: LocalDateTime
  dataEncerramento: LocalDateTime | null
  relato: string | null
  statusSolicitacao: StatusSolicitacao
  idAgendamento: number
  idMembroEquipe: number | null
}

export interface TipoDificuldade {
  idDificuldade: number
  nomeDificuldade: string
}

export interface SolicitacaoDificuldade {
  idSolicitacao: number
  idDificuldade: number
}

export interface Disponibilidade {
  idDisponibilidade: number
  dataInicio: LocalDateTime
  dataFim: LocalDateTime
  modalidade: ModalidadeAtendimento | 'AMBAS'
  idSolicitacao: number
}

export type DisponibilidadeRequest = Pick<Disponibilidade, 'dataInicio' | 'dataFim' | 'modalidade'>
export type AtualizarSolicitacaoRequest = Pick<SolicitacaoAjuda, 'relato'>

export interface CriarSolicitacaoRequest {
  idAgendamento: number
  relato?: string | null
  idsDificuldade?: number[]
  disponibilidades: DisponibilidadeRequest[]
}
