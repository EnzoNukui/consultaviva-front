import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode, SubmitEvent } from 'react'
import { FiCheck } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useSessao } from '../../../components/SessaoProvider/sessao'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { prazoDaOferta } from '../../../services/propostasDoPaciente'
import { propostaService } from '../../../services/propostaService'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import type { SolicitacaoAjuda } from '../../../types/solicitacao'
import { solicitacaoAtiva } from '../SolicitacoesPaciente/dadosSolicitacoes'
import { useBuscaPaciente } from '../useBuscaPaciente'
import CardProposta from './CardProposta'
import { carregarPropostasDaSolicitacao, formatarDataHoraProposta, situacaoDaOferta } from './dadosPropostas'
import type { ConsultaParaPropostas, PropostaDoPaciente, SituacaoOferta } from './dadosPropostas'

export default function PropostasDaSolicitacao({ pedido, consulta, children }: {
  pedido: SolicitacaoAjuda
  consulta: ConsultaParaPropostas
  children: ReactNode
}) {
  const { hash } = useLocation()
  const { sessao, definirSessao } = useSessao()
  const buscar = useCallback((opcoes: OpcoesAutenticadas) => (
    carregarPropostasDaSolicitacao(pedido, consulta, opcoes)
  ), [pedido, consulta])
  const { resultado, tentarNovamente } = useBuscaPaciente(buscar)
  const [, atualizarRelogio] = useState(0)
  const [confirmacao, setConfirmacao] = useState<{ idProposta: number; aceitar: boolean } | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [retorno, setRetorno] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
  const dialogo = useRef<HTMLDialogElement>(null)
  const secao = useRef<HTMLElement>(null)
  const tituloDialogo = useRef<HTMLHeadingElement>(null)
  const requisicao = useRef<AbortController | null>(null)

  useEffect(() => {
    const relogio = window.setInterval(() => atualizarRelogio((atual) => atual + 1), 15_000)
    return () => window.clearInterval(relogio)
  }, [])

  useEffect(() => () => requisicao.current?.abort(), [])

  useEffect(() => {
    if (hash === '#propostas') secao.current?.scrollIntoView({ block: 'start' })
  }, [hash])

  useEffect(() => {
    if (confirmacao && dialogo.current && !dialogo.current.open) {
      dialogo.current.showModal()
      tituloDialogo.current?.focus()
    }
  }, [confirmacao])

  const agora = agoraNaAgenda()
  const propostas = resultado?.status === 'sucesso' ? resultado.dados : []
  const classificadas = propostas.map((item) => ({ item, situacao: situacaoDaOferta(item, agora) }))
  const pendentes = classificadas.filter(({ situacao }) => situacao === 'pendente')
    .sort((a, b) => (prazoDaOferta(a.item.proposta) ?? 0) - (prazoDaOferta(b.item.proposta) ?? 0))
  const aceitas = classificadas.filter(({ situacao }) => situacao === 'aceita')
  const historico = classificadas.filter(({ situacao }) => situacao !== 'pendente' && situacao !== 'aceita')
    .sort((a, b) => timestampDaAgenda(b.item.proposta.dataConfirmacao ?? b.item.proposta.dataResposta ?? b.item.proposta.dataCriacao)
        - timestampDaAgenda(a.item.proposta.dataConfirmacao ?? a.item.proposta.dataResposta ?? a.item.proposta.dataCriacao))
  const atuais = [...pendentes, ...aceitas]
  const ofertaSelecionada = propostas.find(({ proposta }) => proposta.idProposta === confirmacao?.idProposta)
  const podeResponder = ofertaSelecionada && situacaoDaOferta(ofertaSelecionada, agora) === 'pendente'
  function renderizarPropostas(lista: { item: PropostaDoPaciente; situacao: SituacaoOferta }[]) {
    return (
      <ul className="space-y-3">
        {lista.map(({ item, situacao }) => (
          <li key={item.proposta.idProposta}>
            <CardProposta item={item} situacao={situacao} aoResponder={(aceitar) =>
              setConfirmacao({ idProposta: item.proposta.idProposta, aceitar })} />
          </li>
        ))}
      </ul>
    )
  }

  function fecharConfirmacao() {
    dialogo.current?.close()
    setConfirmacao(null)
  }

  async function enviarResposta(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!sessao || !confirmacao || requisicao.current) return
    if (!ofertaSelecionada || situacaoDaOferta(ofertaSelecionada, agoraNaAgenda()) !== 'pendente') {
      fecharConfirmacao()
      setRetorno({ tipo: 'erro', texto: 'Esta oferta não está mais disponível para resposta. Atualizamos a lista.' })
      tentarNovamente()
      return
    }

    const { idProposta, aceitar } = confirmacao
    const controle = new AbortController()
    requisicao.current = controle
    setEnviando(true)
    setRetorno(null)

    try {
      const resposta = await propostaService.registrarResposta(idProposta, aceitar, {
        autorizacao: sessao.autorizacao, signal: controle.signal,
      })
      if (resposta?.idProposta !== idProposta || resposta.statusAceitePaciente !== (aceitar ? 'ACEITA' : 'RECUSADA')) {
        throw new Error('A API não confirmou a resposta.')
      }
      if (!controle.signal.aborted) {
        setRetorno({ tipo: 'sucesso', texto: aceitar
          ? 'Aceite registrado. A equipe ainda precisa confirmar a mudança.' : 'Recusa registrada.' })
      }
    } catch (erro) {
      if (controle.signal.aborted) return
      if (erro instanceof ApiError && erro.status === 401) {
        definirSessao(null)
        return
      }
      setRetorno({ tipo: 'erro', texto: 'Não foi possível confirmar sua resposta. Confira o status atualizado antes de tentar novamente.' })
    } finally {
      requisicao.current = null
      if (!controle.signal.aborted) {
        setEnviando(false)
        fecharConfirmacao()
        tentarNovamente()
      }
    }
  }

  return (
    <>
      {(solicitacaoAtiva(pedido) || atuais.length > 0 || resultado?.status !== 'sucesso' || retorno) && (
        <section id="propostas" ref={secao} aria-labelledby="titulo-propostas" className="mb-5 scroll-mt-20 space-y-3">
          <h2 id="titulo-propostas" className="text-h4">Propostas da equipe</h2>
          {retorno && (
            <p role={retorno.tipo === 'erro' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-md px-3 py-2 text-body-small font-semibold ${retorno.tipo === 'erro' ? 'bg-critico/10 text-critico' : 'bg-menta text-turquesa-escuro'}`}>
              {retorno.tipo === 'sucesso' && <FiCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
              {retorno.texto}
            </p>
          )}
          {resultado === null ? <LoadingState mensagem="Carregando as propostas desta solicitação…" />
            : resultado.status === 'erro' ? <ErrorState mensagem="Não foi possível carregar as propostas." tentarNovamente={tentarNovamente} />
              : atuais.length > 0 ? renderizarPropostas(atuais)
                : solicitacaoAtiva(pedido) && (
                  <p className="rounded-lg border border-azul-profundo/15 bg-superficie px-4 py-3 text-body-small text-azul-profundo/80">
                    As próximas alternativas que a equipe oferecer vão aparecer aqui.
                  </p>
                )}
        </section>
      )}

      {children}

      {historico.length > 0 && (
        <section aria-labelledby="historico-propostas" className="mt-6 space-y-3">
          <h2 id="historico-propostas" className="text-h4">Histórico de propostas</h2>
          {renderizarPropostas(historico)}
        </section>
      )}

      <dialog ref={dialogo} aria-labelledby="titulo-confirmacao-proposta" aria-describedby="texto-confirmacao-proposta"
        className="m-auto w-[28rem] max-w-[calc(100vw-2rem)] rounded-xl border border-azul-profundo/15 bg-superficie p-5 text-azul-profundo backdrop:bg-azul-profundo/45 sm:p-6"
        onCancel={(evento) => {
          evento.preventDefault()
          if (!enviando) fecharConfirmacao()
        }}>
        {confirmacao && (
          <form onSubmit={enviarResposta}>
            <h2 ref={tituloDialogo} tabIndex={-1} id="titulo-confirmacao-proposta" className="text-h3 focus:outline-none">
              {confirmacao.aceitar ? 'Aceitar esta alternativa?' : 'Recusar esta alternativa?'}
            </h2>
            <p id="texto-confirmacao-proposta" className="mt-2 text-body-small text-azul-profundo/80">
              {!podeResponder ? 'Esta oferta não está mais disponível para resposta.' : confirmacao.aceitar
                ? 'A equipe vai receber seu aceite e ainda precisa confirmar a mudança no agendamento.'
                : 'A equipe vai receber sua recusa. Você pode acompanhar a solicitação pelo portal.'}
            </p>
            {podeResponder && ofertaSelecionada.alternativa.horario && (
              <p className="mt-3 rounded-md bg-fundo px-3 py-2 text-body-small font-semibold">
                {formatarDataHoraProposta(timestampDaAgenda(ofertaSelecionada.alternativa.horario.dataInicio))} · {ofertaSelecionada.alternativa.modalidade === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
              </p>
            )}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Botoes texto="Voltar" variante="secundario" onClick={fecharConfirmacao} desabilitado={enviando} />
              <Botoes tipo="submit" texto={confirmacao.aceitar ? 'Confirmar aceite' : 'Confirmar recusa'}
                variante={confirmacao.aceitar ? 'primario' : 'critico'} carregando={enviando} desabilitado={!podeResponder} />
            </div>
          </form>
        )}
      </dialog>
    </>
  )
}
