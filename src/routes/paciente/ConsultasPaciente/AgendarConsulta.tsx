import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { FiArrowLeft, FiCalendar, FiChevronRight, FiClock, FiMapPin, FiSearch } from 'react-icons/fi'
import Botoes from '../../../components/Botoes/Botoes'
import CalendarioAgenda from '../../../components/CalendarioAgenda/CalendarioAgenda'
import EmptyState from '../../../components/EmptyState/EmptyState'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useSessao } from '../../../components/SessaoProvider/sessao'
import { agendamentoService } from '../../../services/agendamentoService'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { ApiError } from '../../../services/apiClient'
import { demasService } from '../../../services/demasService'
import { horarioService } from '../../../services/horarioService'
import { unidadeService } from '../../../services/unidadeService'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import type { EstabelecimentoDemas } from '../../../types/demas'
import { useBuscaPaciente } from '../useBuscaPaciente'

const formatoDia = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', dateStyle: 'long' })
const formatoDiaCurto = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'long' })
const formatoHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', timeStyle: 'short' })
const PAGINA_UNIDADES = 6
const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro'

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR').trim()
}

async function carregarOpcoes(opcoes: OpcoesAutenticadas) {
  const unidades = await unidadeService.listar(opcoes)
  const horarios = unidades.length > 0 ? await horarioService.listarDisponiveis(opcoes) : []
  return { unidades, horarios }
}

interface AgendarConsultaProps {
  aoAgendar: (idAgendamento: number) => void
  aoCancelar: () => void
}

