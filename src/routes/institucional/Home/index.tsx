import {
  FiArrowDown, FiArrowRight, FiCalendar, FiCheck, FiChevronRight,
  FiClipboard, FiHelpCircle, FiHome,
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import logo from '../../../assets/marca/logo-horizontal-original.png'
import Accordion from '../../../components/Accordion/Accordion'
import Botoes from '../../../components/Botoes/Botoes'

function fotoPexels(id: number, largura: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${largura}`
}

const atalhos = [
  { texto: 'Pedir ajuda para comparecer', destino: '#pedir-ajuda', foto: 8988457, recorte: 'object-[50%_37%]' },
  { texto: 'Acompanhar um pedido', destino: '#acompanhar-pedido', foto: 5257312, recorte: 'object-center' },
  { texto: 'Planejar a ida à consulta', destino: '#preparo', foto: 30332492, recorte: 'object-center' },
]

const recursosPortal = [
  'Consultar seus agendamentos',
  'Registrar uma dificuldade',
  'Acompanhar propostas de novo horário',
]

const itensPreparo = [
  {
    id: 'presencial',
    pergunta: 'Consulta presencial',
    resposta: (
      <>
        <p>Confira o local, estime o tempo de trajeto e reserve uma margem para imprevistos.</p>
        <Link
          to="/acesso"
          className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-turquesa-escuro underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Planejar a ida no portal <FiArrowRight aria-hidden="true" />
        </Link>
      </>
    ),
  },
  {
    id: 'virtual',
    pergunta: 'Consulta virtual',
    resposta: (
      <>
        <p>Confira câmera, microfone e conexão antes do atendimento. Escolha um lugar tranquilo e teste o aparelho que vai usar na consulta.</p>
        <Link
          to="/acesso"
          className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-turquesa-escuro underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Acessar o preparo virtual <FiArrowRight aria-hidden="true" />
        </Link>
      </>
    ),
  },
]

const duvidas = [
  {
    id: 'consulta',
    pergunta: 'Preciso ter uma consulta marcada?',
    resposta: 'Sim. O pedido de ajuda fica vinculado a uma consulta que já está marcada.',
  },
  {
    id: 'resposta',
    pergunta: 'Como vejo a resposta ao meu pedido?',
    resposta: 'No portal do paciente, abra Solicitações para acompanhar o pedido. Se houver uma alternativa, você poderá consultar a proposta pelo portal.',
  },
  {
    id: 'proposta',
    pergunta: 'Uma proposta muda minha consulta na hora?',
    resposta: 'A proposta pode ser aceita ou recusada. Se você aceitar, acompanhe a confirmação pelo portal antes de se organizar para o novo horário.',
  },
]

export default function Home() {
  return (
    <>
      <section
        aria-labelledby="titulo-home"
        className="relative isolate overflow-hidden bg-areia lg:flex lg:min-h-[calc(100svh-5rem)] lg:items-center"
      >
        <div className="mx-auto w-full max-w-7xl px-5 pt-16 pb-8 sm:px-8 sm:pt-20 lg:py-24">
          <div className="relative z-10 lg:w-[48%]">
            <h1 id="titulo-home" className="max-w-[14ch] text-display">
              Da consulta marcada ao atendimento realizado.
            </h1>
            <p className="mt-6 max-w-sm text-body-large text-azul-profundo/80">
              Peça ajuda se algo dificultar sua ida à consulta.
            </p>
            <div className="mt-8">
              <Botoes texto="Ver como funciona" para="#como-funciona" icone={FiArrowDown} tamanho="grande" />
            </div>
            <p className="mt-6 text-body-small">
              Já tem uma consulta?{' '}
              <Link
                to="/acesso"
                className="font-bold text-turquesa-escuro underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Acesse o portal.
              </Link>
            </p>
          </div>
        </div>
        <img
          src={fotoPexels(5215008, 1100)}
          srcSet={`${fotoPexels(5215008, 640)} 640w, ${fotoPexels(5215008, 1100)} 1100w`}
          sizes="(min-width: 1024px) 56vw, 100vw"
          width={1100}
          height={1650}
          fetchPriority="high"
          alt="Paciente conversa com médica durante uma consulta em consultório"
          className="h-80 w-full object-cover object-[50%_41%] [mask-image:linear-gradient(to_bottom,transparent,black_18%)] sm:h-105 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[56%] lg:[mask-image:linear-gradient(to_right,transparent,black_28%)]"
        />
      </section>

      <section
        id="como-funciona"
        aria-labelledby="titulo-atalhos"
        tabIndex={-1}
        className="scroll-mt-27 bg-superficie"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
          <h2 id="titulo-atalhos" className="text-h1">O que você precisa fazer?</h2>
          <ul className="mt-9 grid gap-9 sm:mt-12 md:grid-cols-3 md:gap-7">
            {atalhos.map(({ texto, destino, foto, recorte }) => (
              <li key={destino}>
                <a
                  href={destino}
                  className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turquesa-escuro"
                >
                  <img
                    src={fotoPexels(foto, 720)}
                    width={720}
                    height={480}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={`aspect-[3/2] w-full rounded-md bg-fundo object-cover ${recorte}`}
                  />
                  <span className="mt-4 flex min-h-14 items-start justify-between gap-3 text-h4 group-hover:text-turquesa-escuro">
                    <span className="max-w-60">{texto}</span>
                    <FiArrowRight
                      aria-hidden="true"
                      className="mt-1 size-5 shrink-0 text-turquesa-escuro motion-safe:transition-transform motion-safe:group-hover:translate-x-1"
                    />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-superficie" aria-labelledby="titulo-caminho">
        <div className="mx-auto max-w-7xl px-5 pb-20 text-center sm:px-8 lg:pb-28">
          <div className="border-t border-azul-profundo/10 pt-20 lg:pt-28">
            <h2 id="titulo-caminho" className="text-display">
              Marcar é só o começo.
              <span className="block text-turquesa-escuro">O difícil é chegar.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-body-large text-azul-profundo/80">
              Transporte, trabalho e imprevistos fazem parte da rotina.
            </p>
          </div>
        </div>
      </section>

      <section
        id="pedir-ajuda"
        aria-labelledby="titulo-exemplo"
        tabIndex={-1}
        className="relative isolate scroll-mt-27 overflow-hidden bg-menta"
      >
        <img
          src={fotoPexels(7878202, 900)}
          width={900}
          height={600}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-[16/10] w-full object-cover object-[50%_42%] [mask-image:linear-gradient(to_top,transparent,black_20%)] lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-[36%] lg:[mask-image:linear-gradient(to_left,transparent,black_30%)]"
        />
        <div className="relative mx-auto max-w-7xl px-5 pt-10 pb-16 sm:px-8 sm:pb-20 lg:grid lg:min-h-[36rem] lg:grid-cols-[1fr_2.15fr] lg:items-center lg:py-24">
          <div className="grid gap-9 md:grid-cols-[1.35fr_1fr] md:gap-10 lg:col-start-2">
            <div>
              <p className="mb-4 text-body-small font-bold text-turquesa-escuro">Exemplo de jornada</p>
              <h2 id="titulo-exemplo" className="text-h2">
                Ana sai do trabalho às 8h30. A consulta é às 9h.
              </h2>
              <p className="mt-5 text-azul-profundo/80">
                Ela informa a dificuldade pelo portal e acompanha o pedido. Se receber uma proposta, pode avaliar se o novo horário funciona para ela.
              </p>
              <a
                href="#acompanhar-pedido"
                className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-turquesa-escuro underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Conheça o portal <FiArrowRight aria-hidden="true" />
              </a>
            </div>
            <div className="border-t border-azul-profundo/20 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <h3 className="text-h4">Proposta de novo horário</h3>
              <dl className="mt-4 flex items-end gap-4 lg:flex-wrap">
                <div>
                  <dt className="text-body-small text-azul-profundo/75">Original</dt>
                  <dd className="text-h1"><time dateTime="09:00">9h</time></dd>
                </div>
                <FiArrowRight className="mb-2 size-5 shrink-0 text-turquesa-escuro" aria-hidden="true" />
                <div>
                  <dt className="text-body-small text-azul-profundo/75">Proposto</dt>
                  <dd className="text-h1 text-turquesa-escuro"><time dateTime="15:30">15h30</time></dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section
        id="acompanhar-pedido"
        aria-labelledby="titulo-portal"
        tabIndex={-1}
        className="scroll-mt-27 bg-superficie"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:min-h-svh lg:grid-cols-[1fr_1fr] lg:gap-20 lg:py-20">
          <div className="max-w-lg">
            <h2 id="titulo-portal" className="text-h1">O que você pode fazer no portal</h2>
            <ul className="mt-8 divide-y divide-azul-profundo/15 border-y border-azul-profundo/15">
              {recursosPortal.map((recurso) => (
                <li key={recurso} className="flex items-start gap-4 py-4 text-h4">
                  <FiCheck className="mt-1 size-5 shrink-0 text-turquesa-escuro" aria-hidden="true" />
                  {recurso}
                </li>
              ))}
            </ul>
          </div>

          <figure className="grid justify-items-center gap-4">
            <div
              aria-hidden="true"
              className="flex min-h-[30rem] w-full max-w-[17rem] flex-col rounded-[2.1rem] border-[7px] border-azul-profundo bg-fundo p-4 shadow-[0_18px_48px_-24px_var(--color-azul-profundo)] sm:min-h-[34rem] sm:max-w-[18rem]"
            >
              <span className="mx-auto h-1.5 w-12 rounded-full bg-azul-profundo" />
              <img
                src={logo}
                width={2172}
                height={724}
                alt=""
                loading="lazy"
                className="mt-6 h-auto w-32 self-center"
              />
              <div className="mt-7">
                <p className="mb-5 text-h4">Minhas consultas</p>
                <ul className="divide-y divide-azul-profundo/10 border-y border-azul-profundo/10">
                  <li className="flex min-h-14 items-center gap-2 text-body-small font-semibold">
                    <FiCalendar className="size-4 shrink-0 text-turquesa-escuro" />
                    <span className="flex-1">Detalhes da consulta</span>
                    <FiChevronRight className="size-4 shrink-0 text-turquesa-escuro" />
                  </li>
                  <li className="flex min-h-14 items-center gap-2 text-body-small font-semibold">
                    <FiHelpCircle className="size-4 shrink-0 text-turquesa-escuro" />
                    <span className="flex-1">Preciso de ajuda</span>
                    <FiChevronRight className="size-4 shrink-0 text-turquesa-escuro" />
                  </li>
                </ul>
              </div>
              <ul className="mt-auto grid grid-cols-3 gap-1 border-t border-turquesa/40 pt-3 text-center text-caption font-semibold">
                <li className="grid justify-items-center gap-1">
                  <FiHome className="size-4" />
                  Início
                </li>
                <li className="grid justify-items-center gap-1 text-turquesa-escuro">
                  <FiCalendar className="size-4" />
                  Consultas
                </li>
                <li className="grid justify-items-center gap-1">
                  <FiClipboard className="size-4" />
                  Solicitações
                </li>
              </ul>
            </div>
            <figcaption className="text-center text-body-small text-azul-profundo/70">
              Prévia ilustrativa do portal do paciente
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        id="preparo"
        aria-labelledby="titulo-preparo"
        tabIndex={-1}
        className="relative isolate scroll-mt-27 overflow-hidden bg-menta lg:flex lg:min-h-svh lg:items-center"
      >
        <div className="mx-auto w-full max-w-7xl px-5 pt-16 pb-10 sm:px-8 sm:pt-20 lg:py-24">
          <div className="relative z-10 max-w-xl lg:w-[47%]">
            <h2 id="titulo-preparo" className="max-w-[14ch] text-display">Prepare-se para a consulta.</h2>
            <p className="mt-5 max-w-md text-body-large text-azul-profundo/80">
              Escolha seu tipo de atendimento para ver o que preparar antes do horário.
            </p>
            <div className="mt-8">
              <Accordion itens={itensPreparo} itemInicial="presencial" variante="linhas" />
            </div>
          </div>
        </div>
        <img
          src={fotoPexels(4945052, 1100)}
          srcSet={`${fotoPexels(4945052, 640)} 640w, ${fotoPexels(4945052, 1100)} 1100w`}
          sizes="(min-width: 1024px) 52vw, 100vw"
          width={1100}
          height={1650}
          alt="Mulher saindo pela porta de um prédio"
          loading="lazy"
          decoding="async"
          className="h-95 w-full object-cover object-[50%_39%] [mask-image:linear-gradient(to_bottom,transparent,black_18%)] sm:h-110 lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[52%] lg:[mask-image:linear-gradient(to_right,transparent,black_29%)]"
        />
      </section>

      <section className="bg-superficie" aria-labelledby="titulo-duvidas">
        <div className="mx-auto grid max-w-7xl items-start gap-9 px-5 py-20 sm:px-8 lg:min-h-[33rem] lg:grid-cols-[0.75fr_1.25fr] lg:content-center lg:gap-20 lg:py-24">
          <h2 id="titulo-duvidas" className="max-w-[10ch] text-h1">Dúvidas frequentes</h2>
          <Accordion itens={duvidas} itemInicial="consulta" variante="linhas" />
        </div>
      </section>

      <section
        aria-labelledby="titulo-acesso"
        className="grid bg-menta px-5 py-24 text-center sm:px-8 lg:min-h-svh lg:place-items-center"
      >
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-body-small font-bold text-turquesa-escuro">Portal do paciente</p>
          <h2 id="titulo-acesso" className="text-display">
            Acompanhe suas consultas pelo portal.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-body-large text-azul-profundo/80">
            Veja seus agendamentos, acompanhe pedidos de ajuda e consulte propostas de novo horário.
          </p>
          <div className="mt-9">
            <Botoes texto="Entrar no portal" para="/acesso" icone={FiArrowRight} tamanho="grande" />
          </div>
        </div>
      </section>
    </>
  )
}
