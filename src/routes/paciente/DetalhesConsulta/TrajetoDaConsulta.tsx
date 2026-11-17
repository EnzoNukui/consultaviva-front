import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { FiClock, FiCrosshair, FiMapPin, FiNavigation } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Botoes from '../../../components/Botoes/Botoes'
import { buscarTrajetoDeOnibus, diaDoTrajeto, estaNaRegiaoDeSaoPaulo, horarioDoTrajeto, instanteDaConsulta, localizarEndereco } from '../../../services/transitousService'
import type { Coordenadas, Itinerario, PontoTrajeto } from '../../../services/transitousService'

const campo = 'mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border border-azul-profundo/25 bg-superficie px-3 py-2 text-body-small focus-visible:outline-2 focus-visible:outline-turquesa-escuro'
type OpcoesEndereco = { itens: PontoTrajeto[]; escolhido: string }

function selecionarPonto(opcoes: OpcoesEndereco | null) {
  return opcoes?.escolhido ? opcoes.itens[Number(opcoes.escolhido)] : undefined
}

function SeletorEndereco({ rotulo, opcoes, escolher }: { rotulo: string; opcoes: OpcoesEndereco; escolher: (indice: string) => void }) {
  return (
    <label className="block min-w-0 text-body-small font-bold">{rotulo}
      <select required className={campo} value={opcoes.escolhido} onChange={(evento) => escolher(evento.target.value)}>
        <option value="">Selecione o endereço correto</option>
        {opcoes.itens.map((item, indice) => <option key={item.nome} value={indice}>{item.nome}</option>)}
      </select>
    </label>
  )
}

