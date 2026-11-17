import { useState } from 'react'
import type { SubmitEvent } from 'react'
import Botoes from '../../../components/Botoes/Botoes'
import { agoraNaAgenda, timestampDaAgenda } from '../../../services/agendaPacienteService'
import type { CriarHorarioRequest, HorarioAtendimento } from '../../../types/horario'
import type { MembroEquipe } from '../../../types/membroEquipe'
import type { Unidade } from '../../../types/unidade'
import { campoAgenda } from '../ControlesAgendaEquipe'
import { formatarDataAgenda, formatarHoraAgenda, hojeNaAgenda } from '../dadosAgendaEquipe'
import { conflitaComHorario, montarHorariosEmLote } from './horariosEmLote'

const semana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const diasEmOrdem = [1, 2, 3, 4, 5, 6, 0]

export default function FormularioHorariosEmLote({ dia, unidade, profissional, unidades, membros, horarios, ocupado,
  processadas, aoSalvar, aoFechar, informarErro }: {
  dia: string
  unidade: string
  profissional: string
  unidades: Unidade[]
  membros: MembroEquipe[]
  horarios: HorarioAtendimento[]
  ocupado: boolean
  processadas: number
  aoSalvar: (vagas: CriarHorarioRequest[]) => void
  aoFechar: () => void
  informarErro: (erro: string) => void
}) {
  const dataInicial = dia >= hojeNaAgenda() ? dia : hojeNaAgenda()
  const [inicio, setInicio] = useState(dataInicial)
  const [ate, setAte] = useState('')
  const [dias, setDias] = useState([1, 2, 3, 4, 5])
  const [previa, setPrevia] = useState<{ livres: CriarHorarioRequest[]; indisponiveis: number } | null>(null)

  function revisar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (previa) {
      aoSalvar(previa.livres)
      return
    }
    const dados = new FormData(evento.currentTarget)
    const vagas = montarHorariosEmLote({
      inicio, fim: ate || inicio, dias: ate ? dias : [new Date(`${inicio}T00:00:00Z`).getUTCDay()],
      abertura: String(dados.get('abertura')), fechamento: String(dados.get('fechamento')),
      duracao: Number(dados.get('duracao')), idUnidade: Number(dados.get('unidade')), idMembroEquipe: Number(dados.get('profissional')),
    })
    if (!vagas || typeof vagas === 'string' || !vagas.length) {
      informarErro(typeof vagas === 'string' ? vagas : 'Confira os dias e escolha um turno que comporte ao menos uma vaga.')
      return
    }
    const agora = agoraNaAgenda()
    const livres = vagas.filter((vaga) => timestampDaAgenda(vaga.dataInicio) > agora
      && !horarios.some((item) => conflitaComHorario(vaga, item)))
    informarErro('')
    setPrevia({ livres, indisponiveis: vagas.length - livres.length })
  }

  return (
    <form onSubmit={revisar}>
      <fieldset className="grid min-w-0 gap-3 sm:grid-cols-2" disabled={ocupado || !!previa} hidden={!!previa}>
        <label className="min-w-0 text-body-small font-bold">Unidade
          <select name="unidade" required className={campoAgenda} defaultValue={unidade}>
            <option value="">Selecione a unidade</option>
            {unidades.map((item) => <option key={item.idUnidade} value={item.idUnidade}>{item.nomeUnidade}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-body-small font-bold">Profissional
          <select name="profissional" required className={campoAgenda} defaultValue={profissional}>
            <option value="">Selecione o profissional</option>
            {membros.map((item) => <option key={item.idMembroEquipe} value={item.idMembroEquipe}>{item.nomeMembroEquipe}</option>)}
          </select>
        </label>
        <label className="min-w-0 text-body-small font-bold">A partir de
          <input type="date" name="inicio" required min={hojeNaAgenda()} value={inicio}
            className={campoAgenda} onChange={(evento) => setInicio(evento.target.value)} />
        </label>
        <label className="min-w-0 text-body-small font-bold">Repetir até (opcional)
          <input type="date" name="fim" min={inicio} value={ate} className={campoAgenda}
            onChange={(evento) => setAte(evento.target.value)} />
        </label>
        {ate && <div className="sm:col-span-2">
          <p id="dias-do-turno" className="text-body-small font-bold">Dias da semana</p>
          <div role="group" aria-labelledby="dias-do-turno" className="mt-2 flex flex-wrap gap-1.5">
            {diasEmOrdem.map((id) => <button key={id} type="button" aria-pressed={dias.includes(id)}
              onClick={() => setDias((atual) => atual.includes(id) ? atual.filter((dia) => dia !== id) : [...atual, id])}
              className="min-h-11 min-w-11 cursor-pointer rounded-lg border border-azul-profundo/25 px-2 text-body-small font-semibold focus-visible:outline-2 focus-visible:outline-turquesa-escuro aria-pressed:border-turquesa-escuro aria-pressed:bg-menta aria-pressed:text-turquesa-escuro">{semana[id]}</button>)}
          </div>
        </div>}
        <label className="min-w-0 text-body-small font-bold">Início do turno
          <input type="time" name="abertura" required className={campoAgenda} />
        </label>
        <label className="min-w-0 text-body-small font-bold">Fim do turno
          <input type="time" name="fechamento" required className={campoAgenda} />
        </label>
        <label className="min-w-0 text-body-small font-bold">Minutos por consulta
          <input type="number" name="duracao" required min={1} defaultValue={30} className={campoAgenda} />
        </label>
      </fieldset>
      {previa && (
        <div className="space-y-3 rounded-lg border border-azul-profundo/10 bg-fundo p-3 text-body-small">
          <p className="font-bold">{previa.livres.length} {previa.livres.length === 1 ? 'vaga disponível para cadastro' : 'vagas disponíveis para cadastro'}</p>
          {previa.indisponiveis > 0 && <p>{previa.indisponiveis} {previa.indisponiveis === 1 ? 'horário bloqueado' : 'horários bloqueados'} por conflito ou por já terem começado.</p>}
          {previa.livres.length > 0 && (
            <ul aria-label="Prévia das vagas" className="max-h-48 space-y-1 overflow-auto">
              {previa.livres.map((vaga) => <li key={vaga.dataInicio}>{formatarDataAgenda(vaga.dataInicio)} · {formatarHoraAgenda(vaga.dataInicio)} a {formatarHoraAgenda(vaga.dataFim)}</li>)}
            </ul>
          )}
          {ocupado && <p role="status">{processadas} de {previa.livres.length} vagas conferidas…</p>}
        </div>
      )}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Botoes texto={previa ? 'Revisar turno' : 'Voltar'} variante="secundario" desabilitado={ocupado} onClick={() => {
          if (previa) setPrevia(null)
          else aoFechar()
        }} />
        <Botoes texto={previa ? 'Cadastrar vagas' : 'Prévia das vagas'} tipo="submit" desabilitado={previa?.livres.length === 0} carregando={ocupado} />
      </div>
    </form>
  )
}
