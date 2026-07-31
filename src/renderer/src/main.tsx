import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// La fuente de los valores con nombre, importada del sistema de diseno tal cual.
// Del lado del codigo no hay copia: si esta linea se rompe, se nota al abrir la app.
import '../../../design/fundamentos/valores.css'
import { App } from './App'

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
