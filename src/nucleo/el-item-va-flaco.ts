/**
 * El item va flaco, y esto lo mide.
 *
 * `product/modulos.md` §M4 lo escribe asi: «un renglon que se lee de un vistazo… el
 * detalle nunca vive en la lista». La regla existia desde el dia uno; lo que faltaba
 * era algo que la hiciera cumplir.
 *
 * **Por que hace falta un tope y no basta la buena voluntad.** Medido en un repositorio
 * hermano el 2026-07-31: su lista tenia gate de formato —vigilaba que cada item
 * declarara su alta y su apetito— y aun asi los items crecieron hasta volverse parrafos
 * con enmiendas adentro. El gate cuidaba los campos, no el tamano, y la lista dejo de
 * poderse leer de un vistazo. Un limite que nadie mide no es un limite.
 *
 * Nucleo: funciones puras. No abre archivos — recibe el texto ya leido y devuelve las
 * fallas. Quien lee el disco es quien la llama.
 *
 * Y no redacta: aqui se decide **cual** falla aplica, nunca con que palabras se dice.
 */

export const CLAVES_DE_FALLA = [
  'sin-frontmatter',
  'falta-campo',
  'regla-en-varios-renglones',
  'regla-larga',
  'firmeza-desconocida',
  'fecha-sin-huso',
  'confirmado-sin-fecha',
  'confirmado-sin-firmeza',
  'origen-vacio',
  'cuerpo-gordo'
] as const

export type ClaveDeFalla = (typeof CLAVES_DE_FALLA)[number]

/** El detalle es dato —un nombre de campo, un largo medido—, nunca una frase. */
export type Falla = { clave: ClaveDeFalla; detalle?: string }

export type ClaseDeItem = 'roadmap' | 'backlog'

/**
 * Los topes, en un solo lugar y con su motivo.
 *
 * No salen de una medicion: salen de que una lista se lee de un vistazo o no se lee.
 * El dia que un item legitimo no quepa, el dato para moverlos es ese item — no el gusto.
 */
export const LARGO_MAXIMO_DE_LA_REGLA = 120
export const LARGO_MAXIMO_DEL_CUERPO = 900

export const FIRMEZAS = ['dicho', 'confirmado', 'abierto'] as const
export type Firmeza = (typeof FIRMEZAS)[number]

const CAMPOS_OBLIGATORIOS: Record<ClaseDeItem, string[]> = {
  roadmap: ['id', 'regla', 'paso', 'firmeza', 'alta'],
  backlog: ['id', 'tarea', 'origen', 'alta']
}

/** El renglon que el item promete: el que se lee de un vistazo. */
const RENGLON: Record<ClaseDeItem, string> = { roadmap: 'regla', backlog: 'tarea' }

/** ISO 8601 con hora y huso explicito (§1.5). Sin huso no sirve para saber si sigue vigente. */
const FECHA_CON_HUSO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/

export type ItemPartido = { frente: Record<string, string>; cuerpo: string }

/**
 * Parte el archivo en su frontmatter y su cuerpo.
 *
 * Devuelve `null` si no hay frontmatter: no se adivina una forma que no esta.
 */
export function partirItem(texto: string): ItemPartido | null {
  const renglones = texto.replace(/\r\n/g, '\n').split('\n')
  if (renglones[0]?.trim() !== '---') return null

  const cierre = renglones.indexOf('---', 1)
  if (cierre === -1) return null

  const frente: Record<string, string> = {}
  for (const renglon of renglones.slice(1, cierre)) {
    const corte = renglon.indexOf(':')
    if (corte === -1) continue
    frente[renglon.slice(0, corte).trim()] = renglon.slice(corte + 1).trim()
  }

  return { frente, cuerpo: renglones.slice(cierre + 1).join('\n') }
}

/**
 * Lo que se cuenta como cuerpo.
 *
 * Los comentarios de HTML no cuentan: no se leen en la lista y son donde vive el
 * instructivo de la plantilla. Contarlos obligaria a elegir entre una plantilla que
 * explica y un tope que sirve.
 */
export function cuerpoQueCuenta(cuerpo: string): string {
  return cuerpo.replace(/<!--[\s\S]*?-->/g, '').trim()
}

function revisarFecha(valor: string | undefined, campo: string, fallas: Falla[]): void {
  if (!valor) return
  if (!FECHA_CON_HUSO.test(valor)) fallas.push({ clave: 'fecha-sin-huso', detalle: campo })
}

export function revisarItem(texto: string, clase: ClaseDeItem): Falla[] {
  const partido = partirItem(texto)
  if (!partido) return [{ clave: 'sin-frontmatter' }]

  const { frente, cuerpo } = partido
  const fallas: Falla[] = []

  for (const campo of CAMPOS_OBLIGATORIOS[clase]) {
    if (!frente[campo]) fallas.push({ clave: 'falta-campo', detalle: campo })
  }

  const renglon = frente[RENGLON[clase]]
  if (renglon) {
    if (renglon.includes('\n')) fallas.push({ clave: 'regla-en-varios-renglones' })
    if (renglon.length > LARGO_MAXIMO_DE_LA_REGLA) {
      fallas.push({ clave: 'regla-larga', detalle: String(renglon.length) })
    }
  }

  if (clase === 'roadmap') {
    const firmeza = frente.firmeza
    if (firmeza && !FIRMEZAS.includes(firmeza as Firmeza)) {
      fallas.push({ clave: 'firmeza-desconocida', detalle: firmeza })
    }
    if (firmeza === 'confirmado' && !frente.confirmado) {
      fallas.push({ clave: 'confirmado-sin-fecha' })
    }
    if (frente.confirmado && firmeza !== 'confirmado') {
      fallas.push({ clave: 'confirmado-sin-firmeza' })
    }
    revisarFecha(frente.confirmado, 'confirmado', fallas)
  }

  if (clase === 'backlog') {
    // Un item de backlog sin origen es trabajo que nadie pidio.
    const origen = frente.origen
    if (origen && (origen === '[]' || origen === '[ ]')) fallas.push({ clave: 'origen-vacio' })
  }

  revisarFecha(frente.alta, 'alta', fallas)

  const medido = cuerpoQueCuenta(cuerpo)
  if (medido.length > LARGO_MAXIMO_DEL_CUERPO) {
    fallas.push({ clave: 'cuerpo-gordo', detalle: String(medido.length) })
  }

  return fallas
}
