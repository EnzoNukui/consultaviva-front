export const acoesResgate = {
  iniciar: { titulo: 'Iniciar análise', descricao: 'O pedido passará para Em análise e ficará disponível para gerar alternativas.' },
  gerar: { titulo: 'Gerar propostas', descricao: 'O Motor de Resgate cruza as disponibilidades do paciente com os horários cadastrados para encontrar alternativas.' },
  semSolucao: { titulo: 'Encerrar sem solução', descricao: 'O pedido será encerrado e as alternativas ativas serão canceladas.' },
  cancelarPedido: { titulo: 'Cancelar solicitação', descricao: 'O pedido será cancelado e as propostas ativas perderão a reserva.' },
  editar: { titulo: 'Editar justificativa', descricao: 'Revise a justificativa apresentada ao paciente.' },
  autorizar: { titulo: 'Autorizar modalidade', descricao: 'Registre a autorização desta modalidade. O envio ao paciente continuará disponível para a equipe.' },
  negar: { titulo: 'Negar autorização', descricao: 'A negativa cancela esta proposta.' },
  ofertar: { titulo: 'Enviar proposta ao paciente', descricao: 'A vaga será reservada até o prazo de aceite. O prazo precisa terminar até o início dos dois horários.' },
  confirmar: { titulo: 'Confirmar proposta', descricao: 'O paciente já aceitou a alternativa. Ao confirmar, a agenda será atualizada e o pedido será resolvido.' },
  expirar: { titulo: 'Registrar expiração', descricao: 'O prazo de resposta terminou. Registre a expiração desta proposta.' },
  cancelar: { titulo: 'Cancelar proposta', descricao: 'A proposta será cancelada e a reserva, se houver, será liberada.' },
} as const

export type AcaoPedido = 'iniciar' | 'gerar' | 'semSolucao' | 'cancelarPedido'
export type AcaoProposta = Exclude<keyof typeof acoesResgate, AcaoPedido>
