import { FiCalendar, FiClipboard, FiHelpCircle, FiHome } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'

const links = [
  { texto: 'Início', caminho: '/paciente', Icone: FiHome },
  { texto: 'Consultas', caminho: '/paciente/consultas', Icone: FiCalendar },
  { texto: 'Solicitações', caminho: '/paciente/solicitacoes', Icone: FiClipboard },
  { texto: 'Precisa de ajuda?', caminho: '/paciente/ajuda', Icone: FiHelpCircle },
]

export default function MenuPaciente({ aoNavegar }: { aoNavegar?: () => void }) {
  return (
    <nav aria-label="Portal do paciente" className="mt-7">
      <ul className="space-y-1">
        {links.map(({ texto, caminho, Icone }) => (
          <li key={caminho}>
            <NavLink
              to={caminho}
              end={caminho === '/paciente'}
              onClick={aoNavegar}
              className="flex min-h-11 items-center gap-2.5 rounded-lg border-l-3 border-transparent px-2.5 py-2 text-body-small font-semibold text-azul-profundo/80 hover:bg-fundo focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-turquesa-escuro aria-[current=page]:border-turquesa-escuro aria-[current=page]:bg-menta aria-[current=page]:font-bold aria-[current=page]:text-turquesa-escuro"
            >
              <Icone className="size-[18px] shrink-0" aria-hidden="true" />
              {texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
