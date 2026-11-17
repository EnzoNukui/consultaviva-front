import { FiCalendar, FiMapPin } from 'react-icons/fi'
import Botoes from '../../../components/Botoes/Botoes'
import { timestampDaAgenda } from '../../../services/agendaPacienteService'
import { prazoDaOferta } from '../../../services/propostasDoPaciente'
import type { HorarioAtendimento } from '../../../types/horario'
import type { PropostaAtendimento } from '../../../types/proposta'
import { descreverProposta, textoDataHora, tiposProposta } from '../dadosResgateEquipe'
import type { AcaoProposta } from './acoesResgate'

const autorizacoes: Record<PropostaAtendimento['statusAutorizacao'], string> = {
  PENDENTE: 'Aguardando profissional autorizador', AUTORIZADA: 'Autorizada',
  NEGADA: 'Negada', NAO_APLICAVEL: 'Dispensada',
}
const respostas: Record<PropostaAtendimento['statusAceitePaciente'], string> = {
  ACEITA: 'Aceitou', RECUSADA: 'Recusou', PENDENTE: 'Sem resposta',
}

export default function PropostaNaAnalise({ proposta, horario, unidade, podeAnalisar, podeConfirmar, agora, aoAgir }: {
  proposta: PropostaAtendimento
  horario?: HorarioAtendimento
  unidade?: string
  podeAnalisar: boolean
  podeConfirmar: boolean
  agora: number
  aoAgir: (acao: AcaoProposta, proposta: PropostaAtendimento) => void
}) {
  const emAnalise = proposta.statusProposta === 'EM_ANALISE'
  const ofertada = proposta.statusProposta === 'OFERTADA'
  const permiteOferta = proposta.statusAutorizacao === 'NAO_APLICAVEL' || proposta.statusAutorizacao === 'AUTORIZADA'
  const prazoVencido = ofertada && (prazoDaOferta(proposta) ?? -Infinity) <= agora
  const candidatoFuturo = !!horario && timestampDaAgenda(horario.dataInicio) > agora
  const eventos = [
    { titulo: 'Gerada', data: proposta.dataCriacao },
    { titulo: 'Autorização registrada', data: proposta.dataAutorizacao },
    { titulo: 'Enviada ao paciente', data: proposta.dataInicioReserva },
    { titulo: 'Resposta do paciente', data: proposta.dataResposta },
    { titulo: 'Confirmada pela equipe', data: proposta.dataConfirmacao },
  ].flatMap(({ titulo, data }) => data ? [{ titulo, data }] : [])
    .sort((a, b) => a.data.localeCompare(b.data))

  return (
    <article id={`proposta-${proposta.idProposta}`} className="scroll-mt-5 rounded-xl border border-azul-profundo/15 bg-superficie p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-caption font-semibold text-turquesa-escuro">Proposta #{proposta.idProposta}</p>
          <h3 className="mt-1 text-h4">{tiposProposta[proposta.tipoAlternativa]}</h3>
        </div>
        <span className={`rounded-md px-2 py-1 text-caption font-bold ${podeConfirmar ? 'bg-menta text-turquesa-escuro' : 'bg-azul-profundo/8'}`}>{descreverProposta(proposta, agora)}</span>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-lg bg-fundo px-3 py-2.5 text-body-small font-semibold">
        <p className="flex items-center gap-2"><FiCalendar className="shrink-0 text-turquesa-escuro" aria-hidden="true" />
          {horario ? textoDataHora(horario.dataInicio) : 'Horário indisponível'} · {proposta.modalidade === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</p>
        {unidade && <p className="flex items-center gap-2 wrap-break-word"><FiMapPin className="shrink-0 text-turquesa-escuro" aria-hidden="true" />{unidade}</p>}
      </div>
      <p className="my-3 text-body-small wrap-break-word whitespace-pre-wrap">{proposta.justificativa}</p>
      {emAnalise && podeAnalisar && proposta.tipoAlternativa === 'MANUTENCAO' && (
        <p className="mb-3 rounded-md bg-areia px-3 py-2 text-body-small">
          Esta opção mantém o horário e a modalidade originais. Confira se a dificuldade relatada já foi resolvida antes de enviar.
        </p>
      )}
      <dl className="grid gap-3 text-body-small sm:grid-cols-3">
        <div><dt className="font-bold">Autorização</dt><dd>{autorizacoes[proposta.statusAutorizacao]}</dd></div>
        <div><dt className="font-bold">Resposta do paciente</dt><dd>{respostas[proposta.statusAceitePaciente]}</dd></div>
        {proposta.dataLimiteAceite && <div><dt className="font-bold">Prazo de aceite</dt><dd>{textoDataHora(proposta.dataLimiteAceite)}</dd></div>}
      </dl>
      {eventos.length > 0 && (
        <details className="mt-4 border-t border-azul-profundo/10 pt-3 text-body-small">
          <summary className="w-fit cursor-pointer font-bold text-turquesa-escuro">Atividade da proposta</summary>
          <ol className="mt-2 space-y-1">
            {eventos.map(({ titulo, data }) => <li key={titulo}>{textoDataHora(data)} · {titulo}</li>)}
          </ol>
        </details>
      )}
      {((emAnalise && podeAnalisar) || ofertada) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {emAnalise && podeAnalisar && (
            <>
              {permiteOferta && candidatoFuturo && <Botoes texto="Enviar ao paciente" onClick={() => aoAgir('ofertar', proposta)} />}
              {proposta.statusAutorizacao === 'PENDENTE' && (
                <>
                  <Botoes texto="Autorizar modalidade" onClick={() => aoAgir('autorizar', proposta)} />
                  <Botoes texto="Negar autorização" variante="secundario" onClick={() => aoAgir('negar', proposta)} />
                </>
              )}
              <Botoes texto="Editar justificativa" variante="secundario" onClick={() => aoAgir('editar', proposta)} />
            </>
          )}
          {podeConfirmar && <Botoes texto="Confirmar proposta" onClick={() => aoAgir('confirmar', proposta)} />}
          {prazoVencido && <Botoes texto="Registrar expiração" variante="secundario" onClick={() => aoAgir('expirar', proposta)} />}
          <Botoes texto="Cancelar proposta" variante="discreto" onClick={() => aoAgir('cancelar', proposta)} />
        </div>
      )}
      {emAnalise && podeAnalisar && !candidatoFuturo && <p className="mt-2 text-body-small text-azul-profundo/75">A oferta exige um horário proposto futuro.</p>}
      {ofertada && proposta.statusAceitePaciente === 'ACEITA' && !podeConfirmar && (
        <p className="mt-2 text-body-small text-azul-profundo/75">A confirmação exige uma reserva vigente e que os dois horários ainda estejam no futuro.</p>
      )}
    </article>
  )
}
