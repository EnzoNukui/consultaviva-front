import type { IndicadorSimNao, LocalDateTime } from './api'

export interface PlanoComparecimento {
  idPlano: number
  dataCalculo: LocalDateTime
  origemTrajeto: string
  destinoTrajeto: string
  meioTransporte: string
  nomeFonte: string
  duracaoMinutos: number
  margemMinutos: number
  dataAtendimentoReferencia: LocalDateTime
  dataSaidaSugerida: LocalDateTime
  simulado: IndicadorSimNao
  idAgendamento: number
  idProposta: number | null
}

export type AtualizarPlanoRequest = Pick<
  PlanoComparecimento, 'origemTrajeto' | 'destinoTrajeto' | 'meioTransporte' | 'duracaoMinutos' | 'margemMinutos'
>

export type CriarPlanoRequest = AtualizarPlanoRequest & {
  idAgendamento: number
  idProposta?: number | null
}

export interface HistoricoEvento {
  idEvento: number
  dataEvento: LocalDateTime
  tipoEvento: string
  descricaoEvento: string
  tipoOrigem: string
  idAgendamento: number
  idSolicitacao: number | null
  idProposta: number | null
  idMembroEquipe: number | null
}
