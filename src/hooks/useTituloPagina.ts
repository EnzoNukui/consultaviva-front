import { useEffect } from 'react'

const NOME_DO_SITE = 'ConsultaViva'

// Atualiza o título da aba e restaura o anterior quando a página sai de cena.
// Sem título, a aba mostra apenas o nome do site.
export function useTituloPagina(titulo?: string) {
  useEffect(() => {
    const tituloAnterior = document.title
    document.title = titulo ? `${titulo} | ${NOME_DO_SITE}` : NOME_DO_SITE

    return () => {
      document.title = tituloAnterior
    }
  }, [titulo])
}
