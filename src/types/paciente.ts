import type { LocalDate } from './api'
import type { Credenciais } from './autenticacao'

export interface Paciente {
  idPaciente: number
  nomePaciente: string
  dataNascimento: LocalDate
  telefone: string | null
  email: string | null
}

export type CriarPacienteRequest = Pick<Paciente, 'nomePaciente' | 'dataNascimento'> & {
  telefone?: string | null
  email?: string | null
}

export type CadastroPacienteRequest = Omit<CriarPacienteRequest, 'email'> & Credenciais
