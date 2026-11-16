import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { IoSend } from "react-icons/io5";
import { Link } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import { useTituloPagina } from '../../../hooks/useTituloPagina'

const estiloCampo = 'w-full rounded-xl border border-azul-profundo/15 bg-fundo px-4 py-3 text-base focus:border-turquesa-escuro focus:outline-2 focus:outline-offset-2 focus:outline-turquesa-escuro'
const estiloRotulo = 'block text-sm font-bold'

export default function Contato() {
  useTituloPagina('Contato')
  const [feedback, setFeedback] = useState('')

  async function copiarMensagem(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()

    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    const nome = String(dados.get('nome')).trim()
    const email = String(dados.get('email')).trim()
    const perfil = String(dados.get('perfil'))
    const mensagem = String(dados.get('mensagem')).trim()

    if (!mensagem) {
      const campo = formulario.elements.namedItem('mensagem')
      if (campo instanceof HTMLTextAreaElement) {
        campo.setCustomValidity('Escreva sua mensagem.')
        campo.reportValidity()
      }
      return
    }

    try {
      await navigator.clipboard.writeText(`Nome: ${nome}\nE-mail: ${email}\nPerfil: ${perfil}\n\n${mensagem}`)
      setFeedback('Mensagem copiada. Agora você pode colá-la ao falar com a equipe.')
    } catch {
      setFeedback('O navegador não conseguiu copiar a mensagem. Selecione o texto e copie manualmente.')
    }
  }

  return (
    <section aria-labelledby="titulo-contato" className="bg-fundo">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
        <header>
          <p className="text-caption font-bold tracking-widest text-turquesa-escuro">CONTATO</p>
          <h1 id="titulo-contato" className="mt-3 text-display">
            Fale com a <span className="text-turquesa-escuro">equipe</span>
          </h1>
          <p className="mt-4 max-w-xl text-body-large text-azul-profundo/80">
            Tem uma dúvida, sugestão ou interesse em testar a ConsultaViva? Escreva sua mensagem para a equipe.
          </p>
        </header>

        <form
          aria-labelledby="titulo-contato"
          aria-describedby="contato-orientacao"
          onSubmit={copiarMensagem}
          onChange={() => setFeedback('')}
          className="mt-8 space-y-5 rounded-3xl border border-azul-profundo/10 bg-superficie p-5 sm:mt-10 sm:p-8 lg:p-10"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="contato-nome" className={estiloRotulo}>Nome</label>
              <input id="contato-nome" name="nome" required pattern={String.raw`\s*\S.*`} autoComplete="name" maxLength={120} placeholder="Seu nome" className={estiloCampo} />
            </div>
            <div className="space-y-2">
              <label htmlFor="contato-email" className={estiloRotulo}>E-mail</label>
              <input id="contato-email" name="email" type="email" required autoComplete="email" maxLength={254} placeholder="nome@exemplo.com" className={estiloCampo} />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="contato-perfil" className={estiloRotulo}>Você é</label>
            <select id="contato-perfil" name="perfil" required defaultValue="" className={estiloCampo}>
              <option value="" disabled>Selecione seu perfil</option>
              <option>Paciente</option>
              <option>Profissional de saúde</option>
              <option>Estudante</option>
              <option>Avaliador</option>
              <option>Outro</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="contato-mensagem" className={estiloRotulo}>Mensagem</label>
            <textarea
              id="contato-mensagem"
              name="mensagem"
              required
              rows={5}
              maxLength={2000}
              placeholder="Como podemos ajudar?"
              onChange={(evento) => evento.currentTarget.setCustomValidity('')}
              className={`${estiloCampo} resize-y`}
            />
          </div>

          <p id="contato-orientacao" className="rounded-xl bg-menta px-4 py-3 text-body-small text-azul-profundo/85">
            O envio pelo site ainda não está disponível. Você pode copiar sua mensagem e falar com a equipe pelos{' '}
            <Link to="/integrantes" className="rounded-sm font-bold text-turquesa-escuro underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">
              perfis em Integrantes
            </Link>.
          </p>

          <div className="flex flex-col items-center border-t border-azul-profundo/10 pt-5">
            <Botoes texto="Enviar mensagem" tipo="submit" icone={IoSend} posicaoIcone="direita" />
            <p role="status" className="text-center text-body-small text-azul-profundo/85 not-empty:mt-3">
              {feedback}
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
