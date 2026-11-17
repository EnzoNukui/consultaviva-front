import { FiCheck } from 'react-icons/fi'

export default function AvisoOperacao({ mensagem, tipo = 'sucesso' }: {
  mensagem: string
  tipo?: 'sucesso' | 'aviso'
}) {
  if (!mensagem) return null

  if (tipo === 'aviso') {
    return <p role="alert" className="mb-4 rounded-lg bg-areia px-4 py-2.5 text-body-small">{mensagem}</p>
  }

  return (
    <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-menta px-4 py-2.5 text-body-small font-bold text-turquesa-escuro">
      <FiCheck aria-hidden="true" className="shrink-0" /> {mensagem}
    </p>
  )
}
