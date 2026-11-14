import { NavLink } from 'react-router-dom'
import { linksInstitucionais } from '../../routes/Routes'
import Botoes from '../Botoes/Botoes'

interface MenuProps {
  id: string
  aberto: boolean
  aoNavegar: () => void
}

export default function Menu({ id, aberto, aoNavegar }: MenuProps) {
  return (
    <nav
      id={id}
      aria-label="Navegação principal"
      className={`${aberto ? 'block' : 'hidden'} col-span-full pb-5 max-lg:max-h-[calc(100dvh-5rem-1px)] max-lg:overflow-y-auto lg:col-span-2 lg:grid lg:grid-cols-subgrid lg:items-center lg:pb-0`}
    >
      <ul className="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-6">
        {linksInstitucionais.map(({ texto, caminho }) => (
          <li key={caminho}>
            <NavLink
              to={caminho}
              end={caminho === '/'}
              onClick={aoNavegar}
              className="flex min-h-11 items-center rounded-sm text-sm text-azul-profundo/80 decoration-turquesa decoration-2 underline-offset-8 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa aria-[current=page]:font-bold aria-[current=page]:text-azul-profundo aria-[current=page]:underline"
            >
              {texto}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-3 lg:mt-0 lg:justify-self-end">
        <Botoes
          texto="Acessar a plataforma"
          para="/acesso"
          onClick={aoNavegar}
        />
      </div>
    </nav>
  )
}
