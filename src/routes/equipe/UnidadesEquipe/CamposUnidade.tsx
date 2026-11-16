import { useEffect, useRef, useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import Botoes from '../../../components/Botoes/Botoes'
import { ApiError } from '../../../services/apiClient'
import { demasService } from '../../../services/demasService'
import type { Unidade } from '../../../types/unidade'
import { CampoCadastro } from '../CadastroEquipe'

export default function CamposUnidade({ unidade }: { unidade: Unidade | null }) {
  const [nome, setNome] = useState(unidade?.nomeUnidade ?? '')
  const [endereco, setEndereco] = useState(unidade?.endereco ?? '')
  const [cnes, setCnes] = useState('')
  const [resultado, setResultado] = useState<{ nome: string; endereco: string } | null>(null)
  const [erro, setErro] = useState('')
  const [buscando, setBuscando] = useState(false)
  const requisicao = useRef<AbortController | null>(null)
  useEffect(() => () => requisicao.current?.abort(), [])

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
      const logradouro = [local.endereco_estabelecimento, local.numero_estabelecimento].filter(Boolean).join(', ')
      setResultado({ nome: local.nome_fantasia || local.nome_razao_social || '', endereco: [logradouro, local.bairro_estabelecimento].filter(Boolean).join(' · ') })
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
      {!unidade && (
        <details className="mb-4 rounded-lg border border-azul-profundo/15 bg-fundo px-3 py-2">
          <summary className="cursor-pointer py-1 text-body-small font-bold text-turquesa-escuro">Consultar estabelecimento por CNES</summary>
          <p className="mt-2 text-body-small text-azul-profundo/75">
            Busque na DEMAS para preencher o nome e o endereço. Revise os dados antes de salvar.
          </p>
          <div className="my-2 flex flex-wrap items-end gap-2">
            <CampoCadastro rotulo="Código CNES" value={cnes} inputMode="numeric" maxLength={7} disabled={buscando}
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
                if (resultado.endereco) setEndereco(resultado.endereco)
              }} />
            </div>
          )}
        </details>
      )}
      <CampoCadastro rotulo="Nome da unidade" name="nome" required maxLength={100} value={nome}
        onChange={(evento) => setNome(evento.target.value)} />
      <CampoCadastro rotulo="Endereço" name="endereco" required maxLength={250} value={endereco}
        onChange={(evento) => setEndereco(evento.target.value)} />
    </>
  )
}
