import type { Agendamento } from '../../types/agendamento'

const estados: Record<string, { texto: string; cor: string }> = {
  AGENDADO: { texto: 'Agendada', cor: 'bg-menta text-turquesa-escuro' },
  SEM_RESPOSTA: { texto: 'Aguardando sua resposta', cor: 'bg-areia text-azul-profundo' },
  VOU_COMPARECER: { texto: 'Presença confirmada', cor: 'bg-menta text-turquesa-escuro' },
  PRECISO_DE_AJUDA: { texto: 'Você informou que precisa de ajuda', cor: 'bg-areia text-azul-profundo' },
  NAO_CONSIGO_COMPARECER: { texto: 'Você informou que não poderá ir', cor: 'bg-areia text-azul-profundo' },
  REALIZADO: { texto: 'Realizada', cor: 'bg-menta text-turquesa-escuro' },
  CANCELADO: { texto: 'Cancelada', cor: 'bg-critico/10 text-critico' },
  FALTOU: { texto: 'Não compareceu', cor: 'bg-areia text-azul-profundo' },
}

export function estadoDaConsulta(agendamento: Agendamento) {
  return agendamento.statusAgendamento === 'AGENDADO'
    ? estados[agendamento.statusRespostaPaciente] ?? estados.AGENDADO
    : estados[agendamento.statusAgendamento]
}
