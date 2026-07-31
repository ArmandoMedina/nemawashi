import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import ts from 'typescript'
import { describe, it, expect } from 'vitest'

/**
 * El contrato de los puntos 1 y 2 de `arquitectura-diseno.md` §3. No ejecuta nada: lee el
 * codigo y comprueba dos hechos estructurales sobre los componentes de la pantalla.
 *
 * - **Ningun texto visible escrito dentro de un componente**: todo texto sale del modulo
 *   de textos. Un texto tecleado dentro del JSX es una copia que nadie compara contra
 *   nada — ni contra la maqueta, ni contra el resto de la app.
 * - **Ningun color y ninguna medida escritos a mano**: los valores con nombre vienen de
 *   `design/fundamentos/valores.css`, que la app importa tal cual. Un numero suelto en el
 *   codigo es una copia nueva, y las copias divergen (§4).
 *
 * Los dos son la misma falta —la pantalla escribiendo a mano lo que tiene que tomar de
 * una fuente— y por eso viven juntos: quien arregla uno esta en el archivo del otro.
 *
 * Se vigila con herramienta y no con buena voluntad, por la misma razon que
 * `valores-de-diseno.test.ts`: la disciplina no sobrevive al sexto mes.
 *
 * **Limites honestos, escritos aqui para que nadie los suponga cubiertos:**
 *
 * - Mira los `.tsx` de la pantalla, que es donde vive el JSX. Un color escondido en un
 *   `.ts` de la carpeta no lo ve. Se amplia el dia que exista uno, no antes.
 * - «Valor escrito a mano» aqui es **color y medida en pixeles**, que es lo que los
 *   documentos escriben. Una familia tipografica tecleada a mano se le escapa: eso sigue
 *   siendo revision de codigo.
 * - Que el texto que el modulo de textos guarda este **bien redactado** no se mide aqui.
 *   Esto comprueba de donde sale la palabra, no que la palabra sea buena.
 */

const COMPONENTES = 'src/renderer/src'
const RAIZ = resolve(process.cwd())

function componentesDeLaPantalla(): string[] {
  const encontrados: string[] = []

  const recorrer = (dir: string): void => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      const ruta = join(dir, entrada.name)
      if (entrada.isDirectory()) recorrer(ruta)
      else if (entrada.name.endsWith('.tsx') && !entrada.name.endsWith('.test.tsx')) {
        encontrados.push(ruta)
      }
    }
  }

  recorrer(join(RAIZ, COMPONENTES))
  return encontrados.sort()
}

function leer(ruta: string): ts.SourceFile {
  return ts.createSourceFile(ruta, readFileSync(ruta, 'utf8'), ts.ScriptTarget.Latest, true)
}

function nombre(ruta: string): string {
  return relative(RAIZ, ruta).replace(/\\/g, '/')
}

/** Un literal de cadena o de plantilla, con el texto que trae escrito dentro. */
function textoDelLiteral(nodo: ts.Node): string | undefined {
  if (ts.isStringLiteralLike(nodo)) return nodo.text
  if (ts.isTemplateExpression(nodo)) {
    return [nodo.head.text, ...nodo.templateSpans.map((s) => s.literal.text)].join(' ')
  }
  return undefined
}

/**
 * Todo texto que un componente pone a la vista sin pedirselo al modulo de textos.
 *
 * Se mira lo que cae **dentro** de un elemento JSX: el texto suelto entre etiquetas y
 * cualquier literal dentro de una expresion hija —tambien el que se esconde en un ternario
 * o en una plantilla—.
 *
 * Los atributos quedan fuera a proposito, y hay que decirlo por escrito porque la
 * distincion no se ve: en el arbol, `style={{...}}` y `{saludo}` son los dos una expresion
 * JSX, y lo unico que los separa es de quien cuelgan. `data-prueba`, `key` o un objeto de
 * estilo no son texto que nadie lea en pantalla; que el estilo no traiga valores a mano lo
 * mide la otra prueba de este archivo.
 */
function textoEscritoDentroDelComponente(ruta: string): string[] {
  const hallados: string[] = []

  const dentroDeUnaExpresionHija = (nodo: ts.Node): void => {
    const texto = textoDelLiteral(nodo)
    if (texto !== undefined && texto.trim() !== '') hallados.push(texto.trim())
    ts.forEachChild(nodo, dentroDeUnaExpresionHija)
  }

  const visitar = (nodo: ts.Node): void => {
    if (ts.isJsxText(nodo) && nodo.text.trim() !== '') hallados.push(nodo.text.trim())
    if (ts.isJsxExpression(nodo) && nodo.expression && !ts.isJsxAttribute(nodo.parent)) {
      dentroDeUnaExpresionHija(nodo.expression)
    }
    ts.forEachChild(nodo, visitar)
  }

  visitar(leer(ruta))
  return hallados
}

/** Un color escrito a mano, o una medida en pixeles —o en su parentela— tecleada suelta. */
const VALOR_A_MANO = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(|\d(?:\.\d+)?(?:px|rem|em|pt)\b/i

function valoresEscritosAMano(ruta: string): string[] {
  const hallados: string[] = []

  const visitar = (nodo: ts.Node): void => {
    const texto = textoDelLiteral(nodo)
    if (texto !== undefined && VALOR_A_MANO.test(texto)) hallados.push(texto)
    ts.forEachChild(nodo, visitar)
  }

  visitar(leer(ruta))
  return hallados
}

const componentes = componentesDeLaPantalla()

/** Lo hallado en toda la pantalla, con el archivo que lo dispara delante. */
function porTodaLaPantalla(buscar: (ruta: string) => string[]): string[] {
  return componentes.flatMap((r) => buscar(r).map((h) => `${nombre(r)} → «${h}»`)).sort()
}

describe('la pantalla no escribe a mano lo que tiene que tomar de una fuente', () => {
  it('ningun texto visible esta escrito dentro de un componente: todo sale del modulo de textos', () => {
    expect(porTodaLaPantalla(textoEscritoDentroDelComponente)).toEqual([])
  })

  it('ningun color y ninguna medida estan escritos a mano: salen de los valores con nombre', () => {
    expect(porTodaLaPantalla(valoresEscritosAMano)).toEqual([])
  })

  it('la prueba encuentra la pantalla — si deja de encontrarla, no pasa en silencio', () => {
    expect(componentes.length).toBeGreaterThan(0)
  })
})
