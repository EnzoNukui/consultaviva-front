import { useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Cabecalho from './components/Cabecalho/Cabecalho'
import Rodape from './components/Rodape/Rodape'

export default function App() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-fundo text-azul-profundo">
      <Cabecalho />
      <main className="flex-1">
        <Outlet />
      </main>
      <Rodape />
    </div>
  )
}
