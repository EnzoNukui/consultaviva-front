export interface Credenciais {
  email: string
  senha: string
}

export type Perfil = 'PACIENTE' | 'EQUIPE'

export interface OpcoesAutenticadas {
  credenciais: Credenciais
  signal?: AbortSignal
}
