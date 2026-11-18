
import type { ComponentPropsWithoutRef } from 'react'

export const classeCampoFormulario =
  'mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border border-azul-profundo/25 bg-superficie px-3 py-2 text-body-small font-normal text-azul-profundo focus-visible:outline-2 focus-visible:outline-turquesa-escuro'

interface CampoFormularioProps extends ComponentPropsWithoutRef<'input'> {
  rotulo: string
  erro?: string
}

export default function CampoFormulario({
  rotulo,
  erro,
  id,
  ...atributos
}: CampoFormularioProps) {
  const identificador = id ?? atributos.name
  const identificadorErro = identificador
    ? `${identificador}-erro`
    : undefined

  return (
    <label className="block min-w-0 text-body-small font-bold">
      {rotulo}

      <input
        {...atributos}
        id={identificador}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? identificadorErro : undefined}
        className={`${classeCampoFormulario} ${
          erro ? 'border-critico focus-visible:outline-critico' : ''
        }`}
      />

      {erro && (
        <span
          id={identificadorErro}
          className="mt-1 block text-sm font-normal text-critico"
        >
          {erro}
        </span>
      )}
    </label>
  )
}
