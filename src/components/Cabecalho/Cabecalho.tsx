import { useEffect, useId, useRef, useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import logo from '../../assets/marca/logo-horizontal-original.png'
import Menu from '../Menu/Menu'

export default function Cabecalho() {
  const [menuAberto, setMenuAberto] = useState(false)
  const menuId = useId()
  const botaoMenu = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuAberto) return

    function fecharComEscape(evento: KeyboardEvent) {
      if (evento.key !== 'Escape') return

      setMenuAberto(false)
      botaoMenu.current?.focus()
    }

    document.addEventListener('keydown', fecharComEscape)
    return () => document.removeEventListener('keydown', fecharComEscape)
  }, [menuAberto])

  return (
    <header className="sticky top-0 z-20 border-b border-azul-profundo/10 bg-superficie">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-4 px-5 sm:px-8 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          to="/"
          onClick={() => setMenuAberto(false)}
          className="flex min-h-20 items-center justify-self-start rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turquesa"
        >
          <img src={logo} alt="ConsultaViva — página inicial" width={2172} height={724} className="h-auto w-44" />
        </Link>

        <button
          ref={botaoMenu}
          type="button"
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
          aria-controls={menuId}
          onClick={() => setMenuAberto((aberto) => !aberto)}
          className="grid size-11 place-items-center rounded-full border border-azul-profundo/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turquesa lg:hidden"
        >
          {menuAberto ? <FiX size={22} aria-hidden="true" /> : <FiMenu size={22} aria-hidden="true" />}
        </button>

        <Menu
          id={menuId}
          aberto={menuAberto}
          aoNavegar={() => setMenuAberto(false)}
        />
      </div>
    </header>
  )
}
