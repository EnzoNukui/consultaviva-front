import type {
  EstabelecimentoDemas,
  FiltrosEstabelecimentos,
  PaginacaoDemas,
  TipoUnidadeDemas,
  UbsDemas,
} from '../types/demas'
import { executarFetch } from './apiClient'

const DEMAS_API_URL = (
  import.meta.env.VITE_DEMAS_API_URL?.trim() || 'https://apidadosabertos.saude.gov.br'
).replace(/\/+$/, '')
const TEMPO_LIMITE_DEMAS_MS = 30_000

function consultar<T>(caminho: string, signal?: AbortSignal) {
  return executarFetch<T>(`${DEMAS_API_URL}${caminho}`, {
    headers: { Accept: 'application/json' },
    signal,
  }, TEMPO_LIMITE_DEMAS_MS)
}

function paginacao({ limit = 20, offset = 0 }: PaginacaoDemas, maximo: number) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > maximo) {
    throw new RangeError(`O limite por página deve ser um inteiro entre 1 e ${maximo}.`)
  }
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new RangeError('O índice da página deve ser um inteiro a partir de zero.')
  }
  return new URLSearchParams({ limit: String(limit), offset: String(offset) })
}

export const demasService = {
  async listarEstabelecimentos(
    {
      limit,
      offset,
      codigo_tipo_unidade,
      codigo_uf,
      codigo_municipio,
      status,
      estabelecimento_possui_centro_cirurgico,
      estabelecimento_possui_centro_obstetrico,
      data_atualizacao,
    }: FiltrosEstabelecimentos = {},
    signal?: AbortSignal,
  ): Promise<EstabelecimentoDemas[]> {
    const parametros = paginacao({ limit, offset }, 20)
    const filtros = {
      codigo_tipo_unidade,
      codigo_uf,
      codigo_municipio,
      status,
      estabelecimento_possui_centro_cirurgico,
      estabelecimento_possui_centro_obstetrico,
      data_atualizacao,
    }
    for (const [nome, valor] of Object.entries(filtros)) {
      if (valor !== undefined) parametros.set(nome, String(valor))
    }
    const resposta = await consultar<{ estabelecimentos: EstabelecimentoDemas[] }>(
      `/cnes/estabelecimentos?${parametros}`, signal,
    )
    return resposta.estabelecimentos
  },

  buscarPorCnes: (codigoCnes: string | number, signal?: AbortSignal) =>
    consultar<EstabelecimentoDemas>(`/cnes/estabelecimentos/${encodeURIComponent(codigoCnes)}`, signal),

  async listarTiposUnidade(signal?: AbortSignal): Promise<TipoUnidadeDemas[]> {
    const resposta = await consultar<{ tipos_unidade: TipoUnidadeDemas[] }>('/cnes/tipounidades', signal)
    return resposta.tipos_unidade
  },

  async listarUbs(opcoes: PaginacaoDemas = {}, signal?: AbortSignal): Promise<UbsDemas[]> {
    const parametros = paginacao(opcoes, 1000)
    const resposta = await consultar<{ ubs: UbsDemas[] }>(
      `/assistencia-a-saude/unidade-basicas-de-saude?${parametros}`, signal,
    )
    return resposta.ubs
  },
}
