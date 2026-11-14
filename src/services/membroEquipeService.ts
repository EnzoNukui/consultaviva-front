import type { OpcoesAutenticadas } from '../types/autenticacao'
import type { CriarMembroEquipeRequest, MembroEquipe } from '../types/membroEquipe'
import { apiJsonBody, apiRequest } from './apiClient'

export const membroEquipeService = {
  listar: (opcoes: OpcoesAutenticadas) =>
    apiRequest<MembroEquipe[]>('/membros-equipe', opcoes),

  buscarPorId: (idMembroEquipe: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<MembroEquipe>(`/membros-equipe/${idMembroEquipe}`, opcoes),

  inserir: (dados: CriarMembroEquipeRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<MembroEquipe>('/membros-equipe', { ...opcoes, method: 'POST', body: apiJsonBody(dados) }),

  atualizar: (idMembroEquipe: number, dados: CriarMembroEquipeRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<MembroEquipe>(`/membros-equipe/${idMembroEquipe}`, {
      ...opcoes, method: 'PUT', body: apiJsonBody(dados),
    }),

  excluir: (idMembroEquipe: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/membros-equipe/${idMembroEquipe}`, { ...opcoes, method: 'DELETE' }),
}
