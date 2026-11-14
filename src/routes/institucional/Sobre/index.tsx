import { FiArrowDown } from 'react-icons/fi'

const etapas = [
  {
    titulo: 'Entender as faltas',
    descricao: 'Investigar o que impede o comparecimento.',
  },
  {
    titulo: 'Mapear barreiras',
    descricao: 'Identificar os obstáculos mais relevantes.',
  },
  {
    titulo: 'Pensar alternativas',
    descricao: 'Explorar formas de apoiar o planejamento e a comunicação.',
  },
  {
    titulo: 'Criar o protótipo',
    descricao: 'Reunir orientações e pedidos de ajuda em um único lugar.',
  },
]

const barreiras = [
  {
    titulo: 'Mobilidade',
    descricao: 'Um atraso no ônibus pode comprometer todo o trajeto até a unidade.',
  },
  {
    titulo: 'Rotina',
    descricao: 'O horário da consulta pode coincidir com o expediente de trabalho.',
  },
  {
    titulo: 'Comunicação e tecnologia',
    descricao: 'Uma conexão instável pode dificultar a entrada em uma consulta virtual.',
  },
]

const pacientes = [
  {
    nome: 'Ana, 34',
    foto: 'https://images.pexels.com/photos/6976400/pexels-photo-6976400.jpeg?auto=compress&cs=tinysrgb&w=240',
    dificuldade: 'Depende de ônibus e tem pouco tempo para chegar à UBS.',
    apoio: 'Organizar o trajeto e avaliar uma proposta de outro horário.',
  },
  {
    nome: 'Bruno, 61',
    foto: 'https://images.pexels.com/photos/17481298/pexels-photo-17481298.jpeg?auto=compress&cs=tinysrgb&w=240',
    dificuldade: 'A consulta coincide com um compromisso de família.',
    apoio: 'Informar quando está disponível e acompanhar o pedido de ajuda.',
  },
  {
    nome: 'Carla, 45',
    foto: 'https://images.pexels.com/photos/23285900/pexels-photo-23285900.jpeg?auto=compress&cs=tinysrgb&w=240',
    dificuldade: 'Tem dificuldade para acessar a consulta virtual.',
    apoio: 'Conferir o aparelho e a conexão antes do atendimento.',
  },
]

const achados = [
  {
    fonte: 'Teleinterconsultas em Campo Grande (MS)',
    link: 'https://revista.saude.ms.gov.br/index.php/rspms/article/download/329/240/2163#page=21',
    encontrado: 'O serviço registrou 68 faltas em teleinterconsultas entre dezembro de 2021 e março de 2024.',
    aplicacao: 'Considerar dificuldades de comparecimento também nos atendimentos remotos.',
  },
  {
    fonte: 'Imperial College Healthcare NHS Trust',
    link: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12095891/',
    encontrado: 'Em 2021, a taxa de faltas foi de 10,9% nas consultas remotas e de 10,1% nas presenciais.',
    aplicacao: 'Oferecer orientações de preparo tanto para a ida à unidade quanto para a consulta virtual.',
  },
  {
    fonte: 'Apoio à teleconsulta nos EUA',
    link: 'https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2799311',
    encontrado: 'O grupo selecionado para receber apoio técnico prévio teve 91,6% de comparecimento, ante 82,8% no grupo de comparação.',
    aplicacao: 'Incluir uma verificação de câmera, microfone e conexão antes do atendimento.',
  },
  {
    fonte: 'CEJAM, São Paulo',
    link: 'https://evento.cejam.org.br/index.php/AECC/article/view/990',
    encontrado: 'Nas unidades participantes, confirmação antecipada, contato com pacientes e reposição de vagas fizeram parte de uma ação que reduziu as faltas.',
    aplicacao: 'Manter a consulta original até a confirmação de uma mudança e reaproveitar vagas liberadas.',
  },
  {
    fonte: 'Meu SUS Digital',
    link: 'https://www.gov.br/pt-br/servicos/agendar-remarcar-ou-cancelar-consultas-em-unidades-sus-integradas',
    encontrado: 'O serviço já permite agendar, remarcar e cancelar consultas em unidades integradas.',
    aplicacao: 'Concentrar a ConsultaViva no período entre marcar e comparecer, com planejamento e pedidos de ajuda.',
  },
]

const contextoDoProjeto = [
  {
    titulo: 'Na demonstração',
    descricao: 'O protótipo usa dados fictícios e não tem integração oficial com o SUS.',
  },
  {
    titulo: 'Em uma unidade de saúde',
    descricao: 'A adoção depende da contratação pela unidade e de autorização para integrar a agenda.',
  },
]

const secaoTelaInteira =
  'mx-auto grid min-h-[calc(100svh-5rem-1px)] max-w-7xl content-center px-5 sm:px-8'

