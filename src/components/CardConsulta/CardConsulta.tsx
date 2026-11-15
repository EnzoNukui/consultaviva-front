import type { ReactNode } from 'react'
import { FiHome, FiVideo } from 'react-icons/fi'
import type { ConsultaComHorario } from '../../services/agendaPacienteService'
import type { Agendamento } from '../../types/agendamento'
import type { Unidade } from '../../types/unidade'

const formatoData = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'long' })
const formatoDataCurta = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'short' })
const formatoHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

const estados: Record<string, { texto: string; cor: string }> = {
  AGENDADO: { texto: 'Agendada', cor: 'bg-menta text-turquesa-escuro' },
  SEM_RESPOSTA: { texto: 'Aguardando sua resposta', cor: 'bg-areia text-azul-profundo' },
  VOU_COMPARECER: { texto: 'Presença confirmada', cor: 'bg-menta text-turquesa-escuro' },
  PRECISO_DE_AJUDA: { texto: 'Você informou que precisa de ajuda', cor: 'bg-areia text-azul-profundo' },
  NAO_CONSIGO_COMPARECER: { texto: 'Você informou que não poderá ir', cor: 'bg-areia text-azul-profundo' },
  REALIZADO: { texto: 'Realizada', cor: 'bg-menta text-turquesa-escuro' },
  CANCELADO: { texto: 'Cancelada', cor: 'bg-critico/10 text-critico' },
  FALTOU: { texto: 'Não compareceu', cor: 'bg-areia text-azul-profundo' },
}

function estadoDaConsulta(agendamento: Agendamento) {
  if (agendamento.statusAgendamento === 'AGENDADO') {
    return estados[agendamento.statusRespostaPaciente] ?? estados.AGENDADO
  }
  return estados[agendamento.statusAgendamento]
}

interface CardConsultaProps {
  consulta: ConsultaComHorario
  unidade?: Unidade | null
  compacto?: boolean
  children?: ReactNode
}

export default function CardConsulta({ consulta, unidade, compacto = false, children }: CardConsultaProps) {
  const { agendamento, horario, inicio } = consulta
  const virtual = agendamento.modalidade === 'VIRTUAL'
  const Icone = virtual ? FiVideo : FiHome
  const estado = estadoDaConsulta(agendamento)

  return (
    <article className="overflow-hidden rounded-lg border border-azul-profundo/15 bg-superficie">
      <div className="p-4 sm:px-5 sm:py-5">
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-menta text-turquesa-escuro">
              <Icone aria-hidden="true" className="size-5" />
            </span>
            <div className="min-w-0">
              <h2 className={compacto ? 'text-body font-bold' : 'text-h4 font-bold'}>{virtual ? 'Consulta virtual' : 'Consulta presencial'}</h2>
              {unidade && <p className="text-body-small text-azul-profundo/75 wrap-break-word">{unidade.nomeUnidade}</p>}
            </div>
          </div>
          {estado && (
            <p className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-caption font-semibold before:size-1.5 before:shrink-0 before:rounded-full before:bg-current ${estado.cor}`}>
              {estado.texto}
            </p>
          )}
        </header>

        <dl className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-t border-azul-profundo/10 pt-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(5rem,1fr)]">
          <div>
            <dt className="text-caption text-azul-profundo/75">Data</dt>
            <dd className="font-semibold"><time dateTime={horario.dataInicio}>{(compacto ? formatoDataCurta : formatoData).format(inicio)}</time></dd>
          </div>
          <div>
            <dt className="text-caption text-azul-profundo/75">Horário</dt>
            <dd className="font-semibold"><time dateTime={horario.dataInicio}>{formatoHora.format(inicio)}</time></dd>
          </div>
        </dl>
      </div>
      {children && <div className="border-t border-azul-profundo/10 bg-fundo/60 px-4 py-2.5 sm:px-5">{children}</div>}
    </article>
  )
}
