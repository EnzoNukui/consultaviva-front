import { useState } from 'react'
import { FiArrowDown, FiArrowRight } from 'react-icons/fi'
import simbolo from '../../../assets/marca/simbolo-original.png'
import Botoes from '../../../components/Botoes/Botoes'
import { useTituloPagina } from '../../../hooks/useTituloPagina'

const etapas = [
  { titulo: 'Confirmar', descricao: 'Avise se vai comparecer ou se encontrou alguma dificuldade.' },
  { titulo: 'Preparar', descricao: 'Organize o trajeto ou confira o aparelho para uma consulta virtual.' },
  { titulo: 'Pedir ajuda', descricao: 'Conte o que atrapalhou e informe quando pode ser atendido.' },
  { titulo: 'Avaliar a proposta', descricao: 'Confira a alternativa, se houver, antes de decidir.' },
]

const cenarios = [
  {
    rotulo: 'Trajeto incompatível',
    foto: 17994718,
    alt: 'Ônibus urbano na rua.',
    titulo: 'Ana precisa de outro horário',
    descricao: 'O ônibus não chega a tempo para a consulta da manhã. Ana informa que consegue ir à tarde.',
    original: 'Consulta presencial às 8h',
    alternativa: 'Consulta presencial às 15h, se houver vaga',
    nota: 'O horário original segue válido até a mudança ser confirmada.',
    posicao: '50% 54%',
  },
  {
    rotulo: 'Conversão para virtual',
    foto: 7195090,
    alt: 'Profissional de saúde conversa com uma paciente pela tela do notebook.',
    titulo: 'Bruno pode ser atendido por vídeo?',
    descricao: 'Bruno avisa que terá dificuldade para ir até a unidade e pergunta se a consulta pode ser virtual.',
    original: 'Consulta presencial',
    alternativa: 'Consulta por vídeo, se a troca for autorizada',
    nota: 'A modalidade só muda quando a proposta é autorizada e confirmada.',
    posicao: '50% 24%',
  },
  {
    rotulo: 'Instabilidade técnica',
    foto: 8376198,
    alt: 'Pessoa usando um notebook.',
    titulo: 'Carla encontra um problema na conexão',
    descricao: 'Antes da consulta virtual, Carla confere o aparelho e percebe que a conexão oscila.',
    original: 'Consulta por vídeo marcada',
    alternativa: 'Verificar câmera, microfone e conexão antes da consulta',
    nota: 'Se o problema persistir, Carla pode pedir ajuda pelo portal.',
    posicao: '50% 47%',
  },
  {
    rotulo: 'Recuperação de vaga',
    foto: 6809657,
    alt: 'Duas pessoas conferem uma data no calendário na recepção.',
    titulo: 'Um horário é liberado na agenda',
    descricao: 'Com o cancelamento de uma consulta, o horário volta a ficar disponível na agenda demonstrativa.',
    original: 'Horário das 15h ocupado',
    alternativa: 'Horário disponível para uma proposta compatível',
    nota: 'A vaga liberada pode ser reaproveitada conforme as regras do protótipo.',
    posicao: '50% 55%',
  },
  {
    rotulo: 'Resgate seguro',
    foto: 4266948,
    alt: 'Paciente e profissional conversam na unidade.',
    titulo: 'A consulta original continua valendo',
    descricao: 'O paciente recebe uma alternativa, mas ainda precisa decidir se aceita a mudança.',
    original: 'Consulta presencial às 10h',
    alternativa: 'Novo horário aguardando confirmação',
    nota: 'Sem confirmação, o horário original é mantido.',
    posicao: '50% 40%',
  },
]

const modulos = [
  { titulo: 'Plano de comparecimento', descricao: 'Organize horários e o trajeto até a consulta.' },
  { titulo: 'Presencial para virtual', descricao: 'Avalie a troca de modalidade quando permitida.' },
  { titulo: 'Preparo do dispositivo', descricao: 'Confira câmera, microfone e conexão.' },
  { titulo: 'Recuperação de vagas', descricao: 'Reaproveite horários liberados na agenda demonstrativa.' },
  { titulo: 'Resgate seguro', descricao: 'Acompanhe a proposta e confirme sua decisão.' },
  { titulo: 'Agenda do protótipo', descricao: 'Consulte os agendamentos e acompanhe propostas de horário pelo portal.' },
]

