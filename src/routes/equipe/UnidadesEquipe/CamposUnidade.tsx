import { useEffect, useRef, useState } from 'react'
import { FiMapPin, FiSearch } from 'react-icons/fi'
import Botoes from '../../../components/Botoes/Botoes'
import CampoFormulario from '../../../components/CampoFormulario/CampoFormulario'
import { ApiError } from '../../../services/apiClient'
import { demasService } from '../../../services/demasService'
import type { Unidade } from '../../../types/unidade'
import normalizarBusca from '../../../utils/normalizarBusca'
import { carregarCatalogoUbs, enderecoDoEstabelecimento, nomeDoEstabelecimento, obterCatalogoUbs } from './catalogoUbs'

export default function CamposUnidade({ unidade }: { unidade: Unidade | null }) {
  const [nome, setNome] = useState(unidade?.nomeUnidade ?? '')
  const [endereco, setEndereco] = useState(unidade?.endereco ?? '')
  const [catalogo, setCatalogo] = useState(() => obterCatalogoUbs() ?? [])
  const [catalogoCompleto, setCatalogoCompleto] = useState(() => obterCatalogoUbs() !== null)
  const [falhaCatalogo, setFalhaCatalogo] = useState(false)
  const [nomeEscolhido, setNomeEscolhido] = useState(false)
  const [cnes, setCnes] = useState('')
  const [resultado, setResultado] = useState<{ nome: string; endereco: string } | null>(null)
  const [erro, setErro] = useState('')
  const [buscando, setBuscando] = useState(false)
  const requisicao = useRef<AbortController | null>(null)
  useEffect(() => () => requisicao.current?.abort(), [])
  const termo = normalizarBusca(nome)
  const exibirSugestoes = !unidade && !nomeEscolhido && termo.length >= 3
  const termos = termo.split(/\s+/)
  const sugestoes = exibirSugestoes ? catalogo.filter((local) => {
    const nomeNormalizado = normalizarBusca(nomeDoEstabelecimento(local))
    return termos.every((palavra) => nomeNormalizado.includes(palavra))
  }).toSorted((a, b) => nomeDoEstabelecimento(a).localeCompare(nomeDoEstabelecimento(b), 'pt-BR')).slice(0, 6) : []

  useEffect(() => {
    if (!exibirSugestoes || catalogoCompleto || falhaCatalogo) return
    const controle = new AbortController()
    carregarCatalogoUbs(controle.signal, setCatalogo).then((locais) => {
      if (controle.signal.aborted) return
      setCatalogo(locais)
      setCatalogoCompleto(true)
    }).catch(() => {
      if (!controle.signal.aborted) setFalhaCatalogo(true)
    })
    return () => controle.abort()
  }, [exibirSugestoes, catalogoCompleto, falhaCatalogo])

  async function buscar() {
    if (requisicao.current || !/^\d{7}$/.test(cnes)) return
    const controle = new AbortController()
    requisicao.current = controle
    setResultado(null)
    setErro('')
    setBuscando(true)
    try {
      const local = await demasService.buscarPorCnes(cnes, controle.signal)
      if (controle.signal.aborted) return
      setResultado({ nome: nomeDoEstabelecimento(local), endereco: enderecoDoEstabelecimento(local) })
    } catch (falha) {
      if (!controle.signal.aborted) setErro(falha instanceof ApiError && falha.status === 404
        ? 'Nenhum estabelecimento encontrado para esse CNES.' : 'Não foi possível consultar a DEMAS. Você pode preencher os dados manualmente.')
    } finally {
      requisicao.current = null
      if (!controle.signal.aborted) setBuscando(false)
    }
  }

  return (
    <>
      <CampoFormulario rotulo="Nome da unidade" name="nome" required maxLength={100} value={nome}
        placeholder={!unidade ? 'Digite o nome da UBS' : undefined}
        onChange={(evento) => {
          setNome(evento.target.value)
          setNomeEscolhido(false)
        }} />
      {!unidade && !exibirSugestoes && !nomeEscolhido && (
        <p className="text-caption text-azul-profundo/75">Digite parte do nome para buscar UBS da cidade de São Paulo.</p>
      )}
      {exibirSugestoes && (
        <div className="space-y-2 rounded-lg border border-azul-profundo/15 bg-fundo p-3 text-body-small">
          {sugestoes.length > 0 && (
            <ul aria-label="Sugestões de UBS" className="max-h-48 space-y-1 overflow-auto">
              {sugestoes.map((local) => (
                <li key={local.codigo_cnes}>
                  <button type="button"
                    className="flex min-h-11 w-full cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-menta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-turquesa-escuro"
                    onClick={() => {
                      setNome(nomeDoEstabelecimento(local))
                      setEndereco(enderecoDoEstabelecimento(local))
                      setNomeEscolhido(true)
                    }}>
                    <FiMapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-turquesa-escuro" />
                    <span className="min-w-0 wrap-break-word"><strong className="block">{nomeDoEstabelecimento(local)}</strong>
                      <span className="text-caption text-azul-profundo/75">{enderecoDoEstabelecimento(local) || `CNES ${local.codigo_cnes}`}</span></span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!catalogoCompleto && !falhaCatalogo && <p role="status">Buscando UBS no catálogo do CNES…</p>}
          {catalogoCompleto && !sugestoes.length && <p role="status">Nenhuma UBS encontrada. Tente outro nome ou preencha manualmente.</p>}
          {falhaCatalogo && <div className="space-y-2">
            <p role="status">Não foi possível carregar todo o catálogo. Você também pode usar o código CNES ou preencher manualmente.</p>
            <Botoes texto="Tentar novamente" variante="secundario" onClick={() => setFalhaCatalogo(false)} />
          </div>}
        </div>
      )}
      <CampoFormulario rotulo="Endereço" name="endereco" required maxLength={250} value={endereco}
        onChange={(evento) => setEndereco(evento.target.value)} />
      {!unidade && (
        <details className="rounded-lg border border-azul-profundo/15 bg-fundo px-3 py-2">
          <summary className="cursor-pointer py-1 text-body-small font-bold text-turquesa-escuro">Consultar estabelecimento por CNES</summary>
          <p className="mt-2 text-body-small text-azul-profundo/75">
            Busque na DEMAS para preencher o nome e o endereço. Revise os dados antes de salvar.
          </p>
          <div className="my-2 flex flex-wrap items-end gap-2">
            <CampoFormulario rotulo="Código CNES" value={cnes} inputMode="numeric" maxLength={7} disabled={buscando}
              onKeyDown={(evento) => {
                if (evento.key === 'Enter') {
                  evento.preventDefault()
                  void buscar()
                }
              }}
              onChange={(evento) => {
                setCnes(evento.target.value.replace(/\D/g, ''))
                setResultado(null)
                setErro('')
              }} />
            <Botoes texto="Consultar" variante="secundario" icone={FiSearch} desabilitado={cnes.length !== 7}
              carregando={buscando} onClick={buscar} />
          </div>
          {erro && <p role="alert" className="text-body-small text-critico">{erro}</p>}
          {resultado && (
            <div className="my-3 space-y-2 text-body-small">
              <p role="status" className="wrap-break-word"><strong>{resultado.nome}</strong>{resultado.endereco && ` · ${resultado.endereco}`}</p>
              <Botoes texto="Preencher com esses dados" variante="contornoTurquesa" onClick={() => {
                if (resultado.nome) setNome(resultado.nome)
                setEndereco(resultado.endereco)
                setNomeEscolhido(true)
              }} />
            </div>
          )}
        </details>
      )}
    </>
  )
}
