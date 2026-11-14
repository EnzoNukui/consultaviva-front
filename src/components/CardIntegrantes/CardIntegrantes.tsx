import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

interface CardIntegrantesProps {
  nome: string
  area?: string
  rm: string
  turma?: string
  foto?: string
  github?: string
  linkedin?: string
  perfil?: string
  destaque?: boolean
}

const estiloRedeSocial =
  'inline-grid size-11 place-items-center rounded-full border border-azul-profundo/15 text-azul-profundo transition-colors hover:bg-turquesa/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa'

export default function CardIntegrantes({
  nome,
  area,
  rm,
  turma,
  foto,
  github,
  linkedin,
  perfil,
  destaque = false,
}: CardIntegrantesProps) {
  const Titulo = destaque ? 'h1' : 'h2'
  const partesNome = nome.split(' ')
  const iniciais = partesNome.filter((_, indice) => indice === 0 || indice === partesNome.length - 1).map((parte) => parte[0]).join('')

  return (
    <article className={`flex h-full min-w-0 flex-col rounded-3xl border border-azul-profundo/10 bg-superficie ${destaque ? 'gap-6 p-4 sm:flex-row sm:items-center md:gap-10 md:p-6' : 'gap-3 p-3.5'}`}>
      <div className={`aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-menta ${destaque ? 'sm:w-2/5' : ''}`}>
        {foto ? (
          <img
            src={foto}
            alt={`Foto de ${nome}`}
            loading={destaque ? 'eager' : 'lazy'}
            className="size-full object-cover object-center"
          />
        ) : (
          <div aria-hidden="true" className="grid size-full place-items-center text-h1 text-turquesa-escuro">
            {iniciais}
          </div>
        )}
      </div>

      <div className={`flex min-w-0 flex-1 flex-col ${destaque ? 'gap-5 px-2 pb-2 sm:px-0 sm:pb-0' : 'gap-3'}`}>
        <div className="space-y-1">
          <Titulo className={destaque ? 'text-h1 wrap-break-word' : 'text-lg leading-snug font-bold wrap-break-word'}>
            {perfil ? (
              <Link
                to={perfil}
                className="inline-flex min-h-11 items-start gap-2 rounded-sm decoration-turquesa underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa"
              >
                <span>{nome}</span>
                <FiArrowRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-turquesa-escuro" />
              </Link>
            ) : nome}
          </Titulo>
          {area && <p className="text-sm leading-snug font-medium text-azul-profundo/80">{area}</p>}
        </div>

        <ul aria-label="Dados acadêmicos" className="flex flex-wrap gap-1.5">
          <li className="rounded-full bg-turquesa/15 px-2.5 py-0.5 text-xs font-semibold">RM {rm}</li>
          {turma && <li className="rounded-full bg-turquesa/15 px-2.5 py-0.5 text-xs font-semibold">{turma}</li>}
        </ul>

        {(github || linkedin) && (
          <ul aria-label={`Redes de ${nome}`} className="mt-auto flex flex-wrap gap-2">
            {github && (
              <li>
                <a href={github} target="_blank" rel="noopener noreferrer" aria-label={`GitHub de ${nome}`} className={estiloRedeSocial}>
                  <FaGithub size={16} aria-hidden="true" />
                </a>
              </li>
            )}
            {linkedin && (
              <li>
                <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${nome}`} className={estiloRedeSocial}>
                  <FaLinkedin size={16} aria-hidden="true" />
                </a>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  )
}
