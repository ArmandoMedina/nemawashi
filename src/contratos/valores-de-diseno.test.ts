import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato de los valores con nombre.
 *
 * `arquitectura-diseno.md` §4: un valor vive en un solo lugar, porque dos copias del
 * mismo numero divergen en cuanto una se edita. Las paginas del sistema llevan su copia
 * dentro a proposito —cada una tiene que abrir sola—, asi que lo que impide la
 * divergencia no puede ser la disciplina. Es esta prueba.
 *
 * No ejecuta nada: lee el texto y compara numero contra numero.
 *
 * Compara **en los dos sentidos**, bloque por bloque: no basta con que lo que la pagina
 * declara coincida, porque entonces una pagina que pierde valores no choca con nada —no
 * tiene con que chocar— y se queda a medias en silencio. Un valor que la fuente declara y
 * la pagina no, es divergencia igual que un numero cambiado.
 */

type Tema = 'claro' | 'oscuro'
type Valores = Record<string, string>

const RAIZ = resolve(process.cwd())
const FUENTE = join(RAIZ, 'design/fundamentos/valores.css')

/** Devuelve el bloque `{...}` que empieza en `abre`, con las llaves balanceadas. */
function bloqueDesde(texto: string, abre: number): { cuerpo: string; fin: number } {
  let hondo = 0
  for (let i = abre; i < texto.length; i++) {
    if (texto[i] === '{') hondo++
    else if (texto[i] === '}') {
      hondo--
      if (hondo === 0) return { cuerpo: texto.slice(abre + 1, i), fin: i }
    }
  }
  return { cuerpo: '', fin: texto.length }
}

