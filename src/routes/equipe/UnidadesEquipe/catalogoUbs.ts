import { demasService } from '../../../services/demasService'
import type { EstabelecimentoDemas } from '../../../types/demas'
import normalizarBusca from '../../../utils/normalizarBusca'

const municipioSaoPaulo = 355030
const porPagina = 20

let catalogo: EstabelecimentoDemas[] | null = null

export function nomeDoEstabelecimento(local: EstabelecimentoDemas) {
  return local.nome_fantasia?.trim() || local.nome_razao_social?.trim() || ''
}

export function enderecoDoEstabelecimento(local: EstabelecimentoDemas) {
  const logradouro = [local.endereco_estabelecimento?.trim(), local.numero_estabelecimento?.trim()].filter(Boolean).join(', ')
  if (!logradouro) return ''
  return [logradouro, local.bairro_estabelecimento?.trim(), local.codigo_municipio === municipioSaoPaulo ? 'São Paulo - SP' : '']
    .filter(Boolean).join(' · ')
}

export function obterCatalogoUbs() {
  return catalogo
}

export async function carregarCatalogoUbs(signal: AbortSignal, aoReceber: (itens: EstabelecimentoDemas[]) => void) {
  if (catalogo) return catalogo
  const unidades = new Map<number, EstabelecimentoDemas>()
  const porLote = 3

  for (let primeira = 0; ; primeira += porLote) {
    const paginas = await Promise.all(Array.from({ length: porLote }, (_, indice) => demasService.listarEstabelecimentos({
      codigo_municipio: municipioSaoPaulo, codigo_tipo_unidade: 2, status: 1, limit: porPagina, offset: primeira + indice,
    }, signal)))
    signal.throwIfAborted()
    let finalizou = false
    for (const pagina of paginas) {
      for (const unidade of pagina) {
        if (/\b(ubs|usf|unidade basica|centro de saude|posto de saude|unidade de saude da familia)\b/.test(normalizarBusca(nomeDoEstabelecimento(unidade)))) {
          unidades.set(unidade.codigo_cnes, unidade)
        }
      }
      if (pagina.length < porPagina) finalizou = true
    }
    const parciais = [...unidades.values()]
    aoReceber(parciais)
    if (finalizou) {
      catalogo = parciais
      return catalogo
    }
  }
}
