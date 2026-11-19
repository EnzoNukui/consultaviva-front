import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const proxyDemas = {
  '/api/demas': {
    target: 'https://apidadosabertos.saude.gov.br',
    changeOrigin: true,
    rewrite: (caminho: string) => caminho.replace(/^\/api\/demas(?=\/|$)/, ''),
    proxyTimeout: 30_000,
    timeout: 30_000,
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: proxyDemas },
  preview: { proxy: proxyDemas },
})
