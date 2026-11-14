import type {
  AtualizarPlanoRequest,
  AtualizarPreparoRequest,
  CriarPlanoRequest,
  CriarPreparoRequest,
  HistoricoEvento,
  PlanoComparecimento,
  PreparoVirtual,
  SincronizacaoAgenda,
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

  listarPreparos: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<PreparoVirtual[]>(`/atendimentos/agendamentos/${idAgendamento}/preparos`, opcoes),

  buscarPreparo: (idPreparo: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<PreparoVirtual>(`/atendimentos/preparos/${idPreparo}`, opcoes),

  inserirPreparo: (dados: CriarPreparoRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<PreparoVirtual>('/atendimentos/preparos', { ...opcoes, method: 'POST', body: apiJsonBody(dados) }),

  atualizarPreparo: (idPreparo: number, dados: AtualizarPreparoRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<PreparoVirtual>(`/atendimentos/preparos/${idPreparo}`, {
      ...opcoes, method: 'PUT', body: apiJsonBody(dados),
    }),

  excluirPreparo: (idPreparo: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/atendimentos/preparos/${idPreparo}`, { ...opcoes, method: 'DELETE' }),

  listarHistorico: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<HistoricoEvento[]>(`/atendimentos/agendamentos/${idAgendamento}/historico`, opcoes),

  listarSincronizacoes: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<SincronizacaoAgenda[]>(`/atendimentos/agendamentos/${idAgendamento}/sincronizacoes`, opcoes),
}
