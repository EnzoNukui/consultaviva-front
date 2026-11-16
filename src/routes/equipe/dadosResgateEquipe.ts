import { agendamentoService } from '../../services/agendamentoService'
import { timestampDaAgenda } from '../../services/agendaPacienteService'
import { horarioService } from '../../services/horarioService'
import { membroEquipeService } from '../../services/membroEquipeService'
import { pacienteService } from '../../services/pacienteService'
import { propostaService } from '../../services/propostaService'
import { ofertaVigente, prazoDaOferta } from '../../services/propostasDoPaciente'
import { solicitacaoService } from '../../services/solicitacaoService'
import { unidadeService } from '../../services/unidadeService'
import type { Agendamento } from '../../types/agendamento'
import type { OpcoesAutenticadas } from '../../types/autenticacao'
import type { HorarioAtendimento } from '../../types/horario'
import type { PropostaAtendimento, StatusProposta, TipoAlternativa } from '../../types/proposta'
import type { SolicitacaoAjuda, StatusSolicitacao } from '../../types/solicitacao'
import { formatarDataAgenda, formatarHoraAgenda, listaAgenda } from './dadosAgendaEquipe'

export const situacoesSolicitacao: Record<StatusSolicitacao, string> = {
  ABERTA: 'Aguardando análise', EM_ANALISE: 'Em análise', RESOLVIDA: 'Resolvida',
  SEM_SOLUCAO: 'Encerrada sem solução', CANCELADA: 'Cancelada',
}

export const situacoesProposta: Record<StatusProposta, string> = {
  EM_ANALISE: 'Em análise', OFERTADA: 'Ofertada', CONFIRMADA: 'Confirmada', EXPIRADA: 'Expirada', CANCELADA: 'Cancelada',
}

export const tiposProposta: Record<TipoAlternativa, string> = {
  MANUTENCAO: 'Manter a consulta', REMARCACAO: 'Remarcar a consulta',
  CONVERSAO: 'Alterar a modalidade', REMARCACAO_CONVERSAO: 'Remarcar e alterar a modalidade',
}

export function descreverProposta(proposta: PropostaAtendimento, agora: number) {
  if (proposta.statusProposta === 'EM_ANALISE' && proposta.statusAutorizacao === 'PENDENTE') return 'Aguardando autorização'
  if (proposta.statusProposta !== 'OFERTADA') return situacoesProposta[proposta.statusProposta]
  if ((prazoDaOferta(proposta) ?? -Infinity) <= agora) return 'Prazo encerrado'
  return proposta.statusAceitePaciente === 'ACEITA' ? 'Aguardando confirmação' : 'Aguardando resposta'
}

export function textoDataHora(data: string) {
  return `${formatarDataAgenda(data)}, ${formatarHoraAgenda(data)}`
}

export function normalizarBusca(valor: string) {
  return valor.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export async function carregarResgateEquipe(opcoes: OpcoesAutenticadas) {
  const solicitacoes = await listaAgenda(solicitacaoService.listar(opcoes))
  const propostas = solicitacoes.length ? await listaAgenda(propostaService.listar(opcoes)) : []
  const agendamentos = solicitacoes.length ? await listaAgenda(agendamentoService.listar(opcoes)) : []
  const horarios = solicitacoes.length ? await listaAgenda(horarioService.listar(opcoes)) : []
  const pacientes = agendamentos.length ? await listaAgenda(pacienteService.listar(opcoes)) : []
  return {
    solicitacoes, propostas,
    agendamentos: new Map(agendamentos.map((item) => [item.idAgendamento, item])),
    horarios: new Map(horarios.map((item) => [item.idHorario, item])),
    pacientes: new Map(pacientes.map((item) => [item.idPaciente, item.nomePaciente])),
  }
}

export async function carregarAnaliseEquipe(opcoes: OpcoesAutenticadas) {
  const dados = await carregarResgateEquipe(opcoes)
  const unidades = dados.horarios.size ? await listaAgenda(unidadeService.listar(opcoes)) : []
  const profissionais = dados.solicitacoes.length ? await listaAgenda(membroEquipeService.listar(opcoes)) : []
  return {
    ...dados,
    unidades: new Map(unidades.map((item) => [item.idUnidade, item.nomeUnidade])),
    profissionais: new Map(profissionais.map((item) => [item.idMembroEquipe, item.nomeMembroEquipe])),
  }
}

export function consultaPermiteAnalise(agendamento: Agendamento | undefined, horario: HorarioAtendimento | undefined, agora: number) {
  return agendamento?.statusAgendamento === 'AGENDADO' && !!horario && timestampDaAgenda(horario.dataInicio) > agora
}

export function podeConfirmarProposta(proposta: PropostaAtendimento, pedido: SolicitacaoAjuda, agendamento: Agendamento | undefined,
  horarioOriginal: HorarioAtendimento | undefined, candidato: HorarioAtendimento | undefined, agora: number) {
  return pedido.statusSolicitacao === 'EM_ANALISE' && consultaPermiteAnalise(agendamento, horarioOriginal, agora)
    && !!candidato && timestampDaAgenda(candidato.dataInicio) > agora && ofertaVigente(proposta, agora)
    && proposta.statusAceitePaciente === 'ACEITA' && !!proposta.dataResposta
}
