import { unidadeService } from '../../../services/unidadeService'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import CadastroEquipe from '../CadastroEquipe'
import { listaAgenda } from '../dadosAgendaEquipe'
import CamposUnidade from './CamposUnidade'

function carregarUnidades(opcoes: OpcoesAutenticadas) {
  return listaAgenda(unidadeService.listar(opcoes))
}

function lerUnidade(formulario: FormData) {
  const nomeUnidade = String(formulario.get('nome') ?? '').trim()
  const endereco = String(formulario.get('endereco') ?? '').trim()
  if (!nomeUnidade || !endereco) return 'Informe o nome e o endereço da unidade.'
  if (nomeUnidade.length > 100 || endereco.length > 250) return 'Use até 100 caracteres no nome e 250 no endereço.'
  return { nomeUnidade, endereco }
}

export default function UnidadesEquipe() {
  return (
    <CadastroEquipe titulo="Unidades" singular="unidade" plural="unidades" genero="a"
      descricao="Gerencie os locais de atendimento que aparecem na agenda."
      carregar={carregarUnidades} inserir={unidadeService.inserir} atualizar={unidadeService.atualizar} excluir={unidadeService.excluir}
      idDoRegistro={(item) => item.idUnidade} nomeDoRegistro={(item) => item.nomeUnidade}
      textoDaBusca={(item) => `${item.nomeUnidade} ${item.endereco} #${item.idUnidade}`}
      resumir={(item) => <p className="mt-1 text-body-small text-azul-profundo/75">#{item.idUnidade} · {item.endereco}</p>}
      campos={(item) => <CamposUnidade unidade={item} />} lerFormulario={lerUnidade} />
  )
}
