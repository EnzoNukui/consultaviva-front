import { useState } from 'react'
import type { IconType } from 'react-icons'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiGitBranch,
  FiShield,
  FiUsers,
} from 'react-icons/fi'
import Botoes from '../../../components/Botoes/Botoes'
import { useTituloPagina } from '../../../hooks/useTituloPagina'

interface DesfechoJornada {
  titulo: string
  descricao: string
  icone: IconType
}

interface EtapaJornada {
  atalho: string
  titulo: string
  resumo: string
  paciente: string
  equipe: string
  regra: string
  icone: IconType
  desfechos?: DesfechoJornada[]
}

const etapas: EtapaJornada[] = [
  {
    atalho: 'Consulta marcada',
    titulo: 'A consulta está marcada.',
    resumo: 'O paciente confere as informações pelo portal.',
    paciente: 'Confere data, horário e local.',
    equipe: 'Mantém o horário na agenda da unidade.',
    regra: 'Os pacientes e horários desta demonstração são fictícios.',
    icone: FiCalendar,
  },
  {
    atalho: 'Pedir ajuda',
    titulo: 'Algo pode atrapalhar?',
    resumo: 'O paciente conta o que está acontecendo e quando poderia ser atendido.',
    paciente: 'Explica a dificuldade e informa sua disponibilidade.',
    equipe: 'Recebe o pedido ligado à consulta.',
    regra: 'Pedir ajuda não cancela a consulta.',
    icone: FiClipboard,
  },
  {
    atalho: 'Equipe avalia',
    titulo: 'A equipe confere as opções.',
    resumo: 'A equipe compara o pedido com as regras e os horários disponíveis.',
    paciente: 'Acompanha a análise pelo portal.',
    equipe: 'Verifica o que combina com o pedido. A modalidade virtual precisa de autorização profissional.',
    regra: 'Nenhum horário é inventado ou alterado automaticamente.',
    icone: FiUsers,
  },
  {
    atalho: 'Decisão',
    titulo: 'O paciente decide.',
    resumo: 'Se houver uma opção, o paciente pode aceitar ou recusar.',
    paciente: 'Confere a proposta e responde.',
    equipe: 'Confirma a mudança depois do aceite e das autorizações necessárias.',
    regra: 'A consulta original continua marcada até a mudança ser confirmada.',
    icone: FiShield,
    desfechos: [
      {
        titulo: 'Tem opção',
        descricao: 'A equipe confirma a mudança depois do aceite.',
        icone: FiCheckCircle,
      },
      {
        titulo: 'Não tem opção',
        descricao: 'A equipe dá um retorno e a consulta permanece marcada.',
        icone: FiAlertCircle,
      },
    ],
  },
]

