import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import Botoes from '../Botoes/Botoes'

interface ErrorStateProps {
  titulo?: string
  mensagem: string
  tentarNovamente?: () => void
}

export default function ErrorState({
  titulo = 'Não conseguimos carregar os dados',
  mensagem,
  tentarNovamente,
}: ErrorStateProps) {
  return (
    <section className="rounded-2xl border border-azul-profundo/10 bg-superficie px-5 py-9 text-center sm:px-8">
      <div role="alert">
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-critico/10 text-critico">
          <FiAlertCircle className="size-6" aria-hidden="true" />
        </span>
        <h2 className="text-h4">{titulo}</h2>
        <p className="mx-auto mt-2 max-w-md text-body-small text-azul-profundo/80">{mensagem}</p>
      </div>
      {tentarNovamente && (
        <div className="mt-5">
          <Botoes
            texto="Tentar de novo"
            variante="secundario"
            icone={FiRefreshCw}
            onClick={tentarNovamente}
          />
        </div>
      )}
    </section>
  )
}
