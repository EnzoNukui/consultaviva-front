import { timestampDaAgenda } from './agendaPacienteService'
import { ApiError } from './apiClient'
import { propostaService } from './propostaService'
import type { OpcoesAutenticadas } from '../types/autenticacao'
import type { PropostaAtendimento } from '../types/proposta'

export function prazoDaOferta(proposta: PropostaAtendimento) {
  if (!proposta.dataLimiteAceite || !proposta.dataFimReserva) return null
  const prazo = Math.min(timestampDaAgenda(proposta.dataLimiteAceite), timestampDaAgenda(proposta.dataFimReserva))
  return Number.isFinite(prazo) ? prazo : null
}

export function ofertaVigente(proposta: PropostaAtendimento, agora: number) {
  const prazo = prazoDaOferta(proposta)
  return proposta.statusProposta === 'OFERTADA' && prazo !== null && agora < prazo
    && !!proposta.dataInicioReserva && timestampDaAgenda(proposta.dataInicioReserva) <= agora
}

export function listarOfertasDaSolicitacao(id: number, opcoes: OpcoesAutenticadas) {
  return propostaService.listarPorSolicitacao(id, opcoes).then((propostas) =>
    propostas.filter(({ statusProposta, dataInicioReserva }) => statusProposta !== 'EM_ANALISE' && dataInicioReserva !== null),
  ).catch((erro: unknown) => {
    if (erro instanceof ApiError && erro.status === 404) return []
    throw erro
  })
}
