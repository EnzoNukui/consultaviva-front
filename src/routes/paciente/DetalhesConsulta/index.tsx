import { useCallback, useState } from 'react'
import { FiArrowLeft, FiClock, FiMapPin, FiVideo } from 'react-icons/fi'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import AcoesConsultaPaciente from '../../../components/AcoesConsultaPaciente/AcoesConsultaPaciente'
import { estadoDaConsulta } from '../../../components/CardConsulta/estadoDaConsulta'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { agoraNaAgenda, agendaPacienteService } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import type { Agendamento } from '../../../types/agendamento'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import { listarSolicitacoesDoAgendamento, solicitacaoAtiva } from '../SolicitacoesPaciente/dadosSolicitacoes'
import { useBuscaPaciente } from '../useBuscaPaciente'
import PlanoDaConsulta from './PlanoDaConsulta'

const formatoDia = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: '2-digit' })
const formatoMes = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', month: 'long', year: 'numeric' })
const formatoSemana = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'long' })
const formatoHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

export default function DetalhesConsulta() {
  const { id } = useParams()
  const [parametros] = useSearchParams()
  const voltar = parametros.get('periodo') === 'historico' ? '/paciente/consultas?periodo=historico' : '/paciente/consultas'
  const idConsulta = Number(id)
  const idValido = Number.isSafeInteger(idConsulta) && idConsulta > 0
  const carregar = useCallback((opcoes: OpcoesAutenticadas) => (
    idValido ? agendaPacienteService.buscarPorId(idConsulta, opcoes) : Promise.resolve(null)
  ), [idConsulta, idValido])
  const { resultado, tentarNovamente } = useBuscaPaciente(carregar)
  const consultaCarregada = resultado?.status === 'sucesso' ? resultado.dados : null
  const [resposta, setResposta] = useState<{ anterior: Agendamento; confirmada: Agendamento } | null>(null)
  const consulta = consultaCarregada && resposta?.anterior === consultaCarregada.agendamento
    ? { ...consultaCarregada, agendamento: { ...consultaCarregada.agendamento, statusRespostaPaciente: resposta.confirmada.statusRespostaPaciente } }
    : consultaCarregada
  const buscarPedido = useCallback(async (opcoes: OpcoesAutenticadas) => {
    if (!consultaCarregada || consultaCarregada.agendamento.statusAgendamento !== 'AGENDADO'
      || consultaCarregada.inicio <= agoraNaAgenda()) return null
    const pedidos = await listarSolicitacoesDoAgendamento(consultaCarregada.agendamento.idAgendamento, opcoes)
    return pedidos.find(solicitacaoAtiva) ?? null
  }, [consultaCarregada])
  const { resultado: resultadoPedido } = useBuscaPaciente(buscarPedido)
  const pedido = resultadoPedido?.status === 'sucesso' ? resultadoPedido.dados : null
  const estado = consulta ? estadoDaConsulta(consulta.agendamento) : null
  const virtual = consulta?.agendamento.modalidade === 'VIRTUAL'
  const futura = !!consulta && consulta.agendamento.statusAgendamento === 'AGENDADO' && consulta.inicio > agoraNaAgenda()
  const indisponivel = resultado?.status === 'erro' && resultado.erro instanceof ApiError
    && (resultado.erro.status === 403 || resultado.erro.status === 404)

  function atualizarResposta(agendamento: Agendamento) {
    if (consultaCarregada) setResposta({ anterior: consultaCarregada.agendamento, confirmada: agendamento })
  }

  return (
    <>
      <header className="mb-6">
        <Link
          to={voltar}
          className="mb-2 inline-flex min-h-11 items-center gap-2 rounded-sm text-body-small font-bold text-turquesa-escuro hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro"
        >
          <FiArrowLeft aria-hidden="true" className="size-4" /> Minhas consultas
        </Link>
        <h1 className="text-h1">Detalhes da consulta</h1>
      </header>

      {!idValido || indisponivel ? (
        <EmptyState titulo="Consulta indisponível" mensagem="Volte à lista e escolha uma consulta da sua agenda." />
      ) : resultado === null ? (
        <LoadingState mensagem="Carregando os detalhes da consulta…" />
      ) : resultado.status === 'erro' ? (
        <ErrorState mensagem="Não foi possível carregar esta consulta." tentarNovamente={tentarNovamente} />
      ) : consulta && (
        <div className="space-y-6">
          <section aria-labelledby="resumo-da-consulta" className="grid overflow-hidden rounded-xl border border-azul-profundo/15 bg-superficie sm:grid-cols-[12rem_minmax(0,1fr)]">
            <time dateTime={consulta.horario.dataInicio} className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-azul-profundo px-5 py-4 text-superficie sm:flex-col sm:items-start sm:justify-center sm:gap-1 sm:px-6 sm:py-7">
              <span className="text-5xl leading-none font-bold tabular-nums tracking-tight text-ciano sm:text-6xl">{formatoDia.format(consulta.inicio)}</span>
              <span className="flex flex-col">
                <span className="font-bold first-letter:uppercase">{formatoSemana.format(consulta.inicio)}</span>
                <span className="text-body-small text-superficie/85">{formatoMes.format(consulta.inicio)}</span>
              </span>
            </time>
            <div className="min-w-0 space-y-4 p-5 sm:px-7 sm:py-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 id="resumo-da-consulta" className="text-h3">{virtual ? 'Consulta virtual' : 'Consulta presencial'}</h2>
                {estado && (
                  <p className={`rounded-md px-2.5 py-1 text-caption font-semibold ${estado.cor}`}>{estado.texto}</p>
                )}
              </div>
              <dl className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <FiClock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-turquesa-escuro" />
                  <div>
                    <dt className="text-caption text-azul-profundo/75">Horário</dt>
                    <dd className="font-bold"><time dateTime={consulta.horario.dataInicio}>{formatoHora.format(consulta.inicio)}</time></dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  {virtual
                    ? <FiVideo aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-turquesa-escuro" />
                    : <FiMapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-turquesa-escuro" />}
                  <div className="min-w-0">
                    <dt className="text-caption text-azul-profundo/75">Local</dt>
                    <dd className="font-bold wrap-break-word">{virtual ? 'On-line' : consulta.unidade?.nomeUnidade ?? 'Unidade não informada'}</dd>
                    {consulta.unidade?.endereco && <dd className="text-body-small text-azul-profundo/80 wrap-break-word">{consulta.unidade.endereco}</dd>}
                  </div>
                </div>
              </dl>
            </div>
          </section>

          {futura && (
            <section aria-labelledby="acoes-da-consulta" className="border-b border-azul-profundo/15 pb-6">
              <h2 id="acoes-da-consulta" className="mb-3 text-h4">{pedido ? 'Pedido de ajuda em andamento' : 'Você vai conseguir ir?'}</h2>
              {pedido && <p className="mb-3 text-body-small text-azul-profundo/80">Acompanhe o andamento e as alternativas da equipe.</p>}
              <AcoesConsultaPaciente key={consulta.agendamento.idAgendamento} consulta={consulta} pedido={pedido} aoConfirmar={atualizarResposta} />
            </section>
          )}
          {futura && !virtual && resultadoPedido !== null && (
            <PlanoDaConsulta key={consulta.agendamento.idAgendamento} idAgendamento={consulta.agendamento.idAgendamento}
              inicioConsulta={consulta.inicio} endereco={consulta.unidade?.endereco} />
          )}
        </div>
      )}
    </>
  )
}
