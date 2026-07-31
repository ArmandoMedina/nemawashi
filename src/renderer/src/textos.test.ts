import { describe, it, expect } from 'vitest'
import { CLAVES_DE_AVISO } from '../../nucleo/salud-del-repo'
import { TEXTOS_DE_AVISO, TEXTOS_DEL_ANDAMIO } from './textos'

/**
 * La logica sola: entrada exacta, salida exacta. Sin ventana y sin disco.
 *
 * El tipo ya obliga a que no falte ninguna clave, pero no alcanza para dos cosas que sí
 * duelen: una clave que sobra porque el nucleo dejo de levantarla —texto muerto que nadie
 * borra— y un texto presente pero vacio, que compila igual de bien y deja al experto
 * mirando un aviso en blanco.
 */

describe('el modulo de textos viste los avisos del nucleo', () => {
  it('tiene palabras para cada aviso que el nucleo puede levantar, y para ninguno mas', () => {
    expect(Object.keys(TEXTOS_DE_AVISO).sort()).toEqual([...CLAVES_DE_AVISO].sort())
  })

  it('ningun aviso se queda sin titulo ni sin detalle', () => {
    for (const [clave, texto] of Object.entries(TEXTOS_DE_AVISO)) {
      expect(texto.titulo.trim(), `titulo de ${clave}`).not.toBe('')
      expect(texto.detalle.trim(), `detalle de ${clave}`).not.toBe('')
    }
  })
})

describe('las palabras del andamio', () => {
  it('la version que se muestra lleva dentro el numero que llego', () => {
    expect(TEXTOS_DEL_ANDAMIO.version('9.9.9')).toContain('9.9.9')
  })
})
