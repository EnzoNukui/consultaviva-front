import type { Credenciais, Perfil } from '../types/autenticacao'
import { agendamentoService } from './agendamentoService'
import { ApiError } from './apiClient'
import { membroEquipeService } from './membroEquipeService'

export const autenticacaoService = {
  async validarCredenciais(credenciais: Credenciais, signal?: AbortSignal): Promise<Perfil> {
    const opcoes = { credenciais, signal }

    // A listagem do próprio paciente é exclusiva desse perfil e pode retornar uma lista vazia.
    try {
      await agendamentoService.listarDoPaciente(opcoes)
      return 'PACIENTE'
    } catch (erro) {
      if (!(erro instanceof ApiError) || erro.status !== 403) throw erro
    }

    // Confirma o perfil da equipe em uma rota exclusiva antes de liberar o painel.
    await membroEquipeService.listar(opcoes)
    return 'EQUIPE'
  },
}
