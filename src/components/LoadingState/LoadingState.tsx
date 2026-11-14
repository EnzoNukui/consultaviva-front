interface LoadingStateProps {
  mensagem?: string
}

export default function LoadingState({ mensagem = 'Carregando…' }: LoadingStateProps) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 rounded-2xl border border-azul-profundo/10 bg-superficie px-5 py-8 text-body-small font-medium"
    >
      <span
        aria-hidden="true"
        className="size-5 shrink-0 rounded-full border-2 border-azul-profundo/15 border-t-turquesa motion-safe:animate-spin"
      />
      {mensagem}
    </div>
  )
}
