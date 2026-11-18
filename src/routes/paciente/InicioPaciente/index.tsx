import { useEffect, useState } from 'react'
import { FiCalendar, FiChevronRight, FiInfo, FiMapPin, FiShuffle } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import AcoesConsultaPaciente from '../../../components/AcoesConsultaPaciente/AcoesConsultaPaciente'
import Botoes from '../../../components/Botoes/Botoes'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useSessao } from '../../../components/SessaoProvider/sessao'
import { timestampDaAgenda } from '../../../services/agendaPacienteService'
import type { ConsultaComHorario } from '../../../services/agendaPacienteService'
import { agendamentoService } from '../../../services/agendamentoService'
import { ApiError } from '../../../services/apiClient'
import type { Agendamento } from '../../../types/agendamento'
import type { SolicitacaoAjuda } from '../../../types/solicitacao'
import { listarSolicitacoesDosAgendamentos, solicitacaoAtiva } from '../SolicitacoesPaciente/dadosSolicitacoes'
import { carregarConsultas, contarPropostasPendentes } from './dadosPaciente'

const formatoData = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long',
})
const formatoDia = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', day: 'numeric', month: 'short',
})
const formatoHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hourCycle: 'h23',
})
const modalidades = { PRESENCIAL: 'Consulta presencial', VIRTUAL: 'Consulta virtual' }
const respostas: Record<Agendamento['statusRespostaPaciente'], string> = {
  SEM_RESPOSTA: 'Aguardando sua resposta',
  VOU_COMPARECER: 'Presença confirmada',
  PRECISO_DE_AJUDA: 'Você informou que precisa de ajuda',
  NAO_CONSIGO_COMPARECER: 'Você informou que não poderá ir',
}
const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro'

function dataDaConsulta(dataInicio: string) {
  const data = timestampDaAgenda(dataInicio)
  const dia = formatoData.format(data)
  return `${dia[0].toUpperCase()}${dia.slice(1)}, às ${formatoHora.format(data).replace(':00', 'h').replace(':', 'h')}`
}

function orientacaoDaConsulta(agendamento: Agendamento, pedidoAtivo: boolean) {
  if (pedidoAtivo) return 'A consulta segue marcada enquanto a equipe analisa seu pedido.'

  switch (agendamento.statusRespostaPaciente) {
    case 'SEM_RESPOSTA':
      return 'Confirme presença ou peça ajuda se algo dificultar sua ida.'
    case 'VOU_COMPARECER':
      return 'Presença confirmada. Confira data e local antes do dia.'
    case 'PRECISO_DE_AJUDA':
      return 'Acompanhe seu pedido no menu Solicitações.'
    case 'NAO_CONSIGO_COMPARECER':
      return 'A equipe ainda precisa confirmar qualquer mudança na consulta.'
  }
}

