import { useState } from 'react'
import { FiCalendar, FiCheck, FiChevronRight } from 'react-icons/fi'
import { useSearchParams } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import AvisoHorariosIndisponiveis from '../../../components/AvisoHorariosIndisponiveis/AvisoHorariosIndisponiveis'
import CardConsulta from '../../../components/CardConsulta/CardConsulta'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { agoraNaAgenda, agendaPacienteService } from '../../../services/agendaPacienteService'
import { useBuscaPaciente } from '../useBuscaPaciente'
import AgendarConsulta from './AgendarConsulta'

const filtros = [
  { id: 'proximas', texto: 'Próximas' },
  { id: 'historico', texto: 'Histórico' },
] as const

export default function ConsultasPaciente() {
  const [parametros, setParametros] = useSearchParams()
  const [agendamentoConcluido, setAgendamentoConcluido] = useState<number | null>(null)
  const filtro = parametros.get('periodo') === 'historico' ? 'historico' : 'proximas'
  const formularioAberto = parametros.get('agendar') === '1'

  if (formularioAberto) {
    return (
      <AgendarConsulta
        aoCancelar={() => setParametros(filtro === 'historico' ? { periodo: filtro } : {}, { replace: true })}
        aoAgendar={(id) => {
          setAgendamentoConcluido(id)
          setParametros({}, { replace: true })
        }}
      />
    )
  }

  return <ListaConsultas filtro={filtro}
    agendamentoConcluido={agendamentoConcluido}
    aoAbrirAgenda={() => setAgendamentoConcluido(null)}
    aoFiltrar={(periodo) => setParametros(periodo === 'historico' ? { periodo } : {}, { replace: true })} />
}

function ListaConsultas({ filtro, agendamentoConcluido, aoAbrirAgenda, aoFiltrar }: {
  filtro: 'proximas' | 'historico'
  agendamentoConcluido: number | null
  aoAbrirAgenda: () => void
  aoFiltrar: (periodo: 'proximas' | 'historico') => void
}) {
  const { resultado, tentarNovamente } = useBuscaPaciente(agendaPacienteService.listar)
  const periodoNaUrl = filtro === 'historico' ? '?periodo=historico' : ''
  const linkAgenda = `/paciente/consultas?agendar=1${filtro === 'historico' ? '&periodo=historico' : ''}`
  const consultas = resultado?.status === 'sucesso' ? resultado.dados.consultas : []
  const semHorario = resultado?.status === 'sucesso' ? resultado.dados.semHorario : []
  const agora = agoraNaAgenda()
  const proximas = consultas.filter(({ agendamento, inicio }) =>
    agendamento.statusAgendamento === 'AGENDADO' && inicio >= agora,
  ).sort((a, b) => a.inicio - b.inicio)
  const historico = consultas.filter(({ agendamento, inicio }) =>
    agendamento.statusAgendamento !== 'AGENDADO' || inicio < agora,
  ).sort((a, b) => b.inicio - a.inicio)
  const resumo = [
    { rotulo: 'Próximas', total: proximas.length },
    { rotulo: 'Confirmadas', total: proximas.filter(({ agendamento }) => agendamento.statusRespostaPaciente === 'VOU_COMPARECER').length },
    { rotulo: 'Sem resposta', total: proximas.filter(({ agendamento }) => agendamento.statusRespostaPaciente === 'SEM_RESPOSTA').length },
  ]
  const mostrandoProximas = filtro === 'proximas'
  const lista = mostrandoProximas ? proximas : historico

  return (
    <>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h1">Minhas consultas</h1>
          <p className="mt-2 text-body-small text-azul-profundo/80">
            Marque uma consulta ou veja os detalhes de uma que já está na sua agenda.
          </p>
        </div>
        <Botoes texto="Agendar consulta" icone={FiCalendar} para={linkAgenda} onClick={aoAbrirAgenda} />
      </header>

      {agendamentoConcluido && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg bg-menta px-4 py-2">
          <p role="status" className="flex items-center gap-2 text-body-small font-bold text-turquesa-escuro">
            <FiCheck aria-hidden="true" className="size-5 shrink-0" /> Consulta agendada.
          </p>
          <Botoes texto="Ver consulta agendada" para={`/paciente/consultas/${agendamentoConcluido}`} variante="contornoTurquesa" />
        </div>
      )}

      {semHorario.length > 0 && (
        <div className="mb-5">
          <AvisoHorariosIndisponiveis agendamentos={semHorario} tentarNovamente={tentarNovamente} />
        </div>
      )}

      {resultado === null ? (
        <LoadingState mensagem="Carregando suas consultas…" />
      ) : resultado.status === 'erro' ? (
        <ErrorState mensagem="Não foi possível consultar a sua agenda." tentarNovamente={tentarNovamente} />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-6">
          <aside aria-labelledby="resumo-consultas" className="rounded-lg bg-azul-profundo px-4 py-4 text-superficie lg:col-start-2 lg:row-start-1">
            <h2 id="resumo-consultas" className="text-body-small font-bold">Resumo da agenda</h2>
            <dl className="mt-3 grid grid-cols-3 divide-x divide-superficie/20">
              {resumo.map(({ rotulo, total }) => (
                <div key={rotulo} className="grid grid-rows-[auto_1fr] justify-items-center px-0.5 text-center first:justify-items-start first:text-left">
                  <dt className="row-start-2 text-caption text-superficie/80">{rotulo}</dt>
                  <dd className="row-start-1 text-h3 font-bold tabular-nums">{total}</dd>
                </div>
              ))}
            </dl>
            {semHorario.length > 0 && <p className="mt-3 text-caption text-superficie/80">O resumo considera apenas as consultas com horário disponível.</p>}
          </aside>

          <section aria-label="Lista de consultas" className="min-w-0 lg:col-start-1 lg:row-start-1">
            <div role="group" aria-label="Período das consultas" className="mb-4 flex gap-1 rounded-lg border border-azul-profundo/10 bg-superficie p-1 sm:w-fit">
              {filtros.map(({ id, texto }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={filtro === id}
                  onClick={() => aoFiltrar(id)}
                  className="min-h-11 flex-1 cursor-pointer rounded-md px-4 text-body-small font-bold text-azul-profundo/80 hover:bg-fundo focus-visible:outline-2 focus-visible:outline-turquesa-escuro aria-pressed:bg-menta aria-pressed:text-turquesa-escuro"
                >
                  {texto}
                </button>
              ))}
            </div>

            {lista.length > 0 ? (
              <ul className="space-y-3">
                {lista.map((consulta) => (
                  <li key={consulta.agendamento.idAgendamento}>
                    <CardConsulta consulta={consulta} unidade={consulta.unidade}>
                      <Botoes
                        texto="Ver consulta"
                        para={`/paciente/consultas/${consulta.agendamento.idAgendamento}${periodoNaUrl}`}
                        icone={FiChevronRight}
                        posicaoIcone="direita"
                      />
                    </CardConsulta>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                titulo={semHorario.length > 0 ? 'Nenhuma outra consulta neste período' : mostrandoProximas ? 'Você não tem consultas futuras' : 'Seu histórico está vazio'}
                mensagem={semHorario.length > 0 ? 'As consultas com horário indisponível estão indicadas acima.' : mostrandoProximas
                  ? 'Quando uma consulta for agendada, ela aparecerá aqui.'
                  : 'As consultas anteriores e canceladas aparecerão aqui.'}
              />
            )}
          </section>
        </div>
      )}
    </>
  )
}
