import type { LocalDate } from './api'

export interface PaginacaoDemas {
  limit?: number
  /** Índice da página, começando em zero. */
  offset?: number
}

export interface FiltrosEstabelecimentos extends PaginacaoDemas {
  codigo_tipo_unidade?: number
  codigo_uf?: number
  codigo_municipio?: number
  status?: 0 | 1
  estabelecimento_possui_centro_cirurgico?: 0 | 1
  estabelecimento_possui_centro_obstetrico?: 0 | 1
  data_atualizacao?: LocalDate
}

export interface TipoUnidadeDemas {
  codigo_tipo_unidade: number
  descricao_tipo_unidade: string
}

export interface EstabelecimentoDemas {
  codigo_cnes: number
  codigo_estabelecimento_saude: string
  nome_fantasia: string | null
  nome_razao_social: string
  codigo_tipo_unidade: number
  codigo_uf: number
  codigo_municipio: number
  codigo_cep_estabelecimento: string | null
  endereco_estabelecimento: string | null
  numero_estabelecimento: string | null
  bairro_estabelecimento: string | null
  numero_telefone_estabelecimento: string | null
  latitude_estabelecimento_decimo_grau: number | null
  longitude_estabelecimento_decimo_grau: number | null
  descricao_turno_atendimento: string | null
  codigo_motivo_desabilitacao_estabelecimento: string | null
  data_atualizacao: LocalDate | null
}

export interface UbsDemas {
  cnes: string
  nome: string
  ibge: string
  uf: string
  bairro: string | null
  logradouro: string | null
  latitude: string | null
  longitude: string | null
}
