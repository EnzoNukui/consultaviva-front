import { createContext, useContext } from 'react'
import type { Sessao } from '../../types/autenticacao'

export const ContextoSessao = createContext<{
  sessao: Sessao | null
  definirSessao: (sessao: Sessao | null) => void
  sair: () => void
  restaurando: boolean
  erroRestauracao: boolean
  tentarRestaurar: () => void
} | null>(null)

export function useSessao() {
  const contexto = useContext(ContextoSessao)
  if (!contexto) throw new Error('SessaoProvider não encontrado.')
  return contexto
}
