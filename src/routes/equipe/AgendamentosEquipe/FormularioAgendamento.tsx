import type { SubmitEvent } from 'react'
import Botoes from '../../../components/Botoes/Botoes'
import ErrorState from '../../../components/ErrorState/ErrorState'
import LoadingState from '../../../components/LoadingState/LoadingState'
import { useBuscaAutenticada } from '../../../hooks/useBuscaAutenticada'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import { horarioService } from '../../../services/horarioService'
import type { CriarAgendamentoRequest } from '../../../types/agendamento'
import type { OpcoesAutenticadas } from '../../../types/autenticacao'
import type { MembroEquipe } from '../../../types/membroEquipe'
import type { Paciente } from '../../../types/paciente'
import type { Unidade } from '../../../types/unidade'
import { campoAgenda } from '../ControlesAgendaEquipe'
import { formatarDataAgenda, formatarHoraAgenda, listaAgenda } from '../dadosAgendaEquipe'

function buscarVagas(opcoes: OpcoesAutenticadas) {
  return listaAgenda(horarioService.listarDisponiveis(opcoes))
}

export default function FormularioAgendamento({ pacientes, unidades, profissionais, remarcando, ocupado, fechar, informarErro, aoSalvar }: {
  pacientes: Paciente[]
  unidades: Unidade[]
  profissionais: MembroEquipe[]
  remarcando: boolean
  ocupado: boolean
  fechar: () => void
  informarErro: (texto: string) => void
  aoSalvar: (dados: CriarAgendamentoRequest) => void
}) {
  const { resultado, tentarNovamente } = useBuscaAutenticada(buscarVagas)
  const agora = agoraNaAgenda()
  const vagas = resultado?.status === 'sucesso' ? resultado.dados
    .filter(({ dataInicio }) => timestampDaAgenda(dataInicio) > agora)
    .toSorted((a, b) => a.dataInicio.localeCompare(b.dataInicio)) : []
  const localPorId = new Map(unidades.map((item) => [item.idUnidade, item.nomeUnidade]))
  const profissionalPorId = new Map(profissionais.map((item) => [item.idMembroEquipe, item.nomeMembroEquipe]))

  function salvar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = new FormData(evento.currentTarget)
    const idHorario = Number(formulario.get('horario'))
    const idPaciente = Number(formulario.get('paciente'))
    const modalidade = formulario.get('modalidade') === 'VIRTUAL' ? 'VIRTUAL' : 'PRESENCIAL'
    const selecionada = vagas.find((vaga) => vaga.idHorario === idHorario)
    if (!selecionada || timestampDaAgenda(selecionada.dataInicio) <= agoraNaAgenda()
      || (!remarcando && !pacientes.some((paciente) => paciente.idPaciente === idPaciente))) {
      informarErro('Selecione um paciente e um horário disponível, ou atualize as vagas se o horário já começou.')
      return
    }
    aoSalvar({ idHorario, idPaciente, modalidade })
  }

  if (!resultado) return <LoadingState mensagem="Buscando as vagas disponíveis…" />
  if (resultado.status === 'erro') {
    return <ErrorState mensagem="Não foi possível consultar as vagas." tentarNovamente={tentarNovamente} />
  }
  if (!vagas.length) {
    return (
      <div className="space-y-4">
        <p>Não há vagas disponíveis. Os intervalos podem ser cadastrados na tela Horários.</p>
        <Botoes texto="Atualizar vagas" variante="secundario" onClick={tentarNovamente} />
      </div>
    )
  }

  return (
    <form onSubmit={salvar} aria-label={remarcando ? 'Formulário de remarcação' : 'Formulário de agendamento'}>
      <fieldset disabled={ocupado} className="min-w-0 space-y-3">
        {!remarcando && (
          <>
            <label className="block min-w-0 text-body-small font-bold">Paciente
              <select name="paciente" className={campoAgenda} required defaultValue="">
                <option value="">Selecione o paciente</option>
                {pacientes.toSorted((a, b) => a.nomePaciente.localeCompare(b.nomePaciente, 'pt-BR')).map((paciente) => (
                  <option key={paciente.idPaciente} value={paciente.idPaciente}>{paciente.nomePaciente} · #{paciente.idPaciente}</option>
                ))}
              </select>
            </label>
            <label className="block min-w-0 text-body-small font-bold">Modalidade
              <select name="modalidade" className={campoAgenda} defaultValue="PRESENCIAL">
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIRTUAL">Virtual</option>
              </select>
            </label>
          </>
        )}
        <label className="block min-w-0 text-body-small font-bold">{remarcando ? 'Novo horário' : 'Horário disponível'}
          <select name="horario" required className={campoAgenda} defaultValue="">
            <option value="">Selecione uma vaga</option>
            {vagas.map((vaga) => (
              <option key={vaga.idHorario} value={vaga.idHorario}>
                {formatarDataAgenda(vaga.dataInicio)}, {formatarHoraAgenda(vaga.dataInicio)} · {localPorId.get(vaga.idUnidade) ?? `Unidade #${vaga.idUnidade}`} · {profissionalPorId.get(vaga.idMembroEquipe) ?? `Profissional #${vaga.idMembroEquipe}`}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Botoes texto="Atualizar vagas" variante="discreto" desabilitado={ocupado} onClick={() => {
          informarErro('')
          tentarNovamente()
        }} />
        <div className="ml-auto flex flex-wrap justify-end gap-2">
          <Botoes texto="Voltar" variante="secundario" desabilitado={ocupado} onClick={fechar} />
          <Botoes texto={remarcando ? 'Confirmar remarcação' : 'Salvar agendamento'} tipo="submit" carregando={ocupado} />
        </div>
      </div>
    </form>
  )
}
