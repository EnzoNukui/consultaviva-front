export interface Unidade {
  idUnidade: number
  nomeUnidade: string
  endereco: string
}

export type CriarUnidadeRequest = Omit<Unidade, 'idUnidade'>
