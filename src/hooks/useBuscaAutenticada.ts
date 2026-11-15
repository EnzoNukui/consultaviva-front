import { useEffect, useState } from 'react'
import { useSessao } from '../components/SessaoProvider/sessao'
import { ApiError } from '../services/apiClient'
import type { OpcoesAutenticadas } from '../types/autenticacao'

type Busca<T> = (opcoes: OpcoesAutenticadas) => Promise<T>
type Resultado<T> = { busca: Busca<T> } & (
  | { status: 'sucesso'; dados: T }
  | { status: 'erro'; erro: unknown }
)

export function useBuscaAutenticada<T>(busca: Busca<T>) {
  const { sessao, definirSessao } = useSessao()
  const autorizacao = sessao?.autorizacao
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    if (!autorizacao) return

    const controle = new AbortController()
    busca({ autorizacao, signal: controle.signal }).then((dados) => {
      if (!controle.signal.aborted) setResultado({ busca, status: 'sucesso', dados })
    }).catch((erro: unknown) => {
      if (controle.signal.aborted) return
      if (erro instanceof ApiError && erro.status === 401) {
        definirSessao(null)
        return
      }
      setResultado({ busca, status: 'erro', erro })
    })

    return () => controle.abort()
  }, [autorizacao, busca, definirSessao, tentativa])

  function tentarNovamente() {
    setResultado(null)
    setTentativa((atual) => atual + 1)
  }

  return { resultado: resultado?.busca === busca ? resultado : null, tentarNovamente }
}