export default function JornadaConsultaViva() {
  useTituloPagina('A jornada da ConsultaViva')
  const [etapaAtual, setEtapaAtual] = useState(0)
  const etapa = etapas[etapaAtual]
  const IconeEtapa = etapa.icone
  const progressoCaminho = (etapaAtual / (etapas.length - 1)) * 100

  function irParaEtapa(indice: number) {
    setEtapaAtual(Math.max(0, Math.min(indice, etapas.length - 1)))
  }

  return (
    <>
      <section className="relative isolate overflow-hidden bg-azul-profundo text-superficie">
        <div aria-hidden="true" className="pointer-events-none absolute -top-28 -right-24 -z-10 size-96 rounded-full bg-turquesa/15 blur-3xl" />
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div>
            <p className="text-caption font-bold tracking-[0.2em] text-ciano">A JORNADA DA CONSULTAVIVA</p>
            <h1 className="mt-4 max-w-[15ch] text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.04] font-bold tracking-[-0.055em] text-superficie">
              A consulta está marcada. E se algo mudar?
            </h1>
            <p className="mt-5 max-w-2xl text-body-large text-superficie/80">
              O paciente conta o que está dificultando. A equipe avalia as opções, e a consulta continua marcada até uma mudança ser confirmada.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Botoes texto="Percorrer a jornada" para="#etapas" icone={FiArrowRight} posicaoIcone="direita" tamanho="grande" />
              <span className="rounded-full border border-superficie/20 px-4 py-2 text-body-small text-superficie/75">
                Demonstração com dados fictícios
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl rounded-3xl border border-superficie/15 bg-superficie/5 p-5 shadow-2xl shadow-black/20 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-caption font-bold tracking-wider text-ciano">PACIENTE E EQUIPE</p>
                <h2 className="mt-1 text-h3 text-superficie">Um pedido, próximos passos</h2>
              </div>
              <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-turquesa/15 text-ciano">
                <FiShield className="size-6" />
              </span>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="rounded-2xl border border-superficie/10 bg-azul-profundo/60 p-4">
                <span className="grid size-10 place-items-center rounded-xl bg-turquesa/15 text-ciano"><FiCalendar aria-hidden="true" /></span>
                <p className="mt-3 text-body-small font-bold text-superficie">Consulta marcada</p>
                <p className="mt-1 text-caption text-superficie/65">O paciente acompanha o horário</p>
              </div>
              <FiArrowRight aria-hidden="true" className="mx-auto size-5 rotate-90 text-ciano sm:rotate-0" />
              <div className="rounded-2xl border border-turquesa/40 bg-turquesa/10 p-4">
                <span className="grid size-10 place-items-center rounded-xl bg-turquesa/20 text-ciano"><FiUsers aria-hidden="true" /></span>
                <p className="mt-3 text-body-small font-bold text-superficie">Paciente + equipe</p>
                <p className="mt-1 text-caption text-superficie/65">Avaliam juntos o que pode ser feito</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-superficie/10 px-4 py-3 text-body-small text-superficie/85">
              <FiShield aria-hidden="true" className="size-4 shrink-0 text-ciano" />
              <p>A consulta só muda depois das confirmações necessárias.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="etapas" aria-labelledby="titulo-etapas" className="scroll-mt-24 bg-fundo">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <header className="max-w-3xl">
            <p className="text-caption font-bold tracking-[0.2em] text-turquesa-escuro">PASSO A PASSO</p>
            <h2 id="titulo-etapas" className="mt-3 text-h1 text-balance">Veja o que acontece em cada etapa.</h2>
            <p className="mt-4 text-body-large text-azul-profundo/75">
              Toque em uma etapa para saber mais.
            </p>
          </header>

          <div className="relative mt-8 grid gap-3 lg:grid-cols-4">
            <div
              aria-label={`Progresso da jornada: etapa ${etapaAtual + 1} de ${etapas.length}`}
              aria-valuemin={1}
              aria-valuemax={etapas.length}
              aria-valuenow={etapaAtual + 1}
              role="progressbar"
              className="pointer-events-none absolute bottom-12 left-5 top-12 w-0.5 rounded-full bg-azul-profundo/10 lg:hidden"
            >
              <span
                aria-hidden="true"
                className="block w-full rounded-full bg-turquesa transition-[height] duration-300 motion-reduce:transition-none"
                style={{ height: `${progressoCaminho}%` }}
              />
            </div>
            <div
              aria-label={`Progresso da jornada: etapa ${etapaAtual + 1} de ${etapas.length}`}
              aria-valuemin={1}
              aria-valuemax={etapas.length}
              aria-valuenow={etapaAtual + 1}
              role="progressbar"
              className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-9 hidden h-0.5 rounded-full bg-azul-profundo/10 lg:block"
            >
              <span
                aria-hidden="true"
                className="block h-full rounded-full bg-turquesa transition-[width] duration-300 motion-reduce:transition-none"
                style={{ width: `${progressoCaminho}%` }}
              />
            </div>
            {etapas.map((item, indice) => {
              const Icone = item.icone
              const selecionada = indice === etapaAtual
              return (
                <button
                  key={item.atalho}
                  type="button"
                  aria-pressed={selecionada}
                  aria-controls="detalhe-etapa"
                  onClick={() => irParaEtapa(indice)}
                  className={`group relative z-10 grid min-h-24 grid-cols-[2.5rem_1fr] items-center gap-x-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-escuro lg:min-h-36 lg:grid-cols-1 lg:content-start lg:justify-items-center lg:gap-0 lg:text-center ${selecionada
                    ? 'border-azul-profundo bg-azul-profundo text-superficie shadow-lg shadow-azul-profundo/10'
                    : 'border-azul-profundo/12 bg-superficie text-azul-profundo hover:border-turquesa-escuro/40 hover:bg-menta'
                    }`}
                >
                  <span className={`col-start-1 row-span-2 flex size-10 items-center justify-center rounded-xl ring-4 ring-fundo transition-colors lg:row-span-1 ${selecionada ? 'bg-turquesa/20 text-ciano' : 'bg-menta text-turquesa-escuro'}`}>
                    <Icone aria-hidden="true" className="size-4" />
                  </span>
                  <span className={`col-start-2 row-start-1 block text-caption font-bold lg:mt-3 ${selecionada ? 'text-superficie/60' : 'text-azul-profundo/55'}`}>
                    ETAPA {indice + 1}
                  </span>
                  <span className="col-start-2 row-start-2 mt-0.5 block text-body-small font-bold lg:col-auto">{item.atalho}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-caption font-semibold text-azul-profundo/65">
            <span>Etapa {etapaAtual + 1} de {etapas.length}</span>
            <span>Use as etapas para navegar</span>
          </div>

          <article id="detalhe-etapa" aria-live="polite" aria-atomic="true" className="mt-6 overflow-hidden rounded-3xl border border-azul-profundo/10 bg-superficie shadow-xl shadow-azul-profundo/5">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="bg-azul-profundo p-5 text-superficie sm:p-8 lg:p-10">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-2xl bg-turquesa/15 text-ciano">
                    <IconeEtapa aria-hidden="true" className="size-6" />
                  </span>
                  <p className="text-body-small font-bold text-superficie/65">ETAPA {etapaAtual + 1} DE {etapas.length}</p>
                </div>
                <h3 className="mt-6 text-h2 text-superficie">{etapa.titulo}</h3>
                <p className="mt-3 text-body text-superficie/75">{etapa.resumo}</p>
                <div className="mt-7 rounded-2xl border border-superficie/10 bg-superficie/5 p-4">
                  <p className="text-caption font-bold tracking-wider text-ciano">REGRA QUE PROTEGE</p>
                  <p className="mt-2 text-body-small text-superficie/85">{etapa.regra}</p>
                </div>
              </div>

              <div className="p-5 sm:p-8 lg:p-10">
                <div className="grid gap-4 sm:grid-cols-2">
                  <section aria-labelledby="visao-paciente" className="rounded-2xl border border-azul-profundo/10 bg-fundo p-4 sm:p-5">
                    <p className="flex items-center gap-2 text-caption font-bold tracking-wider text-turquesa-escuro">
                      <FiCalendar aria-hidden="true" className="size-4" /> PACIENTE
                    </p>
                    <h4 id="visao-paciente" className="mt-3 font-bold">O que faz</h4>
                    <p className="mt-2 text-body-small text-azul-profundo/75">{etapa.paciente}</p>
                  </section>
                  <section aria-labelledby="visao-equipe" className="rounded-2xl border border-azul-profundo/10 bg-fundo p-4 sm:p-5">
                    <p className="flex items-center gap-2 text-caption font-bold tracking-wider text-turquesa-escuro">
                      <FiUsers aria-hidden="true" className="size-4" /> EQUIPE
                    </p>
                    <h4 id="visao-equipe" className="mt-3 font-bold">O que faz</h4>
                    <p className="mt-2 text-body-small text-azul-profundo/75">{etapa.equipe}</p>
                  </section>
                </div>

                {etapa.desfechos && (
                  <div className="mt-5">
                    <h4 className="flex items-center gap-2 font-bold">
                      <FiGitBranch aria-hidden="true" className="size-4 text-turquesa-escuro" />
                      A jornada pode seguir por dois caminhos
                    </h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {etapa.desfechos.map(({ titulo, descricao, icone: Icone }) => (
                        <div key={titulo} className="flex gap-3 rounded-2xl border border-azul-profundo/10 p-4">
                          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-menta text-turquesa-escuro">
                            <Icone aria-hidden="true" className="size-4" />
                          </span>
                          <div>
                            <p className="text-body-small font-bold">{titulo}</p>
                            <p className="mt-1 text-caption text-azul-profundo/75">{descricao}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-azul-profundo/10 pt-5">
                  <Botoes
                    texto="Voltar"
                    variante="secundario"
                    icone={FiArrowLeft}
                    desabilitado={etapaAtual === 0}
                    onClick={() => irParaEtapa(etapaAtual - 1)}
                  />
                  <Botoes
                    texto={etapaAtual === etapas.length - 1 ? 'Fim da jornada' : 'Próxima'}
                    variante="escuro"
                    icone={FiArrowRight}
                    posicaoIcone="direita"
                    desabilitado={etapaAtual === etapas.length - 1}
                    onClick={() => irParaEtapa(etapaAtual + 1)}
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section aria-labelledby="titulo-continue" className="bg-superficie">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-caption font-bold tracking-[0.2em] text-turquesa-escuro">QUER SABER MAIS?</p>
            <h2 id="titulo-continue" className="mt-2 text-h2">Conheça a ConsultaViva.</h2>
            <p className="mt-2 max-w-2xl text-body-small text-azul-profundo/75">
              Veja a visão geral da proposta na página Solução.
            </p>
          </div>
          <Botoes texto="Ver a página Solução" para="/solucao" icone={FiArrowRight} posicaoIcone="direita" variante="contornoTurquesa" />
        </div>
      </section>
    </>
  )
}
