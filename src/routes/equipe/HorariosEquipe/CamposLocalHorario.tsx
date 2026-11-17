import { classeCampoFormulario } from '../../../components/CampoFormulario/CampoFormulario'
import type { MembroEquipe } from '../../../types/membroEquipe'
import type { Unidade } from '../../../types/unidade'

export default function CamposLocalHorario({ unidades, profissionais, unidade, profissional }: {
  unidades: Unidade[]
  profissionais: MembroEquipe[]
  unidade: string | number
  profissional: string | number
}) {
  return (
    <>
      <label className="min-w-0 text-body-small font-bold">Unidade
        <select name="unidade" required className={classeCampoFormulario} defaultValue={unidade}>
          <option value="">Selecione a unidade</option>
          {unidades.map(({ idUnidade, nomeUnidade }) => <option key={idUnidade} value={idUnidade}>{nomeUnidade}</option>)}
        </select>
      </label>
      <label className="min-w-0 text-body-small font-bold">Profissional
        <select name="profissional" required className={classeCampoFormulario} defaultValue={profissional}>
          <option value="">Selecione o profissional</option>
          {profissionais.map(({ idMembroEquipe, nomeMembroEquipe }) => <option key={idMembroEquipe} value={idMembroEquipe}>{nomeMembroEquipe}</option>)}
        </select>
      </label>
    </>
  )
}
