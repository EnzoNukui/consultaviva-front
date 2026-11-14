import { Link } from 'react-router-dom'
import { linksInstitucionais } from '../../routes/Routes'

export default function Rodape() {
  return (
    <footer className="border-t-4 border-turquesa bg-azul-profundo text-superficie">
      <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-8 lg:pt-14">
        <div className="flex flex-col gap-6 pb-7 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              to="/"
              aria-label="ConsultaViva — página inicial"
              className="inline-block rounded-sm text-2xl leading-none font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turquesa"
            >
              consulta<span className="text-turquesa">viva</span>
            </Link>
            <p className="mt-2 text-sm text-superficie/75">Da consulta marcada ao atendimento realizado.</p>
          </div>

          <nav aria-label="Navegação do rodapé">
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {linksInstitucionais.map(({ texto, caminho }) => (
                <li key={caminho}>
                  <Link
                    to={caminho}
                    className="inline-flex min-h-11 items-center rounded-sm text-sm text-superficie/80 underline-offset-4 hover:text-superficie hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa"
                  >
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t border-superficie/15 py-5 text-xs text-superficie/70 sm:flex-row sm:justify-between">
          <p>© 2026 ConsultaViva. Protótipo acadêmico com dados fictícios.</p>
          <p>Sem integração oficial com o SUS.</p>
        </div>
      </div>
    </footer>
  )
}
