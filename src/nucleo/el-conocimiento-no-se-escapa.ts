/**
 * Una pieza de `product/conocimiento/` no se escapa de tres maneras: no delata la maquina
 * donde se escribio, no se sale de la forma que su plantilla exige, y no se queda calla
 * sobre un hueco que ella misma declaro.
 *
 * Medido el 2026-08-04: una corrida real dejo 14 rutas absolutas de maquina en 6 archivos
 * de `product/conocimiento/`. `.claude/rules/valen-en-toda-sesion.md` ya lo prohibia -«ni
 * la ruta de una maquina real entra a un archivo versionado»- pero nada media esos
 * archivos: el gate de dato personal (`sin-dato-personal.ts`) solo reconoce la ruta de un
 * perfil de usuario de Windows -la letra de unidad seguida de `\Users\` y el nombre de la
 * cuenta-, no una ruta absoluta cualquiera, y ninguna otra
 * prueba recorria `product/conocimiento/`.
 *
 * Nucleo: funciones puras. No abre archivos — reciben el texto ya leido y devuelven los
 * hallazgos o las fallas. Quien lee el disco es quien las llama.
 */

import { partirItem, cuerpoQueCuenta } from './el-item-va-flaco'
export type { ItemPartido } from './el-item-va-flaco'

// --- No delata la maquina --------------------------------------------------

export type ClaseDeHallazgoDeMaquina = 'ruta-de-unidad'

export type HallazgoDeMaquina = {
  ruta: string
  linea: number
  clase: ClaseDeHallazgoDeMaquina
  fragmento: string
}

/**
 * Una letra de unidad seguida de `:` y de `\` o `/`: `C:\`, `D:/`, `c:\trabajo`.
 * El `\b` antes de la letra evita que un esquema de URL como `http://` la dispare: la
 * `p` de `http` no tiene frontera de palabra detras, asi que nunca entra al patron.
 */
const PATRON_RUTA_DE_UNIDAD = /\b[A-Za-z]:[\\/]/g

export function encontrarRutaDeMaquina(texto: string, ruta: string): HallazgoDeMaquina[] {
  return texto.split(/\r\n|\r|\n/).flatMap((linea, i) => {
    const numeroDeLinea = i + 1
    return [...linea.matchAll(PATRON_RUTA_DE_UNIDAD)].map((coincidencia) => ({
      ruta,
      linea: numeroDeLinea,
      clase: 'ruta-de-unidad' as const,
      fragmento: linea.trim()
    }))
  })
}

// --- No se sale de la forma -------------------------------------------------

export const CLAVES_DE_FALLA = [
  'sin-frontmatter',
  'falta-campo',
  'firmeza-desconocida',
  'origen-desconocido',
  'estado-desconocido',
  'hueco-mudo'
] as const

export type ClaveDeFalla = (typeof CLAVES_DE_FALLA)[number]

/** El detalle es dato -un nombre de campo, un valor leido-, nunca una frase. */
export type Falla = { clave: ClaveDeFalla; detalle?: string }

export const TIPOS_DE_PIEZA = ['dominio', 'modulo', 'capacidad', 'regla'] as const
export type TipoDePieza = (typeof TIPOS_DE_PIEZA)[number]

export const FIRMEZAS = ['dicho', 'confirmado', 'abierto'] as const
export type Firmeza = (typeof FIRMEZAS)[number]

export const ORIGENES = ['escuchado', 'propuesto'] as const
export type Origen = (typeof ORIGENES)[number]

export const ESTADOS = ['completa', 'con-huecos'] as const
export type Estado = (typeof ESTADOS)[number]

/** Los campos que las cuatro plantillas exigen, ademas de los propios de cada una. */
const CAMPOS_COMUNES = ['id', 'firmeza', 'origen', 'estado', 'paso', 'alta']

const CAMPOS_PROPIOS: Record<TipoDePieza, string[]> = {
  dominio: ['dominio', 'modulos'],
  modulo: ['modulo', 'dominio', 'capacidades'],
  capacidad: ['capacidad', 'modulo', 'reglas'],
  regla: ['regla', 'capacidades']
}

const CAMPOS_OBLIGATORIOS: Record<TipoDePieza, string[]> = {
  dominio: [...CAMPOS_COMUNES, ...CAMPOS_PROPIOS.dominio],
  modulo: [...CAMPOS_COMUNES, ...CAMPOS_PROPIOS.modulo],
  capacidad: [...CAMPOS_COMUNES, ...CAMPOS_PROPIOS.capacidad],
  regla: [...CAMPOS_COMUNES, ...CAMPOS_PROPIOS.regla]
}

/** El contenido de una etiqueta XML del cuerpo, o `null` si la etiqueta no aparece. */
function contenidoDeEtiqueta(cuerpo: string, etiqueta: string): string | null {
  const coincidencia = cuerpo.match(new RegExp(`<${etiqueta}>([\\s\\S]*?)</${etiqueta}>`))
  return coincidencia?.[1] ?? null
}

/**
 * Una pieza `con-huecos` que no dice cual es el hueco no sirve: la plantilla exige que
 * `que-queda-abierto` diga que falta, y prohibe dejarlo en «nada» cuando si hay hueco.
 */
function revisarHuecoMudo(frente: Record<string, string>, cuerpo: string, fallas: Falla[]): void {
  if (frente.estado !== 'con-huecos') return
  const abierto = contenidoDeEtiqueta(cuerpo, 'que-queda-abierto')?.trim().toLowerCase() ?? ''
  if (abierto === '' || abierto === 'nada') fallas.push({ clave: 'hueco-mudo' })
}

export function revisarPieza(texto: string, tipo: TipoDePieza): Falla[] {
  const partido = partirItem(texto)
  if (!partido) return [{ clave: 'sin-frontmatter' }]

  const { frente, cuerpo } = partido
  const fallas: Falla[] = []

  for (const campo of CAMPOS_OBLIGATORIOS[tipo]) {
    if (!frente[campo]) fallas.push({ clave: 'falta-campo', detalle: campo })
  }

  if (frente.firmeza && !FIRMEZAS.includes(frente.firmeza as Firmeza)) {
    fallas.push({ clave: 'firmeza-desconocida', detalle: frente.firmeza })
  }
  if (frente.origen && !ORIGENES.includes(frente.origen as Origen)) {
    fallas.push({ clave: 'origen-desconocido', detalle: frente.origen })
  }
  if (frente.estado && !ESTADOS.includes(frente.estado as Estado)) {
    fallas.push({ clave: 'estado-desconocido', detalle: frente.estado })
  }

  revisarHuecoMudo(frente, cuerpoQueCuenta(cuerpo), fallas)

  return fallas
}
