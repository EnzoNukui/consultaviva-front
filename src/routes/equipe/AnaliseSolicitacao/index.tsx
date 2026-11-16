import { useEffect, useState } from 'react'
import type { SubmitEvent } from 'react'
import { FiArrowLeft, FiCalendar, FiCheck, FiRefreshCw, FiShuffle } from 'react-icons/fi'
import { useLocation, useParams } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useBuscaAutenticada } from '../../../hooks/useBuscaAutenticada'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { propostaService } from '../../../services/propostaService'
import { solicitacaoService } from '../../../services/solicitacaoService'
import type { PropostaAtendimento } from '../../../types/proposta'
import { campoAgenda, DialogoAgendaEquipe } from '../ControlesAgendaEquipe'
import { carregarAnaliseEquipe, consultaPermiteAnalise, podeConfirmarProposta, situacoesSolicitacao, textoDataHora } from '../dadosResgateEquipe'
import NavegacaoEquipe from '../NavegacaoEquipe'
import { useOperacaoAgendaEquipe } from '../useOperacaoAgendaEquipe'
import { acoesResgate } from './acoesResgate'
import type { AcaoPedido, AcaoProposta } from './acoesResgate'
import PropostaNaAnalise from './PropostaNaAnalise'

type Selecao = { tipo: AcaoPedido } | { tipo: AcaoProposta; proposta: PropostaAtendimento }

