import type { ComponentPropsWithoutRef } from 'react'
import type { IconType } from 'react-icons'
import { FiLoader } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const variantes = {
  primario: 'bg-turquesa text-azul-profundo hover:bg-ciano',
  secundario: 'border border-azul-profundo/35 text-azul-profundo hover:bg-turquesa/10',
  contornoTurquesa: 'border border-turquesa-escuro text-turquesa-escuro hover:bg-turquesa/10',
  discreto: 'border border-azul-profundo/50 bg-transparent text-azul-profundo hover:bg-turquesa/10',
  critico: 'bg-critico text-superficie hover:brightness-90',
  claro: 'border border-azul-profundo/50 bg-superficie text-azul-profundo shadow-sm hover:bg-fundo',
  escuro: 'bg-azul-profundo text-superficie hover:bg-turquesa-escuro',
}

type AparenciaBotao = {
  texto: string
  variante?: keyof typeof variantes
  icone?: IconType
  posicaoIcone?: 'esquerda' | 'direita'
  carregando?: boolean
  desabilitado?: boolean
  tamanho?: 'padrao' | 'grande'
}

type BotoesProps = AparenciaBotao & (
  | { para: string; tipo?: never; onClick?: ComponentPropsWithoutRef<'a'>['onClick'] }
  | {
      para?: never
      tipo?: ComponentPropsWithoutRef<'button'>['type']
      onClick?: ComponentPropsWithoutRef<'button'>['onClick']
    }
)

export default function Botoes({
  texto,
  variante = 'primario',
  icone,
  posicaoIcone = 'esquerda',
  carregando = false,
  desabilitado = false,
  tamanho = 'padrao',
  para,
  tipo,
  onClick,
}: BotoesProps) {
  const bloqueado = carregando || desabilitado
  const Icone = carregando ? FiLoader : icone
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-full text-center leading-5 font-bold transition-colors',
    tamanho === 'grande' ? 'min-h-14 px-7 py-4 text-base' : 'min-h-11 px-6 py-3 text-sm',
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turquesa',
    bloqueado ? 'pointer-events-none opacity-60' : 'cursor-pointer',
    variantes[variante],
  ].join(' ')
  const iconeRenderizado = Icone && (
    <Icone
      aria-hidden="true"
      className={carregando ? 'size-4 shrink-0 motion-safe:animate-spin' : 'size-4 shrink-0'}
    />
  )
  const conteudo = (
    <>
      {posicaoIcone === 'esquerda' && iconeRenderizado}
      {texto}
      {posicaoIcone === 'direita' && iconeRenderizado}
    </>
  )

  if (typeof para === 'string') {
    if (bloqueado) {
      return (
        <span role="link" aria-disabled="true" aria-busy={carregando || undefined} className={classes}>
          {conteudo}
        </span>
      )
    }

    if (para.startsWith('#')) {
      return (
        <a href={para} onClick={onClick} className={classes}>
          {conteudo}
        </a>
      )
    }

    return (
      <Link to={para} onClick={onClick} className={classes}>
        {conteudo}
      </Link>
    )
  }

  return (
    <button
      type={tipo ?? 'button'}
      onClick={onClick}
      disabled={bloqueado}
      aria-busy={carregando || undefined}
      className={classes}
    >
      {conteudo}
    </button>
  )
}
