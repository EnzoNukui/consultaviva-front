export interface Credenciais {
  email: string
  senha: string
}

export type Autorizacao = Credenciais | { token: string }

export type Perfil = 'PACIENTE' | 'EQUIPE'

export interface ContaAutenticada {
  perfil: Perfil
  primeiroNome?: string | null
}

export interface OpcoesAutenticadas {
  autorizacao: Autorizacao
  signal?: AbortSignal
}

export interface Sessao extends ContaAutenticada {
  autorizacao: Autorizacao
}
