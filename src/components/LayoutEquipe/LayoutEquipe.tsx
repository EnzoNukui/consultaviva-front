import { Outlet } from 'react-router-dom'
import MenuEquipe from '../MenuEquipe/MenuEquipe'
import ProtecaoPortal from '../ProtecaoPortal/ProtecaoPortal'

export default function LayoutEquipe() {
  return (
    <ProtecaoPortal perfil="EQUIPE" classeCarregamento="mx-auto w-full max-w-3xl px-5 py-8">
      <div className="min-h-dvh bg-fundo lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
        <MenuEquipe />
        <main className="mx-auto w-full min-w-0 max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
          <Outlet />
        </main>
      </div>
    </ProtecaoPortal>
  )
}
