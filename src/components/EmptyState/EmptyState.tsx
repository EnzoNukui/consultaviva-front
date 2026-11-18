import type { ReactNode } from 'react'
import simbolo from '../../assets/marca/simbolo-original.png'

interface EmptyStateProps {
  titulo: string
  mensagem: string
  acao?: ReactNode
}

export default function EmptyState({
  titulo,
  mensagem,
  acao,
}: EmptyStateProps) {
  return (
    <section
      aria-labelledby="empty-state-titulo"
      aria-describedby="empty-state-mensagem"
      className="rounded-2xl border border-azul-profundo/10 bg-superficie px-5 py-9 text-center sm:px-8"
    >
      <img
        src={simbolo}
        alt=""
        width={1301}
        height={1209}
        className="mx-auto mb-4 h-auto w-16"
      />

      <h2 id="empty-state-titulo" className="text-h4">
        {titulo}
      </h2>

      <p
        id="empty-state-mensagem"
        className="mx-auto mt-2 max-w-md text-body-small text-azul-profundo/80"
      >
        {mensagem}
      </p>

      {acao && <div className="mt-5">{acao}</div>}
    </section>
  )
}