import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { FiArrowLeft, FiPlus, FiSend, FiX } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import CardConsulta from '../../../components/CardConsulta/CardConsulta'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useSessao } from '../../../components/SessaoProvider/sessao'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import type { ConsultaComHorario } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { solicitacaoService } from '../../../services/solicitacaoService'
import type { DisponibilidadeRequest } from '../../../types/solicitacao'
import { useBuscaPaciente } from '../useBuscaPaciente'
import { carregarTiposDificuldade, dataHoraDaSolicitacao } from './dadosSolicitacoes'

const caminho = '/paciente/solicitacoes'
const classeCampo = 'min-h-11 w-full min-w-0 rounded-md border border-azul-profundo/25 bg-superficie px-3 py-2 text-body-small focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro'

interface DisponibilidadeFormulario extends Omit<DisponibilidadeRequest, 'modalidade'> {
  id: number
  modalidade: DisponibilidadeRequest['modalidade'] | ''
}

function novoIntervalo(id: number): DisponibilidadeFormulario {
  return { id, dataInicio: '', dataFim: '', modalidade: '' }
}

interface FormularioSolicitacaoProps {
  consultas: ConsultaComHorario[]
  consultaDoAtalho: string | null
  aoRecarregarLista: () => void
}

export default function FormularioSolicitacao({ consultas, consultaDoAtalho, aoRecarregarLista }: FormularioSolicitacaoProps) {
  const [idConsulta, setIdConsulta] = useState(() => {
    if (consultas.some(({ agendamento }) => String(agendamento.idAgendamento) === consultaDoAtalho)) return consultaDoAtalho ?? ''
    return consultas.length === 1 ? String(consultas[0].agendamento.idAgendamento) : ''
  })
  const [dificuldades, setDificuldades] = useState<number[]>([])
  const [relato, setRelato] = useState('')
  const [intervalos, setIntervalos] = useState([novoIntervalo(1)])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const indiceIntervalo = useRef(2)
  const requisicao = useRef<AbortController | null>(null)
  const tentouEnviar = useRef(false)
  const aviso = useRef<HTMLParagraphElement>(null)
  const { sessao, definirSessao } = useSessao()
  const navigate = useNavigate()
  const { resultado: tipos, tentarNovamente } = useBuscaPaciente(carregarTiposDificuldade)
  const selecionada = consultas.find(({ agendamento }) => String(agendamento.idAgendamento) === idConsulta)
  const minimo = new Date(agoraNaAgenda()).toISOString().slice(0, 16)

  useEffect(() => () => requisicao.current?.abort(), [])
  useEffect(() => {
    if (erro) aviso.current?.focus()
  }, [erro])

  function alterarIntervalo(id: number, dados: Partial<DisponibilidadeFormulario>) {
    setIntervalos((atuais) => atuais.map((intervalo) => intervalo.id === id ? { ...intervalo, ...dados } : intervalo))
    setErro('')
  }

  function voltarParaLista() {
    if (tentouEnviar.current) aoRecarregarLista()
  }

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!sessao || requisicao.current) return

    if (!selecionada || selecionada.inicio <= agoraNaAgenda()) {
      setErro('Escolha uma consulta que ainda não começou.')
      return
    }

    const agora = agoraNaAgenda()
    const disponibilidades: DisponibilidadeRequest[] = []
    for (const [indice, intervalo] of intervalos.entries()) {
      const inicio = timestampDaAgenda(intervalo.dataInicio)
      const fim = timestampDaAgenda(intervalo.dataFim)
      if (!intervalo.modalidade || !Number.isFinite(inicio) || !Number.isFinite(fim) || inicio <= agora || fim <= inicio) {
        setErro(`Confira o intervalo ${indice + 1}. Escolha um início no futuro, um fim posterior e a modalidade.`)
        return
      }
      disponibilidades.push({ dataInicio: intervalo.dataInicio, dataFim: intervalo.dataFim, modalidade: intervalo.modalidade })
    }

    const controle = new AbortController()
    requisicao.current = controle
    tentouEnviar.current = true
    setErro('')
    setEnviando(true)

    try {
      const pedido = await solicitacaoService.inserir({
        idAgendamento: selecionada.agendamento.idAgendamento,
        relato: relato.trim() || null,
        idsDificuldade: dificuldades,
        disponibilidades,
      }, { autorizacao: sessao.autorizacao, signal: controle.signal })

      if (!pedido?.idSolicitacao) throw new Error('A API não confirmou o envio.')
      if (!controle.signal.aborted) await navigate(`${caminho}/${pedido.idSolicitacao}`, { replace: true, state: { enviada: true } })
    } catch (falha) {
      if (controle.signal.aborted) return
      if (falha instanceof ApiError && falha.status === 401) {
        definirSessao(null)
        return
      }
      if (falha instanceof ApiError && falha.status === 403) {
        setErro('Esta consulta não está disponível para receber um pedido de ajuda.')
      } else {
        setErro('Não foi possível confirmar o envio. Confira suas solicitações antes de tentar novamente.')
      }
    } finally {
      requisicao.current = null
      if (!controle.signal.aborted) setEnviando(false)
    }
  }

  return (
    <>
      <header className="mb-6">
        <Link to={caminho} onClick={voltarParaLista} className="mb-2 inline-flex min-h-11 items-center gap-2 rounded-sm text-body-small font-bold text-turquesa-escuro hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro">
          <FiArrowLeft aria-hidden="true" className="size-4" /> Minhas solicitações
        </Link>
        <h1 className="text-h1">Preciso de ajuda</h1>
        <p className="mt-2 text-body-small text-azul-profundo/80">Conte o que está dificultando sua ida e informe quando você poderia comparecer.</p>
      </header>

      {consultas.length === 0 ? (
        <EmptyState titulo="Nenhuma consulta disponível para um novo pedido" mensagem="Você pode pedir ajuda para uma consulta futura que ainda esteja sem solicitação em andamento."
          acao={<Botoes texto="Ver minhas consultas" para="/paciente/consultas" variante="contornoTurquesa" />} />
      ) : (
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <form onSubmit={enviar} className="min-w-0 rounded-lg border border-azul-profundo/15 bg-superficie p-4 sm:p-5">
            <fieldset disabled={enviando} className="grid min-w-0 gap-5">
              <div>
                <label htmlFor="consulta-solicitacao" className="mb-1.5 block text-body-small font-bold">Para qual consulta?</label>
                <select id="consulta-solicitacao" value={idConsulta} onChange={(evento) => {
                  setIdConsulta(evento.target.value)
                  setErro('')
                }} required className={classeCampo}>
                  <option value="">Selecione uma consulta</option>
                  {consultas.map(({ agendamento, horario }) => (
                    <option key={agendamento.idAgendamento} value={agendamento.idAgendamento}>
                      {agendamento.modalidade === 'VIRTUAL' ? 'Consulta virtual' : 'Consulta presencial'} · {dataHoraDaSolicitacao(horario.dataInicio)}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="min-w-0">
                <legend className="mb-2 text-body-small font-bold">O que está dificultando sua ida? <span className="font-normal text-azul-profundo/75">(opcional)</span></legend>
                {tipos === null ? (
                  <LoadingState mensagem="Carregando tipos de dificuldade…" />
                ) : tipos.status === 'erro' ? (
                  <ErrorState mensagem="Não foi possível carregar as opções de dificuldade. Você ainda pode escrever um relato." tentarNovamente={tentarNovamente} />
                ) : tipos.dados.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {tipos.dados.map(({ idDificuldade, nomeDificuldade }) => (
                      <label key={idDificuldade} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-azul-profundo/15 px-3 py-2 text-body-small has-checked:border-turquesa-escuro has-checked:bg-menta">
                        <input type="checkbox" value={idDificuldade} checked={dificuldades.includes(idDificuldade)}
                          onChange={(evento) => {
                            const marcada = evento.target.checked
                            setDificuldades((atuais) => marcada ? [...atuais, idDificuldade] : atuais.filter((id) => id !== idDificuldade))
                          }}
                          className="size-4 shrink-0 accent-turquesa-escuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro" />
                        {nomeDificuldade}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-body-small text-azul-profundo/75">Você pode descrever a dificuldade no campo abaixo.</p>
                )}
              </fieldset>

              <div>
                <label htmlFor="relato-solicitacao" className="mb-1.5 block text-body-small font-bold">Conte com suas palavras <span className="font-normal text-azul-profundo/75">(opcional)</span></label>
                <textarea id="relato-solicitacao" rows={3} maxLength={500} value={relato}
                  onChange={(evento) => setRelato(evento.target.value)} className={`${classeCampo} resize-y`} aria-describedby="limite-relato" />
                <p id="limite-relato" className="text-right text-caption text-azul-profundo/75">{relato.length}/500 caracteres</p>
              </div>

              <section aria-labelledby="titulo-disponibilidade">
                <h2 id="titulo-disponibilidade" className="text-h4">Quando você pode comparecer?</h2>
                <p className="mt-1 mb-3 text-body-small text-azul-profundo/80">Informe pelo menos um intervalo em que você esteja livre.</p>

                <div className="space-y-3">
                  {intervalos.map(({ id, dataInicio, dataFim, modalidade }, indice) => (
                    <fieldset key={id} className="min-w-0 rounded-md border border-azul-profundo/15 bg-fundo p-3">
                      <legend className="px-1 text-body-small font-bold">Disponibilidade {indice + 1}</legend>
                      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                        <label className="grid min-w-0 gap-1 text-body-small font-semibold">
                          Início
                          <input type="datetime-local" value={dataInicio} min={minimo} required className={classeCampo}
                            onChange={(evento) => alterarIntervalo(id, { dataInicio: evento.target.value })} />
                        </label>
                        <label className="grid min-w-0 gap-1 text-body-small font-semibold">
                          Fim
                          <input type="datetime-local" value={dataFim} min={dataInicio || minimo} required className={classeCampo}
                            onChange={(evento) => alterarIntervalo(id, { dataFim: evento.target.value })} />
                        </label>
                        <label className="grid gap-1 text-body-small font-semibold sm:col-span-2">
                          Modalidade
                          <select value={modalidade} required className={classeCampo} onChange={(evento) =>
                            alterarIntervalo(id, { modalidade: evento.target.value as DisponibilidadeFormulario['modalidade'] })}>
                            <option value="">Selecione uma opção</option>
                            <option value="PRESENCIAL">Presencial</option>
                            <option value="VIRTUAL">Virtual</option>
                            <option value="AMBAS">Presencial ou virtual</option>
                          </select>
                        </label>
                      </div>
                      {intervalos.length > 1 && (
                        <button type="button" onClick={() => {
                          setIntervalos((atuais) => atuais.filter((intervalo) => intervalo.id !== id))
                          setErro('')
                        }} className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm text-body-small font-bold text-critico focus-visible:outline-2 focus-visible:outline-offset-2">
                          <FiX aria-hidden="true" className="size-4" /> Remover disponibilidade {indice + 1}
                        </button>
                      )}
                    </fieldset>
                  ))}
                </div>

                <button type="button" onClick={() => {
                  const intervalo = novoIntervalo(indiceIntervalo.current++)
                  setIntervalos((atuais) => [...atuais, intervalo])
                }} className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-sm text-body-small font-bold text-turquesa-escuro hover:underline focus-visible:outline-2 focus-visible:outline-offset-2">
                  <FiPlus aria-hidden="true" className="size-4" /> Adicionar outro intervalo
                </button>
              </section>
            </fieldset>

            {erro && <p ref={aviso} tabIndex={-1} role="alert" className="mt-2 rounded-md bg-critico/10 px-3 py-2 text-body-small font-semibold text-critico">{erro}</p>}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-azul-profundo/10 pt-4">
              <Botoes tipo="submit" texto={enviando ? 'Enviando…' : 'Enviar pedido'} icone={FiSend} posicaoIcone="direita" carregando={enviando} />
              <Botoes texto="Cancelar" para={caminho} variante="secundario" onClick={voltarParaLista} desabilitado={enviando} />
            </div>
          </form>

          <aside className="space-y-3">
            {selecionada && <CardConsulta consulta={selecionada} compacto />}
            <section aria-labelledby="depois-do-pedido" className="rounded-lg bg-azul-profundo p-4 text-superficie">
              <h2 id="depois-do-pedido" className="text-h4">O que acontece depois</h2>
              <p className="mt-2 text-body-small text-superficie/90">A equipe analisa seu pedido. Se houver uma alternativa, você poderá avaliá-la em Propostas.</p>
              <p className="mt-3 border-t border-superficie/20 pt-3 text-body-small text-superficie/90">Seu agendamento atual fica marcado até que uma mudança seja confirmada.</p>
            </section>
          </aside>
        </div>
      )}
    </>
  )
}
