import { useEffect, useRef, useState } from 'react'
import { FiCalendar, FiCheckCircle, FiChevronDown, FiClock, FiInbox, FiRefreshCw, FiSearch } from 'react-icons/fi'
import Botoes from '../../../components/Botoes/Botoes'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useSessao } from '../../../components/SessaoProvider/sessao'
import { useBuscaAutenticada } from '../../../hooks/useBuscaAutenticada'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { solicitacaoService } from '../../../services/solicitacaoService'
import type { SolicitacaoAjuda } from '../../../types/solicitacao'
import normalizarBusca from '../../../utils/normalizarBusca'
import { carregarFilaEquipe, consultaAindaAgendada, resumirPedido } from './dadosVisaoGeral'
import type { PedidoDaFila } from './dadosVisaoGeral'

const filtros = [
  { id: 'abertas', rotulo: 'Aguardando análise', Icone: FiInbox },
  { id: 'analise', rotulo: 'Em análise', Icone: FiClock },
  { id: 'aceitas', rotulo: 'Aceites vigentes', Icone: FiCheckCircle },
] as const
type Filtro = 'todas' | (typeof filtros)[number]['id']

const formatoData = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short',
})
const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro'
const colunas = 'sm:grid-cols-[minmax(0,1.12fr)_minmax(0,0.85fr)_minmax(0,1fr)_auto]'

