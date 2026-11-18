import { FiClock, FiRefreshCw } from 'react-icons/fi'
import type { Agendamento } from '../../types/agendamento'
import Botoes from '../Botoes/Botoes'

const situacoes = { AGENDADO: 'Agendada', REALIZADO: 'Realizada', CANCELADO: 'Cancelada', FALTOU: 'Falta registrada' }

export default function AvisoHorariosIndisponiveis({ agendamentos, tentarNovamente }: {
  agendamentos: Agendamento[]
  tentarNovamente: () => void
}) {
  if (!agendamentos.length) return null

  return (
    <section className="rounded-lg border border-azul-profundo/15 bg-superficie p-4 sm:p-5">
      <div role="status" className="flex items-start gap-3">
        <FiClock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-turquesa-escuro" />
        <div>
          <p className="font-bold">{agendamentos.length === 1 ? 'Uma consulta está com o horário indisponível' : 'Algumas consultas estão com o horário indisponível'}</p>
          <p className="mt-1 text-body-small text-azul-profundo/80">Não conseguimos confirmar a data e o horário agora. Tente atualizar ou procure a equipe da unidade antes de se deslocar.</p>
        </div>
      </div>
      <ul aria-label="Consultas com horário indisponível" className="mt-3 divide-y divide-azul-profundo/10">
        {agendamentos.map((agendamento) => (
          <li key={agendamento.idAgendamento} className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-2 text-body-small">
            <span className="font-semibold">Consulta #{agendamento.idAgendamento} · {agendamento.modalidade === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</span>
            <span className="text-azul-profundo/75">{situacoes[agendamento.statusAgendamento]}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <Botoes texto="Atualizar horários" variante="secundario" icone={FiRefreshCw} onClick={tentarNovamente} />
      </div>
    </section>
  )
}