/** Los tramos del archivo que viven dentro de un `@media` de tema oscuro. */
function tramosOscuros(texto: string): Array<[number, number]> {
  const tramos: Array<[number, number]> = []
  const marca = /@media[^{]*prefers-color-scheme:\s*dark[^{]*\{/g
  let m: RegExpExecArray | null
  while ((m = marca.exec(texto)) !== null) {
    const abre = m.index + m[0].length - 1
    tramos.push([abre, bloqueDesde(texto, abre).fin])
  }
  return tramos
}

function declaraciones(cuerpo: string): Valores {
  const valores: Valores = {}
  const decl = /--([\w-]+)\s*:\s*([^;}]+)/g
  let m: RegExpExecArray | null
  while ((m = decl.exec(cuerpo)) !== null) {
    valores[`--${m[1]}`] = m[2]!.trim()
  }
  return valores
}

type Bloque = { tema: Tema; etiqueta: string; valores: Valores }

/**
 * Los bloques de valores que un archivo declara, cada uno por separado.
 *
 * Por separado y no fundidos a proposito: un archivo declara el mismo tema en dos
 * bloques —el de base y el de `data-theme`—, y si se funden, el segundo tapa al primero.
 * Un numero mal escrito en uno de los dos pasaria inadvertido, que es exactamente lo
 * que esta prueba existe para impedir.
 */
function bloquesDe(ruta: string): Bloque[] {
  const texto = readFileSync(ruta, 'utf8')
  const oscuros = tramosOscuros(texto)
  const bloques: Bloque[] = []

  const marca = /:root(?:\[data-theme="(dark|light)"\])?\s*\{/g
  let m: RegExpExecArray | null
  while ((m = marca.exec(texto)) !== null) {
    const abre = m.index + m[0].length - 1
    const { cuerpo } = bloqueDesde(texto, abre)

    const marcado = m[1]
    const dentroDeOscuro = oscuros.some(([a, b]) => m!.index > a && m!.index < b)
    const tema: Tema = marcado ? (marcado === 'dark' ? 'oscuro' : 'claro') : dentroDeOscuro ? 'oscuro' : 'claro'
    const etiqueta = marcado
      ? `:root[data-theme="${marcado}"]`
      : dentroDeOscuro
        ? ':root dentro del @media oscuro'
        : ':root de base'

    bloques.push({ tema, etiqueta, valores: declaraciones(cuerpo) })
  }
  return bloques
}

/** La referencia por tema, fundida — la fuente sí puede fundirse, y se comprueba aparte. */
function referencia(ruta: string): Record<Tema, Valores> {
  const salida: Record<Tema, Valores> = { claro: {}, oscuro: {} }
  for (const b of bloquesDe(ruta)) Object.assign(salida[b.tema], b.valores)
  return salida
}

/**
 * Todas las paginas del sistema de diseno.
 *
 * Se recorre `design/` entero en vez de nombrar las carpetas y contar las paginas: una
 * cifra copiada a mano pondria rojo el suite el dia que naciera una decima pagina
 * legitima, que es exactamente al reves de lo que esta prueba quiere. Recorriendo, una
 * pagina nueva entra sola a la revision y una carpeta nueva no se queda fuera en
 * silencio.
 */
function paginasDelSistema(): string[] {
  const rutas: string[] = []

  const recorrer = (dir: string): void => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const ruta = join(dir, entrada.name)
      if (entrada.isDirectory()) recorrer(ruta)
      else if (entrada.name.endsWith('.html')) rutas.push(ruta)
    }
  }

  recorrer(join(RAIZ, 'design'))
  return rutas.sort()
}

/**
 * Los bloques de un archivo, buscables por su etiqueta.
 *
 * Dos bloques con la misma etiqueta no se funden: se devuelven los dos, para que la
 * comparacion los vea y no se quede con el ultimo.
 */
function porEtiqueta(bloques: Bloque[]): Map<string, Valores[]> {
  const mapa = new Map<string, Valores[]>()
  for (const b of bloques) mapa.set(b.etiqueta, [...(mapa.get(b.etiqueta) ?? []), b.valores])
  return mapa
}

const fuente = referencia(FUENTE)
const bloquesDeLaFuente = porEtiqueta(bloquesDe(FUENTE))
const paginas = paginasDelSistema()

/** Compara un bloque contra la referencia de su tema y devuelve sólo lo que no cuadra. */
function loQueNoCuadra(bloque: Bloque): Record<string, { pagina: string; fuente: string | undefined }> {
  const diferencias: Record<string, { pagina: string; fuente: string | undefined }> = {}
  for (const [nombre, valor] of Object.entries(bloque.valores)) {
    const esperado = fuente[bloque.tema][nombre]
    if (esperado !== valor) diferencias[nombre] = { pagina: valor, fuente: esperado }
  }
  return diferencias
}

describe('la fuente de los valores con nombre', () => {
  it('declara los dos temas', () => {
    expect(Object.keys(fuente.claro).length).toBeGreaterThan(10)
    expect(Object.keys(fuente.oscuro).length).toBeGreaterThan(5)
  })

  it('no se contradice a si misma: sus bloques del mismo tema dicen lo mismo', () => {
    for (const bloque of bloquesDe(FUENTE)) {
      expect(loQueNoCuadra(bloque), `${bloque.etiqueta} de la fuente`).toEqual({})
    }
  })

  it('encuentra las paginas del sistema — si deja de encontrarlas, no pasa en silencio', () => {
    expect(paginas.length).toBeGreaterThan(0)
  })

  it('declara cada bloque una sola vez, para que la comparacion no se quede con el ultimo', () => {
    for (const [etiqueta, apariciones] of bloquesDeLaFuente) {
      expect(apariciones.length, `${etiqueta} de la fuente`).toBe(1)
    }
  })
})

describe.each(paginas.map((r) => [relative(RAIZ, r).replace(/\\/g, '/'), r] as const))(
  'los valores de %s',
  (_nombre, ruta) => {
    const bloques = porEtiqueta(bloquesDe(ruta))

    it('declara los mismos bloques que la fuente, ni uno mas ni uno menos', () => {
      expect([...bloques.keys()].sort()).toEqual([...bloquesDeLaFuente.keys()].sort())
    })

    it('cada bloque dice exactamente lo que la fuente dice, sin faltarle ni sobrarle un valor', () => {
      for (const [etiqueta, deLaFuente] of bloquesDeLaFuente) {
        expect(bloques.get(etiqueta), etiqueta).toEqual(deLaFuente)
      }
    })
  }
)
