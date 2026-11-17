import type {
  AtualizarPlanoRequest,
  CriarPlanoRequest,
  HistoricoEvento,
  PlanoComparecimento,
} from '../types/atendimento'
import type { OpcoesAutenticadas } from '../types/autenticacao'
import { apiJsonBody, apiRequest } from './apiClient'

export const atendimentoService = {
  listarPlanos: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<PlanoComparecimento[]>(`/atendimentos/agendamentos/${idAgendamento}/planos`, opcoes),

  buscarPlano: (idPlano: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<PlanoComparecimento>(`/atendimentos/planos/${idPlano}`, opcoes),

  inserirPlano: (dados: CriarPlanoRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<PlanoComparecimento>('/atendimentos/planos', { ...opcoes, method: 'POST', body: apiJsonBody(dados) }),

  atualizarPlano: (idPlano: number, dados: AtualizarPlanoRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<PlanoComparecimento>(`/atendimentos/planos/${idPlano}`, {
      ...opcoes, method: 'PUT', body: apiJsonBody(dados),
    }),

  excluirPlano: (idPlano: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/atendimentos/planos/${idPlano}`, { ...opcoes, method: 'DELETE' }),

  listarHistorico: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<HistoricoEvento[]>(`/atendimentos/agendamentos/${idAgendamento}/historico`, opcoes),
}
