import type { IndicadorSimNao } from './api'

export interface MembroEquipe {
  idMembroEquipe: number
  nomeMembroEquipe: string
  cargo: string
  atendimento: IndicadorSimNao
  apoioAdministrativo: IndicadorSimNao
  autorizaModalidade: IndicadorSimNao
  registroProfissional: string | null
}

export type CriarMembroEquipeRequest = Omit<MembroEquipe, 'idMembroEquipe' | 'registroProfissional'> & {
  registroProfissional?: string | null
}
