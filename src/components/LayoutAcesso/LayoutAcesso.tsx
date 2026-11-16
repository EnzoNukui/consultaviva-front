import type { ReactNode } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import logo from '../../assets/marca/logo-horizontal-original.png'
import { useTituloPagina } from '../../hooks/useTituloPagina'

interface LayoutAcessoProps {
  titulo: string
  descricao?: string
  children: ReactNode
  apoio?: ReactNode
  amplo?: boolean
}

export default function LayoutAcesso({ titulo, descricao, children, apoio, amplo = false }: LayoutAcessoProps) {
  useTituloPagina(titulo)
  const larguraFormulario = amplo ? 'max-w-[34.375rem]' : 'max-w-md'

  return (
    <div className="flex min-h-dvh flex-col bg-fundo">
      <header className="border-b border-azul-profundo/10 bg-superficie">
        <div className="mx-auto flex min-h-20 max-w-5xl items-center justify-between gap-3 px-5 sm:px-8">
          <img src={logo} alt="ConsultaViva" width={2172} height={724} className="h-auto w-32 sm:w-44" />
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-sm text-body-small font-semibold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul-profundo"
          >
            <FiArrowLeft className="size-4" aria-hidden="true" />
            Voltar ao site
          </Link>
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-5xl flex-1 content-center px-5 py-10 sm:px-8 sm:py-14">
        <div className={apoio ? 'grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start' : `mx-auto w-full ${larguraFormulario}`}>
          <div className="min-w-0 rounded-2xl border border-azul-profundo/15 bg-superficie px-5 py-7 sm:px-9 sm:py-8">
            <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-[2.375rem]">{titulo}</h1>
            {descricao && <p className="mt-2 text-azul-profundo/80">{descricao}</p>}
            {children}
          </div>
          {apoio && (
            <aside className="min-w-0 rounded-2xl border border-azul-profundo/10 bg-superficie p-5 sm:p-6">
              {apoio}
            </aside>
          )}
        </div>
      </main>
    </div>
  )
}
