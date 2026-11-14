import type { OpcoesAutenticadas } from '../types/autenticacao'
import type { CriarHorarioRequest, HorarioAtendimento } from '../types/horario'
import { apiJsonBody, apiRequest } from './apiClient'

const caminho = '/horarios-atendimento'

export const horarioService = {
  listar: (opcoes: OpcoesAutenticadas) =>
    apiRequest<HorarioAtendimento[]>(caminho, opcoes),

  listarDisponiveis: (opcoes: OpcoesAutenticadas) =>
    apiRequest<HorarioAtendimento[]>(`${caminho}/disponiveis`, opcoes),

  buscarPorId: (idHorario: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<HorarioAtendimento>(`${caminho}/${idHorario}`, opcoes),

  listarPorUnidade: (idUnidade: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<HorarioAtendimento[]>(`${caminho}/por-unidade/${idUnidade}`, opcoes),

  listarPorMembro: (idMembroEquipe: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<HorarioAtendimento[]>(`${caminho}/por-membro/${idMembroEquipe}`, opcoes),

  inserir: (dados: CriarHorarioRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<HorarioAtendimento>(caminho, { ...opcoes, method: 'POST', body: apiJsonBody(dados) }),

  atualizar: (idHorario: number, dados: CriarHorarioRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<HorarioAtendimento>(`${caminho}/${idHorario}`, { ...opcoes, method: 'PUT', body: apiJsonBody(dados) }),

  excluir: (idHorario: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`${caminho}/${idHorario}`, { ...opcoes, method: 'DELETE' }),
}
