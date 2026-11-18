import type { Agendamento } from '../types/agendamento'
import type { OpcoesAutenticadas } from '../types/autenticacao'
import type { HorarioAtendimento } from '../types/horario'
import { agendamentoService } from './agendamentoService'
import { ApiError } from './apiClient'
import { horarioService } from './horarioService'
import { unidadeService } from './unidadeService'

export interface ConsultaComHorario {
  agendamento: Agendamento
  horario: HorarioAtendimento
  inicio: number
}

export class HorarioIndisponivelError extends Error {
  readonly agendamento: Agendamento

  constructor(agendamento: Agendamento) {
    super('A consulta está registrada, mas seu horário está indisponível no momento.')
    this.name = 'HorarioIndisponivelError'
    this.agendamento = agendamento
  }
}

const relogioSaoPaulo = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium',
})

// O Java envia LocalDateTime no fuso da agenda, sem deslocamento no valor.
export function timestampDaAgenda(data: string) {
  return Date.parse(`${data}Z`)
}

export function agoraNaAgenda() {
  return timestampDaAgenda(relogioSaoPaulo.format(new Date()).replace(' ', 'T'))
}

export async function carregarAgenda(agendamentos: Agendamento[], opcoes: OpcoesAutenticadas) {
  const ids = [...new Set(agendamentos.map(({ idHorario }) => idHorario))]
  const horariosPorId = new Map<number, HorarioAtendimento>()
  for (const id of ids) {
    opcoes.signal?.throwIfAborted()
    try {
      const horario = await horarioService.buscarPorId(id, opcoes)
      if (horario.idHorario !== id) throw new Error('A API retornou um horário diferente do solicitado.')
      horariosPorId.set(id, horario)
    } catch (erro) {
      if (opcoes.signal?.aborted || !(erro instanceof ApiError) || erro.status !== 404) throw erro
    }
  }

  const consultas: ConsultaComHorario[] = []
  const semHorario: Agendamento[] = []
  for (const agendamento of agendamentos) {
    const horario = horariosPorId.get(agendamento.idHorario)
    if (!horario) {
      semHorario.push(agendamento)
      continue
    }
    const inicio = timestampDaAgenda(horario.dataInicio)
    if (Number.isNaN(inicio)) throw new Error('Horário da consulta inválido.')
    consultas.push({ agendamento, horario, inicio })
  }
  return { consultas, semHorario }
}

export async function carregarHorarios(agendamentos: Agendamento[], opcoes: OpcoesAutenticadas) {
  const { consultas, semHorario } = await carregarAgenda(agendamentos, opcoes)
  if (semHorario.length) throw new HorarioIndisponivelError(semHorario[0])
  return consultas
}

function buscarUnidade(id: number, opcoes: OpcoesAutenticadas) {
  return unidadeService.buscarPorId(id, opcoes).catch((erro: unknown) => {
    if (erro instanceof ApiError && erro.status === 404) return null
    throw erro
  })
}

export const agendaPacienteService = {
  async listar(opcoes: OpcoesAutenticadas) {
    const agendamentos = await agendamentoService.listarDoPaciente(opcoes)
    const { consultas, semHorario } = await carregarAgenda(agendamentos, opcoes)
    const idsUnidades = [...new Set(consultas.flatMap(({ agendamento, horario }) =>
      agendamento.modalidade === 'PRESENCIAL' ? [horario.idUnidade] : [],
    ))]
    const unidades = await Promise.all(idsUnidades.map((id) => buscarUnidade(id, opcoes)))
    const unidadesPorId = new Map(idsUnidades.map((id, indice) => [id, unidades[indice]]))

    return {
      semHorario,
      consultas: consultas.map((consulta) => ({
        ...consulta,
        unidade: consulta.agendamento.modalidade === 'PRESENCIAL'
          ? unidadesPorId.get(consulta.horario.idUnidade) : null,
      })),
    }
  },

  async buscarPorId(id: number, opcoes: OpcoesAutenticadas) {
    const agendamento = await agendamentoService.buscarDoPaciente(id, opcoes)
    const [consulta] = await carregarHorarios([agendamento], opcoes)
    const unidade = agendamento.modalidade === 'PRESENCIAL'
      ? await buscarUnidade(consulta.horario.idUnidade, opcoes) : null
    return { ...consulta, unidade }
  },
}
