import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError } from '../../services/apiClient'
import { autenticacaoService } from '../../services/autenticacaoService'
import type { Sessao } from '../../types/autenticacao'
import { ContextoSessao } from './sessao'

const CHAVE_SESSAO = 'consultaviva.sessao'

function lerToken() {
  try {
    return sessionStorage.getItem(CHAVE_SESSAO)
  } catch {
    return null
  }
}

export default function SessaoProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null)
  const [tokenSalvo, setTokenSalvo] = useState(lerToken)
  const [erroRestauracao, setErroRestauracao] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  const definirSessao = useCallback((novaSessao: Sessao | null) => {
    const autorizacao = novaSessao?.autorizacao
    try {
      if (autorizacao && 'token' in autorizacao) sessionStorage.setItem(CHAVE_SESSAO, autorizacao.token)
      else sessionStorage.removeItem(CHAVE_SESSAO)
    } catch {
      // A sessão em memória também funciona quando o navegador bloqueia o armazenamento.
    }
    setTokenSalvo(null)
    setErroRestauracao(false)
    setSessao(novaSessao)
  }, [])

  useEffect(() => {
    if (!tokenSalvo) return

    const controle = new AbortController()
    autenticacaoService.restaurar(tokenSalvo, controle.signal).then((conta) => {
      if (!controle.signal.aborted) definirSessao(conta)
    }).catch((erro: unknown) => {
      if (controle.signal.aborted) return
      if (erro instanceof ApiError && (erro.status === 401 || erro.status === 403)) definirSessao(null)
      else setErroRestauracao(true)
    })

    return () => controle.abort()
  }, [definirSessao, tentativa, tokenSalvo])

  function tentarRestaurar() {
    setErroRestauracao(false)
    setTentativa((atual) => atual + 1)
  }

  function sair() {
    const autorizacao = sessao?.autorizacao
    definirSessao(null)
    if (autorizacao && 'token' in autorizacao) {
      void autenticacaoService.sair(autorizacao.token).catch(() => {
        // A sessão local já foi encerrada. O token também tem prazo de validade no servidor.
      })
    }
  }

  return (
    <ContextoSessao.Provider value={{ sessao, definirSessao, sair, restaurando: !!tokenSalvo && !erroRestauracao, erroRestauracao, tentarRestaurar }}>
      {children}
    </ContextoSessao.Provider>
  )
}
