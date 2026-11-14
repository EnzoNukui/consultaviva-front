import type { OpcoesAutenticadas } from '../types/autenticacao'
import type { CadastroPacienteRequest, CriarPacienteRequest, Paciente } from '../types/paciente'
import { apiJsonBody, apiRequest } from './apiClient'

export const pacienteService = {
  cadastrar: (dados: CadastroPacienteRequest, signal?: AbortSignal) =>
    apiRequest<Paciente>('/pacientes/cadastro', {
      method: 'POST',
      body: apiJsonBody(dados),
      signal,
    }),

  listar: (opcoes: OpcoesAutenticadas) =>
    apiRequest<Paciente[]>('/pacientes', opcoes),

  buscarPorId: (idPaciente: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<Paciente>(`/pacientes/${idPaciente}`, opcoes),

  inserir: (dados: CriarPacienteRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<Paciente>('/pacientes', { ...opcoes, method: 'POST', body: apiJsonBody(dados) }),

  atualizar: (idPaciente: number, dados: CriarPacienteRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<Paciente>(`/pacientes/${idPaciente}`, { ...opcoes, method: 'PUT', body: apiJsonBody(dados) }),

  excluir: (idPaciente: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/pacientes/${idPaciente}`, { ...opcoes, method: 'DELETE' }),
}
