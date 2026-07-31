import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { describe, it, expect } from 'vitest'

/**
 * El contrato de la pared. No ejecuta la app: lee el codigo y comprueba un hecho
 * estructural.
 *
 * «La pantalla no toca archivos ni procesos, nunca» no es una costumbre: son dos
 * opciones de la ventana en `src/main/index.ts`. Con `nodeIntegration` apagado la
 * pantalla no tiene con que abrir un archivo, y con `contextIsolation` encendido no
 * puede alcanzar el contexto del preload, que si lo tiene. Si alguna de las dos cambia,
 * la pared se cayo aunque la app siga abriendo.
 *
 * Se mide aqui y no abriendo la app entera porque el hecho esta escrito en el codigo:
 * la capa mas barata que puede verlo es esta. Desde la app solo se podria comprobar que
 * un simbolo concreto no existe, y ausencia de un simbolo no es la regla.
 *
 * No se mira `sandbox`: hoy esta en `false` y eso solo afecta a los privilegios del
 * preload, no a lo que la pantalla alcanza. Fijarlo aqui pondria rojo el dia que alguien
 * lo endurezca, que es justo lo contrario de lo que esta prueba quiere.
 */

const MAIN = 'src/main/index.ts'

/** Las opciones de una ventana, con su valor tal como esta escrito en el codigo. */
type Ventana = Record<string, string>

function leerArchivo(rel: string): ts.SourceFile {
  const ruta = resolve(process.cwd(), rel)
  return ts.createSourceFile(ruta, readFileSync(ruta, 'utf8'), ts.ScriptTarget.Latest, true)
}

function opcionesDe(objeto: ts.ObjectLiteralExpression): Record<string, ts.Expression> {
  const opciones: Record<string, ts.Expression> = {}
  for (const p of objeto.properties) {
    if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) {
      opciones[p.name.text] = p.initializer
    }
  }
  return opciones
}

/** Las `webPreferences` de cada `new BrowserWindow({...})` que el codigo abre. */
function ventanasQueLaAppAbre(): Ventana[] {
  const ventanas: Ventana[] = []

  const visitar = (nodo: ts.Node): void => {
    if (
      ts.isNewExpression(nodo) &&
      ts.isIdentifier(nodo.expression) &&
      nodo.expression.text === 'BrowserWindow'
    ) {
      const primero = nodo.arguments?.[0]
      const preferencias =
        primero && ts.isObjectLiteralExpression(primero)
          ? opcionesDe(primero)['webPreferences']
          : undefined

      const ventana: Ventana = {}
      if (preferencias && ts.isObjectLiteralExpression(preferencias)) {
        for (const [nombre, valor] of Object.entries(opcionesDe(preferencias))) {
          ventana[nombre] = valor.getText()
        }
      }
      ventanas.push(ventana)
    }
    ts.forEachChild(nodo, visitar)
  }

  visitar(leerArchivo(MAIN))
  return ventanas
}

/** Las dos opciones que sostienen la pared, y nada mas. */
function comoQuedaLaPared(ventana: Ventana): Record<string, string> {
  return {
    contextIsolation: ventana['contextIsolation'] ?? '(sin declarar)',
    nodeIntegration: ventana['nodeIntegration'] ?? '(sin declarar)'
  }
}

const ventanas = ventanasQueLaAppAbre()

describe('la pared entre los dos mundos', () => {
  it('toda ventana que la app abre deja a la pantalla sin alcance propio al disco', () => {
    for (const ventana of ventanas) {
      expect(comoQuedaLaPared(ventana)).toEqual({
        contextIsolation: 'true',
        nodeIntegration: 'false'
      })
    }
  })

  it('la pantalla si tiene por donde pedir: la ventana declara su preload', () => {
    for (const ventana of ventanas) {
      expect(ventana['preload']).toBeDefined()
    }
  })

  it('la prueba encuentra la ventana — si deja de encontrarla, no pasa en silencio', () => {
    expect(ventanas.length).toBeGreaterThan(0)
  })
})
