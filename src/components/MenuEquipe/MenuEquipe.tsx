import { useId, useRef, useState } from 'react'
import { FiCalendar, FiClock, FiGrid, FiInbox, FiLogOut, FiMapPin, FiMenu, FiShuffle, FiUsers, FiX } from 'react-icons/fi'
import { Link, NavLink } from 'react-router-dom'
import simbolo from '../../assets/marca/simbolo-original.png'
import { useSessao } from '../SessaoProvider/sessao'

const grupos = [
  {
    titulo: '',
    links: [{ texto: 'Visão geral', caminho: '/equipe', Icone: FiGrid }],
  },
  {
    titulo: 'Atendimento',
    links: [
      { texto: 'Agendamentos', caminho: '/equipe/agendamentos', Icone: FiCalendar },
      { texto: 'Horários', caminho: '/equipe/horarios', Icone: FiClock },
    ],
  },
  {
    titulo: 'Motor de Resgate',
    links: [
      { texto: 'Solicitações', caminho: '/equipe/solicitacoes', Icone: FiInbox },
      { texto: 'Propostas', caminho: '/equipe/propostas', Icone: FiShuffle },
    ],
  },
  {
    titulo: 'Cadastros',
    links: [
      { texto: 'Pacientes', caminho: '/equipe/pacientes', Icone: FiUsers },
      { texto: 'Unidades', caminho: '/equipe/unidades', Icone: FiMapPin },
    ],
  },
]

export default function MenuEquipe() {
  const { sair } = useSessao()
  const [aberto, setAberto] = useState(false)
  const menuId = useId()
  const botaoMenu = useRef<HTMLButtonElement>(null)

  function fecharMenu() {
    if (!aberto) return

    setAberto(false)
    botaoMenu.current?.focus()
  }

  return (
    <div
      className="border-b-2 border-turquesa bg-azul-profundo text-superficie lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:overflow-y-auto lg:border-r-2 lg:border-b-0"
      onKeyDown={(evento) => {
        if (evento.key === 'Escape') fecharMenu()
      }}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 lg:px-6 lg:py-7">
        <Link
          to="/equipe"
          onClick={fecharMenu}
          className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ciano"
        >
          <img src={simbolo} alt="" width={1301} height={1209} className="h-auto w-9 shrink-0" />
          <span className="min-w-0">
            <span className="block text-xl leading-none font-bold tracking-tight">consulta<span className="text-ciano">viva</span></span>
            <span className="mt-1 block text-caption text-superficie/75">Equipe da UBS</span>
          </span>
        </Link>
        <button
          ref={botaoMenu}
          type="button"
          aria-label={aberto ? 'Fechar menu da equipe' : 'Abrir menu da equipe'}
          aria-controls={menuId}
          aria-expanded={aberto}
          onClick={() => setAberto((atual) => !atual)}
          className="grid size-11 shrink-0 place-items-center rounded-xl border border-superficie/35 hover:bg-superficie/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ciano lg:hidden"
        >
          {aberto ? <FiX className="size-5" aria-hidden="true" /> : <FiMenu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      <nav
        id={menuId}
        aria-label="Painel da equipe"
        className={`${aberto ? 'flex' : 'hidden'} flex-1 flex-col border-t border-superficie/15 px-4 pt-4 pb-5 lg:flex`}
      >
        <div className="space-y-4">
          {grupos.map(({ titulo, links }) => (
            <div key={titulo}>
              {titulo && <p className="mb-1 px-3 text-caption font-semibold text-superficie/75">{titulo}</p>}
              <ul aria-label={titulo || undefined} className="space-y-0.5">
                {links.map(({ texto, caminho, Icone }) => (
                  <li key={caminho}>
                    <NavLink
                      to={caminho}
                      end={caminho === '/equipe'}
                      onClick={fecharMenu}
                      className="group flex min-h-11 items-center gap-3 rounded-lg border-l-2 border-transparent px-3 text-body-small font-medium text-superficie/85 hover:bg-superficie/10 hover:text-superficie focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ciano aria-[current=page]:border-ciano aria-[current=page]:bg-turquesa/15 aria-[current=page]:font-bold aria-[current=page]:text-superficie"
                    >
                      <Icone className="size-[18px] shrink-0 text-superficie/70 group-aria-[current=page]:text-ciano" aria-hidden="true" />
                      <span>{texto}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={sair}
            className="flex min-h-11 w-full cursor-pointer items-center gap-3 border-t border-superficie/15 px-3 text-body-small text-superficie/80 hover:text-superficie focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ciano"
          >
            <FiLogOut className="size-4 shrink-0" aria-hidden="true" />
            Sair
          </button>
        </div>
      </nav>
    </div>
  )
}
