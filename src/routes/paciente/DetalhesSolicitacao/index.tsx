import { useCallback } from 'react'
import { FiArrowLeft, FiCheck, FiChevronRight } from 'react-icons/fi'
import { Link, useLocation, useParams } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import CardConsulta from '../../../components/CardConsulta/CardConsulta'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import StatusSolicitacao from '../../../components/StatusSolicitacao/StatusSolicitacao'
import { agoraNaAgenda, agendaPacienteService } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { solicitacaoService } from '../../../services/solicitacaoService'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import { carregarTiposDificuldade, dataHoraDaSolicitacao, solicitacaoAtiva } from '../SolicitacoesPaciente/dadosSolicitacoes'
import { useBuscaPaciente } from '../useBuscaPaciente'
import PropostasDaSolicitacao from './PropostasDaSolicitacao'

const modalidades = { PRESENCIAL: 'Presencial', VIRTUAL: 'Virtual', AMBAS: 'Presencial ou virtual' }

async function carregarDetalhes(id: number, opcoes: OpcoesAutenticadas) {
  const pedido = await solicitacaoService.buscarDoPaciente(id, opcoes)
  const consulta = await agendaPacienteService.buscarPorId(pedido.idAgendamento, opcoes)
  const disponibilidades = await solicitacaoService.listarDisponibilidades(id, opcoes)
  const dificuldades = await solicitacaoService.listarDificuldades(id, opcoes)
  const tipos = dificuldades.length > 0 ? await carregarTiposDificuldade(opcoes) : []
  const nomes = new Map(tipos.map(({ idDificuldade, nomeDificuldade }) => [idDificuldade, nomeDificuldade]))
  return { pedido, consulta, disponibilidades, dificuldades: dificuldades.map(({ idDificuldade }) => ({
    id: idDificuldade, nome: nomes.get(idDificuldade) ?? 'Dificuldade cadastrada',
  })) }
}

export default function DetalhesSolicitacao() {
  const { id } = useParams()
  const { state } = useLocation()
  const identificador = Number(id)
  const valido = Number.isSafeInteger(identificador) && identificador > 0
  const carregar = useCallback((opcoes: OpcoesAutenticadas) => (
    valido ? carregarDetalhes(identificador, opcoes) : Promise.resolve(null)
  ), [identificador, valido])
  const { resultado, tentarNovamente } = useBuscaPaciente(carregar)
  const dados = resultado?.status === 'sucesso' ? resultado.dados : null
  const indisponivel = resultado?.status === 'erro' && resultado.erro instanceof ApiError
    && (resultado.erro.status === 403 || resultado.erro.status === 404)

  return (
    <>
      <header className="mb-6">
        <Link to="/paciente/solicitacoes" className="mb-2 inline-flex min-h-11 items-center gap-2 rounded-sm text-body-small font-bold text-turquesa-escuro hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro">
          <FiArrowLeft aria-hidden="true" className="size-4" /> Minhas solicitações
        </Link>
        <h1 className="text-h1">Detalhes da solicitação</h1>
      </header>

      {state?.enviada === true && (
        <p role="status" className="mb-5 flex items-center gap-2 rounded-lg bg-menta px-4 py-3 text-body-small font-bold text-turquesa-escuro">
          <FiCheck aria-hidden="true" className="size-5 shrink-0" /> Solicitação enviada.
        </p>
      )}

      {!valido || indisponivel ? (
        <EmptyState titulo="Solicitação indisponível" mensagem="Volte à lista para escolher um dos seus pedidos." />
      ) : resultado === null ? (
        <LoadingState mensagem="Carregando os detalhes da solicitação…" />
      ) : resultado.status === 'erro' ? (
        <ErrorState mensagem="Não foi possível carregar esta solicitação." tentarNovamente={tentarNovamente} />
      ) : dados && (
        <PropostasDaSolicitacao key={dados.pedido.idSolicitacao} pedido={dados.pedido} consulta={dados.consulta}>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
            <section aria-labelledby="andamento-solicitacao" className="min-w-0 rounded-lg border border-azul-profundo/15 bg-superficie p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 id="andamento-solicitacao" className="text-h4">Andamento do pedido</h2>
                <StatusSolicitacao situacao={dados.pedido.statusSolicitacao} />
              </div>
              <p className="mt-1 text-body-small text-azul-profundo/80">Enviada em {dataHoraDaSolicitacao(dados.pedido.dataAbertura)}</p>
              {dados.pedido.dataEncerramento && <p className="text-body-small text-azul-profundo/80">Encerrada em {dataHoraDaSolicitacao(dados.pedido.dataEncerramento)}</p>}
              {solicitacaoAtiva(dados.pedido) && dados.consulta.agendamento.statusAgendamento === 'AGENDADO'
                && dados.consulta.inicio > agoraNaAgenda() && (
                <p className="mt-4 rounded-md bg-menta px-3 py-2 text-body-small text-turquesa-escuro">Sua consulta permanece marcada enquanto a equipe avalia o pedido.</p>
              )}

              {(dados.pedido.relato || dados.dificuldades.length > 0) && (
                <section aria-labelledby="relato-enviado" className="mt-5 border-t border-azul-profundo/10 pt-4">
                  <h3 id="relato-enviado" className="text-h4">O que você informou</h3>
                  {dados.dificuldades.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {dados.dificuldades.map(({ id: dificuldade, nome }) => (
                        <li key={dificuldade} className="rounded-md bg-fundo px-2 py-1 text-body-small">{nome}</li>
                      ))}
                    </ul>
                  )}
                  {dados.pedido.relato && <p className="mt-2 text-body-small wrap-break-word whitespace-pre-wrap">{dados.pedido.relato}</p>}
                </section>
              )}

              <section aria-labelledby="disponibilidades-enviadas" className="mt-5 border-t border-azul-profundo/10 pt-4">
                <h3 id="disponibilidades-enviadas" className="text-h4">Sua disponibilidade</h3>
                {dados.disponibilidades.length ? (
                  <ul className="mt-2 divide-y divide-azul-profundo/10">
                    {dados.disponibilidades.map((intervalo) => (
                      <li key={intervalo.idDisponibilidade} className="py-2 text-body-small">
                        <p className="font-semibold">{modalidades[intervalo.modalidade]}</p>
                        <p className="text-azul-profundo/80">De {dataHoraDaSolicitacao(intervalo.dataInicio)} até {dataHoraDaSolicitacao(intervalo.dataFim)}</p>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-2 text-body-small text-azul-profundo/80">Nenhum intervalo informado.</p>}
              </section>
            </section>

            <CardConsulta consulta={dados.consulta} unidade={dados.consulta.unidade} compacto>
              <div className="flex flex-wrap gap-2">
                <Botoes texto="Ver consulta" para={`/paciente/consultas/${dados.pedido.idAgendamento}`} icone={FiChevronRight} posicaoIcone="direita" />
              </div>
            </CardConsulta>
          </div>
        </PropostasDaSolicitacao>
      )}
    </>
  )
}
