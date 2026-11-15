import type { StatusSolicitacao as Situacao } from '../../types/solicitacao'

export type SituacaoExibida = Situacao | 'PROPOSTA_DISPONIVEL' | 'AGUARDANDO_CONFIRMACAO'

const situacoes = {
  ABERTA: { texto: 'Enviada', classe: 'bg-menta text-turquesa-escuro' },
  EM_ANALISE: { texto: 'Em análise', classe: 'bg-areia text-azul-profundo' },
  PROPOSTA_DISPONIVEL: { texto: 'Proposta disponível', classe: 'bg-menta text-turquesa-escuro' },
  AGUARDANDO_CONFIRMACAO: { texto: 'Aguardando confirmação', classe: 'bg-areia text-azul-profundo' },
  RESOLVIDA: { texto: 'Resolvida', classe: 'bg-menta text-turquesa-escuro' },
  SEM_SOLUCAO: { texto: 'Encerrada sem solução', classe: 'bg-areia text-azul-profundo' },
  CANCELADA: { texto: 'Cancelada', classe: 'bg-azul-profundo/8 text-azul-profundo' },
} satisfies Record<SituacaoExibida, { texto: string; classe: string }>

export default function StatusSolicitacao({ situacao }: { situacao: SituacaoExibida }) {
  const { texto, classe } = situacoes[situacao]

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-caption font-semibold before:size-1.5 before:shrink-0 before:rounded-full before:bg-current ${classe}`}>
      {texto}
    </span>
  )
}
