import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { FiX } from 'react-icons/fi'
import type { MembroEquipe } from '../../types/membroEquipe'
import type { Unidade } from '../../types/unidade'

export const campoAgenda = 'mt-1.5 block min-h-11 w-full min-w-0 rounded-lg border border-azul-profundo/25 bg-superficie px-3 py-2 text-body-small font-normal text-azul-profundo focus-visible:outline-2 focus-visible:outline-turquesa-escuro'

export function FiltrosDeLocal({ unidades, profissionais, unidade, profissional, aoFiltrarUnidade, aoFiltrarProfissional }: {
  unidades: Unidade[]
  profissionais: MembroEquipe[]
  unidade: string
  profissional: string
  aoFiltrarUnidade: (id: string) => void
  aoFiltrarProfissional: (id: string) => void
}) {
  return (
    <>
      <label className="min-w-0 text-body-small font-bold">Unidade
        <select className={campoAgenda} value={unidade} onChange={(evento) => aoFiltrarUnidade(evento.target.value)}>
          <option value="">Todas as unidades</option>
          {unidades.map(({ idUnidade, nomeUnidade }) => <option key={idUnidade} value={idUnidade}>{nomeUnidade}</option>)}
        </select>
      </label>
      <label className="min-w-0 text-body-small font-bold">Profissional
        <select className={campoAgenda} value={profissional} onChange={(evento) => aoFiltrarProfissional(evento.target.value)}>
          <option value="">Todos os profissionais</option>
          {profissionais.map(({ idMembroEquipe, nomeMembroEquipe }) => <option key={idMembroEquipe} value={idMembroEquipe}>{nomeMembroEquipe}</option>)}
        </select>
      </label>
    </>
  )
}

export function DialogoAgendaEquipe({ titulo, ocupado, erro, aoFechar, children }: {
  titulo: string
  ocupado: boolean
  erro: string
  aoFechar: () => void
  children: ReactNode
}) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const elemento = dialogo.current
    elemento?.showModal()
    tituloRef.current?.focus()
    return () => elemento?.close()
  }, [])

  return (
    <dialog ref={dialogo} aria-labelledby="titulo-dialogo-agenda"
      onCancel={(evento) => {
        evento.preventDefault()
        if (!ocupado) aoFechar()
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[34rem] max-w-[calc(100%-2rem)] overflow-y-auto rounded-xl border border-azul-profundo/15 bg-superficie p-4 text-azul-profundo backdrop:bg-azul-profundo/45 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 ref={tituloRef} id="titulo-dialogo-agenda" tabIndex={-1} className="text-h3 focus:outline-none">{titulo}</h2>
        <button type="button" aria-label="Fechar" onClick={aoFechar} disabled={ocupado}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-md border border-azul-profundo/20 hover:bg-menta focus-visible:outline-2 focus-visible:outline-turquesa-escuro disabled:opacity-50">
          <FiX aria-hidden="true" className="size-5" />
        </button>
      </div>
      {erro && <p role="alert" className="mb-4 rounded-lg bg-critico/10 px-3 py-2 text-body-small text-critico">{erro}</p>}
      {children}
    </dialog>
  )
}

