import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { useGame, volatile } from './store/useGame'

if (import.meta.env.DEV) {
  ;(window as unknown as { __game: unknown }).__game = { useGame, volatile }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
