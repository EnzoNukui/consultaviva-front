import type { ComponentPropsWithoutRef } from 'react'

export const classeCampoFormulario = 'mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border border-azul-profundo/25 bg-superficie px-3 py-2 text-body-small font-normal text-azul-profundo focus-visible:outline-2 focus-visible:outline-turquesa-escuro'

export default function CampoFormulario({ rotulo, ...atributos }: { rotulo: string } & ComponentPropsWithoutRef<'input'>) {
  return (
    <label className="block min-w-0 text-body-small font-bold">
      {rotulo}
      <input {...atributos} className={classeCampoFormulario} />
    </label>
  )
}
