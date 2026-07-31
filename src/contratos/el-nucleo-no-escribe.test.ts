import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import ts from 'typescript'
import { describe, it, expect } from 'vitest'

/**
 * El contrato de «no invadir». No ejecuta nada: lee el codigo y comprueba un hecho
 * estructural.
 *
 * §0.4.2: el repo del cliente solo recibe resultados, nunca maquinaria. Nemawashi senala y
 * quien decide es el dueno del repositorio. La forma barata de sostener que el nucleo no
 * escribe nada no es leer sus textos —una prueba de palabras prohibidas se esquiva
 * cambiando una palabra— sino mirar lo que tiene a mano: **el nucleo no puede escribir
 * porque no importa nada con que hacerlo.** Sin `node:fs`, sin proceso hijo, sin
 * Electron, la unica salida que le queda es devolver un dato.
 *
 * Es la misma regla de dependencia de §2.4 —«las flechas van siempre hacia adentro»—
 * medida desde el unico lado en el que se puede romper.
 *
 * Limite honesto, escrito aqui para que nadie lo suponga cubierto: esta prueba mide lo
 * que el nucleo *puede* hacer, no lo que sus textos *prometen*. Un aviso que ofrezca
 * arreglar el repo solo seria una promesa falsa, y eso se ve leyendo el aviso — es
 * revision de voz, no de estructura.
 */

const NUCLEO = 'src/nucleo'

/**
 * Los destinos a los que al nucleo le esta permitido apuntar.
 *
 * Los paquetes van aparte y hoy la lista esta vacia a proposito: §"El stack" concede al
 * nucleo **una sola** dependencia, la libreria de validacion de esquemas, y todavia no
 * existe. El dia que llegue se agrega aqui una linea con nombre, que es justo el momento
 * en que alguien tiene que decidirlo.
 */
const PAQUETES_PERMITIDOS: string[] = []
const CARPETAS_PERMITIDAS = ['src/nucleo', 'src/contratos']

function archivosDelNucleo(): string[] {
  const encontrados: string[] = []

  const recorrer = (dir: string): void => {
    for (const entrada of readdirSync(dir)) {
      const ruta = join(dir, entrada)
      if (statSync(ruta).isDirectory()) recorrer(ruta)
      else if (entrada.endsWith('.ts') && !entrada.endsWith('.test.ts')) encontrados.push(ruta)
    }
  }

  recorrer(resolve(process.cwd(), NUCLEO))
  return encontrados.sort()
}

/** Todo lo que un archivo trae de fuera: `import`, `export ... from`, `require` e `import()`. */
function loQueTraeDeFuera(ruta: string): string[] {
  const fuente = ts.createSourceFile(ruta, readFileSync(ruta, 'utf8'), ts.ScriptTarget.Latest, true)
  const traidos: string[] = []

  const visitar = (nodo: ts.Node): void => {
    if (
      (ts.isImportDeclaration(nodo) || ts.isExportDeclaration(nodo)) &&
      nodo.moduleSpecifier &&
      ts.isStringLiteralLike(nodo.moduleSpecifier)
    ) {
      traidos.push(nodo.moduleSpecifier.text)
    }

    const esLlamadaDeCarga =
      ts.isCallExpression(nodo) &&
      (nodo.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(nodo.expression) && nodo.expression.text === 'require'))

    if (esLlamadaDeCarga && ts.isCallExpression(nodo)) {
      const primero = nodo.arguments[0]
      traidos.push(primero && ts.isStringLiteralLike(primero) ? primero.text : nodo.getText())
    }

    ts.forEachChild(nodo, visitar)
  }

  visitar(fuente)
  return traidos
}

function esDestinoPermitido(desde: string, traido: string): boolean {
  if (!traido.startsWith('.')) return PAQUETES_PERMITIDOS.includes(traido)

  const destino = relative(resolve(process.cwd()), resolve(desde, '..', traido)).replace(/\\/g, '/')
  return CARPETAS_PERMITIDAS.some((c) => destino === c || destino.startsWith(`${c}/`))
}

const archivos = archivosDelNucleo()

/** Cada flecha que sale del nucleo hacia donde no debe, con el archivo que la dispara. */
function flechasHaciaAfuera(): string[] {
  const fuera: string[] = []
  for (const ruta of archivos) {
    for (const traido of loQueTraeDeFuera(ruta)) {
      if (!esDestinoPermitido(ruta, traido)) {
        fuera.push(`${relative(resolve(process.cwd()), ruta).replace(/\\/g, '/')} → ${traido}`)
      }
    }
  }
  return fuera.sort()
}

describe('el nucleo no escribe nada en el repositorio del cliente', () => {
  it('no tiene con que: ninguna flecha del nucleo sale hacia el disco, un proceso o Electron', () => {
    expect(flechasHaciaAfuera()).toEqual([])
  })

  it('la prueba encuentra el nucleo — si deja de encontrarlo, no pasa en silencio', () => {
    expect(archivos.length).toBeGreaterThan(0)
  })
})
