import { useCallback, useState } from 'react'
import { FiArrowLeft, FiMapPin } from 'react-icons/fi'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import AcoesConsultaPaciente from '../../../components/AcoesConsultaPaciente/AcoesConsultaPaciente'
import CardConsulta from '../../../components/CardConsulta/CardConsulta'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { agoraNaAgenda, agendaPacienteService } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import type { Agendamento } from '../../../types/agendamento'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import { listarSolicitacoesDosAgendamentos, solicitacaoAtiva } from '../SolicitacoesPaciente/dadosSolicitacoes'
import { useBuscaPaciente } from '../useBuscaPaciente'

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
    const pedidos = await listarSolicitacoesDosAgendamentos([consultaCarregada.agendamento], opcoes)
    return pedidos.find(solicitacaoAtiva) ?? null
  }, [consultaCarregada])
  const { resultado: resultadoPedido } = useBuscaPaciente(buscarPedido)
  const pedido = resultadoPedido?.status === 'sucesso' ? resultadoPedido.dados : null
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
        <>
          <CardConsulta consulta={consulta} unidade={consulta.unidade}>
            {consulta.unidade?.endereco && (
              <div className="flex items-start gap-2 py-1 text-body-small">
                <FiMapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-turquesa-escuro" />
                <div>
                  <h3 className="font-bold">Endereço</h3>
                  <p className="wrap-break-word">{consulta.unidade.endereco}</p>
                </div>
              </div>
            )}
          </CardConsulta>
          {(pedido || (consulta.agendamento.statusAgendamento === 'AGENDADO' && consulta.inicio > agoraNaAgenda())) && (
            <section aria-labelledby="acoes-da-consulta" className="mt-4 rounded-lg border border-azul-profundo/15 bg-superficie p-4 sm:p-5">
              <h2 id="acoes-da-consulta" className="mb-2 text-h4">{pedido ? 'Pedido de ajuda em andamento' : 'Ações para esta consulta'}</h2>
              {pedido && <p className="mb-3 text-body-small text-azul-profundo/80">Acompanhe o andamento e as alternativas da equipe.</p>}
              <AcoesConsultaPaciente key={consulta.agendamento.idAgendamento} consulta={consulta} pedido={pedido} aoConfirmar={atualizarResposta} />
            </section>
          )}
        </>
      )}
    </>
  )
}
