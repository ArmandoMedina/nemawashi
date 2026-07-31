import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import {
  ARCHIVOS_AUTOEXCLUIDOS,
  EXTENSIONES_A_ESCANEAR,
  buscarCadenasDeDenylist,
  encontrarDatoPersonal,
  type Hallazgo
} from '../nucleo/sin-dato-personal'

/**
 * El contrato anti dato personal. No opina: revisa un hecho y siempre contesta lo mismo.
 *
 * Lista los archivos versionados con `git ls-files`, los lee y corre el nucleo estructural
 * sobre cada uno. Si existe una denylist local, tambien busca esas cadenas literales — y
 * si no existe, el contrato corre igual, solo con los detectores estructurales.
 *
 * **Falla cerrado.** Un `git ls-files` que no corre o devuelve vacio no es «sin novedad»:
 * es que el gate no pudo medir nada, y un gate que no puede medir no aprueba a ciegas. Por
 * eso la lista vacia es en si misma un hallazgo del contrato, y cualquier error al invocar
 * `git` se deja propagar — vitest lo cuenta como rojo, no como verde silencioso.
 *
 * **Se auto-excluye.** El nucleo, sus dos pruebas (capa 1 y este mismo archivo) y la
 * plantilla de la denylist contienen patrones por naturaleza: son texto sobre el propio
 * gate. La lista de exclusion vive en el nucleo (`ARCHIVOS_AUTOEXCLUIDOS`) para que este
 * archivo y `sin-dato-personal.ts` compartan una sola fuente.
 */

const RAIZ = resolve(process.cwd())
const RUTA_DENYLIST_LOCAL = resolve(RAIZ, 'anti-pii.denylist.txt')

function archivosVersionados(): string[] {
  const salida = execFileSync('git', ['ls-files'], { cwd: RAIZ, encoding: 'utf8' })
  return salida.split(/\r?\n/).filter((linea) => linea.length > 0)
}

/** Una linea = una cadena literal. Comentarios (`#`) y lineas en blanco se ignoran. */
export function parsearDenylist(contenido: string): string[] {
  return contenido
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0 && !linea.startsWith('#'))
}

function leerDenylistLocal(): string[] {
  if (!existsSync(RUTA_DENYLIST_LOCAL)) return []
  return parsearDenylist(readFileSync(RUTA_DENYLIST_LOCAL, 'utf8'))
}

function archivosAEscanear(): string[] {
  const versionados = archivosVersionados()
  if (versionados.length === 0) {
    throw new Error(
      'git ls-files no devolvio ningun archivo: el gate falla cerrado, no puede medir y no aprueba a ciegas'
    )
  }
  return versionados.filter(
    (ruta) => EXTENSIONES_A_ESCANEAR.includes(extname(ruta)) && !ARCHIVOS_AUTOEXCLUIDOS.includes(ruta)
  )
}

function escanearElArbol(): { archivos: string[]; hallazgos: Hallazgo[] } {
  const archivos = archivosAEscanear()
  const cadenasDeDenylist = leerDenylistLocal()

  const hallazgos: Hallazgo[] = []
  for (const ruta of archivos) {
    const texto = readFileSync(resolve(RAIZ, ruta), 'utf8')
    hallazgos.push(...encontrarDatoPersonal(texto, ruta))
    if (cadenasDeDenylist.length > 0) hallazgos.push(...buscarCadenasDeDenylist(texto, ruta, cadenasDeDenylist))
  }

  return { archivos, hallazgos }
}

describe('parseo de la denylist local', () => {
  it('ignora comentarios y lineas en blanco, y conserva las cadenas', () => {
    const contenido = ['# comentario', '', 'cadena-uno', '  cadena-dos  ', '# otro comentario', 'cadena-tres'].join(
      '\n'
    )
    expect(parsearDenylist(contenido)).toEqual(['cadena-uno', 'cadena-dos', 'cadena-tres'])
  })

  it('un contenido vacio o solo de comentarios no produce ninguna cadena', () => {
    expect(parsearDenylist('# solo comentarios\n\n# nada mas')).toEqual([])
  })
})

describe('el contrato anti dato personal', () => {
  it('git ls-files responde y devuelve al menos un archivo — si no, el gate falla cerrado', () => {
    expect(archivosVersionados().length).toBeGreaterThan(0)
  })

  it('se autoexcluye: el nucleo, sus dos pruebas y la plantilla de la denylist no se escanean a si mismos', () => {
    const { archivos } = escanearElArbol()
    for (const excluido of ARCHIVOS_AUTOEXCLUIDOS) {
      expect(archivos).not.toContain(excluido)
    }
  })

  it('encuentra archivos que escanear en el arbol real — si deja de encontrarlos, no pasa en silencio', () => {
    const { archivos } = escanearElArbol()
    expect(archivos.length).toBeGreaterThan(0)
  })

  it('ningun archivo versionado del repositorio contiene un dato personal detectable', () => {
    const { hallazgos } = escanearElArbol()
    if (hallazgos.length > 0) {
      const detalle = hallazgos.map((h) => `  ${h.ruta}:${h.linea} [${h.clase}] ${h.fragmento}`).join('\n')
      throw new Error(`${hallazgos.length} hallazgo(s) de dato personal en el repositorio:\n${detalle}`)
    }
    expect(hallazgos).toEqual([])
  })
})
