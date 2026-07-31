import { useEffect, useState } from 'react'
import type { Mensajes } from '../../contratos/mensajes'
import { TEXTOS_DEL_ANDAMIO } from './textos'

declare global {
  interface Window {
    nemawashi: Mensajes
  }
}

/**
 * Andamio. Existe para que `npm run dev` abra algo y `npm test` tenga que mirar,
 * no para ser la pantalla de arranque — esa se disena en `design/` antes de vivir aqui.
 *
 * Aun siendo andamio obedece las dos reglas que no admiten excepcion: sus palabras salen
 * del modulo de textos, y no escribe a mano ningun color ni ninguna medida — los valores
 * con nombre llegan por `main.tsx`, que importa `design/fundamentos/valores.css` tal cual.
 * Lo que queda en el estilo es armazon, no medida: donde se coloca el contenido y que
 * ocupe la ventana. Un andamio que se salta las reglas ensena a saltarselas.
 */
export function App(): React.JSX.Element {
  const [version, setVersion] = useState('')

  useEffect(() => {
    void window.nemawashi.version().then(setVersion)
  }, [])

  return (
    <main
      style={{
        fontFamily: 'var(--sans)',
        display: 'grid',
        placeContent: 'center',
        height: '100vh',
        textAlign: 'center'
      }}
    >
      <h1>{TEXTOS_DEL_ANDAMIO.nombre}</h1>
      <p data-prueba="version" style={{ color: 'var(--ink-3)' }}>
        {version ? TEXTOS_DEL_ANDAMIO.version(version) : TEXTOS_DEL_ANDAMIO.cargando}
      </p>
    </main>
  )
}
