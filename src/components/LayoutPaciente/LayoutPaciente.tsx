
import { useEffect, useRef, useState } from 'react'
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi'
import { Link, Outlet } from 'react-router-dom'
import logo from '../../assets/marca/logo-horizontal-original.png'
import MenuPaciente from '../MenuPaciente/MenuPaciente'
import ProtecaoPortal from '../ProtecaoPortal/ProtecaoPortal'
import { useSessao } from '../SessaoProvider/sessao'

const larguraConteudo = 'mx-auto w-full max-w-[58rem] px-4 sm:px-5'
const botaoIcone = 'grid size-11 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-menta focus-visible:outline-2 focus-visible:outline-turquesa-escuro'

export default function LayoutPaciente() {
  return (
    <ProtecaoPortal perfil="PACIENTE" classeCarregamento={`${larguraConteudo} py-8`}>
      <PortalPaciente />
    </ProtecaoPortal>
  )
}

function PortalPaciente() {
  const { sair } = useSessao()
  const [menuAberto, setMenuAberto] = useState(false)

  const menu = useRef<HTMLDialogElement>(null)
  const abrirMenu = useRef<HTMLButtonElement>(null)
  const botaoFechar = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const larguraDesktop = window.matchMedia('(min-width: 48rem)')

    function fecharNoDesktop() {
      if (larguraDesktop.matches) {
        menu.current?.close()
      }
    }

    larguraDesktop.addEventListener('change', fecharNoDesktop)

    return () => larguraDesktop.removeEventListener('change', fecharNoDesktop)
  }, [])

  function fecharMenu() {
    menu.current?.close()
    setMenuAberto(false)
  }

  return (
    <div className="min-h-dvh bg-fundo md:pl-58">
      <aside className="fixed inset-y-0 left-0 hidden w-58 overflow-y-auto border-r border-azul-profundo/10 bg-superficie px-3.5 pt-4.5 pb-6 md:block">
        <Link to="/paciente" className="flex min-h-14 items-center px-2.5">
          <img
            src={logo}
            alt="ConsultaViva — início do paciente"
            width={2172}
            height={724}
            className="h-auto w-42"
          />
        </Link>

        <MenuPaciente />
      </aside>

      <dialog
        id="menu-lateral-paciente"
        ref={menu}
        aria-label="Menu do paciente"
        className="fixed inset-y-0 right-auto left-0 m-0 h-dvh max-h-none w-[min(17.5rem,82vw)] max-w-none overflow-y-auto bg-superficie p-0 text-azul-profundo backdrop:bg-azul-profundo/40"
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) {
            fecharMenu()
          }
        }}
        onClose={() => {
          setMenuAberto(false)

          if (abrirMenu.current?.offsetWidth) {
            abrirMenu.current.focus()
          }
        }}
      >
        <div className="min-h-full px-3.5 pt-4.5 pb-6">
          <div className="flex min-h-14 items-center justify-between gap-2 pl-2.5">
            <Link to="/paciente" onClick={fecharMenu} className="min-w-0">
              <img
                src={logo}
                alt="ConsultaViva — início do paciente"
                width={2172}
                height={724}
                className="h-auto w-42"
              />
            </Link>

            <button
              ref={botaoFechar}
              type="button"
              aria-label="Fechar menu"
              onClick={fecharMenu}
              className={botaoIcone}
            >
              <FiX aria-hidden="true" className="size-5" />
            </button>
          </div>

          <MenuPaciente aoNavegar={fecharMenu} />
        </div>
      </dialog>

      <header className="border-b border-azul-profundo/10 bg-superficie md:border-0 md:bg-transparent">
        <div className={`${larguraConteudo} flex min-h-15.5 items-center gap-2 md:justify-end`}>
          <button
            ref={abrirMenu}
            type="button"
            aria-label="Abrir menu"
            aria-haspopup="dialog"
            aria-controls="menu-lateral-paciente"
            aria-expanded={menuAberto}
            onClick={() => {
              if (!menu.current?.open) {
                menu.current?.showModal()
              }

              setMenuAberto(menu.current?.open ?? false)
              botaoFechar.current?.focus()
            }}
            className={`${botaoIcone} -ml-2 md:hidden`}
          >
            <FiMenu aria-hidden="true" className="size-5" />
          </button>

          <Link to="/paciente" className="mr-auto min-w-0 md:hidden">
            <img
              src={logo}
              alt="ConsultaViva — início do paciente"
              width={2172}
              height={724}
              className="h-auto w-32.5"
            />
          </Link>

          <button
            type="button"
            onClick={sair}
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-md text-body-small font-bold hover:text-turquesa-escuro focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turquesa-escuro"
          >
            <FiLogOut aria-hidden="true" className="size-4.5 text-turquesa-escuro" />
            Sair
          </button>
        </div>
      </header>

      <main className={`${larguraConteudo} pt-6 pb-10 md:pt-2`}>
        <Outlet />
      </main>
    </div>
  )
}
