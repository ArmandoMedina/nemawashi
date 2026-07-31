import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { describe, it, expect } from 'vitest'
import { CANAL } from './mensajes'

/**
 * El contrato. No ejecuta la app: lee el codigo y comprueba un hecho estructural.
 *
 * Lo que de verdad viaja entre los dos mundos es la cadena del canal. Que los dos lados
 * declaren las mismas propiedades ya lo garantiza el tipo `Mensajes`, y comprobarlo aqui
 * seria repetir al compilador; lo que el compilador no puede ver por si solo es de donde
 * salio la cadena. Por eso esta prueba mira canales, no nombres de propiedad:
 *
 * - que el otro mundo atienda exactamente los canales de la lista,
 * - que cada mensaje de la pared viaje por su propio canal y no por el del vecino,
 * - que ningun lado escriba un canal a mano.
 */

const PRELOAD = 'src/preload/index.ts'
const MAIN = 'src/main/index.ts'

function leerArchivo(rel: string): ts.SourceFile {
  const ruta = resolve(process.cwd(), rel)
  return ts.createSourceFile(ruta, readFileSync(ruta, 'utf8'), ts.ScriptTarget.Latest, true)
}

function nombreDePropiedad(p: ts.ObjectLiteralElementLike): string | undefined {
  const n = p.name
  if (!n) return undefined
  if (ts.isIdentifier(n) || ts.isStringLiteral(n)) return n.text
  return undefined
}

/** El nombre del canal si el nodo es `CANAL.algo`; nada si es cualquier otra cosa. */
function canalNombrado(nodo: ts.Node | undefined): string | undefined {
  if (!nodo || !ts.isPropertyAccessExpression(nodo)) return undefined
  if (!ts.isIdentifier(nodo.expression) || nodo.expression.text !== 'CANAL') return undefined
  return nodo.name.text
}

/** Como se ve un canal en el reporte de un rojo: el de la lista, o el texto tal cual se escribio. */
function comoSeNombra(nodo: ts.Expression | undefined): string {
  if (!nodo) return '(sin canal)'
  return canalNombrado(nodo) ?? `escrito a mano: ${nodo.getText()}`
}

/** El primer argumento de cada llamada `objeto.metodo(...)` que hay dentro del nodo. */
function primerArgumentoDe(raiz: ts.Node, objeto: string, metodo: string): ts.Expression[] {
  const argumentos: ts.Expression[] = []

  const visitar = (nodo: ts.Node): void => {
    if (
      ts.isCallExpression(nodo) &&
      ts.isPropertyAccessExpression(nodo.expression) &&
      ts.isIdentifier(nodo.expression.expression) &&
      nodo.expression.expression.text === objeto &&
      nodo.expression.name.text === metodo
    ) {
      const primero = nodo.arguments[0]
      if (primero) argumentos.push(primero)
    }
    ts.forEachChild(nodo, visitar)
  }

  visitar(raiz)
  return argumentos
}

/** Que mensaje de la pared sale por que canal. Bien conectado es `{ version: 'version' }`. */
function laParedConectaAsi(): Record<string, string> {
  const fuente = leerArchivo(PRELOAD)
  const conexiones: Record<string, string> = {}

  const visitar = (nodo: ts.Node): void => {
    if (
      ts.isVariableDeclaration(nodo) &&
      ts.isIdentifier(nodo.name) &&
      nodo.name.text === 'nemawashi' &&
      nodo.initializer &&
      ts.isObjectLiteralExpression(nodo.initializer)
    ) {
      for (const p of nodo.initializer.properties) {
        const nombre = nombreDePropiedad(p)
        if (nombre) conexiones[nombre] = comoSeNombra(primerArgumentoDe(p, 'ipcRenderer', 'invoke')[0])
      }
    }
    ts.forEachChild(nodo, visitar)
  }

  visitar(fuente)
  return conexiones
}

/** Los canales que el otro mundo atiende. */
function loQueElMainAtiende(): string[] {
  return primerArgumentoDe(leerArchivo(MAIN), 'ipcMain', 'handle').map(comoSeNombra).sort()
}

/** Todo canal que aparece en cualquiera de los dos lados, venga de donde venga. */
function todosLosCanalesNombrados(): string[] {
  const preload = leerArchivo(PRELOAD)
  const main = leerArchivo(MAIN)
  return [
    ...primerArgumentoDe(preload, 'ipcRenderer', 'invoke'),
    ...primerArgumentoDe(main, 'ipcMain', 'handle')
  ].map(comoSeNombra)
}

const nombres = Object.keys(CANAL)
const conexionEsperada = Object.fromEntries(nombres.map((n) => [n, n]))

describe('la lista corta de mensajes con nombre', () => {
  it('la pared saca cada mensaje por su propio canal, y ninguno viaja por el del vecino', () => {
    expect(laParedConectaAsi()).toEqual(conexionEsperada)
  })

  it('el otro mundo atiende exactamente los canales de la lista, ni uno mas ni uno menos', () => {
    expect(loQueElMainAtiende()).toEqual([...nombres].sort())
  })

  it('ningun lado escribe el nombre de un canal a mano: todos salen de la lista', () => {
    expect(todosLosCanalesNombrados().filter((c) => !nombres.includes(c))).toEqual([])
  })

  it('la prueba sabe leer los archivos — si deja de encontrarlos, no pasa en silencio', () => {
    expect(Object.keys(laParedConectaAsi()).length).toBeGreaterThan(0)
    expect(loQueElMainAtiende().length).toBeGreaterThan(0)
  })
})
