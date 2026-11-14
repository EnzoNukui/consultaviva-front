import { useEffect } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Navigate, useParams } from 'react-router-dom'
import fotoArthur from '../../../assets/integrantes/foto_arthur.jpeg'
import fotoDiego from '../../../assets/integrantes/foto_diego.jpg'
import fotoEnzo from '../../../assets/integrantes/foto_enzo.jpeg'
import fotoLeticia from '../../../assets/integrantes/foto_leticia_cardoso.jpeg'
import Botoes from '../../../components/Botoes/Botoes'
import CardIntegrantes from '../../../components/CardIntegrantes/CardIntegrantes'

const integrantes = [
  {
    nome: 'Arthur Carvalho Brito Martins',
    rm: '572325',
    turma: '1TDSPH',
    foto: fotoArthur,
    github: 'https://github.com/arthurmartinss',
    linkedin: 'https://www.linkedin.com/in/arthur-martinss/',
  },
  {
    nome: 'Diego Soares Trujillo',
    rm: '570147',
    turma: '1TDSPH',
    foto: fotoDiego,
    github: 'https://github.com/diegotrujillo011',
    linkedin: 'https://www.linkedin.com/in/diego-trujillo-3441b9380/',
  },
  {
    nome: 'Eduardo Damasio Guelere',
    rm: '569960',
    turma: '1TDSPH',
    github: 'https://github.com/Eduardoguelere',
    linkedin: 'https://www.linkedin.com/in/eduardo-guelere-0902753b8/',
  },
  {
    nome: 'Enzo Nukui da Silva',
    rm: '569770',
    turma: '1TDSPH',
    foto: fotoEnzo,
    github: 'https://github.com/EnzoNukui',
    linkedin: 'https://www.linkedin.com/in/enzo-nukui/',
  },
  {
    nome: 'Leticia Cardoso de Almeida',
    rm: '569415',
    turma: '1TDSPH',
    foto: fotoLeticia,
    github: 'https://github.com/lehalmeidafc0',
    linkedin: 'https://www.linkedin.com/in/let%C3%ADcia-almeida-70b851294/',
  },
]

export default function Integrantes() {
  const { rm } = useParams()
  const integrante = integrantes.find((pessoa) => pessoa.rm === rm)
  const titulo = integrante?.nome ?? 'Integrantes'

  useEffect(() => {
    const tituloAnterior = document.title
    document.title = `${titulo} | ConsultaViva`

    return () => {
      document.title = tituloAnterior
    }
  }, [titulo])

  if (rm && !integrante) {
    return <Navigate to="/integrantes" replace />
  }

  if (integrante) {
    return (
      <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:py-24">
        <Botoes texto="Voltar para integrantes" para="/integrantes" variante="secundario" icone={FiArrowLeft} />
        <div className="mt-8 sm:mt-10">
          <CardIntegrantes {...integrante} destaque />
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="titulo-integrantes" className="bg-fundo">
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
          <h1 id="titulo-integrantes" className="text-display">Equipe do projeto</h1>
          <p className="max-w-xs text-body-large text-azul-profundo/80">
            Conheça quem desenvolveu a ConsultaViva para a Global Solution 2026 da FIAP.
          </p>
        </div>

        <ul className="mt-9 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          {integrantes.map((pessoa) => (
            <li key={pessoa.rm} className="min-w-0">
              <CardIntegrantes {...pessoa} perfil={`/integrantes/${pessoa.rm}`} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
