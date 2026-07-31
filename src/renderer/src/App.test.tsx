// @vitest-environment happy-dom
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { App } from './App'
import { TEXTOS_DEL_ANDAMIO } from './textos'
import type { Mensajes } from '../../contratos/mensajes'

/**
 * Un pedazo de pantalla, montado suelto. Sin ventana y sin Electron.
 *
 * El otro mundo se sustituye por una respuesta falsa: lo que se prueba es la pantalla,
 * no el disco. Se busca por lo que un lector de pantalla anunciaria, no por la posicion
 * en el codigo.
 *
 * Lo que se busca se toma del modulo de textos, no se teclea aqui: escrito a mano serian
 * dos copias de la misma palabra que pueden divergir sin que nadie lo note —el mismo
 * motivo por el que los dos lados de la pared toman el canal de la lista—. Lo que se mide
 * no cambia: que exista ese encabezado y que esa version llegue a la pantalla.
 */

function conLaParedFalsa(respuestas: Partial<Mensajes>): void {
  Object.defineProperty(window, 'nemawashi', {
    value: {
      version: () => Promise.resolve('0.0.0'),
      revisarRepo: () => Promise.resolve([]),
      ...respuestas
    },
    configurable: true,
    writable: true
  })
}

afterEach(cleanup)

describe('el andamio de la ventana', () => {
  it('muestra el nombre de la app', () => {
    conLaParedFalsa({})
    render(<App />)
    expect(screen.getByRole('heading', { name: TEXTOS_DEL_ANDAMIO.nombre })).toBeTruthy()
  })

  it('pide la version al otro mundo y la muestra cuando llega', async () => {
    conLaParedFalsa({ version: () => Promise.resolve('9.9.9') })
    render(<App />)
    expect(await screen.findByText(TEXTOS_DEL_ANDAMIO.version('9.9.9'))).toBeTruthy()
  })

  it('mientras la version no llega, dice que esta cargando en vez de quedarse en blanco', () => {
    conLaParedFalsa({ version: () => new Promise<string>(() => {}) })
    render(<App />)
    expect(screen.getByText(TEXTOS_DEL_ANDAMIO.cargando)).toBeTruthy()
  })

  it('pide la version una sola vez', async () => {
    const version = vi.fn(() => Promise.resolve('1.2.3'))
    conLaParedFalsa({ version })
    render(<App />)
    await screen.findByText(TEXTOS_DEL_ANDAMIO.version('1.2.3'))
    expect(version).toHaveBeenCalledTimes(1)
  })
})
