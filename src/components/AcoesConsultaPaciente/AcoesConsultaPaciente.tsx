import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiChevronRight, FiMessageSquare } from 'react-icons/fi'
import { agendamentoService } from '../../services/agendamentoService'
import { agoraNaAgenda } from '../../services/agendaPacienteService'
import type { ConsultaComHorario } from '../../services/agendaPacienteService'
import { ApiError } from '../../services/apiClient'
import type { Agendamento } from '../../types/agendamento'
import type { SolicitacaoAjuda } from '../../types/solicitacao'
import Botoes from '../Botoes/Botoes'
import { useSessao } from '../SessaoProvider/sessao'

interface AcoesConsultaPacienteProps {
  consulta: ConsultaComHorario
  pedido?: SolicitacaoAjuda | null
  detalhes?: string
  aoConfirmar: (agendamento: Agendamento) => void
}

export default function AcoesConsultaPaciente({ consulta, pedido, detalhes, aoConfirmar }: AcoesConsultaPacienteProps) {
  const { sessao, definirSessao } = useSessao()
  const controle = useRef<AbortController | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [retorno, setRetorno] = useState<{ texto: string; erro: boolean } | null>(null)
  const { agendamento, inicio } = consulta
  const futura = agendamento.statusAgendamento === 'AGENDADO' && inicio > agoraNaAgenda()
  const podeConfirmar = futura && agendamento.statusRespostaPaciente !== 'VOU_COMPARECER'

  useEffect(() => () => controle.current?.abort(), [])

  async function confirmarPresenca() {
    if (!sessao || !podeConfirmar || controle.current) return
    if (inicio <= agoraNaAgenda()) {
      setRetorno({ texto: 'O horário da consulta já começou.', erro: true })
      return
    }

    const requisicao = new AbortController()
    controle.current = requisicao
    setEnviando(true)
    setRetorno(null)

    try {
      const atualizado = await agendamentoService.registrarResposta(agendamento.idAgendamento, 'VOU_COMPARECER', {
        autorizacao: sessao.autorizacao, signal: requisicao.signal,
      })
      if (requisicao.signal.aborted) return
      if (atualizado?.idAgendamento !== agendamento.idAgendamento
        || atualizado.statusAgendamento !== 'AGENDADO' || atualizado.statusRespostaPaciente !== 'VOU_COMPARECER') {
        throw new Error('A API não confirmou a presença.')
      }
      aoConfirmar(atualizado)
      setRetorno({ texto: 'Sua presença foi confirmada.', erro: false })
    } catch (falha) {
      if (requisicao.signal.aborted) return
      if (falha instanceof ApiError && falha.status === 401) {
        definirSessao(null)
        return
      }
      setRetorno({ texto: 'Não foi possível confirmar. Confira os detalhes da consulta antes de tentar novamente.', erro: true })
    } finally {
      controle.current = null
      if (!requisicao.signal.aborted) setEnviando(false)
    }
  }

  return (
    <div className="space-y-2.5">
      {retorno && (
        <p role={retorno.erro ? 'alert' : 'status'} className={`text-body-small font-semibold ${retorno.erro ? 'text-critico' : 'text-turquesa-escuro'}`}>
          {retorno.texto}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {podeConfirmar && (
          <Botoes texto="Confirmar presença" icone={FiCheck} variante={pedido ? 'contornoTurquesa' : 'primario'}
            carregando={enviando} onClick={confirmarPresenca} />
        )}
        {(futura || pedido) && (
          <Botoes texto={pedido ? 'Acompanhar pedido de ajuda' : 'Preciso de ajuda'} icone={FiMessageSquare}
            variante={pedido ? 'primario' : 'contornoTurquesa'} desabilitado={enviando}
            para={pedido
              ? `/paciente/solicitacoes/${pedido.idSolicitacao}`
              : `/paciente/ajuda?consulta=${agendamento.idAgendamento}`} />
        )}
        {detalhes && <Botoes texto="Ver detalhes" variante="discreto" para={detalhes} icone={FiChevronRight} posicaoIcone="direita" desabilitado={enviando} />}
      </div>
    </div>
  )
}
