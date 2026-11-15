import { FiArrowRight, FiCheck, FiClock } from 'react-icons/fi'
import Botoes from '../../../components/Botoes/Botoes'
import { timestampDaAgenda } from '../../../services/agendaPacienteService'
import { prazoDaOferta } from '../../../services/propostasDoPaciente'
import type { TipoAlternativa } from '../../../types/proposta'
import { formatarDataHoraProposta } from './dadosPropostas'
import type { HorarioDaProposta, PropostaDoPaciente, SituacaoOferta } from './dadosPropostas'

const titulos = {
  MANUTENCAO: 'Manter a consulta', REMARCACAO: 'Novo horário', CONVERSAO: 'Mudança de modalidade',
  REMARCACAO_CONVERSAO: 'Novo horário e modalidade',
} satisfies Record<TipoAlternativa, string>

const situacoes = {
  pendente: { texto: 'Aguardando sua resposta', classe: 'bg-areia text-azul-profundo' },
  aceita: { texto: 'Aguardando confirmação da equipe', classe: 'bg-menta text-turquesa-escuro' },
  confirmada: { texto: 'Confirmada', classe: 'bg-menta text-turquesa-escuro' },
  recusada: { texto: 'Recusada', classe: 'bg-azul-profundo/8 text-azul-profundo' },
  encerrada: { texto: 'Prazo encerrado', classe: 'bg-azul-profundo/8 text-azul-profundo' },
  cancelada: { texto: 'Cancelada', classe: 'bg-azul-profundo/8 text-azul-profundo' },
  indisponivel: { texto: 'Oferta indisponível', classe: 'bg-azul-profundo/8 text-azul-profundo' },
} satisfies Record<SituacaoOferta, { texto: string; classe: string }>

interface CardPropostaProps {
  item: PropostaDoPaciente
  situacao: SituacaoOferta
  aoResponder: (aceitar: boolean) => void
}

function ResumoHorario({ titulo, dados, destaque }: { titulo: string; dados: HorarioDaProposta; destaque?: boolean }) {
  const { horario, unidade, modalidade } = dados
  const instante = horario ? timestampDaAgenda(horario.dataInicio) : NaN

  return (
    <section className={`min-w-0 rounded-md border border-azul-profundo/10 p-3.5 sm:px-4 ${destaque ? 'bg-menta' : 'bg-fundo'}`}>
      <h4 className="mb-2 text-body-small font-bold text-turquesa-escuro">{titulo}</h4>
      <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-body-small">
        <div>
          <dt className="text-caption text-azul-profundo/75">Data e horário</dt>
          <dd className="font-bold">{horario && Number.isFinite(instante)
            ? <time dateTime={horario.dataInicio}>{formatarDataHoraProposta(instante)}</time> : 'Horário indisponível'}</dd>
        </div>
        <div>
          <dt className="text-caption text-azul-profundo/75">Modalidade</dt>
          <dd>{modalidade === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-caption text-azul-profundo/75">Local</dt>
          <dd className="wrap-break-word">{modalidade === 'VIRTUAL' ? 'On-line' : unidade?.nomeUnidade ?? 'Local não informado'}</dd>
          {unidade?.endereco && <dd className="text-caption text-azul-profundo/80 wrap-break-word">{unidade.endereco}</dd>}
        </div>
      </dl>
    </section>
  )
}

export default function CardProposta({ item, situacao, aoResponder }: CardPropostaProps) {
  const { proposta, consultaAtual, alternativa } = item
  const status = situacoes[situacao]
  const comparar = situacao === 'pendente' || situacao === 'aceita'
  const prazo = prazoDaOferta(proposta)

  return (
    <article className="overflow-hidden rounded-lg border border-azul-profundo/15 bg-superficie">
      <div className="p-4 sm:p-5">
        <header className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-h4 font-bold">{titulos[proposta.tipoAlternativa]}</h3>
          <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-caption font-semibold before:size-1.5 before:shrink-0 before:rounded-full before:bg-current ${status.classe}`}>
            {status.texto}
          </span>
        </header>
        {proposta.justificativa?.trim() && <p className="mt-2 text-body-small text-azul-profundo/80 wrap-break-word">{proposta.justificativa}</p>}

        {comparar ? (
          <div className="mt-4 grid items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-3">
            <ResumoHorario titulo="Sua consulta atual" dados={consultaAtual} />
            <FiArrowRight aria-hidden="true" className="hidden size-5 self-center text-turquesa-escuro sm:block" />
            <ResumoHorario titulo="Alternativa oferecida" dados={alternativa} destaque />
          </div>
        ) : (
          <div className="mt-4">
            <ResumoHorario titulo={situacao === 'confirmada' ? 'Horário confirmado' : 'Alternativa oferecida'} dados={alternativa} destaque={situacao === 'confirmada'} />
          </div>
        )}

        {situacao === 'pendente' && prazo !== null && (
          <p className="mt-3 flex items-center gap-2 text-body-small font-semibold text-azul-profundo/85">
            <FiClock aria-hidden="true" className="size-4 shrink-0 text-turquesa-escuro" /> Responda até {formatarDataHoraProposta(prazo)}
          </p>
        )}
        {situacao === 'aceita' && (
          <p className="mt-3 flex items-start gap-2 text-body-small text-azul-profundo/85">
            <FiCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-turquesa-escuro" /> A equipe ainda precisa confirmar a mudança no agendamento.
          </p>
        )}
      </div>

      {situacao === 'pendente' && (
        <div className="flex flex-wrap items-center gap-3 border-t border-azul-profundo/10 bg-fundo/60 px-4 py-3 sm:px-5">
          <Botoes texto="Aceitar alternativa" icone={FiCheck} onClick={() => aoResponder(true)} />
          <Botoes texto="Recusar" variante="secundario" onClick={() => aoResponder(false)} />
        </div>
      )}
    </article>
  )
}
