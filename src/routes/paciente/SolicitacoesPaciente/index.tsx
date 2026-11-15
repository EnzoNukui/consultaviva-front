import { useCallback } from 'react'
import { FiArrowRight, FiMessageSquare, FiPlus } from 'react-icons/fi'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import StatusSolicitacao from '../../../components/StatusSolicitacao/StatusSolicitacao'
import type { SituacaoExibida } from '../../../components/StatusSolicitacao/StatusSolicitacao'
import { agoraNaAgenda } from '../../../services/agendaPacienteService'
import { ofertaVigente } from '../../../services/propostasDoPaciente'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import { useBuscaPaciente } from '../useBuscaPaciente'
import FormularioSolicitacao from './FormularioSolicitacao'
import { carregarOfertasEmAnalise, carregarSolicitacoesPaciente, dataHoraDaSolicitacao, solicitacaoAtiva } from './dadosSolicitacoes'

const caminho = '/paciente/solicitacoes'

export default function SolicitacoesPaciente() {
  const { resultado, tentarNovamente } = useBuscaPaciente(carregarSolicitacoesPaciente)
  const [parametros] = useSearchParams()
  const consultaDoAtalho = parametros.get('agendamento')
  const abrindoFormulario = parametros.has('nova') || consultaDoAtalho !== null
  const dados = resultado?.status === 'sucesso' ? resultado.dados : null
  const buscarOfertas = useCallback((opcoes: OpcoesAutenticadas) => {
    if (!dados || abrindoFormulario) return Promise.resolve(null)
    const agora = agoraNaAgenda()
    const ids = new Set(dados.consultas.filter(({ agendamento, inicio }) =>
      agendamento.statusAgendamento === 'AGENDADO' && inicio > agora,
    ).map(({ agendamento }) => agendamento.idAgendamento))
    return carregarOfertasEmAnalise(dados.solicitacoes.filter(({ idAgendamento }) => ids.has(idAgendamento)), opcoes)
  }, [dados, abrindoFormulario])
  const { resultado: resultadoOfertas, tentarNovamente: tentarOfertas } = useBuscaPaciente(buscarOfertas)
  const ofertas = resultadoOfertas?.status === 'sucesso' ? resultadoOfertas.dados : null
  const solicitacoes = dados?.solicitacoes ?? []
  const pedidosAtivos = new Map(solicitacoes.filter(solicitacaoAtiva).map((pedido) => [pedido.idAgendamento, pedido]))
  const consultasPorId = new Map(dados?.consultas.map((consulta) => [consulta.agendamento.idAgendamento, consulta]))
  const agora = agoraNaAgenda()
  const disponiveis = dados?.consultas.filter(({ agendamento, inicio }) =>
    agendamento.statusAgendamento === 'AGENDADO' && inicio > agora && !pedidosAtivos.has(agendamento.idAgendamento),
  ).sort((a, b) => a.inicio - b.inicio) ?? []
  const lista = solicitacoes.map((pedido) => {
    const vigentes = ofertas?.get(pedido.idSolicitacao)?.filter((oferta) => ofertaVigente(oferta, agora))
    const temPendente = vigentes?.some(({ statusAceitePaciente }) => statusAceitePaciente === 'PENDENTE')
    const temAceita = vigentes?.some(({ statusAceitePaciente }) => statusAceitePaciente === 'ACEITA')
    const situacao: SituacaoExibida = temPendente ? 'PROPOSTA_DISPONIVEL' : temAceita ? 'AGUARDANDO_CONFIRMACAO' : pedido.statusSolicitacao
    return { pedido, situacao, prioridade: temPendente ? 2 : temAceita ? 1 : 0 }
  }).sort((a, b) => b.prioridade - a.prioridade)

  if (abrindoFormulario && dados) {
    const pedidoExistente = pedidosAtivos.get(Number(consultaDoAtalho))
    if (pedidoExistente) return <Navigate to={`${caminho}/${pedidoExistente.idSolicitacao}`} replace />

    return <FormularioSolicitacao key={consultaDoAtalho ?? 'nova'} consultas={disponiveis}
      consultaDoAtalho={consultaDoAtalho} aoRecarregarLista={tentarNovamente} />
  }

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1">{abrindoFormulario ? 'Preciso de ajuda' : 'Minhas solicitações'}</h1>
          <p className="mt-2 text-body-small text-azul-profundo/80">Peça ajuda com uma consulta já agendada e acompanhe as alternativas da equipe.</p>
        </div>
        {disponiveis.length > 0 && (
          <Botoes texto="Pedir ajuda" icone={FiPlus} para={`${caminho}?nova=1`} />
        )}
      </header>

      {resultadoOfertas?.status === 'erro' && (
        <div className="mb-4">
          <ErrorState mensagem="Não foi possível verificar se há novas propostas." tentarNovamente={tentarOfertas} />
        </div>
      )}

      {resultado === null ? (
        <LoadingState mensagem="Carregando suas solicitações…" />
      ) : resultado.status === 'erro' ? (
        <ErrorState mensagem="Não foi possível carregar suas solicitações." tentarNovamente={tentarNovamente} />
      ) : solicitacoes.length === 0 ? (
        <EmptyState
          titulo="Você ainda não tem solicitações"
          mensagem="Se algo dificultar sua ida a uma consulta, envie um pedido de ajuda e acompanhe o andamento aqui."
          acao={disponiveis.length === 0 ? <Botoes texto="Ver minhas consultas" variante="contornoTurquesa" para="/paciente/consultas" /> : undefined}
        />
      ) : (
        <ul aria-label="Solicitações de ajuda" className="space-y-3">
          {lista.map(({ pedido, situacao }) => {
            const consulta = consultasPorId.get(pedido.idAgendamento)
            const titulo = consulta?.agendamento.modalidade === 'VIRTUAL' ? 'Consulta virtual' : 'Consulta presencial'

            return (
              <li key={pedido.idSolicitacao}>
                <Link
                  to={`${caminho}/${pedido.idSolicitacao}`}
                  className="flex flex-wrap items-start gap-3 rounded-lg border border-azul-profundo/15 bg-superficie p-4 hover:border-turquesa-escuro/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro sm:items-center sm:px-5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-menta text-turquesa-escuro">
                    <FiMessageSquare aria-hidden="true" className="size-5" />
                  </span>
                  <span className="min-w-35 flex-1">
                    <strong className="block">{consulta ? titulo : 'Solicitação de ajuda'}</strong>
                    <span className="block text-body-small text-azul-profundo/80">
                      {consulta ? dataHoraDaSolicitacao(consulta.horario.dataInicio) : `Consulta ${pedido.idAgendamento}`}
                    </span>
                    <span className="mt-1 block text-caption text-azul-profundo/75">Enviada em {dataHoraDaSolicitacao(pedido.dataAbertura)}</span>
                  </span>
                  <span className="ml-auto flex items-center gap-3 self-center">
                    <StatusSolicitacao situacao={situacao} />
                    <FiArrowRight aria-hidden="true" className="size-4 shrink-0 text-turquesa-escuro" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