export default function AnaliseSolicitacao() {
  const { id } = useParams()
  const { hash } = useLocation()
  const idPedido = Number(id)
  const { resultado, tentarNovamente } = useBuscaAutenticada(carregarAnaliseEquipe)
  const { erro, setErro, ocupado, executar } = useOperacaoAgendaEquipe()
  const [selecao, setSelecao] = useState<Selecao | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [agora, setAgora] = useState(agoraNaAgenda)

  const dados = resultado?.status === 'sucesso' ? resultado.dados : null
  const pedido = dados?.solicitacoes.find((item) => item.idSolicitacao === idPedido)
  const agendamento = pedido && dados?.agendamentos.get(pedido.idAgendamento)
  const horario = agendamento && dados?.horarios.get(agendamento.idHorario)
  const consultaAtiva = consultaPermiteAnalise(agendamento, horario, agora)
  const aberta = pedido?.statusSolicitacao === 'ABERTA'
  const emAnalise = pedido?.statusSolicitacao === 'EM_ANALISE'
  const paciente = agendamento && (dados?.pacientes.get(agendamento.idPaciente) ?? `Paciente #${agendamento.idPaciente}`)
  const propostas = dados?.propostas.filter((item) => item.idSolicitacao === idPedido)
    .toSorted((a, b) => Number(confirmavel(b, agora)) - Number(confirmavel(a, agora)) || b.idProposta - a.idProposta) ?? []

  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(agoraNaAgenda()), 30_000)
    return () => window.clearInterval(relogio)
  }, [])

  useEffect(() => {
    if (!pedido || !/^#proposta-\d+$/.test(hash)) return
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash, pedido])

  function confirmavel(proposta: PropostaAtendimento, instante: number) {
    return !!pedido && podeConfirmarProposta(proposta, pedido, agendamento, horario, dados?.horarios.get(proposta.idHorario), instante)
  }

  function abrir(acao: Selecao) {
    setMensagem('')
    setErro('')
    setSelecao(acao)
  }

  function atualizar() {
    setAgora(agoraNaAgenda())
    tentarNovamente()
  }

  function executarAcao(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!selecao || !pedido) return
    const { tipo } = selecao
    const campos = new FormData(evento.currentTarget)
    const instante = agoraNaAgenda()
    const prazo = String(campos.get('prazo') ?? '')
    const justificativa = String(campos.get('justificativa') ?? '').trim()
    const proposta = 'proposta' in selecao ? selecao.proposta : null
    const candidato = proposta && dados?.horarios.get(proposta.idHorario)

    if ((tipo === 'iniciar' || tipo === 'gerar' || tipo === 'ofertar') && !consultaPermiteAnalise(agendamento, horario, instante)) {
      setErro('A consulta precisa estar agendada e em um horário futuro.')
      return
    }
    if (tipo === 'ofertar' && (!prazo || !candidato || !horario || timestampDaAgenda(prazo) <= instante
      || timestampDaAgenda(prazo) > Math.min(timestampDaAgenda(candidato.dataInicio), timestampDaAgenda(horario.dataInicio)))) {
      setErro('Informe um prazo futuro que termine até o início dos dois horários.')
      return
    }
    if (tipo === 'editar' && !justificativa) {
      setErro('Informe a justificativa.')
      return
    }
    if (tipo === 'confirmar' && (!proposta || !confirmavel(proposta, instante))) {
      setErro('A proposta precisa ter aceite do paciente, reserva vigente e horários futuros.')
      return
    }

    void executar(async (opcoes) => {
      if (tipo === 'gerar') {
        const geradas = await propostaService.gerar(idPedido, opcoes)
        if (!Array.isArray(geradas)) throw new Error('A API não confirmou a geração.')
        return geradas.length === 0 ? 'Nenhuma nova alternativa compatível foi encontrada.'
          : geradas.length === 1 ? 'Uma nova proposta foi gerada.' : `${geradas.length} novas propostas foram geradas.`
      }
      if (tipo === 'iniciar' || tipo === 'semSolucao' || tipo === 'cancelarPedido') {
        const situacao = tipo === 'semSolucao' ? 'SEM_SOLUCAO' : 'CANCELADA'
        const salvo = tipo === 'iniciar' ? await solicitacaoService.iniciarAnalise(idPedido, opcoes)
          : await solicitacaoService.encerrar(idPedido, situacao, opcoes)
        if (salvo?.idSolicitacao !== idPedido || salvo.statusSolicitacao !== (tipo === 'iniciar' ? 'EM_ANALISE' : situacao)) {
          throw new Error('A API não confirmou a situação do pedido.')
        }
        return tipo === 'iniciar' ? 'Análise iniciada.' : tipo === 'semSolucao' ? 'Solicitação encerrada sem solução.' : 'Solicitação cancelada.'
      }
      if (!proposta) throw new Error('Proposta indisponível.')
      const numero = proposta.idProposta
      if (tipo === 'cancelar') {
        await propostaService.excluir(numero, opcoes)
        return 'Proposta cancelada.'
      }
      if (tipo === 'autorizar' || tipo === 'negar') {
        const autorizada = tipo === 'autorizar'
        const salvo = await propostaService.autorizar(numero, autorizada, opcoes)
        if (salvo?.idProposta !== numero || salvo.statusAutorizacao !== (autorizada ? 'AUTORIZADA' : 'NEGADA')) {
          throw new Error('A API não confirmou a autorização.')
        }
        return autorizada ? 'Modalidade autorizada.' : 'Autorização negada.'
      }
      const operacoes = {
        editar: { salvar: () => propostaService.atualizar(numero, { justificativa }, opcoes), status: 'EM_ANALISE', mensagem: 'Justificativa atualizada.' },
        ofertar: { salvar: () => propostaService.ofertar(numero, prazo, opcoes), status: 'OFERTADA', mensagem: 'Proposta enviada ao paciente.' },
        confirmar: { salvar: () => propostaService.confirmar(numero, opcoes), status: 'CONFIRMADA', mensagem: 'Proposta confirmada. A agenda foi atualizada.' },
        expirar: { salvar: () => propostaService.expirar(numero, opcoes), status: 'EXPIRADA', mensagem: 'Expiração registrada.' },
      } as const
      const operacao = operacoes[tipo]
      const salvo = await operacao.salvar()
      if (salvo?.idProposta !== numero || salvo.statusProposta !== operacao.status) throw new Error('A API não confirmou a proposta.')
      return operacao.mensagem
    }, (retorno) => {
      setSelecao(null)
      setMensagem(retorno)
      atualizar()
    })
  }

  const alvo = selecao && 'proposta' in selecao ? selecao.proposta : null
  const prazoFinal = alvo && dados?.horarios.get(alvo.idHorario)?.dataInicio
  const maxAceite = prazoFinal && horario ? [prazoFinal, horario.dataInicio].sort()[0].slice(0, 16) : undefined

  return (
    <>
      <header className="mb-5">
        <h1 className="text-h1">Motor de Resgate</h1>
      </header>
      <NavegacaoEquipe secao="resgate" />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <Botoes texto="Voltar às solicitações" para="/equipe/solicitacoes" icone={FiArrowLeft} variante="secundario" />
        <Botoes texto="Atualizar" variante="secundario" icone={FiRefreshCw} onClick={atualizar} desabilitado={!resultado || ocupado} />
      </div>
      {mensagem && <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-menta px-4 py-2.5 text-body-small font-bold text-turquesa-escuro"><FiCheck aria-hidden="true" />{mensagem}</p>}
      {resultado === null && <LoadingState mensagem="Carregando solicitação…" />}
      {resultado?.status === 'erro' && <ErrorState mensagem="Não foi possível carregar a solicitação." tentarNovamente={atualizar} />}
      {dados && !pedido && <EmptyState titulo="Solicitação não encontrada" mensagem="Escolha um pedido na lista de solicitações." />}
      {pedido && (
        <>
          <section className="mb-7 rounded-xl border border-azul-profundo/15 bg-superficie" aria-labelledby="titulo-pedido">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-azul-profundo/10 px-4 py-4 sm:px-5">
              <div>
                <p className="text-caption font-bold text-turquesa-escuro">Solicitação #{idPedido}</p>
                <h2 id="titulo-pedido" className="mt-1 text-h3 wrap-break-word">{paciente ?? 'Detalhes da solicitação'}</h2>
              </div>
              <span className="rounded-md bg-menta px-2 py-1 text-caption font-bold text-turquesa-escuro">{situacoesSolicitacao[pedido.statusSolicitacao]}</span>
            </div>
            <div className="grid gap-5 px-4 py-4 sm:grid-cols-2 sm:px-5">
              <div className="min-w-0 text-body-small">
                <h3 className="mb-1 flex items-center gap-2 font-bold"><FiCalendar className="text-turquesa-escuro" aria-hidden="true" />Consulta #{pedido.idAgendamento}</h3>
                {horario && agendamento ? (
                  <div className="space-y-0.5 wrap-break-word">
                    <p>{textoDataHora(horario.dataInicio)} · {agendamento.modalidade === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</p>
                    <p>{dados?.unidades.get(horario.idUnidade) ?? `Unidade #${horario.idUnidade}`}</p>
                    <p>{dados?.profissionais.get(horario.idMembroEquipe) ?? `Profissional #${horario.idMembroEquipe}`}</p>
                  </div>
                ) : <p>Horário da consulta indisponível.</p>}
                <p className="mt-3">Recebida em {textoDataHora(pedido.dataAbertura)}</p>
                {pedido.idMembroEquipe != null && <p>Responsável {dados?.profissionais.get(pedido.idMembroEquipe) ?? `#${pedido.idMembroEquipe}`}</p>}
                {pedido.dataEncerramento && <p>Encerrada em {textoDataHora(pedido.dataEncerramento)}</p>}
              </div>
              <div className="min-w-0 text-body-small">
                <h3 className="mb-1 font-bold">Relato do paciente</h3>
                <p className="wrap-break-word whitespace-pre-wrap">{pedido.relato?.trim() || 'O paciente não deixou um relato.'}</p>
                {emAnalise && <p className="mt-3 text-azul-profundo/75">O motor usa as dificuldades e disponibilidades registradas pelo paciente para encontrar alternativas. A leitura desses detalhes está disponível no portal do paciente.</p>}
              </div>
            </div>
            {(aberta || emAnalise) && (
              <div className="border-t border-azul-profundo/10 px-4 py-4 sm:px-5">
                {!consultaAtiva && <p className="mb-3 text-body-small text-azul-profundo/75">Para analisar ou gerar alternativas, a consulta precisa estar agendada e ainda não ter começado.</p>}
                <div className="flex flex-wrap gap-2">
                  {aberta && consultaAtiva && <Botoes texto="Iniciar análise" onClick={() => abrir({ tipo: 'iniciar' })} />}
                  {emAnalise && consultaAtiva && <Botoes texto="Gerar propostas" icone={FiShuffle} onClick={() => abrir({ tipo: 'gerar' })} />}
                  {emAnalise && <Botoes texto="Encerrar sem solução" variante="secundario" onClick={() => abrir({ tipo: 'semSolucao' })} />}
                  <Botoes texto="Cancelar solicitação" variante="discreto" onClick={() => abrir({ tipo: 'cancelarPedido' })} />
                </div>
              </div>
            )}
          </section>
          <section aria-labelledby="titulo-alternativas">
            <h2 id="titulo-alternativas" className="mb-3 text-h3">Alternativas para a consulta</h2>
            {propostas.length === 0 ? <EmptyState titulo="Nenhuma alternativa registrada" mensagem={aberta
              ? 'Inicie a análise para que o motor possa buscar alternativas.' : 'As propostas geradas para esta solicitação aparecerão aqui.'} /> : (
              <div className="grid gap-4">
                {propostas.map((proposta) => {
                  const candidato = dados?.horarios.get(proposta.idHorario)
                  return <PropostaNaAnalise key={proposta.idProposta} proposta={proposta} horario={candidato}
                    unidade={candidato && dados?.unidades.get(candidato.idUnidade)} agora={agora} podeConfirmar={confirmavel(proposta, agora)}
                    podeAnalisar={emAnalise && consultaAtiva} aoAgir={(tipo, item) => abrir({ tipo, proposta: item })} />
                })}
              </div>
            )}
          </section>
        </>
      )}
      {selecao && pedido && (
        <DialogoAgendaEquipe titulo={acoesResgate[selecao.tipo].titulo} ocupado={ocupado} erro={erro} aoFechar={() => setSelecao(null)}>
          <p className="mb-4 text-body-small">{acoesResgate[selecao.tipo].descricao}</p>
          <form onSubmit={executarAcao}>
            <fieldset className="min-w-0" disabled={ocupado}>
              {selecao.tipo === 'editar' && (
                <label className="block text-body-small font-bold">Justificativa
                  <textarea className={campoAgenda} rows={4} name="justificativa" required maxLength={500} defaultValue={alvo?.justificativa} />
                </label>
              )}
              {selecao.tipo === 'ofertar' && (
                <label className="block text-body-small font-bold">Prazo de aceite (horário de Brasília)
                  <input className={campoAgenda} name="prazo" type="datetime-local" required max={maxAceite} />
                </label>
              )}
            </fieldset>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Botoes texto="Voltar" variante="secundario" onClick={() => setSelecao(null)} desabilitado={ocupado} />
              <Botoes texto="Confirmar" tipo="submit" carregando={ocupado} />
            </div>
          </form>
        </DialogoAgendaEquipe>
      )}
    </>
  )
}
