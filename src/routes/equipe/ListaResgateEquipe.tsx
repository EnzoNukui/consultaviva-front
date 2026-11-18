import { useEffect, useState } from 'react'
import { FiArrowRight, FiRefreshCw, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Botoes from '../../components/Botoes/Botoes'
import { classeCampoFormulario } from '../../components/CampoFormulario/CampoFormulario'
import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import { useBuscaAutenticada } from '../../hooks/useBuscaAutenticada'
import { agoraNaAgenda } from '../../services/agendaPacienteService'
import type { PropostaAtendimento, StatusProposta } from '../../types/proposta'
import type { StatusSolicitacao } from '../../types/solicitacao'
import normalizarBusca from '../../utils/normalizarBusca'
import { carregarResgateEquipe, descreverProposta, podeConfirmarProposta, situacoesProposta, situacoesSolicitacao, textoDataHora, tiposProposta } from './dadosResgateEquipe'
import NavegacaoEquipe from './NavegacaoEquipe'

type RegistroResgate = {
  id: number
  titulo: string
  subtitulo: string
  caminho: string
  situacao: StatusSolicitacao | StatusProposta
  status: string
  referencia: string
  prioridade: number
}

export default function ListaResgateEquipe({ aba }: { aba: 'solicitacoes' | 'propostas' }) {
  const { resultado, tentarNovamente } = useBuscaAutenticada(carregarResgateEquipe)
  const [busca, setBusca] = useState('')
  const [situacao, setSituacao] = useState('')
  const [agora, setAgora] = useState(agoraNaAgenda)

  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(agoraNaAgenda()), 30_000)
    return () => window.clearInterval(relogio)
  }, [])

  const dados = resultado?.status === 'sucesso' ? resultado.dados : null
  const exibirPropostas = aba === 'propostas'
  const propostasPorPedido = new Map<number, PropostaAtendimento[]>()
  for (const proposta of dados?.propostas ?? []) {
    const relacionadas = propostasPorPedido.get(proposta.idSolicitacao) ?? []
    relacionadas.push(proposta)
    propostasPorPedido.set(proposta.idSolicitacao, relacionadas)
  }
  const itens = dados ? dados.solicitacoes.flatMap<RegistroResgate>((pedido) => {
    const agendamento = dados.agendamentos.get(pedido.idAgendamento)
    const horario = agendamento && dados.horarios.get(agendamento.idHorario)
    const paciente = agendamento && dados.pacientes.get(agendamento.idPaciente)
    const titulo = paciente ?? (agendamento ? `Paciente #${agendamento.idPaciente}` : `Consulta #${pedido.idAgendamento}`)
    const relacionadas = propostasPorPedido.get(pedido.idSolicitacao) ?? []
    const aceita = relacionadas.find((proposta) => podeConfirmarProposta(proposta, pedido, agendamento, horario, dados.horarios.get(proposta.idHorario), agora))
    const subtitulo = `Solicitação #${pedido.idSolicitacao}`
    const caminho = `/equipe/solicitacoes/${pedido.idSolicitacao}`

    if (!exibirPropostas) return [{
      id: pedido.idSolicitacao, titulo, subtitulo, caminho, situacao: pedido.statusSolicitacao,
      status: aceita ? 'Aguardando confirmação' : situacoesSolicitacao[pedido.statusSolicitacao],
      referencia: horario ? textoDataHora(horario.dataInicio) : 'Horário da consulta indisponível',
      prioridade: aceita ? 0 : pedido.statusSolicitacao === 'ABERTA' ? 1 : pedido.statusSolicitacao === 'EM_ANALISE' ? 2 : 3,
    }]
    return relacionadas.map((proposta) => {
      const candidato = dados.horarios.get(proposta.idHorario)
      return {
        id: proposta.idProposta, titulo: tiposProposta[proposta.tipoAlternativa], subtitulo: `${titulo} · ${subtitulo} · Proposta #${proposta.idProposta}`,
        caminho: `${caminho}#proposta-${proposta.idProposta}`,
        situacao: proposta.statusProposta, status: descreverProposta(proposta, agora),
        referencia: candidato ? textoDataHora(candidato.dataInicio) : 'Horário da proposta indisponível',
        prioridade: podeConfirmarProposta(proposta, pedido, agendamento, horario, candidato, agora) ? 0
          : proposta.statusProposta === 'EM_ANALISE' ? 1 : proposta.statusProposta === 'OFERTADA' ? 2 : 3,
      }
    })
  }) : []
  const termo = normalizarBusca(busca)
  const visiveis = itens.filter((item) => (!situacao || item.situacao === situacao)
    && normalizarBusca(`${item.titulo} ${item.subtitulo}`).includes(termo))
    .sort((a, b) => a.prioridade - b.prioridade || b.id - a.id)
  const nome = exibirPropostas ? 'Propostas' : 'Solicitações'

  return (
    <>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-h1">Motor de Resgate</h1>
          <p className="mt-2 text-body-small text-azul-profundo/80">Analise os pedidos de ajuda e acompanhe as alternativas para cada consulta.</p>
        </div>
        <Botoes texto="Atualizar" variante="secundario" icone={FiRefreshCw} onClick={tentarNovamente} desabilitado={!resultado} />
      </header>
      <NavegacaoEquipe secao="resgate" />
      {resultado === null && <LoadingState mensagem={`Carregando ${nome.toLowerCase()}…`} />}
      {resultado?.status === 'erro' && <ErrorState mensagem={`Não foi possível carregar ${nome.toLowerCase()}.`} tentarNovamente={tentarNovamente} />}
      {dados && (
        <section aria-labelledby="lista-resgate">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="lista-resgate" className="text-h3">{nome}</h2>
              <p role="status" className="mt-1 text-body-small text-azul-profundo/75">{visiveis.length} {visiveis.length === 1 ? 'registro' : 'registros'}</p>
            </div>
            {itens.length > 0 && (
              <div className="grid w-full min-w-0 gap-3 sm:w-full sm:max-w-[36rem] sm:grid-cols-2">
                <label className="relative block min-w-0 text-body-small font-bold">Buscar
                  <FiSearch aria-hidden="true" className="pointer-events-none absolute bottom-3.5 left-3 size-4 text-turquesa-escuro" />
                  <input type="search" className={`${classeCampoFormulario} pl-9`} value={busca} onChange={(evento) => setBusca(evento.target.value)}
                    placeholder="Paciente ou número" />
                </label>
                <label className="block min-w-0 text-body-small font-bold">Situação
                  <select className={classeCampoFormulario} value={situacao} onChange={(evento) => setSituacao(evento.target.value)}>
                    <option value="">Todas as situações</option>
                    {Object.entries(exibirPropostas ? situacoesProposta : situacoesSolicitacao).map(([id, texto]) => <option key={id} value={id}>{texto}</option>)}
                  </select>
                </label>
              </div>
            )}
          </div>
          {visiveis.length === 0 ? (
            <EmptyState titulo={itens.length ? 'Nenhum resultado' : exibirPropostas ? 'Nenhuma proposta gerada' : 'Nenhuma solicitação recebida'}
              mensagem={itens.length ? 'Nenhum registro corresponde aos filtros selecionados.' : exibirPropostas
                ? 'As alternativas geradas durante a análise de uma solicitação aparecem aqui.'
                : 'Os pedidos de ajuda dos pacientes aparecem aqui.'}
              acao={itens.length ? <Botoes texto="Limpar busca e situação" variante="secundario" onClick={() => { setBusca(''); setSituacao('') }} /> : undefined} />
          ) : (
            <ul className="divide-y divide-azul-profundo/10 overflow-hidden rounded-xl border border-azul-profundo/15 bg-superficie">
              {visiveis.map((item) => (
                <li key={item.id}>
                  <Link to={item.caminho}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-4 py-4 hover:bg-fundo focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-turquesa-escuro md:grid-cols-[minmax(0,1fr)_minmax(8rem,0.45fr)_minmax(8rem,auto)_auto] md:gap-4">
                    <span className="min-w-0 wrap-break-word"><strong className="block">{item.titulo}</strong><span className="text-caption text-azul-profundo/75">{item.subtitulo}</span></span>
                    <span className="col-start-1 text-body-small text-azul-profundo/80 md:col-start-auto">{item.referencia}</span>
                    <span className={`col-start-1 w-fit rounded-md px-2 py-1 text-caption font-bold md:col-start-auto ${item.prioridade === 0 ? 'bg-menta text-turquesa-escuro' : 'bg-azul-profundo/8'}`}>{item.status}</span>
                    <FiArrowRight className="col-start-2 row-start-1 size-5 text-turquesa-escuro md:col-start-auto md:row-start-auto" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  )
}
