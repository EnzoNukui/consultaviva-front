import { useEffect, useState } from 'react'
import { FiCalendar, FiCheck, FiChevronDown, FiPlus } from 'react-icons/fi'
import Botoes from '../../../components/Botoes/Botoes'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useBuscaAutenticada } from '../../../hooks/useBuscaAutenticada'
import { agendamentoService } from '../../../services/agendamentoService'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import type { Agendamento, CriarAgendamentoRequest, StatusAgendamento } from '../../../types/agendamento'
import type { HorarioAtendimento } from '../../../types/horario'
import { campoAgenda, DialogoAgendaEquipe, FiltrosDeLocal } from '../ControlesAgendaEquipe'
import { carregarAgendamentosEquipe, formatarDataAgenda, formatarHoraAgenda, hojeNaAgenda } from '../dadosAgendaEquipe'
import { useOperacaoAgendaEquipe } from '../useOperacaoAgendaEquipe'
import FormularioAgendamento from './FormularioAgendamento'

const situacoes: Record<StatusAgendamento, string> = {
  AGENDADO: 'Agendado', REALIZADO: 'Realizado', CANCELADO: 'Cancelado', FALTOU: 'Falta registrada',
}
const respostas: Record<Agendamento['statusRespostaPaciente'], string> = {
  SEM_RESPOSTA: 'Aguardando resposta', VOU_COMPARECER: 'Presença confirmada',
  PRECISO_DE_AJUDA: 'Informou que precisa de ajuda', NAO_CONSIGO_COMPARECER: 'Informou que não consegue comparecer',
}
const resultados = {
  cancelar: { titulo: 'Cancelar agendamento', confirmacao: 'Confirma o cancelamento desta consulta?', estado: 'CANCELADO', salvar: agendamentoService.cancelar },
  realizar: { titulo: 'Registrar atendimento realizado', confirmacao: 'Confirma que o atendimento foi realizado?', estado: 'REALIZADO', salvar: agendamentoService.registrarRealizacao },
  falta: { titulo: 'Registrar falta', confirmacao: 'Confirma que o paciente não compareceu?', estado: 'FALTOU', salvar: agendamentoService.registrarFalta },
} as const
type Acao = { tipo: 'novo' } | { tipo: 'remarcar' | keyof typeof resultados; agendamento: Agendamento; horario: HorarioAtendimento }

function podeExecutar(acao: Exclude<Acao, { tipo: 'novo' }>, agora: number) {
  if (acao.agendamento.statusAgendamento !== 'AGENDADO') return false
  const inicio = timestampDaAgenda(acao.horario.dataInicio)
  if (acao.tipo === 'cancelar' || acao.tipo === 'remarcar') return inicio > agora
  return agora >= (acao.tipo === 'falta' ? timestampDaAgenda(acao.horario.dataFim) : inicio)
}

