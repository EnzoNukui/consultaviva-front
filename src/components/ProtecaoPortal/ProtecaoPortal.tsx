import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Perfil } from '../../types/autenticacao'
import ErrorState from '../ErrorState/ErrorState'
import LoadingState from '../LoadingState/LoadingState'
import { useSessao } from '../SessaoProvider/sessao'

export default function ProtecaoPortal({ perfil, classeCarregamento, children }: {
  perfil: Perfil
  classeCarregamento: string
  children: ReactNode
}) {
  const { sessao, restaurando, erroRestauracao, tentarRestaurar } = useSessao()

  if (restaurando || erroRestauracao) {
    return (
      <main className={classeCarregamento}>
        {restaurando
          ? <LoadingState mensagem="Restaurando sua sessão…" />
          : <ErrorState mensagem="Não foi possível recuperar sua sessão." tentarNovamente={tentarRestaurar} />}
      </main>
    )
  }
  if (!sessao) return <Navigate to="/acesso" replace />
  if (sessao.perfil !== perfil) return <Navigate to={sessao.perfil === 'EQUIPE' ? '/equipe' : '/paciente'} replace />

  return children
}
