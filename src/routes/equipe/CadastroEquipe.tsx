import { useState } from 'react'
import type { ReactNode, SubmitEvent } from 'react'
import { FiPlus, FiSearch } from 'react-icons/fi'
import AvisoOperacao from '../../components/AvisoOperacao/AvisoOperacao'
import Botoes from '../../components/Botoes/Botoes'
import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import { useBuscaAutenticada } from '../../hooks/useBuscaAutenticada'
import type { OpcoesAutenticadas } from '../../types/autenticacao'
import normalizarBusca from '../../utils/normalizarBusca'
import { DialogoAgendaEquipe } from './ControlesAgendaEquipe'
import NavegacaoEquipe from './NavegacaoEquipe'
import { useOperacaoAgendaEquipe } from './useOperacaoAgendaEquipe'

type CadastroProps<T, D> = {
  titulo: string
  singular: string
  plural: string
  genero: 'o' | 'a'
  descricao: string
  carregar: (opcoes: OpcoesAutenticadas) => Promise<T[]>
  inserir: (dados: D, opcoes: OpcoesAutenticadas) => Promise<T>
  atualizar: (id: number, dados: D, opcoes: OpcoesAutenticadas) => Promise<T>
  excluir: (id: number, opcoes: OpcoesAutenticadas) => Promise<void>
  idDoRegistro: (item: T) => number
  nomeDoRegistro: (item: T) => string
  textoDaBusca: (item: T) => string
  resumir: (item: T) => ReactNode
  campos: (item: T | null) => ReactNode
  lerFormulario: (formulario: FormData) => D | string
}
type Acao<T> = { tipo: 'novo' } | { tipo: 'editar' | 'excluir'; item: T }

