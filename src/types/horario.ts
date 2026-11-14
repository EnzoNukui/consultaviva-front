import type { LocalDateTime } from './api'

export interface HorarioAtendimento {
  idHorario: number
  dataInicio: LocalDateTime
  dataFim: LocalDateTime
  idUnidade: number
  idMembroEquipe: number
}

export type CriarHorarioRequest = Omit<HorarioAtendimento, 'idHorario'>
