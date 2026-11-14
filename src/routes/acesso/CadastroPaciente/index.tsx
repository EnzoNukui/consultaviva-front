import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import CampoAcesso from '../../../components/CampoAcesso/CampoAcesso'
import LayoutAcesso from '../../../components/LayoutAcesso/LayoutAcesso'
import { ApiError } from '../../../services/apiClient'
import { pacienteService } from '../../../services/pacienteService'

function ultimaDataDeNascimento() {
  const hoje = new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const [dia, mes, ano] = hoje.split('/').map(Number)
  const ontem = new Date(Date.UTC(ano, mes - 1, dia - 1))
  return ontem.toISOString().slice(0, 10)
}

export default function CadastroPaciente() {
  const [cadastrando, setCadastrando] = useState(false)
  const [erro, setErro] = useState('')
  const requisicao = useRef<AbortController | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    return () => requisicao.current?.abort()
  }, [])

  async function cadastrar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (requisicao.current) return

    const dados = new FormData(evento.currentTarget)
    const nomePaciente = String(dados.get('nomePaciente') ?? '').trim()
    const dataNascimento = String(dados.get('dataNascimento') ?? '')
    const telefone = String(dados.get('telefone') ?? '').trim()
    const email = String(dados.get('email') ?? '').trim()
    const senha = String(dados.get('senha') ?? '')

    if (!nomePaciente || !senha.trim()) {
      setErro('Preencha o nome completo e use uma senha com pelo menos 12 caracteres que não seja só espaços.')
      return
    }
    if (dataNascimento > ultimaDataDeNascimento()) {
      setErro('Informe uma data de nascimento anterior a hoje.')
      return
    }

    const controle = new AbortController()
    requisicao.current = controle
    setErro('')
    setCadastrando(true)

    try {
      await pacienteService.cadastrar({
        nomePaciente,
        dataNascimento,
        telefone: telefone || null,
        email,
        senha,
      }, controle.signal)

      if (!controle.signal.aborted) {
        await navigate('/acesso', { replace: true, state: { cadastroConcluido: true } })
      }
    } catch (falha) {
      if (controle.signal.aborted) return

      if (falha instanceof ApiError && falha.status === 409) {
        setErro('Não foi possível criar a conta. Verifique se o e-mail já está em uso.')
      } else if (falha instanceof ApiError && falha.status === 400) {
        setErro('Confira os dados do formulário e tente novamente.')
      } else {
        setErro('Não foi possível criar a conta agora. Tente novamente em instantes.')
      }
    } finally {
      requisicao.current = null
      if (!controle.signal.aborted) setCadastrando(false)
    }
  }

  return (
    <LayoutAcesso
      titulo="Criar conta de paciente"
      descricao="Acompanhe suas consultas pelo portal do paciente."
      amplo
    >
      <form onSubmit={cadastrar} className="mt-6 grid gap-3.5">
        <CampoAcesso
          id="nomePaciente"
          name="nomePaciente"
          rotulo="Nome completo"
          autoComplete="name"
          placeholder="Seu nome completo"
          maxLength={100}
          required
          readOnly={cadastrando}
        />

        <div className="grid gap-3.5 sm:grid-cols-2">
          <CampoAcesso
            id="dataNascimento"
            name="dataNascimento"
            rotulo="Data de nascimento"
            type="date"
            autoComplete="bday"
            max={ultimaDataDeNascimento()}
            required
            readOnly={cadastrando}
          />
          <CampoAcesso
            id="telefone"
            name="telefone"
            rotulo={<>Telefone <span className="font-normal text-azul-profundo/75">(opcional)</span></>}
            type="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            maxLength={20}
            readOnly={cadastrando}
          />
        </div>

        <CampoAcesso
          id="email"
          name="email"
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          placeholder="nome@exemplo.com"
          maxLength={150}
          required
          readOnly={cadastrando}
        />
        <CampoAcesso
          id="senha"
          name="senha"
          rotulo="Senha"
          type="password"
          autoComplete="new-password"
          ajuda="Use de 12 a 128 caracteres."
          minLength={12}
          maxLength={128}
          required
          readOnly={cadastrando}
        />

        {erro && <p role="alert" className="text-body-small font-semibold text-critico">{erro}</p>}
        <Botoes tipo="submit" texto={cadastrando ? 'Criando conta…' : 'Criar conta'} carregando={cadastrando} />
        {cadastrando && (
          <p role="status" className="text-center text-body-small text-azul-profundo/80">
            O cadastro pode levar alguns minutos.
          </p>
        )}
      </form>

      <p className="mt-5 border-t border-azul-profundo/10 pt-4 text-center text-body-small text-azul-profundo/80">
        Já tem conta?{' '}
        <Link to="/acesso" className="rounded-sm font-bold text-turquesa-escuro underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">
          Entrar
        </Link>
      </p>
    </LayoutAcesso>
  )
}
