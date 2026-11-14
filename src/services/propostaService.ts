import type { LocalDateTime } from '../types/api'
import type { OpcoesAutenticadas } from '../types/autenticacao'
import type { AtualizarPropostaRequest, PropostaAtendimento } from '../types/proposta'
import { apiJsonBody, apiRequest } from './apiClient'

export const propostaService = {
  listar: (opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento[]>('/propostas', opcoes),

  buscarPorId: (idProposta: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento>(`/propostas/${idProposta}`, opcoes),

  listarPorSolicitacao: (idSolicitacao: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento[]>(`/propostas/por-solicitacao/${idSolicitacao}`, opcoes),

  gerar: (idSolicitacao: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento[]>(`/propostas/por-solicitacao/${idSolicitacao}/gerar`, { ...opcoes, method: 'POST' }),

  atualizar: (idProposta: number, dados: AtualizarPropostaRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento>(`/propostas/${idProposta}`, { ...opcoes, method: 'PUT', body: apiJsonBody(dados) }),

  autorizar: (idProposta: number, autorizada: boolean, opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento>(
      `/propostas/${idProposta}/autorizacao?${new URLSearchParams({ autorizada: String(autorizada) })}`,
      { ...opcoes, method: 'POST' },
    ),

  ofertar: (idProposta: number, dataLimiteAceite: LocalDateTime, opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento>(
      `/propostas/${idProposta}/oferta?${new URLSearchParams({ dataLimiteAceite })}`,
      { ...opcoes, method: 'POST' },
    ),

  registrarResposta: (idProposta: number, aceita: boolean, opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento>(
      `/propostas/${idProposta}/resposta?${new URLSearchParams({ aceita: String(aceita) })}`,
      { ...opcoes, method: 'POST' },
    ),

  confirmar: (idProposta: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento>(`/propostas/${idProposta}/confirmacao`, { ...opcoes, method: 'POST' }),

  expirar: (idProposta: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<PropostaAtendimento>(`/propostas/${idProposta}/expiracao`, { ...opcoes, method: 'POST' }),

  excluir: (idProposta: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/propostas/${idProposta}`, { ...opcoes, method: 'DELETE' }),
}
