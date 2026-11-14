import Accordion from '../../../components/Accordion/Accordion'
import Botoes from '../../../components/Botoes/Botoes'

const perguntas = [
  {
    id: 'sus',
    pergunta: 'A ConsultaViva é integrada ao SUS?',
    resposta: 'Não. A ConsultaViva é um protótipo acadêmico com agendamentos e dados fictícios. O sistema não consulta nem altera agendamentos reais do SUS.',
  },
  {
    id: 'resposta',
    pergunta: 'Se eu não responder, minha consulta é cancelada?',
    resposta: 'Não. Se você não responder a uma proposta, ela pode expirar. O agendamento original permanece como estava.',
  },
  {
    id: 'ajuda',
    pergunta: 'O que acontece quando toco em “Preciso de ajuda”?',
    resposta: 'Você pode informar o que dificulta sua ida e indicar quando conseguiria ser atendido. Depois de enviar o pedido, acompanhe a resposta no portal do paciente.',
  },
  {
    id: 'virtual',
    pergunta: 'A consulta pode virar virtual automaticamente?',
    resposta: 'Não. Se houver uma proposta de atendimento virtual, você pode aceitá-la ou recusá-la. A modalidade só muda depois da confirmação da proposta.',
  },
  {
    id: 'aplicativo',
    pergunta: 'Preciso instalar algum aplicativo?',
    resposta: 'Não. A ConsultaViva pode ser acessada pelo navegador do celular ou do computador.',
  },
  {
    id: 'custo',
    pergunta: 'Quanto custa para o paciente?',
    resposta: 'O protótipo acadêmico é gratuito e não realiza cobranças.',
  },
  {
    id: 'agenda',
    pergunta: 'A ConsultaViva lê minha agenda pessoal?',
    resposta: 'Não. O sistema usa os horários que você informa no pedido de ajuda. Não precisa acessar a agenda do seu celular.',
  },
  {
    id: 'prioridade',
    pergunta: 'Vocês usam IA para decidir quem é atendido primeiro?',
    resposta: 'Não. O sistema usa regras de agendamento para buscar alternativas de horário. Ele não faz triagem clínica nem decide a prioridade de atendimento.',
  },
  {
    id: 'privacidade',
    pergunta: 'Como os dados são protegidos?',
    resposta: 'O protótipo usa dados fictícios de demonstração. Use apenas dados de teste ao explorar a ConsultaViva.',
  },
]

export default function Faq() {
  return (
    <section aria-labelledby="titulo-faq" className="bg-fundo">
      <div className="mx-auto grid w-full max-w-7xl items-start gap-9 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)] lg:gap-14 lg:pt-[5.5rem] lg:pb-26 xl:w-5/6 xl:px-0">
        <header>
          <p className="text-caption font-bold tracking-widest text-turquesa-escuro">FAQ</p>
          <h1 id="titulo-faq" className="mt-3 text-display">
            Perguntas <span className="block text-turquesa-escuro">frequentes</span>
          </h1>
          <p className="mt-4 max-w-xs text-body-large text-azul-profundo/80">
            O que pacientes, profissionais e avaliadores costumam perguntar sobre a ConsultaViva.
          </p>
          <div className="mt-5">
            <Botoes texto="Mandar outra pergunta" para="/contato" variante="contornoTurquesa" />
          </div>
        </header>

        <Accordion itens={perguntas} />
      </div>
    </section>
  )
}
