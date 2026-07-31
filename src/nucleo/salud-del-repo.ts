/**
 * Revision de salud del repositorio elegido.
 *
 * Nucleo: funciones puras. No abre archivos ni pregunta al sistema — recibe los
 * hechos ya medidos y devuelve los avisos. Quien mide es el adaptador.
 *
 * Ninguno de estos avisos escribe nada: Nemawashi senala y quien decide es el dueno
 * del repositorio. Arreglarlo seria escribir en el repo del cliente, y eso es
 * justo lo que la cualidad «no invadir» prohibe.
 *
 * Y ninguno redacta: aqui se decide **cual** aviso aplica, nunca con que palabras se
 * dice. Redactar es presentacion, y la presentacion no vive en el nucleo (§2.4). Las
 * palabras de cada clave estan en `src/renderer/src/textos.ts`.
 */

/**
 * Los avisos que esta revision puede levantar.
 *
 * Se declaran como dato y no solo como tipo porque el modulo de textos tiene que poder
 * recorrerlos: si manana nace una clave sin palabras, se ve en una prueba que la nombra
 * y no en un hueco que nadie mira.
 */
export const CLAVES_DE_AVISO = [
  'carpeta-sincronizada',
  'unidad-de-red',
  'ruta-larga',
  'sin-gitattributes'
] as const

export type ClaveDeAviso = (typeof CLAVES_DE_AVISO)[number]

/** Lo que el adaptador tuvo que ir a medir al disco. */
export type HechosDelRepo = {
  ruta: string
  tieneGitattributes: boolean
}

const SINCRONIZADORES = ['onedrive', 'dropbox', 'google drive', 'googledrive', 'icloud']

/** El limite de rutas de Windows sigue vivo por defecto en la maquina del cliente. */
const LARGO_QUE_PREOCUPA = 200

export function esCarpetaSincronizada(ruta: string): boolean {
  const r = ruta.toLowerCase()
  return SINCRONIZADORES.some((s) => r.includes(s))
}

export function esUnidadDeRed(ruta: string): boolean {
  return ruta.startsWith('\\\\') || ruta.startsWith('//')
}

export function esRutaLarga(ruta: string): boolean {
  return ruta.length > LARGO_QUE_PREOCUPA
}

export function revisarRepo(hechos: HechosDelRepo): ClaveDeAviso[] {
  const avisos: ClaveDeAviso[] = []

  if (esCarpetaSincronizada(hechos.ruta)) avisos.push('carpeta-sincronizada')
  if (esUnidadDeRed(hechos.ruta)) avisos.push('unidad-de-red')
  if (esRutaLarga(hechos.ruta)) avisos.push('ruta-larga')
  if (!hechos.tieneGitattributes) avisos.push('sin-gitattributes')

  return avisos
}
