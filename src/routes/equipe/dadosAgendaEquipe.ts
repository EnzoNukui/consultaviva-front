import { agendamentoService } from '../../services/agendamentoService'
import { agoraNaAgenda, timestampDaAgenda } from '../../services/agendaPacienteService'
import { ApiError } from '../../services/apiClient'
import { horarioService } from '../../services/horarioService'
import { membroEquipeService } from '../../services/membroEquipeService'
import { pacienteService } from '../../services/pacienteService'
import { unidadeService } from '../../services/unidadeService'
import type { OpcoesAutenticadas } from '../../types/autenticacao'

export async function listaAgenda<T>(requisicao: Promise<T[]>): Promise<T[]> {
  try {
    return await requisicao
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 404) return []
    throw erro
  }
}

async function carregarAgenda(opcoes: OpcoesAutenticadas) {
  const unidades = await listaAgenda(unidadeService.listar(opcoes))
  const profissionais = await listaAgenda(membroEquipeService.listar(opcoes))
  const horarios = await listaAgenda(horarioService.listar(opcoes))
  const agendamentos = await listaAgenda(agendamentoService.listar(opcoes))
  return { unidades, profissionais, horarios, agendamentos }
}

export async function carregarHorariosEquipe(opcoes: OpcoesAutenticadas) {
  const dados = await carregarAgenda(opcoes)
  const vagas = await listaAgenda(horarioService.listarDisponiveis(opcoes))
  return { ...dados, vagas }
}

export async function carregarAgendamentosEquipe(opcoes: OpcoesAutenticadas) {
  const dados = await carregarAgenda(opcoes)
  const pacientes = await listaAgenda(pacienteService.listar(opcoes))
  return { ...dados, pacientes }
}

export function hojeNaAgenda() {
  return new Date(agoraNaAgenda()).toISOString().slice(0, 10)
}

export function somarDias(data: string, dias: number) {
  const dia = new Date(`${data}T00:00:00Z`)
  dia.setUTCDate(dia.getUTCDate() + dias)
  return dia.toISOString().slice(0, 10)
}

export function inicioDaSemana(data: string) {
  const dia = new Date(`${data}T00:00:00Z`).getUTCDay()
  return somarDias(data, -((dia + 6) % 7))
}

const dataAgenda = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'short' })
const horaAgenda = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})

export function formatarDataAgenda(data: string) {
  return dataAgenda.format(timestampDaAgenda(data))
}

export function formatarHoraAgenda(data: string) {
  return horaAgenda.format(timestampDaAgenda(data))
}