export default function TrajetoDaConsulta({ inicioConsulta, endereco, nomeUnidade }: {
  inicioConsulta: number
  endereco?: string
  nomeUnidade?: string
}) {
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState(endereco || nomeUnidade || '')
  const [antecedencia, setAntecedencia] = useState('15')
  const [modo, setModo] = useState<'localizacao' | 'endereco'>('localizacao')
  const [localizacao, setLocalizacao] = useState<Coordenadas | null>(null)
  const [opcoesOrigem, setOpcoesOrigem] = useState<OpcoesEndereco | null>(null)
  const [opcoesDestino, setOpcoesDestino] = useState<OpcoesEndereco | null>(null)
  const [rota, setRota] = useState<Itinerario | null>(null)
  const [erro, setErro] = useState('')
  const [ocupacao, setOcupacao] = useState<'localizando' | 'calculando' | null>(null)
  const requisicao = useRef<AbortController | null>(null)
  useEffect(() => () => requisicao.current?.abort(), [])

  function usarLocalizacao() {
    if (requisicao.current) return
    setErro('')
    setRota(null)
    setLocalizacao(null)
    if (!window.isSecureContext || !navigator.geolocation) {
      setErro('Seu navegador não pode acessar a localização aqui. Digite o endereço de partida.')
      return
    }
    const controle = new AbortController()
    requisicao.current = controle
    setOcupacao('localizando')
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (controle.signal.aborted) return
      requisicao.current = null
      setOcupacao(null)
      const ponto = { lat: coords.latitude, lon: coords.longitude }
      if (!estaNaRegiaoDeSaoPaulo(ponto)) {
        setErro('A localização está fora da região atendida por este planejador. Você pode digitar um ponto de partida em São Paulo.')
        return
      }
      setLocalizacao(ponto)
    }, ({ code }) => {
      if (controle.signal.aborted) return
      requisicao.current = null
      setOcupacao(null)
      setErro(code === 1 ? 'O acesso à localização foi negado. Digite o endereço de partida ou revise a permissão do navegador.'
        : 'Não foi possível localizar você agora. Tente novamente ou digite o endereço de partida.')
    }, { timeout: 10_000, maximumAge: 60_000 })
  }

  async function calcular(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (requisicao.current) return
    const margem = Number(antecedencia)
    if (!antecedencia || !Number.isInteger(margem) || margem < 0 || margem > 999) return
    const chegarAte = instanteDaConsulta(inicioConsulta) - margem * 60_000
    if (chegarAte <= Date.now()) {
      setErro('O horário desejado de chegada já passou. Revise a antecedência.')
      return
    }
    if (!destino.trim() || (modo === 'localizacao' ? !localizacao : !origem.trim())) {
      setErro('Informe o ponto de partida e o endereço da unidade.')
      return
    }

    const controle = new AbortController()
    requisicao.current = controle
    setErro('')
    setRota(null)
    setOcupacao('calculando')
    try {
      const partida = modo === 'localizacao' ? localizacao : selecionarPonto(opcoesOrigem)
      const chegada = selecionarPonto(opcoesDestino)
      const [locaisDePartida, locaisDeChegada] = await Promise.all([
        partida ? null : localizarEndereco(origem, controle.signal),
        chegada ? null : localizarEndereco(destino, controle.signal),
      ])
      controle.signal.throwIfAborted()
      if (locaisDePartida?.length) setOpcoesOrigem({ itens: locaisDePartida, escolhido: '' })
      if (locaisDeChegada?.length) setOpcoesDestino({ itens: locaisDeChegada, escolhido: '' })
      if (locaisDePartida?.length === 0 || locaisDeChegada?.length === 0) {
        setErro(locaisDeChegada?.length === 0 ? 'Não encontramos o endereço da unidade. Confira a rua, o número e o município.'
          : 'Não encontramos o endereço de partida. Confira a rua, o número e o município.')
        return
      }
      if (!partida || !chegada) return
      const resultado = await buscarTrajetoDeOnibus(partida, chegada, chegarAte, controle.signal)
      controle.signal.throwIfAborted()
      if (resultado) setRota(resultado)
      else setErro('Nenhuma rota de ônibus disponível para chegar com essa antecedência. Confira os endereços ou ajuste o horário de chegada.')
    } catch {
      if (!controle.signal.aborted) setErro('O planejador está indisponível agora. Tente de novo ou use o cálculo manual.')
    } finally {
      if (requisicao.current === controle) requisicao.current = null
      if (!controle.signal.aborted) setOcupacao(null)
    }
  }

  function trocarModo() {
    if (ocupacao === 'localizando') {
      requisicao.current?.abort()
      requisicao.current = null
      setOcupacao(null)
    }
    setModo((atual) => atual === 'localizacao' ? 'endereco' : 'localizacao')
    setErro('')
    setRota(null)
  }

  return (
    <section aria-labelledby="trajeto-consulta" className="space-y-4">
      <header>
        <h2 id="trajeto-consulta" className="text-h3">Trajeto de ônibus</h2>
        <p className="mt-1 text-body-small text-azul-profundo/80">Veja quando sair e qual ônibus pegar para chegar à consulta.</p>
      </header>
      <form aria-label="Calcular trajeto de ônibus" onSubmit={calcular}
        className="space-y-4 rounded-xl border border-azul-profundo/15 bg-superficie p-4 sm:p-5">
        <fieldset disabled={ocupacao === 'calculando'} className="min-w-0 space-y-4">
          <div className="space-y-2">
            <p className="text-body-small font-bold">Ponto de partida</p>
            <div className="flex flex-wrap items-center gap-2">
              {modo === 'localizacao' && (
                <Botoes texto={localizacao ? 'Atualizar localização' : 'Usar minha localização'} icone={FiCrosshair} variante="contornoTurquesa"
                  carregando={ocupacao === 'localizando'} onClick={usarLocalizacao} />
              )}
              <Botoes texto={modo === 'localizacao' ? 'Digitar endereço de saída' : 'Voltar para localização'}
                variante="secundario" onClick={trocarModo} />
            </div>
            {modo === 'localizacao' && localizacao && <p role="status" className="text-body-small font-semibold text-turquesa-escuro">Localização pronta para calcular a rota.</p>}
            {modo === 'endereco' && (
              <label className="block min-w-0 text-body-small font-bold">Endereço de partida
                <input value={origem} required maxLength={250} className={campo} placeholder="Rua, número e município" onChange={(evento) => {
                  setOrigem(evento.target.value)
                  setOpcoesOrigem(null)
                  setRota(null)
                  setErro('')
                }} />
              </label>
            )}
            {modo === 'endereco' && opcoesOrigem && (
              <SeletorEndereco rotulo="Confirme o ponto de partida" opcoes={opcoesOrigem} escolher={(escolhido) => {
                setOpcoesOrigem({ ...opcoesOrigem, escolhido })
                setRota(null)
              }} />
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <label className="block min-w-0 text-body-small font-bold">Endereço da UBS
              <input value={destino} required maxLength={250} className={campo} placeholder="Rua, número e município" onChange={(evento) => {
                setDestino(evento.target.value)
                setOpcoesDestino(null)
                setRota(null)
                setErro('')
              }} />
            </label>
            <label className="block min-w-0 text-body-small font-bold">Antecedência para chegar (min)
              <input type="number" min={0} max={999} required value={antecedencia} className={campo} onChange={(evento) => {
                setAntecedencia(evento.target.value)
                setRota(null)
                setErro('')
              }} />
            </label>
          </div>
          {opcoesDestino && <SeletorEndereco rotulo="Confirme o endereço da UBS" opcoes={opcoesDestino} escolher={(escolhido) => {
            setOpcoesDestino({ ...opcoesDestino, escolhido })
            setRota(null)
          }} />}
        </fieldset>
        {erro && <p role="alert" className="rounded-lg bg-critico/10 px-3 py-2 text-body-small text-critico">{erro}</p>}
        <div className="flex flex-wrap items-center gap-3">
          <Botoes texto="Calcular trajeto" tipo="submit" icone={FiNavigation} carregando={ocupacao === 'calculando'}
            desabilitado={ocupacao === 'localizando' || (modo === 'localizacao' && !localizacao)} />
          <p className="max-w-sm text-caption text-azul-profundo/75">Ao calcular, enviamos a origem, o destino e o horário de chegada ao Transitous.</p>
        </div>
        <p className="flex flex-wrap gap-x-3 text-caption text-azul-profundo/75">
          <a className="underline underline-offset-2" href="https://transitous.org/sources/" target="_blank" rel="noreferrer">Fontes dos dados do Transitous</a>
          <a className="underline underline-offset-2" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
          <Link className="underline underline-offset-2" to="/contato">Contato da ConsultaViva</Link>
        </p>
      </form>

      {rota && (
        <article aria-labelledby="resultado-trajeto" className="overflow-hidden rounded-xl border border-azul-profundo/15 bg-superficie">
          <div className="bg-menta p-4 sm:p-5">
            <h3 id="resultado-trajeto" className="flex items-center gap-2 text-h4 text-turquesa-escuro">
              <FiClock aria-hidden="true" className="size-5 shrink-0" />
              Saia às <time dateTime={rota.startTime}>{horarioDoTrajeto(rota.startTime)}</time>
            </h3>
            <p role="status" className="mt-2 text-body-small">
              {diaDoTrajeto(rota.startTime)} · Chegada às {horarioDoTrajeto(rota.endTime)} · {Math.ceil(rota.duration / 60)} min no total
            </p>
            <p className="mt-1 text-caption text-azul-profundo/75">{rota.legs.filter((etapa) => etapa.mode === 'BUS').every((etapa) => etapa.realTime)
              ? 'Previsões disponíveis em tempo real' : 'Estimativa com horários programados'}</p>
          </div>
          <ol aria-label="Etapas do trajeto" className="divide-y divide-azul-profundo/10 px-4 py-1 sm:px-5">
            {rota.legs.map((etapa, indice) => (
              <li key={`${etapa.mode}-${etapa.startTime}-${indice}`} className="flex items-start gap-3 py-3 text-body-small">
                <FiMapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-turquesa-escuro" />
                <div className="min-w-0 wrap-break-word">
                  <p className="font-bold">{horarioDoTrajeto(etapa.startTime)} · {etapa.mode === 'BUS'
                    ? `Ônibus ${etapa.displayName || etapa.routeShortName || ''}` : `Caminhe por ${Math.ceil(etapa.duration / 60)} min`}</p>
                  {etapa.mode === 'BUS' ? (
                    <>
                      {etapa.headsign && <p>Sentido {etapa.headsign}</p>}
                      <p>Embarque em {etapa.from.name} · Desça em {etapa.to.name}</p>
                    </>
                  ) : <p>Até {etapa.to.name === 'END' ? 'a unidade' : etapa.to.name}</p>}
                </div>
              </li>
            ))}
          </ol>
        </article>
      )}
    </section>
  )
}