export default function InicioPaciente() {
  const { sessao, definirSessao } = useSessao()
  const autorizacao = sessao?.autorizacao
  const [consultas, setConsultas] = useState<{
    futuras: ConsultaComHorario[]
    localProxima?: string
  } | null>(null)
  const [pedidoDaProxima, setPedidoDaProxima] = useState<SolicitacaoAjuda | null>(null)
  const [pendencias, setPendencias] = useState<{ total: number; idsSolicitacao: number[] }>({ total: 0, idsSolicitacao: [] })
  const [erroPendencias, setErroPendencias] = useState(false)
  const [erro, setErro] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    if (!autorizacao) return

    const controle = new AbortController()
    const opcoes = { autorizacao, signal: controle.signal }

    function tratarFalha(falha: unknown, informarErro: () => void) {
      if (controle.signal.aborted) return
      if (falha instanceof ApiError && falha.status === 401) {
        definirSessao(null)
        return
      }
      informarErro()
    }

    agendamentoService.listarDoPaciente(opcoes).then(async (agendamentos) => {
      if (controle.signal.aborted) return
      const agendadas = agendamentos.filter(({ statusAgendamento }) => statusAgendamento === 'AGENDADO')
      const dados = await carregarConsultas(agendadas, opcoes)
      if (controle.signal.aborted) return
      setConsultas(dados)

      try {
        const pedidos = await listarSolicitacoesDosAgendamentos(dados.futuras.map(({ agendamento }) => agendamento), opcoes)
        if (controle.signal.aborted) return
        const idProxima = dados.futuras[0]?.agendamento.idAgendamento
        setPedidoDaProxima(pedidos.find((pedido) => pedido.idAgendamento === idProxima && solicitacaoAtiva(pedido)) ?? null)
        const pendentes = await contarPropostasPendentes(pedidos, opcoes)
        if (!controle.signal.aborted) setPendencias(pendentes)
      } catch (falha) {
        tratarFalha(falha, () => setErroPendencias(true))
      }
    }).catch((falha: unknown) => tratarFalha(falha, () => setErro(true)))

    return () => controle.abort()
  }, [autorizacao, definirSessao, tentativa])

  function tentarNovamente() {
    setErro(false)
    setErroPendencias(false)
    setTentativa((atual) => atual + 1)
  }

  function confirmarNaAgenda(atualizado: Agendamento) {
    setConsultas((dados) => dados && {
      ...dados,
      futuras: dados.futuras.map((consulta) => consulta.agendamento.idAgendamento === atualizado.idAgendamento
        ? { ...consulta, agendamento: { ...consulta.agendamento, statusRespostaPaciente: atualizado.statusRespostaPaciente } }
        : consulta),
    })
  }

  const [proxima, ...outras] = consultas?.futuras ?? []
  const detalheProxima = proxima ? `/paciente/consultas/${proxima.agendamento.idAgendamento}` : ''
  const pedidoAtivo = proxima && pedidoDaProxima?.idAgendamento === proxima.agendamento.idAgendamento ? pedidoDaProxima : null
  const orientacaoProxima = proxima ? orientacaoDaConsulta(proxima.agendamento, Boolean(pedidoAtivo)) : ''
  const solicitacoes = '/paciente/solicitacoes'
  const destinoPendencias = pendencias.idsSolicitacao.length === 1
    ? `${solicitacoes}/${pendencias.idsSolicitacao[0]}#propostas` : solicitacoes

  return (
    <>
      <h1 className="text-h1 wrap-break-word">{sessao?.primeiroNome ? `Olá, ${sessao.primeiroNome}!` : 'Olá!'}</h1>

      <section aria-labelledby="proxima-consulta" className="mt-5 md:mt-6">
        <h2 id="proxima-consulta" className="mb-2.5 text-h4 font-bold">Próxima consulta</h2>
        {erro ? (
          <ErrorState mensagem="Não foi possível consultar a sua agenda." tentarNovamente={tentarNovamente} />
        ) : !consultas ? (
          <LoadingState mensagem="Carregando suas consultas…" />
        ) : proxima ? (
          <div className="overflow-hidden rounded-lg border border-azul-profundo/15 bg-superficie">
            <div className="grid items-start gap-2.5 p-4 sm:grid-cols-[1fr_auto] sm:px-6 sm:py-5">
              <div>
                <time dateTime={proxima.horario.dataInicio} className="text-body-small font-bold text-turquesa-escuro">
                  {dataDaConsulta(proxima.horario.dataInicio)}
                </time>
                <h3 className="mt-1 text-h3 font-bold">{modalidades[proxima.agendamento.modalidade]}</h3>
                {consultas.localProxima && (
                  <p className="mt-2 flex items-center gap-2 text-body-small text-azul-profundo/80">
                    <FiMapPin aria-hidden="true" className="size-4 shrink-0 text-turquesa-escuro" />
                    {consultas.localProxima}
                  </p>
                )}
              </div>
              <p className={`flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-caption font-semibold before:size-1.5 before:shrink-0 before:rounded-full before:bg-current ${pedidoAtivo || proxima.agendamento.statusRespostaPaciente !== 'VOU_COMPARECER' ? 'bg-areia text-azul-profundo' : 'bg-menta text-turquesa-escuro'}`}>
                {pedidoAtivo ? 'Pedido de ajuda em andamento' : respostas[proxima.agendamento.statusRespostaPaciente]}
              </p>
            </div>
            <div className="border-t border-azul-profundo/10 bg-fundo/60 px-4 py-3 sm:px-6">
              {orientacaoProxima && (
                <p className="mb-3 flex items-start gap-2 text-caption leading-relaxed text-azul-profundo/75">
                  <FiInfo aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-turquesa-escuro" />
                  <span>{orientacaoProxima}</span>
                </p>
              )}
              <AcoesConsultaPaciente key={proxima.agendamento.idAgendamento} consulta={proxima} pedido={pedidoAtivo}
                detalhes={detalheProxima} aoConfirmar={confirmarNaAgenda} />
            </div>
          </div>
        ) : (
          <EmptyState
            titulo="Você não tem consultas futuras"
            mensagem="Explore a escolha de unidade e horário na agenda de demonstração do ConsultaViva."
            acao={<Botoes texto="Ver agenda de demonstração" para="/paciente/consultas?agendar=1" icone={FiCalendar} />}
          />
        )}
      </section>

      {(pendencias.total > 0 || erroPendencias) && (
        <section aria-labelledby="pendencias-paciente" className="mt-5 sm:mt-6">
          <h2 id="pendencias-paciente" className="mb-2.5 text-h4 font-bold">Pendências</h2>
          {erroPendencias ? (
            <p role="status" className="text-body-small text-azul-profundo/80">Não foi possível verificar suas propostas.</p>
          ) : (
            <Link to={destinoPendencias} className={`${foco} flex min-h-13 items-center gap-2 rounded-lg border border-azul-profundo/15 bg-superficie px-3 py-2 text-body-small hover:bg-menta sm:gap-3`}>
              <FiShuffle aria-hidden="true" className="size-4.5 shrink-0 text-turquesa-escuro" />
              <span className="flex-1 font-semibold">
                {pendencias.total === 1 ? 'Uma proposta aguarda sua resposta' : `${pendencias.total} propostas aguardam sua resposta`}
              </span>
              <span className="flex shrink-0 items-center gap-1 font-bold text-turquesa-escuro">
                {pendencias.idsSolicitacao.length === 1 ? 'Abrir solicitação' : 'Ver solicitações'} <FiChevronRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          )}
        </section>
      )}

      {proxima && (
        <section aria-labelledby="outras-consultas" className="mt-5 sm:mt-6">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-x-3">
            <h2 id="outras-consultas" className="text-h4 font-bold">Outras consultas</h2>
            <Link to="/paciente/consultas" aria-label="Ver todas as consultas" className={`${foco} inline-flex min-h-11 items-center gap-1 rounded-sm text-body-small font-bold text-turquesa-escuro`}>
              Ver todas <FiChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          {outras.length ? (
            <ul className="divide-y divide-azul-profundo/10 overflow-hidden rounded-lg border border-azul-profundo/15 bg-superficie">
              {outras.slice(0, 2).map(({ agendamento, horario }) => (
                <li key={agendamento.idAgendamento}>
                  <Link to={`/paciente/consultas/${agendamento.idAgendamento}`} className="flex min-h-14 items-center gap-2.5 px-3 py-2 hover:bg-menta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-turquesa-escuro sm:gap-4">
                    <time dateTime={horario.dataInicio} className="w-12 shrink-0 text-body-small font-bold text-turquesa-escuro sm:w-16">
                      {formatoDia.format(timestampDaAgenda(horario.dataInicio))}
                    </time>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-body-small">{modalidades[agendamento.modalidade]}</strong>
                      <span className="block text-caption text-azul-profundo/80">{dataDaConsulta(horario.dataInicio)}</span>
                    </span>
                    <FiChevronRight aria-hidden="true" className="size-4 shrink-0 text-turquesa-escuro" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-small text-azul-profundo/80">Você não tem outras consultas futuras.</p>
          )}
        </section>
      )}
    </>
  )
}
