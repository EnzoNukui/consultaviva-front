export interface Unidade {
  idUnidade: number
  nomeUnidade: string
  endereco: string
  codigoCnes?: string | null
}

export type CriarUnidadeRequest = Omit<Unidade, 'idUnidade'>
