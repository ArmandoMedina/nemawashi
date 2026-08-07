import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { encontrarDatoPersonal } from '../nucleo/sin-dato-personal'
import { revisarPieza, encontrarRutaDeMaquina, type Falla, type TipoDePieza } from '../nucleo/el-conocimiento-no-se-escapa'
import {
  aristasDelGrafo,
  revisarElGrafo,
  claveDeDeuda as claveDeDeudaDeEnlace,
  type PiezaLeida
} from '../nucleo/el-enlace-va-en-los-dos-sentidos'

/**
 * Contrato: ninguna pieza de `product/conocimiento/` se escapa.
 *
 * La capa 1 prueba las cuatro reglas con datos a la medida. Esta prueba las aplica a los
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

/**
 * Todas las piezas de verdad, para el grafo. `piezasDe` es la unica que decide que archivo
 * cuenta y cual no -un segundo lector con otro criterio es el dia que uno de los dos cambie
 * una pieza y quede fuera sin que nada avise. La ruta va relativa al repositorio y con
 * barras normales: es la que se escribe en `DEUDA_DE_ENLACE`, y no empieza con letra de
 * unidad.
 */
const TODAS: PiezaLeida[] = (['dominio', 'modulo', 'capacidad', 'regla'] as const).flatMap((tipo) =>
  piezasDe(tipo).map((archivo) => ({
    ruta: archivo.slice(RAIZ.length + 1).split('\\').join('/'),
    tipo,
    texto: readFileSync(archivo, 'utf8')
  }))
)

/**
 * Deuda del enlace: aristas que hoy no cierran en el registro -de un solo lado, o apuntando a
 * un id que nadie ha escrito- y en una linea de negocio por que siguen asi. Igual que
 * `DEUDA_DE_FORMA`, cierra por los dos lados: si la falla sigue, el suite no truena; si la
 * falla ya no esta, esta misma prueba avisa.
 *
 * Un `id-inexistente` se declara aqui y no se tapa creando la pieza que falta: un modulo
 * escrito para que el grafo cierre es un corte que nadie levanto, y el registro dejaria de
 * distinguir lo que se escucho de lo que se invento para pasar la prueba. La cita se queda
 * apuntando al hueco, con nombre, hasta que una sesion diga de que cuelga.
 */
