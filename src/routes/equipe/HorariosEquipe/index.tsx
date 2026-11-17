import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { FiCalendar, FiCheck, FiChevronLeft, FiChevronRight, FiClock, FiPlus } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useBuscaAutenticada } from '../../../hooks/useBuscaAutenticada'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { horarioService } from '../../../services/horarioService'
import type { CriarHorarioRequest, HorarioAtendimento } from '../../../types/horario'
import { campoAgenda, DialogoAgendaEquipe, FiltrosDeLocal } from '../ControlesAgendaEquipe'
import { carregarHorariosEquipe, formatarDataAgenda, formatarHoraAgenda, hojeNaAgenda, inicioDaSemana, somarDias } from '../dadosAgendaEquipe'
import { useOperacaoAgendaEquipe } from '../useOperacaoAgendaEquipe'
import FormularioHorariosEmLote from './FormularioHorariosEmLote'
import { cadastrarHorariosEmLote, conflitaComHorario } from './horariosEmLote'

const diaDaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' })
const botaoSemana = 'grid size-11 shrink-0 cursor-pointer place-items-center rounded-lg border border-azul-profundo/20 bg-superficie hover:bg-menta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro'
type Acao = { tipo: 'novo' | 'lote' } | { tipo: 'editar' | 'excluir'; horario: HorarioAtendimento }

