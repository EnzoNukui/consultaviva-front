import CampoFormulario from '../../../components/CampoFormulario/CampoFormulario'
import { pacienteService } from '../../../services/pacienteService'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import type { Paciente } from '../../../types/paciente'
import CadastroEquipe from '../CadastroEquipe'
import { formatarDataAgenda, hojeNaAgenda, listaAgenda, somarDias } from '../dadosAgendaEquipe'

function carregarPacientes(opcoes: OpcoesAutenticadas) {
  return listaAgenda(pacienteService.listar(opcoes))
}

function camposPaciente(paciente: Paciente | null) {
  return (
    <>
      <CampoFormulario rotulo="Nome completo" name="nome" defaultValue={paciente?.nomePaciente} required maxLength={100} />
      <CampoFormulario rotulo="Data de nascimento" name="nascimento" type="date" defaultValue={paciente?.dataNascimento}
        required max={somarDias(hojeNaAgenda(), -1)} />
      <CampoFormulario rotulo="Telefone (opcional)" name="telefone" type="tel" defaultValue={paciente?.telefone ?? ''} maxLength={20} />
      <CampoFormulario rotulo="E-mail (opcional)" name="email" type="email" defaultValue={paciente?.email ?? ''} maxLength={150} />
      <p className="text-body-small text-azul-profundo/75">{paciente?.email
        ? 'Se o campo de e-mail ficar vazio, o endereço atual será mantido.'
        : 'Este cadastro serve para a equipe marcar consultas. Se a pessoa precisar acessar o portal, use a página pública de cadastro.'}</p>
    </>
  )
}

function lerPaciente(formulario: FormData) {
  const nomePaciente = String(formulario.get('nome') ?? '').trim()
  const dataNascimento = String(formulario.get('nascimento') ?? '')
  if (!nomePaciente || !dataNascimento || dataNascimento >= hojeNaAgenda()) {
    return 'Informe o nome e uma data de nascimento anterior a hoje.'
  }
  return {
    nomePaciente, dataNascimento,
    telefone: String(formulario.get('telefone') ?? '').trim() || null,
    email: String(formulario.get('email') ?? '').trim() || null,
  }
}

export default function PacientesEquipe() {
  return (
    <CadastroEquipe titulo="Pacientes" singular="paciente" plural="pacientes" genero="o"
      descricao="Consulte e mantenha os dados de contato dos pacientes."
      carregar={carregarPacientes} inserir={pacienteService.inserir} atualizar={pacienteService.atualizar} excluir={pacienteService.excluir}
      idDoRegistro={(item) => item.idPaciente} nomeDoRegistro={(item) => item.nomePaciente}
      textoDaBusca={(item) => `${item.nomePaciente} ${item.email ?? ''} ${item.telefone ?? ''} #${item.idPaciente}`}
      resumir={(item) => (
        <div className="mt-1 space-y-0.5 text-body-small text-azul-profundo/75">
          <p>#{item.idPaciente} · Nascimento em {formatarDataAgenda(`${item.dataNascimento}T00:00:00`)}</p>
          <p>{[item.telefone, item.email].filter(Boolean).join(' · ') || 'Contato não informado'}</p>
        </div>
      )}
      campos={camposPaciente} lerFormulario={lerPaciente} />
  )
}
