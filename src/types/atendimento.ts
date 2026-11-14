import type { IndicadorSimNao, LocalDateTime } from './api'

export interface PlanoComparecimento {
  idPlano: number
  dataCalculo: LocalDateTime
  origemTrajeto: string
  destinoTrajeto: string
  meioTransporte: string
  nomeFonte: string
  duracaoMinutos: number
  margemMinutos: number
  dataAtendimentoReferencia: LocalDateTime
  dataSaidaSugerida: LocalDateTime
  simulado: IndicadorSimNao
  idAgendamento: number
  idProposta: number | null
}

export type AtualizarPlanoRequest = Pick<
  PlanoComparecimento, 'origemTrajeto' | 'destinoTrajeto' | 'meioTransporte' | 'duracaoMinutos' | 'margemMinutos'
>

export type CriarPlanoRequest = AtualizarPlanoRequest & {
  idAgendamento: number
  idProposta?: number | null
}

export interface PreparoVirtual {
  idPreparo: number
  dataVerificacao: LocalDateTime
  statusPermissaoMicrofone: string
  statusPermissaoCamera: string
  statusCamera: string
  statusMicrofone: string
  statusConexao: string
  observacao: string | null
  idAgendamento: number
  idProposta: number | null
}

export type AtualizarPreparoRequest = Pick<
  PreparoVirtual, 'statusPermissaoMicrofone' | 'statusPermissaoCamera' | 'statusCamera' | 'statusMicrofone' | 'statusConexao'
> & { observacao?: string | null }

export type CriarPreparoRequest = AtualizarPreparoRequest & {
  idAgendamento: number
  idProposta?: number | null
}

export interface HistoricoEvento {
  idEvento: number
  dataEvento: LocalDateTime
  tipoEvento: string
  descricaoEvento: string
  tipoOrigem: string
  idAgendamento: number
  idSolicitacao: number | null
  idProposta: number | null
  idMembroEquipe: number | null
}

export interface SincronizacaoAgenda {
  idSincronizacao: number
  nomeProvedor: string
  idAgendaExterna: string | null
  idEventoExterno: string | null
  tipoOperacao: string
  statusSincronizacao: string
  numeroTentativas: number
  dataUltimaTentativa: LocalDateTime | null
  dataUltimoSucesso: LocalDateTime | null
  ultimoErro: string | null
  idAgendamento: number
}
