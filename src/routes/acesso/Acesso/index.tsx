import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import CampoAcesso from '../../../components/CampoAcesso/CampoAcesso'
import LayoutAcesso from '../../../components/LayoutAcesso/LayoutAcesso'
import { useSessao } from '../../../components/SessaoProvider/sessao'
import { ApiError } from '../../../services/apiClient'
import { autenticacaoService } from '../../../services/autenticacaoService'

export default function Acesso() {
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState('')
  const requisicao = useRef<AbortController | null>(null)
  const navigate = useNavigate()
  const { state } = useLocation()
  const { definirSessao } = useSessao()

  useEffect(() => {
    return () => requisicao.current?.abort()
  }, [])

  async function entrar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (requisicao.current) return

    const dados = new FormData(evento.currentTarget)
    const email = String(dados.get('email') ?? '').trim()
    const senha = String(dados.get('senha') ?? '')
    const controle = new AbortController()
    requisicao.current = controle
    setErro('')
    setEntrando(true)

    try {
      const conta = await autenticacaoService.entrar({ email, senha }, controle.signal)
      if (!controle.signal.aborted) {
        definirSessao(conta)
        await navigate(conta.perfil === 'PACIENTE' ? '/paciente' : '/equipe', { replace: true })
      }
    } catch (falha) {
      if (controle.signal.aborted) return

      if (falha instanceof ApiError && (falha.status === 401 || falha.status === 403)) {
        setErro('E-mail ou senha incorretos. Confira os dados e tente novamente.')
      } else {
        setErro('Não foi possível entrar agora. Tente novamente em instantes.')
      }
    } finally {
      requisicao.current = null
      if (!controle.signal.aborted) setEntrando(false)
    }
  }

  return (
    <LayoutAcesso titulo="Entrar na plataforma" descricao="Use o e-mail e a senha da sua conta.">
      {state?.cadastroConcluido === true && (
        <p role="status" className="mt-4 rounded-lg bg-menta px-3 py-2 text-body-small text-turquesa-escuro">
          Conta criada com sucesso. Entre com seu e-mail e senha.
        </p>
      )}
      <form onSubmit={entrar} className="mt-6 grid gap-4">
        <CampoAcesso
          id="email"
          name="email"
          rotulo="E-mail"
          type="email"
          autoComplete="username"
          placeholder="nome@gmail.com"
          required
          readOnly={entrando}
        />
        <CampoAcesso
          id="senha"
          name="senha"
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          required
          readOnly={entrando}
        />

        {erro && <p role="alert" className="text-body-small font-semibold text-critico">{erro}</p>}

        <Botoes tipo="submit" texto={entrando ? 'Entrando…' : 'Entrar'} carregando={entrando} />
        {entrando && (
          <p role="status" className="text-center text-body-small text-azul-profundo/80">
            O primeiro acesso pode levar alguns minutos.
          </p>
        )}
      </form>

      <p className="mt-5 border-t border-azul-profundo/10 pt-4 text-center text-body-small text-azul-profundo/80">
        É paciente e ainda não tem conta?{' '}
        <Link to="/cadastro" className="rounded-sm font-bold text-turquesa-escuro underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">
          Cadastre-se
        </Link>
      </p>
    </LayoutAcesso>
  )
}