const comparacao = [
  { necessidade: 'Consultar o horário marcado', agenda: 'Sim', lembrete: 'Sim' },
  { necessidade: 'Planejar o comparecimento', agenda: '—', lembrete: '—' },
  { necessidade: 'Informar dificuldades e disponibilidade', agenda: '—', lembrete: '—' },
  { necessidade: 'Acompanhar uma alternativa autorizada', agenda: '—', lembrete: '—' },
]

const larguraSecao = 'mx-auto w-full max-w-7xl px-5 sm:px-8'
const espacoSecao = 'py-16 sm:py-20 lg:py-26'

export default function Solucao() {
  useTituloPagina('Solução')
  const [cenario, setCenario] = useState(cenarios[0])
  const foto = `https://images.pexels.com/photos/${cenario.foto}/pexels-photo-${cenario.foto}.jpeg?auto=compress&cs=tinysrgb`

  return (
    <>
      <section aria-labelledby="titulo-solucao" className="relative isolate grid min-h-[calc(100svh-5rem-1px)] items-center overflow-hidden bg-fundo py-14 sm:py-18">
        <img
          src={simbolo}
          alt=""
          width={1301}
          height={1209}
          decoding="async"
          className="pointer-events-none absolute -right-[36%] -bottom-[7%] -z-10 h-auto w-[139vw] max-w-none select-none opacity-15 md:-right-[13%] md:-bottom-[13%] md:w-[94vw] lg:-right-[146px] lg:-bottom-[180px] lg:w-[min(80vw,1080px)]"
        />

        <div className={larguraSecao}>
          <h1 id="titulo-solucao" className="max-w-[16ch] text-[clamp(2.75rem,8vw,7.25rem)] leading-none font-bold tracking-[-0.06em] lg:max-w-none">
            <span className="lg:block">Quando a consulta</span>{' '}
            <span className="lg:block">precisa mudar</span>
          </h1>
          <a
            href="#demonstracao"
            className="mt-8 inline-flex min-h-12 items-center gap-5 border-b-2 border-current pb-1 font-bold text-turquesa-escuro hover:text-azul-profundo focus-visible:outline-2 focus-visible:outline-offset-4 sm:mt-10 sm:gap-8 sm:text-body-large sm:font-bold"
          >
            Ver o Motor de Resgate em ação <FiArrowDown aria-hidden="true" className="size-5 shrink-0" />
          </a>
        </div>
      </section>

      <section aria-labelledby="titulo-jornada-solucao" className="bg-superficie">
        <div className={`${larguraSecao} ${espacoSecao}`}>
          <h2 id="titulo-jornada-solucao" className="text-h1 text-balance">Do agendamento ao atendimento</h2>
          <p className="mt-4 text-body-large text-azul-profundo/80">
            O paciente pode planejar a consulta e pedir ajuda se algo mudar.
          </p>

          <ol role="list" className="mt-9 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-x-7">
            {etapas.map(({ titulo, descricao }) => (
              <li key={titulo} className="relative border-t border-turquesa-escuro/30 pt-5 sm:pt-7">
                <span aria-hidden="true" className="absolute top-0 left-0 size-3 -translate-y-1/2 rounded-full border-2 border-superficie bg-turquesa-escuro ring-1 ring-turquesa-escuro/40" />
                <h3 className="text-h3">{titulo}</h3>
                <p className="mt-2 max-w-[31ch] text-pretty text-azul-profundo/80">{descricao}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="demonstracao"
        aria-labelledby="titulo-demonstracao"
        tabIndex={-1}
        className="scroll-mt-[calc(5rem+1px)] bg-azul-profundo text-superficie"
      >
        <div className={`${larguraSecao} ${espacoSecao}`}>
          <h2 id="titulo-demonstracao" className="text-h1 text-balance text-superficie">O Motor de Resgate na prática</h2>
          <p className="mt-4 max-w-2xl text-body-large text-superficie/80">
            Cinco situações fictícias mostram o que pode acontecer quando surge um obstáculo.
          </p>

          <div className="mt-8 grid items-start gap-7 md:mt-10 md:grid-cols-[minmax(12rem,0.75fr)_minmax(0,2fr)] lg:gap-12">
            <ul aria-label="Cenários da demonstração" className="divide-y divide-superficie/20 border-y border-superficie/20">
              {cenarios.map((item) => (
                <li key={item.rotulo}>
                  <button
                    type="button"
                    aria-controls="exemplo-solucao"
                    aria-pressed={item === cenario}
                    onClick={() => setCenario(item)}
                    className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 border-l-2 border-transparent px-3 py-3 text-left text-superficie/90 hover:bg-superficie/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ciano aria-pressed:border-turquesa aria-pressed:bg-turquesa/15 aria-pressed:font-bold aria-pressed:text-ciano"
                  >
                    {item.rotulo}
                    {item === cenario && <FiArrowRight aria-hidden="true" className="size-4 shrink-0" />}
                  </button>
                </li>
              ))}
            </ul>

            <article id="exemplo-solucao" aria-labelledby="titulo-exemplo-solucao" className="overflow-hidden rounded-xl bg-superficie text-azul-profundo">
              <img
                src={`${foto}&w=640`}
                srcSet={`${foto}&w=640 640w, ${foto}&w=1100 1100w`}
                sizes="(min-width: 1280px) 850px, (min-width: 768px) 65vw, calc(100vw - 40px)"
                alt={cenario.alt}
                width={1100}
                height={367}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: cenario.posicao }}
                className="block h-[clamp(10rem,30vw,18.5rem)] w-full bg-menta object-cover"
              />
              <div aria-live="polite" aria-atomic="true" className="p-5 sm:p-8">
                <p className="text-body-small font-bold text-turquesa-escuro">Exemplo fictício</p>
                <h3 id="titulo-exemplo-solucao" className="mt-1 text-h2">{cenario.titulo}</h3>
                <p className="mt-2 max-w-[60ch] text-pretty text-azul-profundo/80">{cenario.descricao}</p>
                <dl className="mt-5 divide-y divide-azul-profundo/15 border-t border-azul-profundo/15">
                  <div className="grid gap-1 py-2.5 sm:grid-cols-[6rem_1fr]">
                    <dt className="font-bold text-turquesa-escuro">Original</dt>
                    <dd>{cenario.original}</dd>
                  </div>
                  <div className="grid gap-1 py-2.5 sm:grid-cols-[6rem_1fr]">
                    <dt className="font-bold text-turquesa-escuro">Alternativa</dt>
                    <dd>{cenario.alternativa}</dd>
                  </div>
                </dl>
                <p className="mt-2 rounded-md bg-menta px-3.5 py-2.5 text-body-small text-turquesa-escuro">
                  {cenario.nota}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-modulos" className="bg-superficie">
        <div className={`${larguraSecao} ${espacoSecao} grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16`}>
          <div>
            <h2 id="titulo-modulos" className="max-w-[14ch] text-h1">Seis módulos, uma jornada</h2>
            <p className="mt-4 max-w-md text-body-large text-azul-profundo/80">
              Cada módulo apoia uma parte do caminho, do preparo à confirmação da alternativa.
            </p>
          </div>

          <dl className="divide-y divide-azul-profundo/15 border-y border-azul-profundo/15">
            {modulos.map(({ titulo, descricao }) => (
              <div key={titulo} className="grid gap-1 py-4 sm:grid-cols-[0.85fr_1.15fr] sm:gap-5">
                <dt className="font-bold text-turquesa-escuro">{titulo}</dt>
                <dd className="text-azul-profundo/80">{descricao}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="titulo-arquitetura-solucao" className="bg-menta">
        <div className={`${larguraSecao} ${espacoSecao}`}>
          <h2 id="titulo-arquitetura-solucao" className="max-w-[22ch] text-h1">Java no centro das decisões</h2>
          <p className="mt-4 max-w-2xl text-body-large text-azul-profundo/80">
            No protótipo, os horários vêm da agenda de demonstração. Os dados das unidades são consultados em outra fonte.
          </p>

          <div className="mt-8 grid items-center gap-8 lg:mt-10 lg:grid-cols-[1.5fr_0.85fr] lg:gap-14">
            <div className="border-t-4 border-turquesa bg-superficie px-5 py-6 sm:px-7">
              <h3 className="text-h3">Agenda da demonstração</h3>
              <p className="mt-2 text-azul-profundo/80">
                O Java aplica as regras do Motor de Resgate aos dados fictícios da agenda.
              </p>
              <p className="mt-5 flex flex-wrap items-center gap-2 text-body-small font-bold text-turquesa-escuro sm:gap-3">
                <span className="rounded-md border border-turquesa-escuro/20 bg-fundo px-2.5 py-2">Portal do paciente</span>
                <FiArrowRight aria-hidden="true" />
                <span className="rounded-md border border-turquesa-escuro/20 bg-fundo px-2.5 py-2">API Java</span>
                <FiArrowRight aria-hidden="true" />
                <span className="rounded-md border border-turquesa-escuro/20 bg-fundo px-2.5 py-2">Banco Oracle</span>
              </p>
            </div>
            <div className="border-l border-turquesa-escuro/30 pl-5 sm:pl-7">
              <h3 className="text-h3">Unidades de saúde</h3>
              <p className="mt-2 max-w-[40ch] text-azul-profundo/80">
                O DEMAS fornece dados públicos de estabelecimentos. A ConsultaViva não tem integração oficial com a agenda do SUS.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="titulo-comparacao" className="bg-superficie">
        <div className={`${larguraSecao} ${espacoSecao}`}>
          <h2 id="titulo-comparacao" className="text-h1 text-balance">Três abordagens, os mesmos cenários</h2>
          <p id="descricao-comparacao" className="mt-4 text-body-large text-azul-profundo/80">
            Compare o que cada abordagem oferece nos mesmos cenários.
          </p>

          <table aria-labelledby="titulo-comparacao" aria-describedby="descricao-comparacao" className="mt-8 w-full table-fixed border-collapse text-left text-caption sm:text-body">
            <thead className="border-y border-azul-profundo/15 bg-fundo">
              <tr>
                <th scope="col" className="w-[37%] px-1.5 py-3 sm:w-[40%] sm:px-4">O que o paciente precisa</th>
                <th scope="col" className="w-[15%] px-1.5 py-3 sm:w-[20%] sm:px-4">Agenda</th>
                <th scope="col" className="w-[21%] px-1.5 py-3 sm:w-[20%] sm:px-4">Lembrete</th>
                <th scope="col" className="w-[27%] bg-menta px-1.5 py-3 text-turquesa-escuro sm:w-[20%] sm:px-4">ConsultaViva</th>
              </tr>
            </thead>
            <tbody>
              {comparacao.map(({ necessidade, agenda, lembrete }) => (
                <tr key={necessidade} className="border-b border-azul-profundo/15">
                  <th scope="row" className="px-1.5 py-3 font-medium sm:px-4">{necessidade}</th>
                  <td className="px-1.5 py-3 sm:px-4">{agenda}</td>
                  <td className="px-1.5 py-3 sm:px-4">{lembrete}</td>
                  <td className="bg-menta px-1.5 py-3 font-bold text-turquesa-escuro sm:px-4">Sim</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-body-small text-azul-profundo/80">
            Os cenários são fictícios e mostram como a ConsultaViva pode apoiar o paciente.
          </p>
        </div>
      </section>

      <section aria-labelledby="titulo-proxima-etapa" className="bg-menta">
        <div className={`${larguraSecao} ${espacoSecao} flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <h2 id="titulo-proxima-etapa" className="max-w-2xl text-h1 text-balance">
              Veja a jornada de quem pede ajuda
            </h2>
            <p className="mt-3 max-w-xl text-body-large text-azul-profundo/80">
              Acompanhe o caminho do pedido até a resposta da equipe.
            </p>
          </div>
          <Botoes texto="Acompanhar a jornada" para="/jornada" icone={FiArrowRight} posicaoIcone="direita" />
        </div>
      </section>
    </>
  )
}
