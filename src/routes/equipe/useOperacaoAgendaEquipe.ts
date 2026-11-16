import { useEffect, useRef, useState } from 'react'
import { useSessao } from '../../components/SessaoProvider/sessao'
import { ApiError } from '../../services/apiClient'
import type { OpcoesAutenticadas } from '../../types/autenticacao'

export function useOperacaoAgendaEquipe() {
  const { sessao, definirSessao } = useSessao()
  const [ocupado, setOcupado] = useState(false)
  const [erro, setErro] = useState('')
  const requisicao = useRef<AbortController | null>(null)
  useEffect(() => () => requisicao.current?.abort(), [])

  async function executar<T>(operacao: (opcoes: OpcoesAutenticadas) => Promise<T>, aoConcluir: (resultado: T) => void) {
    if (!sessao || requisicao.current) return
    const controle = new AbortController()
    requisicao.current = controle
    setOcupado(true)
    setErro('')

    try {
      const resultado = await operacao({ autorizacao: sessao.autorizacao, signal: controle.signal })
      if (!controle.signal.aborted) aoConcluir(resultado)
    } catch (falha) {
      if (controle.signal.aborted) return
      if (falha instanceof ApiError && falha.status === 401) {
        definirSessao(null)
        return
      }
      setErro(falha instanceof ApiError && falha.status < 500 ? falha.message
        : 'Não foi possível confirmar a operação. Confira a agenda antes de tentar novamente.')
    } finally {
      requisicao.current = null
      if (!controle.signal.aborted) setOcupado(false)
    }
  }

  return { ocupado, erro, setErro, executar }
}