const DEUDA_DE_ENLACE: Record<string, string> = {
  'product/conocimiento/capacidades/0015-instalar-y-abrir-como-cualquier-programa.md enlace-de-un-solo-lado reglas:REG-0001':
    'la capacidad cita la regla de instalarse como cualquier programa, y esa regla solo devuelve la cita a la capacidad de escoger o crear proyecto',
  'product/conocimiento/capacidades/0016-construir-hablando-el-mapa-del-sistema.md enlace-de-un-solo-lado reglas:REG-0001':
    'la capacidad cita la misma regla de instalarse como cualquier programa, que tampoco la devuelve',
  'product/conocimiento/dominios/0001-el-levantamiento-hablado-del-negocio.md enlace-de-un-solo-lado modulos:MOD-0002':
    'el dominio cita el modulo del registro de lo dicho, que no declara ningun dominio de vuelta',
  'product/conocimiento/dominios/0001-el-levantamiento-hablado-del-negocio.md enlace-de-un-solo-lado modulos:MOD-0004':
    'el dominio cita el modulo del programa en manos de quien no sabe, que declara el campo dominio vacio',
  'product/conocimiento/modulos/0004-el-programa-en-manos-de-quien-no-sabe.md enlace-de-un-solo-lado capacidades:CAP-0015':
    'el modulo cita la capacidad de instalar y abrir el programa, que declara el campo modulo vacio',
  'product/conocimiento/reglas/0027-el-experto-platica-directo-con-la-ia.md sin-quien-lo-contenga capacidades:':
    'la regla dice que el experto platica directo con la ia porque le sigue el ritmo, y en el levantamiento nadie dijo de que capacidad cuelga; colgarla de una seria inventar el enlace',
  'product/conocimiento/capacidades/0035-detener-la-corrida-sin-materia-prima.md id-inexistente modulo:MOD-0012':
    'detener la corrida cuando no llega materia prima cuelga del modulo de como se comporta la corrida del molino, que ninguna sesion ha levantado',
  'product/conocimiento/capacidades/0037-seguir-la-corrida-si-falla-una-medicion.md id-inexistente modulo:MOD-0012':
    'seguir la corrida aunque reviente una medicion cuelga del mismo modulo de la corrida, todavia sin escribir',
  'product/conocimiento/capacidades/0038-retomar-la-corrida-interrumpida.md id-inexistente modulo:MOD-0012':
    'retomar lo interrumpido cuelga del mismo modulo de la corrida, todavia sin escribir',
  'product/conocimiento/capacidades/0039-repetir-un-paso-que-escribe-sin-ensuciar.md id-inexistente modulo:MOD-0012':
    'repetir un paso que escribe sin dejar basura cuelga del mismo modulo de la corrida, todavia sin escribir',
  'product/conocimiento/capacidades/0040-recoger-lo-tirado-por-la-marca-de-la-corrida.md id-inexistente modulo:MOD-0012':
    'recoger lo tirado por la marca de la corrida cuelga del mismo modulo de la corrida, todavia sin escribir',
  'product/conocimiento/capacidades/0041-abrir-a-ojo-el-conocimiento-escrito.md id-inexistente modulo:MOD-0012':
    'abrir a ojo lo ya escrito cuelga del mismo modulo de la corrida, todavia sin escribir',
  'product/conocimiento/capacidades/0054-moler-una-platica-exportada-de-la-nube.md id-inexistente modulo:MOD-0012':
    'moler una platica traida de fuera cuelga del mismo modulo de la corrida, todavia sin escribir',
  'product/conocimiento/capacidades/0053-ver-dibujado-lo-que-hoy-solo-se-lee.md id-inexistente modulo:MOD-0015':
    'ver dibujado lo que hoy solo se lee cuelga del modulo de las pantallas donde se ve y se ajusta lo que vive en texto, reservado desde el 2026-08-06 y todavia sin escribir',
  'product/conocimiento/dominios/0005-el-rumbo-del-propio-proyecto.md id-inexistente modulos:MOD-0015':
    'el dominio nombra ese mismo modulo de las pantallas como el tercero de sus tres pedazos, y lo lista antes de que exista'
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

describe('el enlace va en los dos sentidos, en el grafo de verdad', () => {
  const fallas = revisarElGrafo(TODAS)

  it('ninguna falla nueva sin declarar como deuda', () => {
    const sinDeclarar = fallas.filter((f) => DEUDA_DE_ENLACE[claveDeDeudaDeEnlace(f)] === undefined)
    if (sinDeclarar.length > 0) {
      const detalle = sinDeclarar
        .map((f) => `  ${f.ruta} ${f.clave} campo ${f.campo}, citado "${f.citado}"`)
        .join('\n')
      throw new Error(`${sinDeclarar.length} enlace(s) roto(s) sin declarar en DEUDA_DE_ENLACE:\n${detalle}`)
    }
  })

  it('la deuda ya cerrada se saca de la lista', () => {
    const llavesVivas = new Set(fallas.map(claveDeDeudaDeEnlace))
    for (const llave of Object.keys(DEUDA_DE_ENLACE)) {
      if (!llavesVivas.has(llave)) {
        throw new Error(`${llave} ya cumple -sacala de DEUDA_DE_ENLACE (traia: ${DEUDA_DE_ENLACE[llave]})`)
      }
    }
  })

  it('un piso de aristas: si esto cae, algo del recorrido se rompio en silencio', () => {
    expect(aristasDelGrafo(TODAS).length).toBeGreaterThan(60)
  })
})
