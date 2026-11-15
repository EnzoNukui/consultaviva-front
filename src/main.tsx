import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import SessaoProvider from './components/SessaoProvider/SessaoProvider'
import './globals.css'
import router from './routes/Routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessaoProvider>
      <RouterProvider router={router} />
    </SessaoProvider>
  </StrictMode>,
)
