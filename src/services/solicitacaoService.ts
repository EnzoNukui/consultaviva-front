import type { OpcoesAutenticadas } from '../types/autenticacao'
import type {
  AtualizarSolicitacaoRequest,
  CriarSolicitacaoRequest,
  Disponibilidade,
  DisponibilidadeRequest,
  SituacaoEncerramento,
  SolicitacaoAjuda,
  SolicitacaoDificuldade,
  TipoDificuldade,
} from '../types/solicitacao'
import { apiJsonBody, apiRequest } from './apiClient'

export const solicitacaoService = {
  listar: (opcoes: OpcoesAutenticadas) =>
    apiRequest<SolicitacaoAjuda[]>('/solicitacoes', opcoes),

  listarTiposDificuldade: (opcoes: OpcoesAutenticadas) =>
    apiRequest<TipoDificuldade[]>('/solicitacoes/tipos-dificuldade', opcoes),

  listarPorAgendamento: (idAgendamento: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<SolicitacaoAjuda[]>(`/solicitacoes/por-agendamento/${idAgendamento}`, opcoes),

  buscarDoPaciente: (idSolicitacao: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<SolicitacaoAjuda>(`/solicitacoes/${idSolicitacao}`, opcoes),

  listarDificuldades: (idSolicitacao: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<SolicitacaoDificuldade[]>(`/solicitacoes/${idSolicitacao}/dificuldades`, opcoes),

  listarDisponibilidades: (idSolicitacao: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<Disponibilidade[]>(`/solicitacoes/${idSolicitacao}/disponibilidades`, opcoes),

  inserir: (dados: CriarSolicitacaoRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<SolicitacaoAjuda>('/solicitacoes', { ...opcoes, method: 'POST', body: apiJsonBody(dados) }),

  atualizar: (idSolicitacao: number, dados: AtualizarSolicitacaoRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<SolicitacaoAjuda>(`/solicitacoes/${idSolicitacao}`, {
      ...opcoes, method: 'PUT', body: apiJsonBody(dados),
    }),

  adicionarDificuldade: (idSolicitacao: number, idDificuldade: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<SolicitacaoDificuldade>(`/solicitacoes/${idSolicitacao}/dificuldades`, {
      ...opcoes, method: 'POST', body: apiJsonBody({ idDificuldade }),
    }),

  excluirDificuldade: (idSolicitacao: number, idDificuldade: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/solicitacoes/${idSolicitacao}/dificuldades/${idDificuldade}`, { ...opcoes, method: 'DELETE' }),

  adicionarDisponibilidade: (idSolicitacao: number, dados: DisponibilidadeRequest, opcoes: OpcoesAutenticadas) =>
    apiRequest<Disponibilidade>(`/solicitacoes/${idSolicitacao}/disponibilidades`, {
      ...opcoes, method: 'POST', body: apiJsonBody(dados),
    }),

  atualizarDisponibilidade: (
    idSolicitacao: number, idDisponibilidade: number, dados: DisponibilidadeRequest, opcoes: OpcoesAutenticadas,
  ) =>
    apiRequest<Disponibilidade>(`/solicitacoes/${idSolicitacao}/disponibilidades/${idDisponibilidade}`, {
      ...opcoes, method: 'PUT', body: apiJsonBody(dados),
    }),

  excluirDisponibilidade: (idSolicitacao: number, idDisponibilidade: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/solicitacoes/${idSolicitacao}/disponibilidades/${idDisponibilidade}`, { ...opcoes, method: 'DELETE' }),

  iniciarAnalise: (idSolicitacao: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<SolicitacaoAjuda>(`/solicitacoes/${idSolicitacao}/analise`, { ...opcoes, method: 'POST' }),

  encerrar: (idSolicitacao: number, situacao: SituacaoEncerramento, opcoes: OpcoesAutenticadas) =>
    apiRequest<SolicitacaoAjuda>(`/solicitacoes/${idSolicitacao}/encerramento?${new URLSearchParams({ situacao })}`, {
      ...opcoes, method: 'POST',
    }),

  excluir: (idSolicitacao: number, opcoes: OpcoesAutenticadas) =>
    apiRequest<void>(`/solicitacoes/${idSolicitacao}`, { ...opcoes, method: 'DELETE' }),
}
