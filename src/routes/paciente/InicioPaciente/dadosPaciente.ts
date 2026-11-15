import { agoraNaAgenda, carregarHorarios } from '../../../services/agendaPacienteService'
import { ofertaVigente } from '../../../services/propostasDoPaciente'
import { unidadeService } from '../../../services/unidadeService'
import type { Agendamento } from '../../../types/agendamento'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import type { SolicitacaoAjuda } from '../../../types/solicitacao'
import { carregarOfertasEmAnalise } from '../SolicitacoesPaciente/dadosSolicitacoes'

export async function carregarConsultas(agendadas: Agendamento[], opcoes: OpcoesAutenticadas) {
  const consultas = await carregarHorarios(agendadas, opcoes)
  const agora = agoraNaAgenda()

  const futuras = consultas.filter(({ inicio }) => inicio >= agora).sort((a, b) => a.inicio - b.inicio)

  const proxima = futuras[0]
  const unidade = proxima?.agendamento.modalidade === 'PRESENCIAL'
    ? await unidadeService.buscarPorId(proxima.horario.idUnidade, opcoes)
    : null

  return { futuras, localProxima: unidade?.nomeUnidade }
}

export async function contarPropostasPendentes(solicitacoes: SolicitacaoAjuda[], opcoes: OpcoesAutenticadas) {
  const ofertasPorSolicitacao = await carregarOfertasEmAnalise(solicitacoes, opcoes)
  const agora = agoraNaAgenda()
  const idsSolicitacao: number[] = []
  let total = 0

  for (const [id, propostas] of ofertasPorSolicitacao) {
    const quantidade = propostas.filter((proposta) => proposta.statusAceitePaciente === 'PENDENTE' && ofertaVigente(proposta, agora)).length
    if (quantidade > 0) {
      idsSolicitacao.push(id)
      total += quantidade
    }
  }
  return { total, idsSolicitacao }
}
