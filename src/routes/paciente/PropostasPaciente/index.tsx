import { Navigate, useSearchParams } from 'react-router-dom'

export default function PropostasPaciente() {
  const [parametros] = useSearchParams()
  const id = Number(parametros.get('solicitacao'))
  const caminho = '/paciente/solicitacoes'

  return <Navigate to={Number.isSafeInteger(id) && id > 0 ? `${caminho}/${id}#propostas` : caminho} replace />
}
