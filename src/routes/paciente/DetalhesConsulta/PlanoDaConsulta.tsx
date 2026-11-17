import { useCallback, useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { FiArrowRight, FiClock, FiMap, FiMapPin } from 'react-icons/fi'
import Botoes from '../../../components/Botoes/Botoes'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useSessao } from '../../../components/SessaoProvider/sessao'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { atendimentoService } from '../../../services/atendimentoService'
import type { AtualizarPlanoRequest, PlanoComparecimento } from '../../../types/atendimento'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import { useBuscaPaciente } from '../useBuscaPaciente'

const formatoHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})
const formatoDia = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})
const transportePadrao = 'Ônibus'
const campo = 'mt-1 block min-h-11 w-full rounded-lg border border-azul-profundo/25 bg-superficie px-3 py-2 text-body-small text-azul-profundo focus-visible:outline-2 focus-visible:outline-turquesa-escuro'

interface PlanoDaConsultaProps {
  idAgendamento: number
  inicioConsulta: number
  endereco?: string
}

export default function PlanoDaConsulta({ idAgendamento, inicioConsulta, endereco }: PlanoDaConsultaProps) {
  const { sessao, definirSessao } = useSessao()
  const [planoSalvo, setPlanoSalvo] = useState<PlanoComparecimento | null>(null)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [duracao, setDuracao] = useState('')
  const [antecedencia, setAntecedencia] = useState('15')
  const [mensagem, setMensagem] = useState<{ texto: string; erro: boolean } | null>(null)
  const requisicao = useRef<AbortController | null>(null)
  const conferirAposFalha = useRef(false)
  const carregar = useCallback(async (opcoes: OpcoesAutenticadas) => {
    const planos = await atendimentoService.listarPlanos(idAgendamento, opcoes)
    return planos.filter(({ idProposta }) => idProposta === null).sort((a, b) =>
      timestampDaAgenda(b.dataCalculo) - timestampDaAgenda(a.dataCalculo) || b.idPlano - a.idPlano,
    )[0] ?? null
  }, [idAgendamento])
  const { resultado, tentarNovamente } = useBuscaPaciente(carregar)
  const plano = planoSalvo ?? (resultado?.status === 'sucesso' ? resultado.dados : null)
  const saida = plano && timestampDaAgenda(plano.dataSaidaSugerida)
  const planoAtual = !!plano && Number.isFinite(saida) && timestampDaAgenda(plano.dataAtendimentoReferencia) === inicioConsulta
    && (!endereco || endereco === plano.destinoTrajeto)
  const deOnibus = plano?.meioTransporte.localeCompare(transportePadrao, 'pt-BR', { sensitivity: 'base' }) === 0
  const minutos = Number(duracao)
  const margem = Number(antecedencia)
  const previaSaida = antecedencia !== '' && Number.isInteger(minutos) && minutos >= 1 && minutos <= 9999
    && Number.isInteger(margem) && margem >= 0 && margem <= 999
    ? inicioConsulta - (minutos + margem) * 60_000 : null

  useEffect(() => () => requisicao.current?.abort(), [])

  function abrirPlano() {
    setDuracao(planoAtual && plano ? String(plano.duracaoMinutos) : '')
    setAntecedencia(String(plano?.margemMinutos ?? 15))
    setMensagem(null)
    setEditando(true)
  }

  async function salvarPlano(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!sessao || requisicao.current) return
    if (inicioConsulta <= agoraNaAgenda()) {
      setMensagem({ texto: 'O horário da consulta já começou.', erro: true })
      return
    }

    const formulario = new FormData(evento.currentTarget)
    const dados: AtualizarPlanoRequest = {
      origemTrajeto: String(formulario.get('origem') ?? '').trim(),
      destinoTrajeto: endereco || String(formulario.get('destino') ?? '').trim(),
      meioTransporte: String(formulario.get('transporte') ?? '').trim(),
      duracaoMinutos: Number(formulario.get('duracao')),
      margemMinutos: Number(formulario.get('margem')),
    }
    if (!dados.origemTrajeto || !dados.destinoTrajeto || !dados.meioTransporte
      || !Number.isInteger(dados.duracaoMinutos) || dados.duracaoMinutos < 1 || dados.duracaoMinutos > 9999
      || !Number.isInteger(dados.margemMinutos) || dados.margemMinutos < 0 || dados.margemMinutos > 999) {
      setMensagem({ texto: 'Confira o trajeto, o tempo de viagem e a antecedência.', erro: true })
      return
    }

    const controle = new AbortController()
    const opcoes = { autorizacao: sessao.autorizacao, signal: controle.signal }
    requisicao.current = controle
    setSalvando(true)
    setMensagem(null)
    try {
      const planoExistente = plano ?? (conferirAposFalha.current ? await carregar(opcoes) : null)
      const confirmado = planoExistente
        ? await atendimentoService.atualizarPlano(planoExistente.idPlano, dados, opcoes)
        : await atendimentoService.inserirPlano({ ...dados, idAgendamento }, opcoes)
      if (controle.signal.aborted) return
      if (!confirmado?.idPlano || confirmado.idAgendamento !== idAgendamento
        || !Number.isFinite(timestampDaAgenda(confirmado.dataSaidaSugerida))) {
        throw new Error('A API não confirmou o plano.')
      }
      conferirAposFalha.current = false
      setPlanoSalvo(confirmado)
      setEditando(false)
      setMensagem({ texto: 'Plano salvo.', erro: false })
    } catch (falha) {
      if (controle.signal.aborted) return
      if (falha instanceof ApiError && falha.status === 401) {
        definirSessao(null)
        return
      }
      conferirAposFalha.current = !plano
      setMensagem({ texto: 'Não foi possível salvar seu plano agora. Confira os dados e tente novamente.', erro: true })
    } finally {
      requisicao.current = null
      if (!controle.signal.aborted) setSalvando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-plano" className="min-w-0 pb-4">
      <h3 id="titulo-plano" className="sr-only">Plano de comparecimento</h3>
      {mensagem && <p role={mensagem.erro ? 'alert' : 'status'} className={`mt-3 text-body-small font-semibold ${mensagem.erro ? 'text-critico' : 'text-turquesa-escuro'}`}>{mensagem.texto}</p>}
      {resultado === null && <div className="mt-3"><LoadingState mensagem="Buscando seu plano…" /></div>}
      {resultado?.status === 'erro' && (
        <div className="mt-3"><ErrorState mensagem="Não foi possível carregar seu plano de comparecimento." tentarNovamente={tentarNovamente} /></div>
      )}
      {resultado?.status === 'sucesso' && (
        <div className="mt-4 overflow-hidden rounded-xl border border-azul-profundo/15 bg-superficie">
          {planoAtual && plano && typeof saida === 'number' ? (
            <>
              <dl className="grid divide-y divide-azul-profundo/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="min-w-0 bg-menta p-4 sm:p-5">
                  <dt className="flex items-center gap-2 text-body-small font-semibold">
                    <FiClock aria-hidden="true" className="size-4 shrink-0 text-turquesa-escuro" /> Hora sugerida para sair
                  </dt>
                  <dd className="mt-1 text-h3 font-bold text-turquesa-escuro">
                    <time dateTime={plano.dataSaidaSugerida}>{formatoHora.format(saida)}</time>
                  </dd>
                  <dd className="mt-1 text-body-small text-azul-profundo/80">{formatoDia.format(saida)}</dd>
                </div>
                <div className="min-w-0 p-4 sm:p-5">
                  <dt className="flex items-center gap-2 text-body-small font-semibold">
                    <FiMap aria-hidden="true" className="size-4 shrink-0 text-turquesa-escuro" />
                    {deOnibus ? 'Tempo estimado de ônibus' : 'Tempo estimado de trajeto'}
                  </dt>
                  <dd className="mt-1 text-h3 font-bold">{plano.duracaoMinutos} min</dd>
                  <dd className="mt-1 text-body-small text-azul-profundo/80 wrap-break-word">
                    {!deOnibus && `${plano.meioTransporte} · `}{plano.margemMinutos} min de antecedência
                  </dd>
                </div>
              </dl>
              {!editando && (
                <div className="border-t border-azul-profundo/10 px-4 py-3 sm:px-5">
                  <Botoes texto="Editar plano" variante="contornoTurquesa" onClick={abrirPlano} />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
              <p className="max-w-sm text-body-small text-azul-profundo/80">{plano
                ? 'A consulta mudou. Revise o trajeto para calcular uma nova hora de saída.'
                : 'Se já souber quanto tempo dura a viagem, use esse valor para calcular a hora de sair.'}</p>
              {!editando && <Botoes texto={plano ? 'Revisar plano' : 'Calcular hora de saída'} icone={FiArrowRight} posicaoIcone="direita" onClick={abrirPlano} />}
            </div>
          )}
          {editando && (
            <form onSubmit={salvarPlano} aria-label="Plano de comparecimento" className="space-y-4 border-t border-azul-profundo/10 p-4 sm:p-5">
              <fieldset disabled={salvando} className="grid min-w-0 gap-4 sm:grid-cols-2">
                <label className="min-w-0 text-body-small font-semibold">De onde você vai sair?
                  <input name="origem" required maxLength={250} placeholder="Ex.: de casa" defaultValue={plano?.origemTrajeto} className={campo} />
                </label>
                <label className="min-w-0 text-body-small font-semibold">Como você vai?
                  <input name="transporte" required maxLength={60} defaultValue={plano?.meioTransporte ?? transportePadrao} className={campo} />
                </label>
                {endereco ? (
                  <p className="flex items-start gap-2 text-body-small text-azul-profundo/80 wrap-break-word sm:col-span-2">
                    <FiMapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-turquesa-escuro" /> {endereco}
                  </p>
                ) : (
                  <label className="min-w-0 text-body-small font-semibold sm:col-span-2">Endereço do atendimento
                    <input name="destino" required maxLength={250} defaultValue={plano?.destinoTrajeto} className={campo} />
                  </label>
                )}
                <label className="min-w-0 text-body-small font-semibold">Tempo estimado de trajeto (min)
                  <input name="duracao" type="number" required min={1} max={9999} value={duracao}
                    onChange={(evento) => setDuracao(evento.target.value)} className={campo} />
                </label>
                <label className="min-w-0 text-body-small font-semibold">Antecedência para chegar (min)
                  <input name="margem" type="number" required min={0} max={999} value={antecedencia}
                    onChange={(evento) => setAntecedencia(evento.target.value)} className={campo} />
                </label>
              </fieldset>
              {previaSaida !== null && (
                <p className="rounded-lg bg-menta px-3 py-2 text-body-small text-turquesa-escuro">
                  Saída sugerida às <strong>{formatoHora.format(previaSaida)}</strong>, {formatoDia.format(previaSaida)}.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Botoes tipo="submit" texto="Salvar plano" carregando={salvando} />
                <Botoes texto="Voltar" variante="secundario" desabilitado={salvando} onClick={() => {
                  setEditando(false)
                  setMensagem(null)
                }} />
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  )
}