export default function InicioEquipe() {
  const { sessao, definirSessao } = useSessao()
  const { resultado, tentarNovamente } = useBuscaAutenticada(carregarFilaEquipe)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busca, setBusca] = useState('')
  const [atualizados, setAtualizados] = useState<Record<number, SolicitacaoAjuda>>({})
  const [iniciando, setIniciando] = useState<number | null>(null)
  const [retorno, setRetorno] = useState<{ erro: boolean; mensagem: string } | null>(null)
  const [agora, setAgora] = useState(agoraNaAgenda)
  const requisicao = useRef<AbortController | null>(null)

  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(agoraNaAgenda()), 30_000)
    return () => {
      window.clearInterval(relogio)
      requisicao.current?.abort()
    }
  }, [])

  const fila = resultado?.status === 'sucesso' ? resultado.dados
    .map((item) => resumirPedido({ ...item, pedido: atualizados[item.pedido.idSolicitacao] ?? item.pedido }, agora))
    .sort((a, b) => {
      const prioridade = { aceitas: 0, abertas: 1, analise: 2 }
      return Number(b.consultaAtiva) - Number(a.consultaAtiva)
        || prioridade[a.grupo] - prioridade[b.grupo] || (a.prazo ?? 0) - (b.prazo ?? 0)
        || (a.inicio ?? Infinity) - (b.inicio ?? Infinity)
        || timestampDaAgenda(a.pedido.dataAbertura) - timestampDaAgenda(b.pedido.dataAbertura)
    }) : []
  const totais = { abertas: 0, analise: 0, aceitas: 0 }
  for (const { grupo } of fila) totais[grupo]++
  const termo = normalizarBusca(busca)
  const pedidosVisiveis = fila.filter(({ grupo, paciente, pedido }) =>
    (filtro === 'todas' || filtro === grupo)
    && normalizarBusca(`${paciente ?? ''} #${pedido.idSolicitacao}`).includes(termo),
  )

  function atualizarFila() {
    setAtualizados({})
    setRetorno(null)
    setAgora(agoraNaAgenda())
    tentarNovamente()
  }

  async function iniciarAnalise(item: PedidoDaFila) {
    if (!sessao || requisicao.current || item.pedido.statusSolicitacao !== 'ABERTA') return
    if (!consultaAindaAgendada(item)) {
      setAgora(agoraNaAgenda())
      setRetorno({ erro: true, mensagem: 'A consulta já começou ou está indisponível para análise.' })
      return
    }

    const id = item.pedido.idSolicitacao
    const controle = new AbortController()
    requisicao.current = controle
    setIniciando(id)
    setRetorno(null)
    try {
      const atualizado = await solicitacaoService.iniciarAnalise(id, { autorizacao: sessao.autorizacao, signal: controle.signal })
      if (controle.signal.aborted) return
      if (atualizado?.idSolicitacao !== id || atualizado.statusSolicitacao !== 'EM_ANALISE') {
        throw new Error('A API não confirmou o início da análise.')
      }
      setAtualizados((anteriores) => ({ ...anteriores, [id]: atualizado }))
      setRetorno({ erro: false, mensagem: `A solicitação #${id} está em análise.` })
    } catch (erro) {
      if (controle.signal.aborted) return
      if (erro instanceof ApiError && erro.status === 401) {
        definirSessao(null)
        return
      }
      const mensagem = erro instanceof ApiError && erro.status === 403
        ? erro.message : 'Não foi possível iniciar a análise. Atualize a fila para conferir o pedido.'
      setRetorno({ erro: true, mensagem })
    } finally {
      requisicao.current = null
      if (!controle.signal.aborted) setIniciando(null)
    }
  }

  return (
    <>
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1">Visão geral</h1>
          <p className="mt-2 text-body-small text-azul-profundo/80">Acompanhe os pedidos de ajuda e veja quais precisam de atenção da equipe.</p>
        </div>
        <Botoes texto="Atualizar fila" variante="secundario" icone={FiRefreshCw} onClick={atualizarFila}
          desabilitado={resultado === null || iniciando !== null} />
      </header>

      {resultado === null ? <LoadingState mensagem="Carregando a fila de solicitações…" />
        : resultado.status === 'erro' ? <ErrorState mensagem="Não foi possível carregar a fila da equipe." tentarNovamente={atualizarFila} /> : (
          <>
            <div role="group" aria-label="Filtrar solicitações por situação" className="mb-7 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
              {filtros.map(({ id, rotulo, Icone }) => (
                <button key={id} type="button" aria-pressed={filtro === id} aria-controls="fila-equipe"
                  onClick={() => setFiltro((atual) => atual === id ? 'todas' : id)}
                  className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border border-azul-profundo/15 bg-superficie p-3.5 text-left hover:border-turquesa-escuro/60 aria-pressed:border-turquesa-escuro aria-pressed:bg-menta sm:items-start sm:p-4 ${foco}`}>
                  <Icone aria-hidden="true" className="size-5 shrink-0 text-turquesa-escuro sm:mt-1" />
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-0.5 sm:flex-col sm:items-start">
                    <span className="text-h3 leading-none font-bold tabular-nums">{totais[id]}</span>
                    <span className="text-body-small font-semibold wrap-break-word">{rotulo}</span>
                  </span>
                </button>
              ))}
            </div>

            <section id="fila-equipe" aria-labelledby="titulo-fila-equipe">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 id="titulo-fila-equipe" className="text-h3">Fila de solicitações</h2>
                  <p role="status" className="mt-1 text-body-small text-azul-profundo/75">
                    {pedidosVisiveis.length === 1 ? '1 solicitação' : `${pedidosVisiveis.length} solicitações`}
                  </p>
                </div>
                {fila.length > 0 && (
                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    {filtro !== 'todas' && <Botoes texto="Ver todas" variante="secundario" onClick={() => setFiltro('todas')} />}
                    <div className="relative min-w-0 flex-1 sm:flex-none">
                      <FiSearch aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-turquesa-escuro" />
                      <label htmlFor="buscar-pedido-equipe" className="sr-only">Buscar por paciente ou número do pedido</label>
                      <input id="buscar-pedido-equipe" type="search" value={busca} onChange={(evento) => setBusca(evento.target.value)}
                        placeholder="Buscar paciente ou pedido"
                        className={`min-h-11 w-full rounded-lg border border-azul-profundo/25 bg-superficie py-2 pr-3 pl-9 text-body-small sm:w-61 ${foco}`} />
                    </div>
                  </div>
                )}
              </div>

              {retorno && (
                <p role={retorno.erro ? 'alert' : 'status'}
                  className={`mb-3 rounded-md px-3 py-2 text-body-small font-semibold ${retorno.erro ? 'bg-critico/10 text-critico' : 'bg-menta text-turquesa-escuro'}`}>
                  {retorno.mensagem}
                </p>
              )}
              {fila.length === 0 ? (
                <EmptyState titulo="Nenhuma solicitação na fila" mensagem="Quando houver um pedido de ajuda para acompanhar, ele aparecerá aqui." />
              ) : pedidosVisiveis.length === 0 ? (
                <p className="rounded-lg border border-azul-profundo/15 bg-superficie px-4 py-5 text-body-small">
                  Nenhum pedido corresponde à busca ou à situação selecionada.
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-azul-profundo/15 bg-superficie">
                  <div aria-hidden="true" className={`hidden gap-4 border-b border-azul-profundo/10 bg-menta px-4 py-2.5 text-body-small font-bold text-turquesa-escuro sm:grid ${colunas}`}>
                    <span>Paciente</span><span>Consulta</span><span>Situação</span><span className="w-5" />
                  </div>
                  <ul aria-label="Solicitações na fila" className="divide-y divide-azul-profundo/10">
                    {pedidosVisiveis.map((item) => (
                      <li key={item.pedido.idSolicitacao}>
                        <SolicitacaoNaFila item={item} iniciando={iniciando} aoIniciar={iniciarAnalise} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </>
        )}
    </>
  )
}

function SolicitacaoNaFila({ item, iniciando, aoIniciar }: {
  item: ReturnType<typeof resumirPedido>
  iniciando: number | null
  aoIniciar: (item: PedidoDaFila) => void
}) {
  const { pedido, paciente, inicio, agendamento, consultaAtiva, prazo, grupo, aguardandoResposta } = item
  const idPaciente = agendamento?.idPaciente
  const nome = paciente?.trim() || (idPaciente ? `Paciente #${idPaciente}` : 'Paciente indisponível')
  const situacao = grupo === 'aceitas' ? 'Aceite recebido' : grupo === 'abertas' ? 'Aguardando análise'
    : aguardandoResposta ? 'Aguardando o paciente' : 'Em análise'
  const proximaAcao = grupo === 'aceitas' ? 'Próximo passo: confirmar a proposta'
    : grupo === 'abertas' && consultaAtiva ? 'Próximo passo: iniciar análise' : ''

  return (
    <details className="group">
      <summary className={`grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 px-4 py-3.5 hover:bg-fundo group-open:bg-fundo focus-visible:-outline-offset-2 ${foco} ${colunas} [&::-webkit-details-marker]:hidden`}>
        <div className="min-w-0">
          <p className="font-bold wrap-break-word">{nome}</p>
          <p className="text-caption text-azul-profundo/75">Pedido #{pedido.idSolicitacao}</p>
        </div>
        <div className="col-start-1 min-w-0 text-body-small sm:col-start-auto">
          <p className="flex items-center gap-1.5 font-semibold">
            <FiCalendar aria-hidden="true" className="size-4 shrink-0 text-turquesa-escuro sm:hidden" />
            {inicio !== null && Number.isFinite(inicio) ? formatoData.format(inicio) : 'Horário indisponível'}
          </p>
          {agendamento && (
            <p className="text-caption text-azul-profundo/75">
              {agendamento.modalidade === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
            </p>
          )}
        </div>
        <div className="col-start-1 min-w-0 sm:col-start-auto">
          <span className={`block w-fit rounded-md px-2 py-1 text-caption font-bold ${grupo === 'abertas' ? 'bg-areia text-azul-profundo' : 'bg-menta text-turquesa-escuro'}`}>
            {situacao}
          </span>
          {proximaAcao && <p className="mt-1 text-caption text-azul-profundo/75">{proximaAcao}</p>}
          {prazo !== null && (
            <p className="mt-1 flex items-start gap-1 text-caption font-semibold text-turquesa-escuro">
              <FiClock aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              Vaga reservada até {formatoData.format(prazo)}
            </p>
          )}
        </div>
        <FiChevronDown aria-hidden="true" className="col-start-2 row-start-1 size-5 shrink-0 text-turquesa-escuro group-open:rotate-180 sm:col-start-auto sm:row-start-auto" />
      </summary>
      <div className="space-y-3 border-t border-azul-profundo/10 px-4 py-4">
        <dl className="grid gap-3 text-body-small sm:grid-cols-2">
          <div>
            <dt className="font-bold">Pedido recebido em</dt>
            <dd className="text-azul-profundo/80">{formatoData.format(timestampDaAgenda(pedido.dataAbertura))}</dd>
          </div>
          {prazo !== null && (
            <div>
              <dt className="font-bold">Vaga reservada até</dt>
              <dd className="text-azul-profundo/80">{formatoData.format(prazo)}</dd>
            </div>
          )}
          <div className="min-w-0 sm:col-span-2">
            <dt className="font-bold">Relato do paciente</dt>
            <dd className="text-azul-profundo/80 wrap-break-word whitespace-pre-wrap">{pedido.relato?.trim() || 'O paciente não deixou um relato.'}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap items-center gap-2">
          {grupo === 'abertas' && consultaAtiva && (
            <Botoes texto="Iniciar análise" onClick={() => aoIniciar(item)} carregando={iniciando === pedido.idSolicitacao}
              desabilitado={iniciando !== null && iniciando !== pedido.idSolicitacao} />
          )}
          <Botoes texto="Abrir solicitação" variante="secundario" para={`/equipe/solicitacoes/${pedido.idSolicitacao}`} />
        </div>
        {grupo === 'abertas' && !consultaAtiva && <p className="text-body-small text-azul-profundo/80">A consulta precisa estar agendada e em um horário futuro para iniciar a análise.</p>}
      </div>
    </details>
  )
}
