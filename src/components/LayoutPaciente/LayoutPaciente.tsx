import { FiArrowUpRight } from 'react-icons/fi'
import { Link, Outlet } from 'react-router-dom'
import logo from '../../assets/marca/logo-horizontal-original.png'
import MenuPaciente from '../MenuPaciente/MenuPaciente'

export default function LayoutPaciente() {
  return (
    <div className="flex min-h-dvh flex-col bg-fundo pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-0">
      <header className="border-b border-azul-profundo/10 bg-superficie">
        <div className="mx-auto grid min-h-20 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 px-5 sm:px-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-x-6">
          <Link
            to="/paciente"
            className="w-fit rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-azul-profundo"
          >
            <img src={logo} alt="ConsultaViva — início do paciente" width={2172} height={724} className="h-auto w-36 lg:w-40" />
          </Link>
          <MenuPaciente />
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-sm text-body-small font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-profundo"
          >
            Voltar ao site
            <FiArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full min-w-0 max-w-5xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <Outlet />
      </main>
    </div>
  )
}
