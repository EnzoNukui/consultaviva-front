import type {
  EstabelecimentoDemas,
  FiltrosEstabelecimentos,
  PaginacaoDemas,
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

function paginacao({ limit = 20, offset = 0 }: PaginacaoDemas) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 20) {
    throw new RangeError('O limite por página deve ser um inteiro entre 1 e 20.')
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
    const parametros = paginacao({ limit, offset })
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
}
