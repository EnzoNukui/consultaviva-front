import { NavLink } from 'react-router-dom'

const secoes = {
  resgate: [
    { texto: 'Solicitações', caminho: '/equipe/solicitacoes' },
    { texto: 'Propostas', caminho: '/equipe/propostas' },
  ],
  cadastros: [
    { texto: 'Pacientes', caminho: '/equipe/pacientes' },
    { texto: 'Unidades', caminho: '/equipe/unidades' },
  ],
}

export default function NavegacaoEquipe({ secao }: { secao: keyof typeof secoes }) {
  return (
    <nav aria-label={secao === 'resgate' ? 'Motor de Resgate' : 'Cadastros'} className="mb-6 flex gap-5 border-b border-azul-profundo/15">
      {secoes[secao].map(({ texto, caminho }) => (
        <NavLink key={caminho} to={caminho}
          className="flex min-h-11 items-center border-b-2 border-transparent px-1 text-body-small font-semibold hover:text-turquesa-escuro focus-visible:outline-2 focus-visible:outline-turquesa-escuro aria-[current=page]:border-turquesa-escuro aria-[current=page]:font-bold aria-[current=page]:text-turquesa-escuro">
          {texto}
        </NavLink>
      ))}
    </nav>
  )
}
