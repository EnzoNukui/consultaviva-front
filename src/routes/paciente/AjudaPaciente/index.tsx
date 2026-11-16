import { useCallback } from 'react'
import { FiArrowRight, FiCalendar, FiClipboard } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import CardConsulta from '../../../components/CardConsulta/CardConsulta'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import StatusSolicitacao from '../../../components/StatusSolicitacao/StatusSolicitacao'
import { agoraNaAgenda, agendaPacienteService } from '../../../services/agendaPacienteService'
import { listarOfertasDaSolicitacao, ofertaVigente } from '../../../services/propostasDoPaciente'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import { listarSolicitacoesDoAgendamento, solicitacaoAtiva } from '../SolicitacoesPaciente/dadosSolicitacoes'
import { useBuscaPaciente } from '../useBuscaPaciente'

const caminhoSolicitacoes = '/paciente/solicitacoes'
const formatoConsulta = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', dateStyle: 'short', timeStyle: 'short',
})
const etapas = [
  { titulo: 'Conte o que aconteceu', texto: 'Informe o que está dificultando sua ida e indique quando pode comparecer.' },
  { titulo: 'Acompanhe a análise', texto: 'Se a equipe encontrar uma alternativa, ela vai aparecer no seu pedido.' },
  { titulo: 'Confira sua consulta', texto: 'Se aceitar uma alternativa, aguarde a equipe confirmar a mudança.' },
]

export default function AjudaPaciente() {
  const [parametros, setParametros] = useSearchParams()
  const { resultado, tentarNovamente } = useBuscaPaciente(agendaPacienteService.listar)
  const agora = agoraNaAgenda()
  const consultas = resultado?.status === 'sucesso' ? resultado.dados
    .filter(({ agendamento, inicio }) => agendamento.statusAgendamento === 'AGENDADO' && inicio > agora)
    .toSorted((a, b) => a.inicio - b.inicio) : []
  const idNaUrl = parametros.get('consulta')
  const consulta = idNaUrl === null ? consultas[0] : consultas.find(({ agendamento }) => String(agendamento.idAgendamento) === idNaUrl)

  return (
    <>
      <header className="mb-6">
        <h1 className="text-h1">Precisa de ajuda?</h1>
        <p className="mt-2 max-w-xl text-azul-profundo/80">
          Se algo dificultar sua ida a uma consulta, fale com a equipe pelo seu pedido.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-8">
        <div className="min-w-0 space-y-4">
          {resultado === null && <LoadingState mensagem="Carregando suas próximas consultas…" />}
          {resultado?.status === 'erro' && <ErrorState mensagem="Não foi possível carregar suas consultas." tentarNovamente={tentarNovamente} />}
          {resultado?.status === 'sucesso' && consultas.length === 0 && (
            <EmptyState titulo="Você não tem consultas futuras" mensagem="Você pode pedir ajuda quando tiver uma consulta marcada."
              acao={<Botoes texto="Ver minhas consultas" icone={FiCalendar} para="/paciente/consultas" />} />
          )}
          {resultado?.status === 'sucesso' && consultas.length > 0 && (
            <>
              {(consultas.length > 1 || !consulta) && (
                <div>
                  <label htmlFor="consulta-para-ajuda" className="mb-2 block font-bold">Com qual consulta você precisa de ajuda?</label>
                  <select id="consulta-para-ajuda" value={consulta?.agendamento.idAgendamento ?? ''}
                    onChange={(evento) => setParametros({ consulta: evento.target.value }, { replace: true })}
                    className="min-h-11 w-full rounded-lg border border-azul-profundo/25 bg-superficie px-3 py-2 text-body-small focus-visible:outline-2 focus-visible:outline-turquesa-escuro">
                    {!consulta && <option value="" disabled>Selecione uma consulta futura</option>}
                    {consultas.map(({ agendamento: item, inicio, unidade }) => (
                      <option key={item.idAgendamento} value={item.idAgendamento}>
                        {formatoConsulta.format(inicio)} · {unidade?.nomeUnidade ?? (item.modalidade === 'VIRTUAL' ? 'Virtual' : 'Presencial')}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {consulta && (
                <CardConsulta consulta={consulta} unidade={consulta.unidade}>
                  <AcoesDoPedido idAgendamento={consulta.agendamento.idAgendamento} />
                </CardConsulta>
              )}
            </>
          )}
          <Link to={caminhoSolicitacoes} className="inline-flex min-h-11 items-center gap-2 rounded-sm text-body-small font-bold text-turquesa-escuro underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">
            <FiClipboard aria-hidden="true" className="size-4" /> Ver todas as solicitações
          </Link>
        </div>

        <aside aria-labelledby="depois-do-pedido" className="border-t border-azul-profundo/15 pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <h2 id="depois-do-pedido" className="text-h4">O que acontece depois?</h2>
          <ol className="mt-4 space-y-4">
            {etapas.map(({ titulo, texto }, indice) => (
              <li key={titulo} className="flex gap-3">
                <span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-menta text-caption font-bold text-turquesa-escuro">{indice + 1}</span>
                <div className="min-w-0">
                  <p className="font-bold">{titulo}</p>
                  <p className="mt-0.5 text-body-small text-azul-profundo/80">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  )
}

function AcoesDoPedido({ idAgendamento }: { idAgendamento: number }) {
  const buscarPedido = useCallback(async (opcoes: OpcoesAutenticadas) => {
    const pedidos = await listarSolicitacoesDoAgendamento(idAgendamento, opcoes)
    const pedido = pedidos.find(solicitacaoAtiva)
    if (!pedido) return null
    const ofertas = pedido.statusSolicitacao === 'EM_ANALISE'
      ? await listarOfertasDaSolicitacao(pedido.idSolicitacao, opcoes) : []
    return { pedido, ofertas }
  }, [idAgendamento])
  const { resultado, tentarNovamente } = useBuscaPaciente(buscarPedido)

  if (!resultado) {
    return <p role="status" className="py-2 text-body-small">Verificando se já existe um pedido de ajuda…</p>
  }
  if (resultado.status === 'erro') {
    return (
      <div className="space-y-2 py-1">
        <p role="alert" className="text-body-small">Não foi possível verificar o pedido desta consulta.</p>
        <Botoes texto="Tentar de novo" variante="secundario" onClick={tentarNovamente} />
      </div>
    )
  }
  if (!resultado.dados) {
    return <Botoes para={`${caminhoSolicitacoes}?agendamento=${idAgendamento}`} icone={FiArrowRight}
      posicaoIcone="direita" texto="Pedir ajuda com esta consulta" />
  }

  const { pedido, ofertas } = resultado.dados
  const agora = agoraNaAgenda()
  const vigentes = ofertas.filter((oferta) => ofertaVigente(oferta, agora))
  const temProposta = vigentes.some(({ statusAceitePaciente }) => statusAceitePaciente === 'PENDENTE')
  const temAceite = vigentes.some(({ statusAceitePaciente }) => statusAceitePaciente === 'ACEITA')

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <StatusSolicitacao situacao={temProposta ? 'PROPOSTA_DISPONIVEL' : temAceite ? 'AGUARDANDO_CONFIRMACAO' : pedido.statusSolicitacao} />
      <Botoes para={`${caminhoSolicitacoes}/${pedido.idSolicitacao}${temProposta ? '#propostas' : ''}`}
        icone={FiArrowRight} posicaoIcone="direita" texto={temProposta ? 'Ver alternativa da equipe' : 'Acompanhar pedido'} />
    </div>
  )
}
