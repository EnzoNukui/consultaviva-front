export type ModalidadeAtendimento = 'PRESENCIAL' | 'VIRTUAL'
export type StatusAgendamento = 'AGENDADO' | 'REALIZADO' | 'CANCELADO' | 'FALTOU'
export type RespostaAgendamento = 'VOU_COMPARECER' | 'PRECISO_DE_AJUDA' | 'NAO_CONSIGO_COMPARECER'

export interface Agendamento {
  idAgendamento: number
  modalidade: ModalidadeAtendimento
  statusAgendamento: StatusAgendamento
  statusRespostaPaciente: 'SEM_RESPOSTA' | RespostaAgendamento
  idPaciente: number
  idHorario: number
}

export type CriarAgendamentoRequest = Pick<Agendamento, 'modalidade' | 'idPaciente' | 'idHorario'>
export type RemarcarAgendamentoRequest = Pick<Agendamento, 'idHorario'>
