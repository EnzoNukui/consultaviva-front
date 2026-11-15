import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { agoraNaAgenda } from '../../services/agendaPacienteService'

const semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const mesExtenso = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const diaExtenso = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeZone: 'UTC' })
const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro'

interface CalendarioAgendaProps {
  datasDisponiveis: string[]
  selecionada: string
  aoSelecionar: (data: string) => void
  bloqueado?: boolean
}

function inicioDoMes(data: string) {
  return Date.parse(`${data.slice(0, 7)}-01T00:00:00Z`)
}

function deslocarMes(mes: number, quantidade: number) {
  const data = new Date(mes)
  return Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + quantidade, 1)
}

export default function CalendarioAgenda({ datasDisponiveis, selecionada, aoSelecionar, bloqueado }: CalendarioAgendaProps) {
  const hoje = new Date(agoraNaAgenda()).toISOString().slice(0, 10)
  const mesAtual = inicioDoMes(hoje)
  const [mes, setMes] = useState(() => inicioDoMes(selecionada || hoje))
  const dataMes = new Date(mes)
  const ano = dataMes.getUTCFullYear()
  const indiceMes = dataMes.getUTCMonth()
  const primeiroDia = dataMes.getUTCDay()
  const diasNoMes = new Date(Date.UTC(ano, indiceMes + 1, 0)).getUTCDate()
  const datasFuturas = datasDisponiveis.filter((data) => data >= hoje)
  const vagas = new Set(datasFuturas)
  const temVagasNoMes = datasFuturas.some((data) => inicioDoMes(data) === mes)
  const dataParaAtalho = datasFuturas.find((data) => inicioDoMes(data) > mes) ?? datasFuturas[0]
  const linhas = Math.ceil((primeiroDia + diasNoMes) / semana.length)
  const navegar = `grid size-11 place-items-center rounded-md border border-azul-profundo/15 hover:bg-menta disabled:opacity-35 ${foco}`

  function mudarMes(novoMes: number) {
    setMes(novoMes)
    if (selecionada) aoSelecionar('')
  }

  return (
    <div className="min-w-0 rounded-lg border border-azul-profundo/15 bg-superficie p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button type="button" aria-label="Mês anterior" className={navegar} disabled={bloqueado}
          onClick={() => mudarMes(deslocarMes(mes, -1))}>
          <FiChevronLeft aria-hidden="true" className="size-5" />
        </button>
        <p aria-live="polite" className="text-center text-body-small font-bold first-letter:uppercase">{mesExtenso.format(mes)}</p>
        <button type="button" aria-label="Próximo mês" className={navegar} disabled={bloqueado}
          onClick={() => mudarMes(deslocarMes(mes, 1))}>
          <FiChevronRight aria-hidden="true" className="size-5" />
        </button>
      </div>

      {!temVagasNoMes && (
        <div className="mb-2 rounded-md bg-fundo px-3 py-2 text-body-small">
          <p role="status">{mes < mesAtual ? 'Agendamentos podem ser feitos apenas para datas futuras.' : 'Sem vagas neste mês.'}</p>
          {dataParaAtalho && (
            <button type="button" disabled={bloqueado}
              onClick={() => mudarMes(inicioDoMes(dataParaAtalho))}
              className={`inline-flex min-h-11 items-center rounded-sm text-left font-bold text-turquesa-escuro underline underline-offset-4 disabled:opacity-50 ${foco}`}>
              Ver vagas de {mesExtenso.format(inicioDoMes(dataParaAtalho))}
            </button>
          )}
        </div>
      )}

      <table aria-label="Calendário de agendamento" className="w-full table-fixed border-separate border-spacing-y-1 text-center">
        <thead>
          <tr>
            {semana.map((dia) => <th key={dia} scope="col" className="pb-1 text-caption font-semibold text-azul-profundo/75">{dia}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: linhas }, (_, linha) => (
            <tr key={linha}>
              {semana.map((diaSemana, coluna) => {
                const dia = linha * semana.length + coluna - primeiroDia + 1
                if (dia < 1 || dia > diasNoMes) return <td key={diaSemana} />

                const instante = Date.UTC(ano, indiceMes, dia)
                const chave = new Date(instante).toISOString().slice(0, 10)
                const disponivel = vagas.has(chave)

                return (
                  <td key={diaSemana} className="px-0.5">
                    {disponivel ? (
                      <button
                        type="button"
                        aria-label={diaExtenso.format(instante)}
                        aria-pressed={selecionada === chave}
                        aria-current={chave === hoje ? 'date' : undefined}
                        disabled={bloqueado}
                        onClick={() => aoSelecionar(chave)}
                        className={`min-h-11 w-full rounded-md bg-menta text-sm font-bold text-turquesa-escuro hover:bg-turquesa/20 aria-pressed:bg-turquesa-escuro aria-pressed:text-superficie ${foco}`}
                      >
                        {dia}
                      </button>
                    ) : (
                      <span className="grid min-h-11 place-items-center text-sm text-azul-profundo/55">
                        <span className="sr-only">{diaExtenso.format(instante)}, sem horário</span>
                        <span aria-hidden="true">{dia}</span>
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {temVagasNoMes && (
        <p className="mt-2 flex items-center gap-2 text-caption text-azul-profundo/80">
          <span aria-hidden="true" className="size-3 rounded-sm bg-menta ring-1 ring-turquesa-escuro/40" /> Dia com horário disponível
        </p>
      )}
    </div>
  )
}
