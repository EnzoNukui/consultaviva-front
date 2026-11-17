import type { Agendamento, AgendarConsultaPacienteRequest, CriarAgendamentoRequest, RemarcarAgendamentoRequest, RespostaAgendamento } from '../types/agendamento'
import type { OpcoesAutenticadas } from '../types/autenticacao'
import { apiJsonBody, apiRequest } from './apiClient'

export const agendamentoService = {
  listar: (opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento[]>('/agendamentos', opcoes),

  listarDoPaciente: (opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento[]>('/agendamentos/paciente', opcoes),

  agendarPeloPaciente: (dados: AgendarConsultaPacienteRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento>('/agendamentos/paciente', { ...opcoes, method: 'POST', body: apiJsonBody(dados) }),

  buscarPorId: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento>(`/agendamentos/${idAgendamento}`, opcoes),

  buscarDoPaciente: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento>(`/agendamentos/${idAgendamento}/paciente`, opcoes),

  inserir: (dados: CriarAgendamentoRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento>('/agendamentos', { ...opcoes, method: 'POST', body: apiJsonBody(dados) }),

  remarcar: (idAgendamento: number, dados: RemarcarAgendamentoRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento>(`/agendamentos/${idAgendamento}`, {
      ...opcoes, method: 'PUT', body: apiJsonBody(dados),
    }),

  excluir: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/agendamentos/${idAgendamento}`, { ...opcoes, method: 'DELETE' }),

  registrarResposta: (idAgendamento: number, resposta: RespostaAgendamento, opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento>(`/agendamentos/${idAgendamento}/resposta?${new URLSearchParams({ resposta })}`, {
      ...opcoes, method: 'POST',
    }),

  cancelar: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento>(`/agendamentos/${idAgendamento}/cancelamento`, { ...opcoes, method: 'POST' }),

  registrarRealizacao: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento>(`/agendamentos/${idAgendamento}/realizacao`, { ...opcoes, method: 'POST' }),

  registrarFalta: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<Agendamento>(`/agendamentos/${idAgendamento}/falta`, { ...opcoes, method: 'POST' }),
}