export default function AgendamentosEquipe() {
  const { resultado, tentarNovamente } = useBuscaAutenticada(carregarAgendamentosEquipe)
  const { ocupado, erro, setErro, executar } = useOperacaoAgendaEquipe()
  const [data, setData] = useState('')
  const [unidade, setUnidade] = useState('')
  const [profissional, setProfissional] = useState('')
  const [situacao, setSituacao] = useState('')
  const [acao, setAcao] = useState<Acao | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [agora, setAgora] = useState(agoraNaAgenda)
  const dados = resultado?.status === 'sucesso' ? resultado.dados : null
  const horarios = new Map(dados?.horarios.map((item) => [item.idHorario, item]))
  const pacientes = new Map(dados?.pacientes.map((item) => [item.idPaciente, item.nomePaciente]))
  const unidades = new Map(dados?.unidades.map((item) => [item.idUnidade, item.nomeUnidade]))
  const profissionais = new Map(dados?.profissionais.map((item) => [item.idMembroEquipe, item.nomeMembroEquipe]))
  const agenda = (dados?.agendamentos ?? []).map((item) => ({ item, horario: horarios.get(item.idHorario) }))
    .filter(({ item, horario }) => (!data || horario?.dataInicio.slice(0, 10) === data)
      && (!unidade || String(horario?.idUnidade) === unidade) && (!profissional || String(horario?.idMembroEquipe) === profissional)
      && (!situacao || item.statusAgendamento === situacao))
    .sort((a, b) => {
      const inicioA = a.horario ? timestampDaAgenda(a.horario.dataInicio) : -Infinity
      const inicioB = b.horario ? timestampDaAgenda(b.horario.dataInicio) : -Infinity
      return Number(inicioB >= agora) - Number(inicioA >= agora)
        || (inicioA >= agora ? inicioA - inicioB : inicioB - inicioA)
        || b.item.idAgendamento - a.item.idAgendamento
    })

  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(agoraNaAgenda()), 30_000)
    return () => window.clearInterval(relogio)
  }, [])

  function abrir(novaAcao: Acao) {
    setErro('')
    setMensagem('')
    setAcao(novaAcao)
  }

  function concluir(texto: string) {
    setAcao(null)
    setMensagem(texto)
    setAgora(agoraNaAgenda())
    tentarNovamente()
  }

  function salvarAgendamento(registro: CriarAgendamentoRequest) {
    if (!acao || (acao.tipo !== 'novo' && acao.tipo !== 'remarcar')) return
    if (acao.tipo === 'remarcar' && !podeExecutar(acao, agoraNaAgenda())) {
      setErro('A consulta precisa estar agendada e ainda não ter começado.')
      return
    }

    void executar(async (opcoes) => {
      const salvo = acao.tipo === 'novo' ? await agendamentoService.inserir(registro, opcoes)
        : await agendamentoService.remarcar(acao.agendamento.idAgendamento, { idHorario: registro.idHorario }, opcoes)
      if (!salvo?.idAgendamento || salvo.idHorario !== registro.idHorario
        || (acao.tipo === 'remarcar' && salvo.idAgendamento !== acao.agendamento.idAgendamento)) {
        throw new Error('A API não confirmou o agendamento.')
      }
    }, () => {
      setData('')
      setUnidade('')
      setProfissional('')
      setSituacao('AGENDADO')
      concluir(acao.tipo === 'novo' ? 'Consulta agendada.' : 'Consulta remarcada.')
    })
  }

  function registrarResultado() {
    if (!acao || acao.tipo === 'novo' || acao.tipo === 'remarcar') return
    if (!podeExecutar(acao, agoraNaAgenda())) {
      setErro('Essa ação não está disponível no horário ou na situação atual da consulta.')
      return
    }
    const operacao = resultados[acao.tipo]
    void executar(async (opcoes) => {
      const salvo = await operacao.salvar(acao.agendamento.idAgendamento, opcoes)
      if (salvo?.idAgendamento !== acao.agendamento.idAgendamento || salvo.statusAgendamento !== operacao.estado) {
        throw new Error('A API não confirmou a situação do agendamento.')
      }
    }, () => {
      setSituacao(operacao.estado)
      concluir(acao.tipo === 'cancelar' ? 'Consulta cancelada.' : acao.tipo === 'falta' ? 'Falta registrada.' : 'Atendimento registrado como realizado.')
    })
  }

  const confirmacao = acao && acao.tipo !== 'novo' && acao.tipo !== 'remarcar' ? resultados[acao.tipo] : null

  return (
    <>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1">Agendamentos</h1>
          <p className="mt-2 text-body-small text-azul-profundo/80">Acompanhe as consultas da equipe e registre o que aconteceu em cada atendimento.</p>
        </div>
        {dados && <Botoes texto="Novo agendamento" icone={FiPlus} desabilitado={!dados.pacientes.length} onClick={() => abrir({ tipo: 'novo' })} />}
      </header>
      {mensagem && <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-menta px-4 py-2.5 text-body-small font-bold text-turquesa-escuro">
        <FiCheck aria-hidden="true" className="shrink-0" /> {mensagem}
      </p>}
      {resultado === null && <LoadingState mensagem="Carregando os agendamentos…" />}
      {resultado?.status === 'erro' && <ErrorState mensagem="Não foi possível carregar os agendamentos." tentarNovamente={tentarNovamente} />}
      {dados && (
        <>
          <div className="mb-5 rounded-xl border border-azul-profundo/15 bg-superficie p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <label className="min-w-0 text-body-small font-bold">Data
                <input type="date" value={data} onChange={(evento) => setData(evento.target.value)} className={campoAgenda} />
              </label>
              <FiltrosDeLocal unidades={dados.unidades} profissionais={dados.profissionais} unidade={unidade} profissional={profissional}
                aoFiltrarUnidade={setUnidade} aoFiltrarProfissional={setProfissional} />
              <label className="min-w-0 text-body-small font-bold">Situação
                <select value={situacao} onChange={(evento) => setSituacao(evento.target.value)} className={campoAgenda}>
                  <option value="">Todas as situações</option>
                  {Object.entries(situacoes).map(([id, rotulo]) => <option key={id} value={id}>{rotulo}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Botoes texto="Ver hoje" variante="secundario" onClick={() => setData(hojeNaAgenda())} />
              {(data || unidade || profissional || situacao) && (
                <Botoes texto="Limpar filtros" variante="discreto" onClick={() => {
                  setData('')
                  setUnidade('')
                  setProfissional('')
                  setSituacao('')
                }} />
              )}
            </div>
          </div>
          {!dados.pacientes.length && <p className="mb-4 text-body-small">Cadastre um paciente para marcar uma consulta.</p>}
          <section aria-labelledby="lista-agendamentos">
            <h2 id="lista-agendamentos" className="mb-1 text-h3">Consultas da equipe</h2>
            <p role="status" className="mb-3 text-body-small text-azul-profundo/75">{agenda.length === 1 ? '1 consulta' : `${agenda.length} consultas`}</p>
            {agenda.length === 0 ? (
              <EmptyState titulo="Nenhuma consulta encontrada" mensagem="Altere os filtros ou marque uma consulta usando um horário disponível." />
            ) : (
              <ul className="divide-y divide-azul-profundo/10 overflow-hidden rounded-xl border border-azul-profundo/15 bg-superficie">
                {agenda.map(({ item, horario }) => {
                  const agendada = item.statusAgendamento === 'AGENDADO'
                  const futura = !!horario && agendada && timestampDaAgenda(horario.dataInicio) > agora
                  const iniciou = !!horario && agendada && agora >= timestampDaAgenda(horario.dataInicio)
                  const terminou = !!horario && agendada && agora >= timestampDaAgenda(horario.dataFim)
                  return (
                    <li key={item.idAgendamento}>
                      <details className="group">
                        <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-3.5 hover:bg-fundo group-open:bg-fundo focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-turquesa-escuro sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] [&::-webkit-details-marker]:hidden">
                          <div className="min-w-0">
                            <p className="font-bold wrap-break-word">{pacientes.get(item.idPaciente) ?? `Paciente #${item.idPaciente}`}</p>
                            <p className="text-caption text-azul-profundo/75">Consulta #{item.idAgendamento} · {item.modalidade === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</p>
                          </div>
                          <div className="col-start-1 min-w-0 text-body-small sm:col-start-auto">
                            <p className="flex items-center gap-2 font-bold"><FiCalendar aria-hidden="true" className="size-4 shrink-0 text-turquesa-escuro" />
                              {horario ? `${formatarDataAgenda(horario.dataInicio)}, ${formatarHoraAgenda(horario.dataInicio)}` : 'Horário indisponível'}
                            </p>
                            {horario && <p className="text-caption text-azul-profundo/75 wrap-break-word">{unidades.get(horario.idUnidade) ?? `Unidade #${horario.idUnidade}`}</p>}
                          </div>
                          <span className={`col-start-1 w-fit rounded-md px-2 py-1 text-caption font-bold sm:col-start-auto ${item.statusAgendamento === 'CANCELADO' ? 'bg-critico/10 text-critico' : 'bg-menta text-turquesa-escuro'}`}>{situacoes[item.statusAgendamento]}</span>
                          <FiChevronDown aria-hidden="true" className="col-start-2 row-start-1 size-5 shrink-0 text-turquesa-escuro group-open:rotate-180 sm:col-start-auto sm:row-start-auto" />
                        </summary>
                        <div className="space-y-3 border-t border-azul-profundo/10 px-4 py-4 text-body-small">
                          <dl className="grid gap-3 sm:grid-cols-2">
                            <div><dt className="font-bold">Profissional</dt><dd className="wrap-break-word">
                              {horario ? profissionais.get(horario.idMembroEquipe) ?? `Profissional #${horario.idMembroEquipe}` : 'Indisponível'}
                            </dd></div>
                            <div><dt className="font-bold">Resposta do paciente</dt><dd>{respostas[item.statusRespostaPaciente]}</dd></div>
                          </dl>
                          {horario && (
                            <div className="flex flex-wrap gap-2">
                              {futura && <Botoes texto="Remarcar" variante="contornoTurquesa" onClick={() => abrir({ tipo: 'remarcar', agendamento: item, horario })} />}
                              {futura && <Botoes texto="Cancelar consulta" variante="discreto" onClick={() => abrir({ tipo: 'cancelar', agendamento: item, horario })} />}
                              {iniciou && <Botoes texto="Registrar realizado" onClick={() => abrir({ tipo: 'realizar', agendamento: item, horario })} />}
                              {terminou && <Botoes texto="Registrar falta" variante="secundario" onClick={() => abrir({ tipo: 'falta', agendamento: item, horario })} />}
                            </div>
                          )}
                        </div>
                      </details>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}

      {acao && dados && (
        <DialogoAgendaEquipe titulo={acao.tipo === 'novo' ? 'Novo agendamento' : acao.tipo === 'remarcar' ? 'Remarcar consulta' : resultados[acao.tipo].titulo}
          erro={erro} ocupado={ocupado} aoFechar={() => setAcao(null)}>
          {acao.tipo !== 'novo' && (
            <p className="mb-4 text-body-small text-azul-profundo/80">
              {pacientes.get(acao.agendamento.idPaciente) ?? `Paciente #${acao.agendamento.idPaciente}`} · {formatarDataAgenda(acao.horario.dataInicio)}, {formatarHoraAgenda(acao.horario.dataInicio)}
            </p>
          )}
          {confirmacao ? (
            <>
              <p className="mb-5">{confirmacao.confirmacao}</p>
              <div className="flex flex-wrap justify-end gap-2">
                <Botoes texto="Voltar" variante="secundario" desabilitado={ocupado} onClick={() => setAcao(null)} />
                <Botoes texto="Confirmar" variante={acao.tipo === 'cancelar' ? 'critico' : 'primario'} carregando={ocupado} onClick={registrarResultado} />
              </div>
            </>
          ) : (
            <FormularioAgendamento pacientes={dados.pacientes} unidades={dados.unidades} profissionais={dados.profissionais}
              remarcando={acao.tipo === 'remarcar'} ocupado={ocupado} informarErro={setErro} fechar={() => setAcao(null)} aoSalvar={salvarAgendamento} />
          )}
        </DialogoAgendaEquipe>
      )}
    </>
  )
}
