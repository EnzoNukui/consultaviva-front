import { useState } from 'react'
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
import { campoAgenda, FiltrosDeLocal } from '../ControlesAgendaEquipe'
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
  const [data, setData] = useState('')
  const [unidade, setUnidade] = useState('')
  const [profissional, setProfissional] = useState('')
  const agora = agoraNaAgenda()
  const vagas = resultado?.status === 'sucesso' ? resultado.dados
    .filter(({ dataInicio }) => timestampDaAgenda(dataInicio) > agora)
    .toSorted((a, b) => a.dataInicio.localeCompare(b.dataInicio)) : []
  const visiveis = vagas.filter((vaga) => (!data || vaga.dataInicio.slice(0, 10) === data)
    && (!unidade || String(vaga.idUnidade) === unidade)
    && (!profissional || String(vaga.idMembroEquipe) === profissional))
  const localPorId = new Map(unidades.map((item) => [item.idUnidade, item.nomeUnidade]))
  const profissionalPorId = new Map(profissionais.map((item) => [item.idMembroEquipe, item.nomeMembroEquipe]))

  function salvar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = new FormData(evento.currentTarget)
    const idHorario = Number(formulario.get('horario'))
    const idPaciente = Number(formulario.get('paciente'))
    const modalidade = formulario.get('modalidade') === 'VIRTUAL' ? 'VIRTUAL' : 'PRESENCIAL'
    const selecionada = visiveis.find((vaga) => vaga.idHorario === idHorario)
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
        <details className="rounded-lg border border-azul-profundo/15 bg-fundo p-3">
          <summary className="min-h-8 cursor-pointer text-body-small font-bold text-turquesa-escuro">
            Filtrar vagas · {visiveis.length} {visiveis.length === 1 ? 'resultado' : 'resultados'}
          </summary>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="min-w-0 text-body-small font-bold">Data da consulta
              <input type="date" className={campoAgenda} value={data} onChange={(evento) => setData(evento.target.value)} />
            </label>
            <FiltrosDeLocal unidades={unidades} profissionais={profissionais} unidade={unidade} profissional={profissional}
              aoFiltrarUnidade={setUnidade} aoFiltrarProfissional={setProfissional} />
            {(data || unidade || profissional) && <div className="self-end">
              <Botoes texto="Limpar filtros de vagas" variante="secundario" onClick={() => {
                setData('')
                setUnidade('')
                setProfissional('')
              }} />
            </div>}
          </div>
        </details>
        {!visiveis.length ? <p role="status" className="text-body-small">Altere ou limpe os filtros para encontrar uma vaga.</p> : (
          <label className="block min-w-0 text-body-small font-bold">{remarcando ? 'Novo horário' : 'Horário disponível'}
            <select key={`${data}/${unidade}/${profissional}`} name="horario" required className={campoAgenda} defaultValue="">
              <option value="">Selecione uma vaga</option>
              {visiveis.map((vaga) => (
                <option key={vaga.idHorario} value={vaga.idHorario}>
                  {formatarDataAgenda(vaga.dataInicio)}, {formatarHoraAgenda(vaga.dataInicio)} · {localPorId.get(vaga.idUnidade) ?? `Unidade #${vaga.idUnidade}`} · {profissionalPorId.get(vaga.idMembroEquipe) ?? `Profissional #${vaga.idMembroEquipe}`}
                </option>
              ))}
            </select>
          </label>
        )}
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Botoes texto="Atualizar vagas" variante="discreto" desabilitado={ocupado} onClick={() => {
          informarErro('')
          tentarNovamente()
        }} />
        <div className="ml-auto flex flex-wrap justify-end gap-2">
          <Botoes texto="Voltar" variante="secundario" desabilitado={ocupado} onClick={fechar} />
          <Botoes texto={remarcando ? 'Confirmar remarcação' : 'Salvar agendamento'} tipo="submit"
            desabilitado={!visiveis.length} carregando={ocupado} />
        </div>
      </div>
    </form>
  )
}
