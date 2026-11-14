import { useId } from 'react'
import type { ReactNode } from 'react'
import { FiChevronDown, FiMinus, FiPlus } from 'react-icons/fi'

interface ItemAccordion {
  id: string
  pergunta: string
  resposta: ReactNode
}

interface AccordionProps {
  itens: readonly ItemAccordion[]
  itemInicial?: string
  variante?: 'cartao' | 'linhas'
}

export default function Accordion({ itens, itemInicial, variante = 'cartao' }: AccordionProps) {
  const grupo = useId()
  const emLinhas = variante === 'linhas'

  return (
    <div className={emLinhas ? 'divide-y divide-azul-profundo/20 border-y border-azul-profundo/20' : 'space-y-3'}>
      {itens.map(({ id, pergunta, resposta }) => (
        <details
          key={id}
          name={grupo}
          open={id === itemInicial}
          className={emLinhas ? 'group' : 'group overflow-hidden rounded-[1.25rem] border border-azul-profundo/10 bg-superficie open:border-turquesa-escuro/20'}
        >
          <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-azul-profundo [&::-webkit-details-marker]:hidden ${emLinhas ? 'min-h-14 py-5 text-h4 font-bold hover:text-turquesa-escuro' : 'min-h-[4.75rem] px-5 py-4 text-body font-bold hover:bg-fundo group-open:min-h-16 sm:px-6'}`}>
            <span>{pergunta}</span>
            {emLinhas ? (
              <FiChevronDown className="size-6 shrink-0 text-turquesa-escuro group-open:rotate-180" aria-hidden="true" />
            ) : (
              <span
                aria-hidden="true"
                className="grid size-8 shrink-0 place-items-center rounded-full bg-turquesa/15 text-turquesa-escuro group-open:bg-turquesa-escuro group-open:text-superficie"
              >
                <FiPlus className="size-4 group-open:hidden" />
                <FiMinus className="hidden size-4 group-open:block" />
              </span>
            )}
          </summary>
          <div className={emLinhas ? 'pr-8 pb-6 text-body text-azul-profundo/80' : 'px-5 pb-5 text-body text-azul-profundo/80 sm:px-6'}>
            {resposta}
          </div>
        </details>
      ))}
    </div>
  )
}
