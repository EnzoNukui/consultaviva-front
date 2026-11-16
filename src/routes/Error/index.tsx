import { FiRefreshCw } from 'react-icons/fi'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import Botoes from '../../components/Botoes/Botoes'
import { useTituloPagina } from '../../hooks/useTituloPagina'

// O errorElement também recebe falhas de renderização e de carregamento das
// páginas lazy (por exemplo, um chunk antigo depois de um novo deploy). Nesses
// casos, "Página não encontrada" seria uma mensagem enganosa.
export default function PaginaErro() {
  const erro = useRouteError()
  const naoEncontrada = isRouteErrorResponse(erro) && erro.status === 404
  useTituloPagina(naoEncontrada ? 'Página não encontrada' : 'Erro')

  return (
    <section className="mx-auto max-w-7xl space-y-4 px-5 py-16 sm:px-8">
      <h1>{naoEncontrada ? 'Página não encontrada' : 'Não foi possível abrir esta página'}</h1>
      <p className="max-w-xl text-body-large text-azul-profundo/80">
        {naoEncontrada
          ? 'O endereço pode ter mudado ou não existe mais. Confira o link ou volte para a Home.'
          : 'Recarregue a página para tentar de novo. Se o problema continuar, volte para a Home.'}
      </p>
      <div className="flex flex-wrap gap-3">
        {!naoEncontrada && (
          <Botoes texto="Recarregar a página" icone={FiRefreshCw} onClick={() => window.location.reload()} />
        )}
        <Botoes
          texto="Voltar para a Home"
          para="/"
          variante={naoEncontrada ? 'primario' : 'secundario'}
        />
      </div>
    </section>
  )
}