export default function Sobre() {
  return (
    <>
      <section aria-labelledby="titulo-sobre" className="bg-menta">
        <div className="mx-auto flex min-h-[calc(100svh-5rem-1px)] max-w-7xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8 sm:py-20">
          <p className="text-caption font-bold tracking-[0.18em] text-turquesa-escuro">
            SOBRE A CONSULTAVIVA
          </p>
          <h1 id="titulo-sobre" className="mt-6 text-display text-balance sm:mt-8">
            Por que uma consulta marcada{' '}
            <span className="block text-turquesa-escuro">pode não acontecer?</span>
          </h1>
          <p className="mt-6 max-w-2xl text-body-large text-pretty text-azul-profundo/80 sm:mt-8">
            Horários, deslocamento e dificuldades de acesso podem atrapalhar a ida à consulta.
            Foi para entender esse caminho que criamos a ConsultaViva.
          </p>
          <a
            href="#como-chegamos-a-solucao"
            className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-turquesa-escuro underline underline-offset-8 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-4 sm:mt-9"
          >
            Como chegamos à solução <FiArrowDown aria-hidden="true" className="size-4" />
          </a>
        </div>
      </section>

      <section
        id="como-chegamos-a-solucao"
        aria-labelledby="titulo-caminho"
        tabIndex={-1}
        className="scroll-mt-[calc(5rem+1px)] bg-superficie"
      >
        <div className={`${secaoTelaInteira} py-16 sm:py-20 lg:py-24`}>
          <p className="text-caption font-bold tracking-[0.14em] text-turquesa-escuro">
            NOSSO CAMINHO
          </p>
          <h2 id="titulo-caminho" className="mt-2 text-h1">
            Como chegamos à solução
          </h2>
          <p className="mt-3 max-w-2xl text-azul-profundo/80">
            A proposta surgiu ao investigar por que nem sempre é possível comparecer a uma consulta marcada.
          </p>

          <ol role="list" className="mt-10 grid md:mt-12 md:grid-cols-4 md:gap-6">
            {etapas.map(({ titulo, descricao }) => (
              <li
                key={titulo}
                className="relative pb-7 pl-7 last:pb-0 before:absolute before:top-2 before:-bottom-2 before:left-1 before:w-px before:bg-turquesa-escuro/40 last:before:hidden md:pt-7 md:pb-0 md:pl-0 md:before:top-1 md:before:-right-6 md:before:bottom-auto md:before:left-1 md:before:h-px md:before:w-auto"
              >
                <span aria-hidden="true" className="absolute top-1.5 left-0 size-2.5 rounded-full bg-turquesa-escuro md:top-0" />
                <h3 className="text-h4">{titulo}</h3>
                <p className="mt-1 text-body-small text-pretty text-azul-profundo/80">
                  {descricao}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="titulo-barreiras" className="bg-azul-profundo text-superficie">
        <div className={`${secaoTelaInteira} py-16 sm:py-20 lg:py-24`}>
          <div className="grid gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-caption font-bold tracking-[0.14em] text-ciano">
                O QUE APRENDEMOS
              </p>
              <h2 id="titulo-barreiras" className="mt-3 max-w-[17ch] text-h1 text-superficie">
                Sete barreiras, três grandes grupos
              </h2>
            </div>

            <dl className="divide-y divide-superficie/20 border-y border-superficie/20">
              {barreiras.map(({ titulo, descricao }) => (
                <div key={titulo} className="grid gap-2 py-5 sm:grid-cols-[minmax(9rem,0.8fr)_1.2fr] sm:gap-6 lg:py-7">
                  <dt className="font-bold text-ciano">{titulo}</dt>
                  <dd className="text-pretty text-superficie/85">{descricao}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-pacientes" className="bg-fundo">
        <div className={`${secaoTelaInteira} py-16 sm:py-20 lg:py-24`}>
          <p className="text-caption font-bold tracking-[0.14em] text-turquesa-escuro">
            NA PRÁTICA
          </p>
          <h2 id="titulo-pacientes" className="mt-2 text-h1">
            Três pacientes, três barreiras
          </h2>
          <p className="mt-3 max-w-3xl text-azul-profundo/80">
            Perfis fictícios, com fotos ilustrativas, que representam dificuldades do dia a dia.
          </p>

          <ul className="mt-8 grid gap-4 md:grid-cols-3 lg:gap-6">
            {pacientes.map(({ nome, foto, dificuldade, apoio }) => (
              <li key={nome} className="rounded-xl border border-turquesa-escuro/20 bg-superficie p-5 lg:p-6">
                <div className="flex items-center gap-3">
                  <img
                    src={foto}
                    alt=""
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="size-14 shrink-0 rounded-full bg-menta object-cover object-[50%_35%]"
                  />
                  <h3 className="text-h4">{nome}</h3>
                </div>
                <dl className="mt-5 space-y-3 text-body-small">
                  <div>
                    <dt className="font-bold text-turquesa-escuro">O que dificultou</dt>
                    <dd className="mt-1 text-azul-profundo/85">{dificuldade}</dd>
                  </div>
                  <div className="border-t border-azul-profundo/10 pt-3">
                    <dt className="font-bold text-turquesa-escuro">Como a ConsultaViva pode ajudar</dt>
                    <dd className="mt-1 text-azul-profundo/85">{apoio}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="titulo-pesquisa" className="bg-superficie">
        <div className={`${secaoTelaInteira} py-16 sm:py-20 lg:py-24`}>
          <p className="text-caption font-bold tracking-[0.14em] text-turquesa-escuro">
            EVIDÊNCIAS DA PESQUISA
          </p>
          <h2 id="titulo-pesquisa" className="mt-2 text-h1">
            O que encontramos
          </h2>
          <p className="mt-3 max-w-2xl text-azul-profundo/80">
            Estudos e serviços de saúde ajudaram a orientar as escolhas do protótipo.
          </p>
          <div role="table" aria-label="Síntese da pesquisa e decisões do projeto" className="mt-7 overflow-hidden rounded-lg border border-turquesa/30 bg-superficie">
            <div role="rowgroup" className="hidden bg-turquesa-escuro text-superficie sm:block">
              <div role="row" className="grid grid-cols-[0.9fr_1.1fr_1.2fr]">
                <span role="columnheader" className="px-4 py-3 text-body-small font-bold">Fonte</span>
                <span role="columnheader" className="px-4 py-3 text-body-small font-bold">O que encontramos</span>
                <span role="columnheader" className="px-4 py-3 text-body-small font-bold">O que levamos para o projeto</span>
              </div>
            </div>
            <div role="rowgroup" className="divide-y divide-azul-profundo/10">
              {achados.map(({ fonte, link, encontrado, aplicacao }) => (
                <div role="row" key={fonte} className="grid gap-3 p-4 sm:grid-cols-[0.9fr_1.1fr_1.2fr] sm:gap-0 sm:p-0 even:bg-menta/70">
                  <div role="cell" className="grid grid-cols-[7.5rem_1fr] gap-3 text-body-small sm:block sm:px-4 sm:py-4">
                    <span className="font-bold text-azul-profundo/65 sm:hidden">Fonte</span>
                    <a
                      href={link}
                      className="font-semibold text-turquesa-escuro underline decoration-turquesa-escuro/45 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {fonte}
                    </a>
                  </div>
                  <div role="cell" className="grid grid-cols-[7.5rem_1fr] gap-3 text-body-small sm:block sm:px-4 sm:py-4">
                    <span className="font-bold text-azul-profundo/65 sm:hidden">O que encontramos</span>
                    <span className="text-azul-profundo/85">{encontrado}</span>
                  </div>
                  <div role="cell" className="grid grid-cols-[7.5rem_1fr] gap-3 text-body-small sm:block sm:px-4 sm:py-4">
                    <span className="font-bold text-azul-profundo/65 sm:hidden">O que levamos para o projeto</span>
                    <span className="text-azul-profundo/85">{aplicacao}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="titulo-demonstracao"
        className="grid min-h-[calc(100svh-5rem-1px)] grid-rows-[1fr_auto] bg-superficie"
      >
        <div className="mx-auto grid w-full max-w-xl items-center content-center gap-7 px-5 py-12 sm:px-8 md:max-w-6xl md:grid-cols-[1.05fr_1fr] md:gap-10 lg:gap-16 lg:py-16">
          <div className="md:col-start-2 md:row-start-1">
            <h2 id="titulo-demonstracao" className="max-w-[15ch] text-h1 text-balance">
              Da demonstração à unidade de saúde
            </h2>
            <p className="mt-4 text-h4 text-turquesa-escuro sm:mt-5">Gratuito para o paciente.</p>
          </div>

          <img
            src="https://images.pexels.com/photos/6809657/pexels-photo-6809657.jpeg?auto=compress&cs=tinysrgb&w=640"
            srcSet="https://images.pexels.com/photos/6809657/pexels-photo-6809657.jpeg?auto=compress&cs=tinysrgb&w=640 640w, https://images.pexels.com/photos/6809657/pexels-photo-6809657.jpeg?auto=compress&cs=tinysrgb&w=1100 1100w"
            sizes="(min-width: 1152px) 512px, (min-width: 768px) 46vw, (min-width: 576px) 512px, calc(100vw - 40px)"
            alt="Paciente e recepcionista conferem a data de um atendimento no calendário."
            width={640}
            height={427}
            loading="lazy"
            decoding="async"
            className="aspect-[3/2] w-full max-w-lg rounded-lg bg-fundo object-cover md:col-start-1 md:row-start-1"
          />
        </div>

        <div className="border-y border-turquesa-escuro/15 bg-menta">
          <dl className="mx-auto grid w-full max-w-xl divide-y divide-turquesa-escuro/20 px-5 py-7 sm:px-8 md:max-w-6xl md:grid-cols-2 md:divide-x md:divide-y-0 md:py-9">
            {contextoDoProjeto.map(({ titulo, descricao }) => (
              <div key={titulo} className="py-4 first:pt-0 last:pb-0 md:py-0 md:first:pr-8 md:last:pl-8">
                <dt className="text-h4 text-turquesa-escuro">{titulo}</dt>
                <dd className="mt-1 max-w-[48ch] text-pretty text-azul-profundo/80">{descricao}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