export default function HorariosEquipe() {
  const [parametros] = useSearchParams()
  const dataInicial = parametros.get('dia') ?? ''
  const { resultado, tentarNovamente } = useBuscaAutenticada(carregarHorariosEquipe)
  const { ocupado, erro, setErro, executar } = useOperacaoAgendaEquipe()
  const [dia, setDia] = useState(() => /^\d{4}-\d{2}-\d{2}$/.test(dataInicial)
    && Number.isFinite(timestampDaAgenda(`${dataInicial}T00:00:00`)) ? dataInicial : hojeNaAgenda())
  const [unidade, setUnidade] = useState(parametros.get('unidade') ?? '')
  const [profissional, setProfissional] = useState(parametros.get('profissional') ?? '')
  const [acao, setAcao] = useState<Acao | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [aviso, setAviso] = useState('')
  const [processadas, setProcessadas] = useState(0)
  const dados = resultado?.status === 'sucesso' ? resultado.dados : null
  const membros = dados?.profissionais.filter(({ atendimento }) => atendimento === 'S') ?? []
  const profissionaisPorId = new Map(dados?.profissionais.map((item) => [item.idMembroEquipe, item.nomeMembroEquipe]))
  const unidadesPorId = new Map(dados?.unidades.map((item) => [item.idUnidade, item.nomeUnidade]))
  const inicioSemana = inicioDaSemana(dia)
  const diasDaSemana = Array.from({ length: 7 }, (_, indice) => somarDias(inicioSemana, indice))
  const hoje = hojeNaAgenda()
  const agora = agoraNaAgenda()
  const vagas = new Set(dados?.vagas.map(({ idHorario }) => idHorario))
  const vinculados = new Set(dados?.agendamentos.map(({ idHorario }) => idHorario))
  const ocupados = new Set(dados?.agendamentos.filter(({ statusAgendamento }) => statusAgendamento === 'AGENDADO').map(({ idHorario }) => idHorario))
  const horariosPorDia = new Map<string, HorarioAtendimento[]>()

  for (const horario of dados?.horarios ?? []) {
    if ((unidade && String(horario.idUnidade) !== unidade) || (profissional && String(horario.idMembroEquipe) !== profissional)) continue
    const data = horario.dataInicio.slice(0, 10)
    const lista = horariosPorDia.get(data) ?? []
    lista.push(horario)
    horariosPorDia.set(data, lista)
  }
  const horarios = (horariosPorDia.get(dia) ?? []).toSorted((a, b) => a.dataInicio.localeCompare(b.dataInicio))
  const horarioSelecionado = acao?.tipo === 'editar' || acao?.tipo === 'excluir' ? acao.horario : undefined

  function abrir(tipo: Acao) {
    setErro('')
    setMensagem('')
    setAviso('')
    setAcao(tipo)
  }

  function salvarLote(vagasDoTurno: CriarHorarioRequest[]) {
    const primeira = vagasDoTurno[0]
    if (!primeira) return
    setProcessadas(0)
    void executar((opcoes) => cadastrarHorariosEmLote(vagasDoTurno, opcoes, setProcessadas), (resumo) => {
      setAcao(null)
      setDia(primeira.dataInicio.slice(0, 10))
      setUnidade(String(primeira.idUnidade))
      setProfissional(String(primeira.idMembroEquipe))
      const saldo = `${resumo.criadas} ${resumo.criadas === 1 ? 'vaga cadastrada' : 'vagas cadastradas'}.`
      const conflitos = resumo.ignoradas ? ` ${resumo.ignoradas} ${resumo.ignoradas === 1 ? 'vaga ignorada' : 'vagas ignoradas'} por conflito ou início já passado.` : ''
      if (resumo.pendentes) {
        setAviso(`${saldo}${conflitos} ${resumo.pendentes} sem confirmação. ${resumo.erro} Revise a agenda antes de tentar novamente.`)
      } else setMensagem(saldo + conflitos)
      tentarNovamente()
    })
  }

  function salvar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!acao || (acao.tipo !== 'novo' && acao.tipo !== 'editar') || !dados) return
    const formulario = new FormData(evento.currentTarget)
    const dataInicio = String(formulario.get('dataInicio') ?? '')
    const dataFim = String(formulario.get('dataFim') || dataInicio)
    const horaInicio = String(formulario.get('horaInicio') ?? '')
    const horaFim = String(formulario.get('horaFim') ?? '')
    const registro: CriarHorarioRequest = {
      idUnidade: Number(formulario.get('unidade')),
      idMembroEquipe: Number(formulario.get('profissional')),
      dataInicio: `${dataInicio}T${horaInicio.length === 5 ? `${horaInicio}:00` : horaInicio}`,
      dataFim: `${dataFim}T${horaFim.length === 5 ? `${horaFim}:00` : horaFim}`,
    }
    const inicio = timestampDaAgenda(registro.dataInicio)
    const fim = timestampDaAgenda(registro.dataFim)
    if (!(fim > inicio) || !dados.unidades.some((item) => item.idUnidade === registro.idUnidade)
      || !membros.some((item) => item.idMembroEquipe === registro.idMembroEquipe)) {
      setErro('Selecione a unidade e o profissional. O fim precisa ser depois do início.')
      return
    }
    if (dados.horarios.some((item) => item.idHorario !== horarioSelecionado?.idHorario && conflitaComHorario(registro, item))) {
      setErro('O profissional já tem um horário cadastrado nesse intervalo.')
      return
    }

    void executar(async (opcoes) => {
      const salvo = horarioSelecionado
        ? await horarioService.atualizar(horarioSelecionado.idHorario, registro, opcoes)
        : await horarioService.inserir(registro, opcoes)
      if (!salvo?.idHorario || (horarioSelecionado && salvo.idHorario !== horarioSelecionado.idHorario)) {
        throw new Error('A API não confirmou o horário.')
      }
      return salvo
    }, (salvo) => {
      setAcao(null)
      setDia(salvo.dataInicio.slice(0, 10))
      if (unidade && String(salvo.idUnidade) !== unidade) setUnidade('')
      if (profissional && String(salvo.idMembroEquipe) !== profissional) setProfissional('')
      setMensagem(horarioSelecionado ? 'Horário atualizado.' : 'Horário cadastrado.')
      tentarNovamente()
    })
  }

  function excluir() {
    if (acao?.tipo !== 'excluir') return
    void executar((opcoes) => horarioService.excluir(acao.horario.idHorario, opcoes), () => {
      setAcao(null)
      setMensagem('Horário excluído.')
      tentarNovamente()
    })
  }

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1">Horários</h1>
          <p className="mt-2 text-body-small text-azul-profundo/80">Organize os intervalos de atendimento por unidade e profissional.</p>
        </div>
        {dados && (
          <div className="flex flex-wrap gap-2">
            <Botoes texto="Cadastrar horário" variante="secundario" icone={FiPlus} desabilitado={!dados.unidades.length || !membros.length}
              onClick={() => abrir({ tipo: 'novo' })} />
            <Botoes texto="Cadastrar por turno" icone={FiCalendar} desabilitado={!dados.unidades.length || !membros.length}
              onClick={() => abrir({ tipo: 'lote' })} />
          </div>
        )}
      </header>
      {mensagem && <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-menta px-4 py-2.5 text-body-small font-bold text-turquesa-escuro">
        <FiCheck aria-hidden="true" className="shrink-0" /> {mensagem}
      </p>}
      {aviso && <p role="alert" className="mb-4 rounded-lg bg-areia px-4 py-2.5 text-body-small">{aviso}</p>}

      {resultado === null && <LoadingState mensagem="Carregando horários da equipe…" />}
      {resultado?.status === 'erro' && <ErrorState mensagem="Não foi possível carregar os horários." tentarNovamente={tentarNovamente} />}
      {dados && (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <FiltrosDeLocal unidades={dados.unidades} profissionais={dados.profissionais} unidade={unidade}
              profissional={profissional} aoFiltrarUnidade={setUnidade} aoFiltrarProfissional={setProfissional} />
          </div>
          {(!dados.unidades.length || !membros.length) && (
            <p className="mb-4 rounded-lg bg-areia px-4 py-3 text-body-small">O cadastro de horários precisa de uma unidade e de um profissional com atribuição de atendimento.</p>
          )}
          <section aria-labelledby="semana-agenda" className="mb-6 rounded-xl border border-azul-profundo/15 bg-superficie p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 id="semana-agenda" className="text-h4" aria-live="polite">
                {formatarDataAgenda(`${inicioSemana}T00:00:00`)} a {formatarDataAgenda(`${diasDaSemana[6]}T00:00:00`)}
              </h2>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Semana anterior" className={botaoSemana} onClick={() => setDia(somarDias(dia, -7))}>
                  <FiChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <Botoes texto="Hoje" variante="secundario" onClick={() => setDia(hojeNaAgenda())} />
                <button type="button" aria-label="Próxima semana" className={botaoSemana} onClick={() => setDia(somarDias(dia, 7))}>
                  <FiChevronRight aria-hidden="true" className="size-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" role="group" aria-label="Dias da semana">
              {diasDaSemana.map((data) => (
                <button key={data} type="button" aria-label={formatarDataAgenda(`${data}T00:00:00`)}
                  aria-current={data === hoje ? 'date' : undefined} aria-pressed={data === dia} onClick={() => setDia(data)}
                  className="min-h-16 cursor-pointer rounded-md border border-azul-profundo/10 px-1 py-2 text-center text-caption hover:bg-menta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro aria-pressed:border-turquesa-escuro aria-pressed:bg-menta aria-pressed:text-turquesa-escuro">
                  <span className="block first-letter:uppercase">{diaDaSemana.format(new Date(`${data}T00:00:00Z`))}</span>
                  <strong className="block text-body">{data.slice(8)}</strong>
                  <span className="block">{horariosPorDia.get(data)?.length ?? 0} horários</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="titulo-dia-agenda">
            <h2 id="titulo-dia-agenda" className="mb-3 text-h4">Horários de {formatarDataAgenda(`${dia}T00:00:00`)}</h2>
            {horarios.length === 0 ? (
              <EmptyState titulo="Nenhum horário neste dia" mensagem="Selecione outro dia da semana ou ajuste os filtros." />
            ) : (
              <ul className="divide-y divide-azul-profundo/10 overflow-hidden rounded-xl border border-azul-profundo/15 bg-superficie">
                {horarios.map((horario) => {
                  const { idHorario, dataInicio, dataFim, idUnidade, idMembroEquipe } = horario
                  const fimPassou = timestampDaAgenda(dataFim) <= agora
                  const livre = vagas.has(idHorario) && timestampDaAgenda(dataInicio) > agora
                  const situacao = fimPassou ? 'Encerrado' : ocupados.has(idHorario) ? 'Ocupado' : livre ? 'Disponível' : 'Indisponível'
                  return (
                    <li key={idHorario} className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3 px-4 py-3.5 sm:items-center">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <FiClock aria-hidden="true" className="mt-1 size-5 shrink-0 text-turquesa-escuro" />
                        <div className="min-w-0">
                          <p className="font-bold">{formatarHoraAgenda(dataInicio)} a {formatarHoraAgenda(dataFim)}
                            {dataInicio.slice(0, 10) !== dataFim.slice(0, 10) && ` de ${formatarDataAgenda(dataFim)}`}</p>
                          <p className="text-body-small text-azul-profundo/80 wrap-break-word">
                            {unidadesPorId.get(idUnidade) ?? `Unidade #${idUnidade}`} · {profissionaisPorId.get(idMembroEquipe) ?? `Profissional #${idMembroEquipe}`}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-caption font-bold ${livre ? 'bg-menta text-turquesa-escuro' : 'bg-areia'}`}>{situacao}</span>
                      {vinculados.has(idHorario) ? <span className="w-full text-caption text-azul-profundo/75 sm:w-auto">Vinculado a agendamento</span> : (
                        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                          <Botoes texto="Editar" variante="contornoTurquesa" onClick={() => abrir({ tipo: 'editar', horario })} />
                          <Botoes texto="Excluir" variante="discreto" onClick={() => abrir({ tipo: 'excluir', horario })} />
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}

      {acao && dados && (
        <DialogoAgendaEquipe titulo={acao.tipo === 'excluir' ? 'Excluir horário' : acao.tipo === 'editar' ? 'Editar horário' : acao.tipo === 'lote' ? 'Cadastrar por turno' : 'Cadastrar horário'}
          ocupado={ocupado} erro={erro} aoFechar={() => setAcao(null)}>
          {acao.tipo === 'lote' ? (
            <FormularioHorariosEmLote dia={dia} unidade={unidade} profissional={profissional} unidades={dados.unidades} membros={membros}
              horarios={dados.horarios} ocupado={ocupado} processadas={processadas} aoSalvar={salvarLote}
              aoFechar={() => setAcao(null)} informarErro={setErro} />
          ) : acao.tipo === 'excluir' ? (
            <>
              <p className="mb-5 text-body-small">Excluir o horário de {formatarDataAgenda(acao.horario.dataInicio)}, às {formatarHoraAgenda(acao.horario.dataInicio)}?</p>
              <div className="flex flex-wrap justify-end gap-2">
                <Botoes texto="Voltar" variante="secundario" desabilitado={ocupado} onClick={() => setAcao(null)} />
                <Botoes texto="Excluir horário" variante="critico" carregando={ocupado} onClick={excluir} />
              </div>
            </>
          ) : (
            <form onSubmit={salvar}>
              <fieldset disabled={ocupado} className="grid min-w-0 gap-3 sm:grid-cols-2">
                <label className="min-w-0 text-body-small font-bold">Unidade
                  <select name="unidade" required className={campoAgenda} defaultValue={horarioSelecionado?.idUnidade ?? unidade}>
                    <option value="">Selecione a unidade</option>
                    {dados.unidades.map((item) => <option key={item.idUnidade} value={item.idUnidade}>{item.nomeUnidade}</option>)}
                  </select>
                </label>
                <label className="min-w-0 text-body-small font-bold">Profissional
                  <select name="profissional" required className={campoAgenda} defaultValue={horarioSelecionado?.idMembroEquipe ?? profissional}>
                    <option value="">Selecione o profissional</option>
                    {membros.map((item) => <option key={item.idMembroEquipe} value={item.idMembroEquipe}>{item.nomeMembroEquipe}</option>)}
                  </select>
                </label>
                <label className="min-w-0 text-body-small font-bold">Data de início
                  <input name="dataInicio" type="date" required defaultValue={horarioSelecionado?.dataInicio.slice(0, 10) ?? dia} className={campoAgenda} />
                </label>
                <label className="min-w-0 text-body-small font-bold">Data de término (se for outro dia)
                  <input name="dataFim" type="date" className={campoAgenda}
                    defaultValue={horarioSelecionado && horarioSelecionado.dataInicio.slice(0, 10) !== horarioSelecionado.dataFim.slice(0, 10)
                      ? horarioSelecionado.dataFim.slice(0, 10) : ''} />
                </label>
                <label className="min-w-0 text-body-small font-bold">Início
                  <input name="horaInicio" type="time" step={1} required defaultValue={horarioSelecionado?.dataInicio.slice(11, 19)} className={campoAgenda} />
                </label>
                <label className="min-w-0 text-body-small font-bold">Fim
                  <input name="horaFim" type="time" step={1} required defaultValue={horarioSelecionado?.dataFim.slice(11, 19)} className={campoAgenda} />
                </label>
              </fieldset>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <Botoes texto="Voltar" variante="secundario" desabilitado={ocupado} onClick={() => setAcao(null)} />
                <Botoes texto="Salvar horário" tipo="submit" carregando={ocupado} />
              </div>
            </form>
          )}
        </DialogoAgendaEquipe>
      )}
    </>
  )
}
