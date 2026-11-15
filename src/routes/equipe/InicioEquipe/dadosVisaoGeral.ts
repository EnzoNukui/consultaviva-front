import { agendamentoService } from '../../../services/agendamentoService'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { horarioService } from '../../../services/horarioService'
import { pacienteService } from '../../../services/pacienteService'
import { propostaService } from '../../../services/propostaService'
import { ofertaVigente, prazoDaOferta } from '../../../services/propostasDoPaciente'
import { solicitacaoService } from '../../../services/solicitacaoService'
import type { Agendamento } from '../../../types/agendamento'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import type { PropostaAtendimento } from '../../../types/proposta'
import type { SolicitacaoAjuda } from '../../../types/solicitacao'

export interface PedidoDaFila {
  pedido: SolicitacaoAjuda
  agendamento?: Agendamento
  paciente?: string
  inicio: number | null
  propostas: { proposta: PropostaAtendimento; inicio: number | null }[]
}

function listaOuVazia<T>(requisicao: Promise<T[]>) {
  return requisicao.catch((erro: unknown) => {
    if (erro instanceof ApiError && erro.status === 404) return []
    throw erro
  })
}

export async function carregarFilaEquipe(opcoes: OpcoesAutenticadas): Promise<PedidoDaFila[]> {
  const pedidos = await listaOuVazia(solicitacaoService.listar(opcoes))
  const ativos = pedidos.filter(({ statusSolicitacao }) => statusSolicitacao === 'ABERTA' || statusSolicitacao === 'EM_ANALISE')
  if (ativos.length === 0) return []

  const agendamentos = await listaOuVazia(agendamentoService.listar(opcoes))
  const propostas = ativos.some(({ statusSolicitacao }) => statusSolicitacao === 'EM_ANALISE')
    ? await listaOuVazia(propostaService.listar(opcoes)) : []
  const horarios = await listaOuVazia(horarioService.listar(opcoes))
  const pacientes = await listaOuVazia(pacienteService.listar(opcoes))

  const agendaPorId = new Map(agendamentos.map((agenda) => [agenda.idAgendamento, agenda]))
  const pacientesPorId = new Map(pacientes.map((paciente) => [paciente.idPaciente, paciente.nomePaciente]))
  const horariosPorId = new Map(horarios.map((horario) => [horario.idHorario, timestampDaAgenda(horario.dataInicio)]))
  const propostasPorPedido = new Map<number, PedidoDaFila['propostas']>()
  for (const proposta of propostas) {
    if (proposta.statusProposta !== 'OFERTADA') continue
    const lista = propostasPorPedido.get(proposta.idSolicitacao) ?? []
    lista.push({ proposta, inicio: horariosPorId.get(proposta.idHorario) ?? null })
    propostasPorPedido.set(proposta.idSolicitacao, lista)
  }

  return ativos.map((pedido) => {
    const agendamento = agendaPorId.get(pedido.idAgendamento)
    return {
      pedido, agendamento,
      paciente: agendamento && pacientesPorId.get(agendamento.idPaciente),
      inicio: agendamento ? horariosPorId.get(agendamento.idHorario) ?? null : null,
      propostas: propostasPorPedido.get(pedido.idSolicitacao) ?? [],
    }
  })
}

export function consultaAindaAgendada({ agendamento, inicio }: PedidoDaFila, agora = agoraNaAgenda()) {
  return agendamento?.statusAgendamento === 'AGENDADO' && inicio !== null && inicio > agora
}

export function resumirPedido(item: PedidoDaFila, agora: number) {
  const consultaAtiva = consultaAindaAgendada(item, agora)
  const ofertas = consultaAtiva && item.pedido.statusSolicitacao === 'EM_ANALISE'
    ? item.propostas.filter(({ proposta, inicio }) => inicio !== null && inicio > agora && ofertaVigente(proposta, agora))
    : []
  const aceite = ofertas.filter(({ proposta }) => proposta.statusAceitePaciente === 'ACEITA' && proposta.dataResposta)
    .sort((a, b) => (prazoDaOferta(a.proposta) ?? Infinity) - (prazoDaOferta(b.proposta) ?? Infinity))[0]
  const aguardandoResposta = ofertas.some(({ proposta }) => proposta.statusAceitePaciente === 'PENDENTE')
  const grupo = aceite ? 'aceitas' : item.pedido.statusSolicitacao === 'ABERTA' ? 'abertas' : 'analise'

  return {
    ...item, grupo, consultaAtiva, aguardandoResposta,
    prazo: aceite ? prazoDaOferta(aceite.proposta) : null,
  } as const
}
