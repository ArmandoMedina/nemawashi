import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { revisarItem, type ClaseDeItem, type Falla } from '../nucleo/el-item-va-flaco'

/**
 * Contrato: ningun item del roadmap ni del backlog engorda.
 *
 * La capa 1 prueba la regla con datos a la medida. Esta prueba la aplica a los archivos
 * de verdad, que es donde el engorde ocurre: nadie escribe un item gordo a proposito,
 * se llega ahi renglon por renglon.
 *
 * No opina: lee un hecho estructural y siempre contesta lo mismo.
 */

const RAIZ = join(__dirname, '..', '..')

function itemsDe(clase: ClaseDeItem): string[] {
  const carpeta = join(RAIZ, clase)
  if (!existsSync(carpeta)) return []
  return readdirSync(carpeta)
    .filter((n) => n.endsWith('.md') && /^\d{4}-/.test(n))
    .map((n) => join(carpeta, n))
}

function comoTexto(fallas: Falla[]): string {
  return fallas.map((f) => (f.detalle ? `${f.clave} (${f.detalle})` : f.clave)).join(', ')
}

describe('el item va flaco, en los archivos de verdad', () => {
  for (const clase of ['roadmap', 'backlog'] as const) {
    describe(clase, () => {
      const archivos = itemsDe(clase)

      it('la plantilla existe, porque es la forma que todos copian', () => {
        expect(archivos.some((a) => a.endsWith('0000-plantilla.md'))).toBe(true)
      })

      // La plantilla entra al examen a proposito: si ella sola se saliera de la forma
      // que predica, cada item nuevo naceria fuera del contrato.
      for (const archivo of archivos) {
        const nombre = archivo.slice(RAIZ.length + 1)
        it(`${nombre} cumple la forma`, () => {
          const fallas = revisarItem(readFileSync(archivo, 'utf8'), clase)
          expect(comoTexto(fallas)).toBe('')
        })
      }
    })
  }

  it('los identificadores no se repiten', () => {
    for (const clase of ['roadmap', 'backlog'] as const) {
      const vistos = new Map<string, string>()
      for (const archivo of itemsDe(clase)) {
        const id = readFileSync(archivo, 'utf8').match(/^id:\s*(\S+)/m)?.[1]
        if (!id) continue
        expect(vistos.has(id), `${id} ya lo usa ${vistos.get(id)}`).toBe(false)
        vistos.set(id, archivo.slice(RAIZ.length + 1))
      }
    }
  })
})