export default function AgendarConsulta({ aoAgendar, aoCancelar }: AgendarConsultaProps) {
  const { sessao, definirSessao } = useSessao()
  const autorizacao = sessao?.autorizacao
  const { resultado, tentarNovamente } = useBuscaPaciente(carregarOpcoes)
  const [busca, setBusca] = useState('')
  const [limite, setLimite] = useState(PAGINA_UNIDADES)
  const [idUnidade, setIdUnidade] = useState<number | null>(null)
  const [data, setData] = useState('')
  const [idHorario, setIdHorario] = useState<number | null>(null)
  const [agendando, setAgendando] = useState(false)
  const [erroAgendamento, setErroAgendamento] = useState('')
  const [catalogo, setCatalogo] = useState<{ codigo: string; estabelecimento: EstabelecimentoDemas | null } | null>(null)
  const requisicao = useRef<AbortController | null>(null)
  const titulo = useRef<HTMLHeadingElement>(null)
  const tituloHorarios = useRef<HTMLHeadingElement>(null)

  const dados = resultado?.status === 'sucesso' ? resultado.dados : null
  const agora = agoraNaAgenda()
  const horarios = dados?.horarios.map((horario) => ({ ...horario, inicio: timestampDaAgenda(horario.dataInicio) }))
    .filter(({ inicio }) => inicio > agora)
    .sort((a, b) => a.inicio - b.inicio) ?? []
  const primeiraVagaPorUnidade = new Map<number, number>()
  for (const { idUnidade: id, inicio } of horarios) {
    if (!primeiraVagaPorUnidade.has(id)) primeiraVagaPorUnidade.set(id, inicio)
  }
  const termo = normalizar(busca)
  const locais = (dados?.unidades ?? []).filter(({ nomeUnidade, endereco, codigoCnes }) =>
    normalizar(`${nomeUnidade} ${endereco} ${codigoCnes ?? ''}`).includes(termo),
  ).sort((a, b) => Number(primeiraVagaPorUnidade.has(b.idUnidade)) - Number(primeiraVagaPorUnidade.has(a.idUnidade))
    || a.nomeUnidade.localeCompare(b.nomeUnidade, 'pt-BR'))
  const unidade = dados?.unidades.find(({ idUnidade: id }) => id === idUnidade)
  const horariosDaUnidade = horarios.filter(({ idUnidade: id }) => id === unidade?.idUnidade)
  const datas = [...new Set(horariosDaUnidade.map(({ dataInicio }) => dataInicio.slice(0, 10)))]
  const horariosPorHora = new Map<string, (typeof horariosDaUnidade)[number]>()
  for (const vaga of horariosDaUnidade) {
    if (vaga.dataInicio.slice(0, 10) !== data) continue
    const hora = vaga.dataInicio.slice(11, 16)
    if (!horariosPorHora.has(hora)) horariosPorHora.set(hora, vaga)
  }
  const horariosDoDia = [...horariosPorHora.values()]
  const horario = horariosDoDia.find(({ idHorario: id }) => id === idHorario)
  const codigo = unidade?.codigoCnes
  const dadosCatalogo = catalogo?.codigo === codigo ? catalogo : null
  const estabelecimento = dadosCatalogo?.estabelecimento
  const enderecoDemas = estabelecimento && [
    [estabelecimento.endereco_estabelecimento, estabelecimento.numero_estabelecimento].filter(Boolean).join(', '),
    estabelecimento.bairro_estabelecimento,
  ].filter(Boolean).join(' · ')

  function escolherUnidade(id: number | null) {
    setIdUnidade(id)
    escolherData('')
  }

  function escolherData(dia: string) {
    setData(dia)
    setIdHorario(null)
    setErroAgendamento('')
  }

  function escolherDiaNoCalendario(dia: string) {
    escolherData(dia)
    const tituloDia = tituloHorarios.current
    if (dia && tituloDia && tituloDia.getBoundingClientRect().top > window.innerHeight - 100) {
      tituloDia.focus()
    }
  }

  useEffect(() => {
    titulo.current?.focus()
    return () => requisicao.current?.abort()
  }, [])

  useEffect(() => {
    if (resultado?.status === 'sucesso') titulo.current?.focus()
  }, [idUnidade, resultado?.status])

  useEffect(() => {
    if (!codigo) return

    const controle = new AbortController()
    demasService.buscarPorCnes(codigo, controle.signal).then((registro) => {
      if (controle.signal.aborted) return
      const mesmoCnes = String(registro?.codigo_cnes).padStart(7, '0') === codigo
      setCatalogo({ codigo, estabelecimento: mesmoCnes ? registro : null })
    }).catch(() => {
      if (!controle.signal.aborted) setCatalogo({ codigo, estabelecimento: null })
    })
    return () => controle.abort()
  }, [codigo])

  async function agendar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!unidade || !horario || !autorizacao || requisicao.current) return

    const controle = new AbortController()
    requisicao.current = controle
    setErroAgendamento('')
    setAgendando(true)

    try {
      const agendamento = await agendamentoService.agendarPeloPaciente({ idUnidade: unidade.idUnidade, idHorario: horario.idHorario }, {
        autorizacao, signal: controle.signal,
      })
      if (!agendamento?.idAgendamento) throw new Error('A API não confirmou o agendamento.')
      if (!controle.signal.aborted) aoAgendar(agendamento.idAgendamento)
    } catch (erro) {
      if (controle.signal.aborted) return
      if (erro instanceof ApiError && erro.status === 401) {
        definirSessao(null)
        return
      }
      if (erro instanceof ApiError && erro.status === 409) {
        setIdHorario(null)
        setErroAgendamento(`${erro.message} Escolha outro horário.`)
        tentarNovamente()
      } else if (erro instanceof ApiError && (erro.status === 404 || erro.status === 405)) {
        setErroAgendamento('O agendamento pelo paciente ainda não está disponível nesta versão da API.')
      } else {
        setErroAgendamento('Não foi possível confirmar o agendamento. Confira suas consultas antes de tentar novamente.')
      }
    } finally {
      requisicao.current = null
      if (!controle.signal.aborted) setAgendando(false)
    }
  }

  return (
    <div className="pb-4">
      <button
        type="button"
        onClick={aoCancelar}
        disabled={agendando}
        className={['mb-2 inline-flex min-h-11 items-center gap-2 rounded-sm text-body-small font-bold text-turquesa-escuro hover:underline disabled:opacity-50', foco].join(' ')}
      >
        <FiArrowLeft aria-hidden="true" className="size-4" /> Minhas consultas
      </button>
      <h1 className="text-h1">Agendar consulta</h1>
      <p className="mt-2 text-body-small text-azul-profundo/80">Escolha uma unidade, selecione um dia e horário, e confirme sua consulta presencial.</p>

      <div className="mt-6">
        {erroAgendamento && (
          <p role="alert" className="mb-4 rounded-md bg-critico/10 px-4 py-3 text-body-small font-semibold text-critico">{erroAgendamento}</p>
        )}

        {resultado === null ? (
          <LoadingState mensagem="Carregando unidades e horários…" />
        ) : resultado.status === 'erro' ? (
          <ErrorState mensagem="Não foi possível buscar os locais e horários da agenda." tentarNovamente={tentarNovamente} />
        ) : resultado.dados.unidades.length === 0 ? (
          <EmptyState titulo="Nenhuma unidade cadastrada" mensagem="As unidades cadastradas na agenda do ConsultaViva aparecerão aqui." />
        ) : unidade ? (
          <form onSubmit={agendar} aria-labelledby="titulo-data-agenda">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-x-5 gap-y-2 rounded-lg border border-azul-profundo/15 bg-superficie px-4 py-3">
              <div className="flex min-w-0 items-start gap-3" aria-live="polite">
                <FiMapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-turquesa-escuro" />
                <div className="min-w-0 wrap-break-word">
                  <p className="font-bold">{estabelecimento?.nome_fantasia || estabelecimento?.nome_razao_social || unidade.nomeUnidade}</p>
                  <p className="text-body-small text-azul-profundo/80">{enderecoDemas || unidade.endereco}</p>
                  <p className="mt-1 text-caption text-azul-profundo/75">
                    {estabelecimento ? ['DEMAS · CNES', codigo].join(' ') : 'Cadastro do ConsultaViva'}
                  </p>
                  {codigo && !estabelecimento && (
                    <p className="text-caption text-azul-profundo/75">
                      {dadosCatalogo ? 'Não foi possível consultar o catálogo público.' : 'Consultando o catálogo da DEMAS…'}
                    </p>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => escolherUnidade(null)} disabled={agendando}
                className={['min-h-11 rounded-sm text-body-small font-bold text-turquesa-escuro underline underline-offset-4 disabled:opacity-50', foco].join(' ')}>
                Alterar unidade
              </button>
            </div>

            <h2 ref={titulo} tabIndex={-1} id="titulo-data-agenda" className="mb-3 text-h3 focus:outline-none">2. Escolha o dia e o horário</h2>
            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <CalendarioAgenda key={unidade.idUnidade} datasDisponiveis={datas} selecionada={data} aoSelecionar={escolherDiaNoCalendario} bloqueado={agendando} />
              <section aria-labelledby="titulo-horarios-agenda" className="min-w-0 rounded-lg border border-azul-profundo/15 bg-superficie p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <FiClock aria-hidden="true" className="size-5 shrink-0 text-turquesa-escuro" />
                  <h3 id="titulo-horarios-agenda" ref={tituloHorarios} tabIndex={-1} className="text-h4 focus:outline-none">Horários</h3>
                </div>
                {datas.length === 0 ? (
                  <div className="mt-2 space-y-3">
                    <p className="text-body-small text-azul-profundo/80">Esta unidade está sem horários disponíveis.</p>
                    <Botoes texto="Ver outras unidades" variante="contornoTurquesa" onClick={() => escolherUnidade(null)} />
                  </div>
                ) : !data ? (
                  <p className="mt-2 text-body-small text-azul-profundo/80">Selecione um dia disponível no calendário.</p>
                ) : (
                  <div className="mt-3">
                    <p className="mb-2 text-body-small font-semibold" aria-live="polite">{formatoDia.format(Date.parse(data))}</p>
                    {horariosDoDia.length > 0 ? (
                      <div className="grid grid-cols-[repeat(auto-fit,minmax(4.75rem,1fr))] gap-2" role="group" aria-label="Horários disponíveis">
                        {horariosDoDia.map(({ idHorario: id, inicio }) => (
                          <button
                            key={id}
                            type="button"
                            aria-pressed={idHorario === id}
                            disabled={agendando}
                            onClick={() => {
                              setIdHorario(id)
                              setErroAgendamento('')
                            }}
                            className={['min-h-11 rounded-md border border-azul-profundo/20 px-2 text-body-small font-bold hover:bg-menta disabled:opacity-65 aria-pressed:border-turquesa-escuro aria-pressed:bg-menta aria-pressed:text-turquesa-escuro', foco].join(' ')}
                          >
                            {formatoHora.format(inicio)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-body-small text-azul-profundo/80">Este dia ficou sem vagas. Escolha outra data.</p>
                    )}
                  </div>
                )}
                {horario && (
                  <div className="mt-4 border-t border-azul-profundo/10 pt-4">
                    <h3 className="font-bold">3. Confirme o agendamento</h3>
                    <p className="mt-1 mb-3 text-body-small text-azul-profundo/80">
                      {formatoDia.format(horario.inicio)} às {formatoHora.format(horario.inicio)}, em {unidade.nomeUnidade}.
                    </p>
                    <Botoes tipo="submit" texto={agendando ? 'Agendando…' : 'Confirmar agendamento'} icone={FiCalendar} carregando={agendando} />
                  </div>
                )}
              </section>
            </div>
          </form>
        ) : (
          <section aria-labelledby="titulo-local-agenda">
            <h2 ref={titulo} tabIndex={-1} id="titulo-local-agenda" className="text-h3 focus:outline-none">1. Escolha a unidade</h2>
            {primeiraVagaPorUnidade.size === 0 && (
              <p role="status" className="mt-3 rounded-md bg-areia px-3 py-2 text-body-small">
                Nenhuma unidade tem horários disponíveis agora.
              </p>
            )}
            <div className="mt-3">
              <label htmlFor="busca-unidade" className="sr-only">Buscar unidade</label>
              <div className="relative sm:max-w-md">
                <FiSearch aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-turquesa-escuro" />
                <input
                  id="busca-unidade"
                  type="search"
                  placeholder="Busque por nome, endereço ou CNES"
                  value={busca}
                  onChange={(evento) => {
                    setBusca(evento.target.value)
                    setLimite(PAGINA_UNIDADES)
                  }}
                  className={['min-h-12 w-full rounded-lg border border-azul-profundo/25 bg-superficie py-2 pr-3 pl-11 text-body-small', foco].join(' ')}
                />
              </div>
            </div>

            <p className="mt-4 mb-2 text-body-small text-azul-profundo/75" role="status">
              {locais.length === 1 ? '1 unidade encontrada' : [locais.length, 'unidades encontradas'].join(' ')}
            </p>
            {locais.length === 0 ? (
              <EmptyState titulo="Unidade não encontrada" mensagem="Tente buscar pelo nome, por uma parte do endereço ou pelo CNES." />
            ) : (
              <ul className="grid min-w-0 gap-3 lg:grid-cols-2">
                {locais.slice(0, limite).map(({ idUnidade: id, nomeUnidade, endereco, codigoCnes }) => {
                  const primeiraVaga = primeiraVagaPorUnidade.get(id)
                  return (
                    <li key={id} className="min-w-0">
                      <button
                        type="button"
                        onClick={() => escolherUnidade(id)}
                        className={['flex h-full w-full gap-3 rounded-lg border border-azul-profundo/15 bg-superficie p-4 text-left transition-colors hover:border-turquesa-escuro/55 hover:bg-menta/40', foco].join(' ')}
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-menta text-turquesa-escuro">
                          <FiMapPin aria-hidden="true" className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1 wrap-break-word">
                          <strong className="block">{nomeUnidade}</strong>
                          <span className="block text-body-small text-azul-profundo/80">{endereco}</span>
                          <span className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-caption">
                            <span className={primeiraVaga !== undefined ? 'font-bold text-turquesa-escuro' : 'text-azul-profundo/75'}>
                              {primeiraVaga !== undefined ? `Próxima vaga em ${formatoDiaCurto.format(primeiraVaga)}` : 'Sem horários disponíveis'}
                            </span>
                            {codigoCnes && <span className="text-azul-profundo/75">CNES {codigoCnes}</span>}
                          </span>
                        </span>
                        <FiChevronRight aria-hidden="true" className="mt-2 size-4 shrink-0 text-turquesa-escuro" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            {locais.length > limite && (
              <div className="mt-4">
                <Botoes texto="Mostrar mais unidades" variante="secundario" onClick={() => setLimite((atual) => atual + PAGINA_UNIDADES)} />
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
