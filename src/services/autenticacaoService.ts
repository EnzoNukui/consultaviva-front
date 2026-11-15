import type { ContaAutenticada, Credenciais, Sessao } from '../types/autenticacao'
import { agendamentoService } from './agendamentoService'
import { ApiError, apiRequest } from './apiClient'
import { membroEquipeService } from './membroEquipeService'

export const autenticacaoService = {
  async entrar(credenciais: Credenciais, signal?: AbortSignal): Promise<Sessao> {
    const opcoes = { autorizacao: credenciais, signal }

    try {
      const conta = await apiRequest<(ContaAutenticada & { token: string }) | undefined>('/autenticacao/sessao', {
        ...opcoes, method: 'POST',
      })
      if (conta && (conta.perfil === 'PACIENTE' || conta.perfil === 'EQUIPE') && typeof conta.token === 'string' && conta.token) {
        const { perfil, primeiroNome, token } = conta
        return { perfil, primeiroNome, autorizacao: { token } }
      }
    } catch (erro) {
      if (signal?.aborted) throw erro
    }

    // A API publicada pode ainda não emitir tokens. Valida as credenciais nas rotas de perfil.
    try {
      await agendamentoService.listarDoPaciente(opcoes)
      return { perfil: 'PACIENTE', autorizacao: credenciais }
    } catch (erro) {
      if (!(erro instanceof ApiError) || erro.status !== 403) throw erro
    }

    await membroEquipeService.listar(opcoes)
    return { perfil: 'EQUIPE', autorizacao: credenciais }
  },

  async restaurar(token: string, signal?: AbortSignal): Promise<Sessao> {
    const autorizacao = { token }
    const conta = await apiRequest<ContaAutenticada>('/autenticacao/me', { autorizacao, signal })
    return { ...conta, autorizacao }
  },

  sair(token: string) {
    return apiRequest<void>('/autenticacao/sessao', { autorizacao: { token }, method: 'DELETE', keepalive: true })
  },
}
