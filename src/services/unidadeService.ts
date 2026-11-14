import type { OpcoesAutenticadas } from '../types/autenticacao'
import type { HorarioAtendimento } from '../types/horario'
import type { CriarUnidadeRequest, Unidade } from '../types/unidade'
import { apiJsonBody, apiRequest } from './apiClient'

export const unidadeService = {
  listar: (opcoes: OpcoesAutenticadas) =>
    apiRequest<Unidade[]>('/unidades', opcoes),

  buscarPorId: (idUnidade: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<Unidade>(`/unidades/${idUnidade}`, opcoes),

  listarHorarios: (idUnidade: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<HorarioAtendimento[]>(`/unidades/${idUnidade}/horarios`, opcoes),

  inserir: (dados: CriarUnidadeRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<Unidade>('/unidades', { ...opcoes, method: 'POST', body: apiJsonBody(dados) }),

  atualizar: (idUnidade: number, dados: CriarUnidadeRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<Unidade>(`/unidades/${idUnidade}`, { ...opcoes, method: 'PUT', body: apiJsonBody(dados) }),

  excluir: (idUnidade: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/unidades/${idUnidade}`, { ...opcoes, method: 'DELETE' }),
}