export default function CadastroEquipe<T, D>(config: CadastroProps<T, D>) {
  const { resultado, tentarNovamente } = useBuscaAutenticada(config.carregar)
  const { ocupado, erro, setErro, executar } = useOperacaoAgendaEquipe()
  const [busca, setBusca] = useState('')
  const [acao, setAcao] = useState<Acao<T> | null>(null)
  const [mensagem, setMensagem] = useState('')
  const termo = normalizarBusca(busca)
  const registros = resultado?.status === 'sucesso' ? resultado.dados
    .filter((item) => normalizarBusca(config.textoDaBusca(item)).includes(termo))
    .toSorted((a, b) => config.nomeDoRegistro(a).localeCompare(config.nomeDoRegistro(b), 'pt-BR')) : []
  const itemAtual = acao && acao.tipo !== 'novo' ? acao.item : null

  function abrir(novaAcao: Acao<T>) {
    setErro('')
    setMensagem('')
    setAcao(novaAcao)
  }

  function concluir(texto: string) {
    setAcao(null)
    setMensagem(texto)
    tentarNovamente()
  }

  function salvar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!acao || acao.tipo === 'excluir') return
    const dados = config.lerFormulario(new FormData(evento.currentTarget))
    if (typeof dados === 'string') {
      setErro(dados)
      return
    }
    const edicao = acao.tipo === 'editar' ? config.idDoRegistro(acao.item) : null
    void executar(async (opcoes) => {
      const salvo = edicao === null ? await config.inserir(dados, opcoes) : await config.atualizar(edicao, dados, opcoes)
      if (!salvo || !config.idDoRegistro(salvo) || (edicao !== null && config.idDoRegistro(salvo) !== edicao)) {
        throw new Error('A API não confirmou o cadastro.')
      }
    }, () => {
      setBusca('')
      concluir(edicao === null ? `Cadastro de ${config.singular} concluído.` : 'Cadastro atualizado.')
    })
  }

  function excluir() {
    if (acao?.tipo !== 'excluir') return
    void executar((opcoes) => config.excluir(config.idDoRegistro(acao.item), opcoes), () => concluir('Cadastro excluído.'))
  }

  const tituloDialogo = acao?.tipo === 'excluir' ? 'Excluir' : acao?.tipo === 'editar' ? 'Editar' : 'Cadastrar'
  return (
    <>
      <header className="mb-5">
        <h1 className="text-h1">Cadastros</h1>
        <p className="mt-2 text-body-small text-azul-profundo/80">Gerencie os pacientes e as unidades usados nos agendamentos.</p>
      </header>
      <NavegacaoEquipe secao="cadastros" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-h3">{config.titulo}</h2>
          <p className="mt-1 text-body-small text-azul-profundo/80">{config.descricao}</p>
        </div>
        {resultado?.status === 'sucesso' && <Botoes texto={`Cadastrar ${config.singular}`} icone={FiPlus} onClick={() => abrir({ tipo: 'novo' })} />}
      </div>
      <AvisoOperacao mensagem={mensagem} />
      {resultado === null && <LoadingState mensagem={`Carregando ${config.plural}…`} />}
      {resultado?.status === 'erro' && <ErrorState mensagem={`Não foi possível carregar ${config.plural}.`} tentarNovamente={tentarNovamente} />}
      {resultado?.status === 'sucesso' && (
        <>
          {resultado.dados.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-azul-profundo/25 bg-superficie px-3 focus-within:outline-2 focus-within:outline-turquesa-escuro">
                <FiSearch aria-hidden="true" className="size-4 shrink-0 text-turquesa-escuro" />
                <span className="sr-only">Buscar {config.plural}</span>
                <input type="search" className="min-h-11 w-full min-w-0 text-body-small outline-none" placeholder={`Buscar ${config.plural}`}
                  value={busca} onChange={(evento) => setBusca(evento.target.value)} />
              </label>
              <p role="status" className="text-body-small text-azul-profundo/75">{registros.length} {registros.length === 1 ? config.singular : config.plural}</p>
            </div>
          )}
          {registros.length === 0 ? (
            <EmptyState titulo={termo ? 'Nenhum resultado' : `Nenhum${config.genero === 'a' ? 'a' : ''} ${config.singular} cadastrad${config.genero}`}
              mensagem={termo ? 'Experimente outro termo de busca.' : `Use o botão Cadastrar ${config.singular} para adicionar o primeiro registro.`} />
          ) : (
            <ul className="divide-y divide-azul-profundo/10 overflow-hidden rounded-xl border border-azul-profundo/15 bg-superficie">
              {registros.map((item) => (
                <li key={config.idDoRegistro(item)} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                  <div className="min-w-0 flex-1 basis-55 wrap-break-word">
                    <p className="font-bold">{config.nomeDoRegistro(item)}</p>
                    {config.resumir(item)}
                  </div>
                  <div role="group" aria-label={`Ações para ${config.nomeDoRegistro(item)}`} className="flex flex-wrap gap-2">
                    <Botoes texto="Editar" variante="contornoTurquesa" onClick={() => abrir({ tipo: 'editar', item })} />
                    <Botoes texto="Excluir" variante="discreto" onClick={() => abrir({ tipo: 'excluir', item })} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {acao && (
        <DialogoAgendaEquipe titulo={`${tituloDialogo} ${config.singular}`} ocupado={ocupado} erro={erro} aoFechar={() => setAcao(null)}>
          {acao.tipo === 'excluir' ? (
            <>
              <p className="mb-5 wrap-break-word">Confirma a exclusão do cadastro de <strong>{config.nomeDoRegistro(acao.item)}</strong>?</p>
              <div className="flex flex-wrap justify-end gap-2">
                <Botoes texto="Voltar" variante="secundario" desabilitado={ocupado} onClick={() => setAcao(null)} />
                <Botoes texto="Excluir cadastro" variante="critico" carregando={ocupado} onClick={excluir} />
              </div>
            </>
          ) : (
            <form onSubmit={salvar}>
              <fieldset disabled={ocupado} className="min-w-0 space-y-3">{config.campos(itemAtual)}</fieldset>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Botoes texto="Voltar" variante="secundario" desabilitado={ocupado} onClick={() => setAcao(null)} />
                <Botoes texto="Salvar cadastro" tipo="submit" carregando={ocupado} />
              </div>
            </form>
          )}
        </DialogoAgendaEquipe>
      )}
    </>
  )
}
