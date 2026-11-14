import { FiCalendar, FiClipboard, FiHome, FiShuffle, FiVideo } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'

const links = [
  { texto: 'Início', caminho: '/paciente', Icone: FiHome },
  { texto: 'Consultas', caminho: '/paciente/consultas', Icone: FiCalendar },
  { texto: 'Solicitações', caminho: '/paciente/solicitacoes', Icone: FiClipboard },
  { texto: 'Propostas', caminho: '/paciente/propostas', Icone: FiShuffle },
  { texto: 'Preparo virtual', caminho: '/paciente/preparo-virtual', Icone: FiVideo },
]

export default function MenuPaciente() {
  return (
    <nav
      aria-label="Portal do paciente"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-turquesa/40 bg-superficie px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-16px_var(--color-azul-profundo)] lg:static lg:border-0 lg:p-0 lg:shadow-none"
    >
      <ul className="relative mx-auto grid max-w-lg grid-cols-5 before:pointer-events-none before:absolute before:inset-x-[10%] before:top-4.5 before:h-px before:bg-turquesa/50 lg:flex lg:max-w-none lg:justify-center lg:gap-1 lg:before:hidden">
        {links.map(({ texto, caminho, Icone }) => (
          <li key={caminho} className="min-w-0">
            <NavLink
              to={caminho}
              end={caminho === '/paciente'}
              className="group relative flex min-h-16 flex-col items-center gap-1 rounded-xl px-0.5 text-center text-caption leading-tight font-semibold text-azul-profundo/80 hover:bg-fundo focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-azul-profundo aria-[current=page]:font-bold aria-[current=page]:text-azul-profundo lg:min-h-11 lg:flex-row lg:gap-2 lg:px-2.5 lg:text-body-small lg:leading-tight lg:aria-[current=page]:bg-turquesa/15"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-turquesa/40 bg-fundo group-aria-[current=page]:border-azul-profundo group-aria-[current=page]:bg-turquesa lg:size-auto lg:rounded-none lg:border-0 lg:bg-transparent lg:group-aria-[current=page]:bg-transparent">
                <Icone className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="wrap-anywhere group-aria-[current=page]:underline group-aria-[current=page]:underline-offset-3">{texto}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
