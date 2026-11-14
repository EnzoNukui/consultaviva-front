import { useState } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface CampoAcessoProps extends ComponentPropsWithoutRef<'input'> {
  id: string
  rotulo: ReactNode
  ajuda?: string
}

export default function CampoAcesso({
  id,
  rotulo,
  ajuda,
  type = 'text',
  className = '',
  ...campo
}: CampoAcessoProps) {
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const senha = type === 'password'
  const IconeSenha = senhaVisivel ? FiEyeOff : FiEye
  const idAjuda = ajuda ? `${id}-ajuda` : undefined

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-body-small font-semibold">
        {rotulo}
      </label>
      <div className="relative">
        <input
          {...campo}
          id={id}
          type={senha && senhaVisivel ? 'text' : type}
          aria-describedby={idAjuda ?? campo['aria-describedby']}
          className={`h-12 w-full min-w-0 rounded-lg border border-azul-profundo/45 bg-superficie px-3.5 placeholder:text-azul-profundo/65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro ${senha ? 'pr-14 [&::-ms-reveal]:hidden' : ''} ${className}`}
        />
        {senha && (
          <button
            type="button"
            aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            aria-controls={id}
            onClick={() => setSenhaVisivel(!senhaVisivel)}
            className="absolute inset-y-0.5 right-0.5 grid w-11 cursor-pointer place-items-center rounded-md text-turquesa-escuro hover:bg-menta focus-visible:outline-2 focus-visible:outline-turquesa-escuro"
          >
            <IconeSenha aria-hidden="true" className="size-5" />
          </button>
        )}
      </div>
      {ajuda && <p id={idAjuda} className="mt-1 text-body-small text-azul-profundo/80">{ajuda}</p>}
    </div>
  )
}
