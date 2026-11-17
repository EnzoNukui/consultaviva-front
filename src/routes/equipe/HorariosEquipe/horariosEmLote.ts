import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { horarioService } from '../../../services/horarioService'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import type { CriarHorarioRequest, HorarioAtendimento } from '../../../types/horario'
import { listaAgenda, somarDias } from '../dadosAgendaEquipe'

export function conflitaComHorario(registro: CriarHorarioRequest, horario: HorarioAtendimento) {
  return horario.idMembroEquipe === registro.idMembroEquipe
    && timestampDaAgenda(horario.dataInicio) < timestampDaAgenda(registro.dataFim)
    && timestampDaAgenda(horario.dataFim) > timestampDaAgenda(registro.dataInicio)
}

export function montarHorariosEmLote({ inicio, fim, dias, abertura, fechamento, duracao, idUnidade, idMembroEquipe }: {
  inicio: string; fim: string; dias: number[]; abertura: string; fechamento: string; duracao: number;
  idUnidade: number; idMembroEquipe: number
}) {
  const minuto = 60_000
  const primeiro = timestampDaAgenda(`${inicio}T${abertura}:00`)
  const ultimo = timestampDaAgenda(`${inicio}T${fechamento}:00`)
  const tamanho = duracao * minuto
  if (!dias.length || !idUnidade || !idMembroEquipe || !Number.isInteger(duracao) || duracao < 1
    || !(ultimo - primeiro >= tamanho) || !(timestampDaAgenda(`${fim}T00:00:00`) >= timestampDaAgenda(`${inicio}T00:00:00`))) {
    return null
  }

  const vagas: CriarHorarioRequest[] = []
  const totalPorDia = Math.floor((ultimo - primeiro) / tamanho)
  let horariosNoPeriodo = 0
  for (let dia = inicio; dia <= fim; dia = somarDias(dia, 1)) {
    if (!dias.includes(new Date(`${dia}T00:00:00Z`).getUTCDay())) continue
    horariosNoPeriodo += totalPorDia
    // A API grava uma vaga por chamada. Lotes grandes podem ser cadastrados por etapas.
    if (horariosNoPeriodo > 500) return 'Divida esse período em lotes de até 500 vagas para acompanhar o cadastro.'
    const inicioDoDia = timestampDaAgenda(`${dia}T${abertura}:00`)
    for (let indice = 0; indice < totalPorDia; indice++) {
      const inicioVaga = inicioDoDia + indice * tamanho
      vagas.push({
        idUnidade, idMembroEquipe,
        dataInicio: new Date(inicioVaga).toISOString().slice(0, 19),
        dataFim: new Date(inicioVaga + tamanho).toISOString().slice(0, 19),
      })
    }
  }
  return vagas
}

export async function cadastrarHorariosEmLote(vagas: CriarHorarioRequest[], opcoes: OpcoesAutenticadas,
  aoProgredir: (processadas: number) => void) {
  const existentes = await listaAgenda(horarioService.listar(opcoes))
  let criadas = 0
  let ignoradas = 0
  for (const vaga of vagas) {
    opcoes.signal?.throwIfAborted()
    if (timestampDaAgenda(vaga.dataInicio) <= agoraNaAgenda() || existentes.some((item) => conflitaComHorario(vaga, item))) {
      ignoradas++
    } else {
      try {
        const salvo = await horarioService.inserir(vaga, opcoes)
        if (!salvo?.idHorario) throw new Error('Cadastro sem confirmação.')
        criadas++
      } catch (falha) {
        if (opcoes.signal?.aborted || (falha instanceof ApiError && falha.status === 401)) throw falha
        const recentes = falha instanceof ApiError && falha.status === 409
          ? await listaAgenda(horarioService.listar(opcoes)).catch((falhaNaConsulta: unknown) => {
            if (opcoes.signal?.aborted || (falhaNaConsulta instanceof ApiError && falhaNaConsulta.status === 401)) throw falhaNaConsulta
            return []
          }) : []
        if (recentes.some((item) => conflitaComHorario(vaga, item))) ignoradas++
        else return {
          criadas, ignoradas, pendentes: vagas.length - criadas - ignoradas,
          erro: falha instanceof ApiError && falha.status < 500 ? falha.message : 'A API deixou de confirmar o cadastro.',
        }
      }
    }
    aoProgredir(criadas + ignoradas)
  }
  return { criadas, ignoradas, pendentes: 0, erro: '' }
}
