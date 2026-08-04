import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { encontrarDatoPersonal } from '../nucleo/sin-dato-personal'
import { revisarPieza, encontrarRutaDeMaquina, type Falla, type TipoDePieza } from '../nucleo/el-conocimiento-no-se-escapa'

/**
 * Contrato: ninguna pieza de `product/conocimiento/` se escapa.
 *
 * La capa 1 prueba las tres reglas con datos a la medida. Esta prueba las aplica a los
 * archivos de verdad, que es donde el escape ocurre: nadie escribe una ruta de maquina a
 * proposito, se cuela en una corrida real del molino.
 *
 * No opina: lee un hecho estructural y siempre contesta lo mismo.
 *
 * **Las plantillas `0000-plantilla.md` no son piezas** -lo dice el README de
 * `product/conocimiento/`: una pieza es un dominio, un modulo, una capacidad o una regla, y
 * la plantilla es la forma que esas piezas copian, no una de ellas. Medirla como si fuera
 * una pieza la haria fallar por lo que no es: su frontmatter usa `AAAA-MM-DDTHH:MM:SS-06:00`
 * y textos de ejemplo a proposito, no un dato real. Por eso queda fuera del recorrido.
 */

const RAIZ = join(__dirname, '..', '..')
const CARPETA_POR_TIPO: Record<TipoDePieza, string> = {
  dominio: 'dominios',
  modulo: 'modulos',
  capacidad: 'capacidades',
  regla: 'reglas'
}

/**
 * Deuda del registro: piezas que hoy no cumplen la forma de su plantilla, y en una linea el
 * hueco que arrastran. No se arreglan aqui -ponerle dominio a un modulo o nombrar el hueco de
 * una regla es del experto, no de esta prueba- pero tampoco quedan tapadas: mientras la clave
 * siga aqui, la pieza puede seguir fallando sin tumbar el suite. El dia que la pieza se
 * corrija, esta misma prueba avisa que ya se puede sacar la clave de esta lista.
 */
const DEUDA_DE_FORMA: Record<string, string> = {
  'product/conocimiento/modulos/0001-la-sesion.md': 'el modulo no cuelga de ningun dominio',
  'product/conocimiento/modulos/0002-el-registro-de-lo-dicho.md': 'el modulo no cuelga de ningun dominio',
  'product/conocimiento/modulos/0003-la-revision-en-frio.md': 'el modulo no cuelga de ningun dominio',
  'product/conocimiento/modulos/0004-el-programa-en-manos-de-quien-no-sabe.md':
    'el modulo declara el campo dominio pero lo deja vacio',
  'product/conocimiento/capacidades/0015-instalar-y-abrir-como-cualquier-programa.md':
    'la capacidad declara el campo modulo pero lo deja vacio',
  'product/conocimiento/reglas/0007-el-caso-cabe-entero.md':
    'la regla dice con-huecos y no nombra cual es el hueco',
  'product/conocimiento/reglas/0008-antes-de-guardar-lo-lee-quien-no-estuvo.md':
    'la regla dice con-huecos y no nombra cual es el hueco',
  'product/conocimiento/reglas/0015-el-tema-se-fija-y-queda-fijo.md':
    'la regla dice con-huecos y no nombra cual es el hueco'
}

function piezasDe(tipo: TipoDePieza): string[] {
  const carpeta = join(RAIZ, 'product', 'conocimiento', CARPETA_POR_TIPO[tipo])
  return readdirSync(carpeta)
    .filter((n) => n.endsWith('.md') && n !== '0000-plantilla.md')
    .map((n) => join(carpeta, n))
}

function comoTexto(fallas: Falla[]): string {
  return fallas.map((f) => (f.detalle ? `${f.clave} (${f.detalle})` : f.clave)).join(', ')
}

describe('el conocimiento no se escapa, en los archivos de verdad', () => {
  for (const tipo of ['dominio', 'modulo', 'capacidad', 'regla'] as const) {
    describe(CARPETA_POR_TIPO[tipo], () => {
      const archivos = piezasDe(tipo)

      it('encuentra al menos una pieza que medir -si deja de encontrarlas, no pasa en silencio', () => {
        expect(archivos.length).toBeGreaterThan(0)
      })

      for (const archivo of archivos) {
        const nombre = archivo.slice(RAIZ.length + 1)
        const texto = readFileSync(archivo, 'utf8')

        it(`${nombre} cumple la forma de su plantilla`, () => {
          const claveDeDeuda = nombre.split('\\').join('/')
          const razonDeDeuda = DEUDA_DE_FORMA[claveDeDeuda]
          const fallas = comoTexto(revisarPieza(texto, tipo))

          if (razonDeDeuda === undefined) {
            expect(fallas).toBe('')
            return
          }

          if (fallas === '') {
            throw new Error(
              `${claveDeDeuda} ya cumple la forma de su plantilla -sacala de DEUDA_DE_FORMA (traia: ${razonDeDeuda})`
            )
          }
        })

        it(`${nombre} no delata la maquina donde se escribio`, () => {
          const hallazgos = encontrarRutaDeMaquina(texto, nombre)
          if (hallazgos.length > 0) {
            const detalle = hallazgos.map((h) => `  ${h.ruta}:${h.linea} ${h.fragmento}`).join('\n')
            throw new Error(`${hallazgos.length} ruta(s) de maquina en ${nombre}:\n${detalle}`)
          }
          expect(hallazgos).toEqual([])
        })

        it(`${nombre} no contiene un dato personal detectable`, () => {
          const hallazgos = encontrarDatoPersonal(texto, nombre)
          if (hallazgos.length > 0) {
            const detalle = hallazgos.map((h) => `  ${h.ruta}:${h.linea} [${h.clase}] ${h.fragmento}`).join('\n')
            throw new Error(`${hallazgos.length} dato(s) personal(es) en ${nombre}:\n${detalle}`)
          }
          expect(hallazgos).toEqual([])
        })
      }
    })
  }
})
