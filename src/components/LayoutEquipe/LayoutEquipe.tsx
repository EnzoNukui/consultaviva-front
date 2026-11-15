import { Navigate, Outlet } from 'react-router-dom'
import ErrorState from '../ErrorState/ErrorState'
import LoadingState from '../LoadingState/LoadingState'
import MenuEquipe from '../MenuEquipe/MenuEquipe'
import { useSessao } from '../SessaoProvider/sessao'

export default function LayoutEquipe() {
  const { sessao, restaurando, erroRestauracao, tentarRestaurar } = useSessao()

  if (restaurando || erroRestauracao) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-8">
        {restaurando
          ? <LoadingState mensagem="Restaurando sua sessão…" />
          : <ErrorState mensagem="Não foi possível recuperar sua sessão." tentarNovamente={tentarRestaurar} />}
      </main>
    )
  }
  if (!sessao) return <Navigate to="/acesso" replace />
  if (sessao.perfil !== 'EQUIPE') return <Navigate to="/paciente" replace />

  return (
    <div className="min-h-dvh bg-fundo lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
      <MenuEquipe />
      <main className="mx-auto w-full min-w-0 max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
        <Outlet />
      </main>
    </div>
  )
}
