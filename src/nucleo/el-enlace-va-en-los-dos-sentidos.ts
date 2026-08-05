/**
 * El enlace va en los dos sentidos -`product/conocimiento/README.md:76-86`-, y esto lo mide
 * sobre el conjunto: recibe todas las piezas leidas y camina el grafo que forman.
 *
 * Es deliberado que viva aparte de `./el-conocimiento-no-se-escapa`: ese archivo mide **una
 * pieza a la vez** -su encabezado lo dice-, asi que un modulo que declara `dominio: DOM-0002`
 * inexistente pasa verde ahi. Aqui se mide el conjunto, y por eso el escape se puede ver.
 *
 * Nucleo: funciones puras. No abre archivos y no importa `node:fs` -reciben las piezas ya
 * leidas y devuelven las aristas o las fallas. Quien lee el disco es quien las llama.
 *
 * ## Las tres fronteras, donde esto mediria de mas o de menos
 *
 * 1. **El campo hacia arriba ausente o vacio NO es falla de enlace.** Ya lo reporta
 *    `revisarPieza` como `falta-campo`, y `DEUDA_DE_FORMA` ya lo nombra: contarlo aqui
 *    duplicaria cada modulo huerfano en dos fallas para un solo hecho. Lo que si se le escapa
 *    a `revisarPieza` es `capacidades: []` en una regla -`'[]'` es truthy-, y para eso existe
 *    `sin-quien-lo-contenga`, acotado solo a los campos hacia arriba que son lista.
 * 2. **`capacidad.reglas` vacio no es falla.** La plantilla `PIEZA_CAPACIDAD` ya lo declara:
 *    «Vacio es hueco, no error». Ningun campo hacia abajo se exige lleno, y por eso una lista
 *    vacia hacia abajo simplemente no produce aristas ni fallas.
 * 3. **El tipo se decide por la carpeta, nunca por el prefijo del id.** Es la decision que ya
 *    tomo el molino en `piezasDelTipoMarcadas`: el id de trabajo no es un contrato. Por eso
 *    estas funciones siempre usan `pieza.tipo` -el dato que declaro quien construyo la lista,
 *    a partir de la carpeta donde vive el archivo- y jamas lo infieren de un texto como
 *    `MOD-` o `CAP-`.
 */

import { partirItem } from './el-item-va-flaco'
import type { TipoDePieza } from './el-conocimiento-no-se-escapa'
export type { TipoDePieza } from './el-conocimiento-no-se-escapa'

export type PiezaLeida = { ruta: string; tipo: TipoDePieza; texto: string }
export type Arista = { desde: string; campo: string; hacia: string }

export const CLAVES_DE_FALLA_DE_ENLACE = [
  'id-repetido',
  'id-inexistente',
  'tipo-que-no-corresponde',
  'enlace-de-un-solo-lado',
  'sin-quien-lo-contenga',
  'mas-de-un-padre'
] as const

export type ClaveDeFallaDeEnlace = (typeof CLAVES_DE_FALLA_DE_ENLACE)[number]

export type FallaDeEnlace = {
  clave: ClaveDeFallaDeEnlace
  ruta: string // el archivo donde se lee la falla
  id: string // el id de esa pieza; vacio si no tiene
  campo: string // modulos, dominio, capacidades, modulo, reglas
  citado: string // el id citado; vacio cuando la falla no cita a nadie
  detalle?: string // dato, nunca una frase
}

/**
 * Un campo de frontmatter puede venir en tres formas: ausente, un solo id sin corchetes, o
 * una lista entre corchetes separada por comas. Las tres viven en disco hoy.
 */
export function idsDelCampo(valor: string | undefined): string[] {
  const recortado = valor?.trim() ?? ''
  if (recortado === '' || recortado === '[]') return []
  if (recortado.startsWith('[') && recortado.endsWith(']')) {
    return recortado
      .slice(1, -1)
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id !== '')
  }
  return [recortado]
}

type DireccionDeEnlace = 'abajo' | 'arriba-unico' | 'arriba-lista'

type FilaDeEnlace = {
  tipo: TipoDePieza
  campo: string
  tipoCitado: TipoDePieza
  vuelvePor: string
  direccion: DireccionDeEnlace
}

/**
 * La tabla de `product/conocimiento/README.md:81-86`, escrita en codigo: por cada tipo, el
 * campo con que cita a otro, el tipo que ese campo tendria que citar, y el campo por el que
 * ese otro tipo devuelve la cita. `direccion` distingue el campo hacia arriba de valor unico
 * -`mas-de-un-padre` aplica ahi- del campo hacia arriba de lista -`sin-quien-lo-contenga`
 * aplica solo ahi, porque es el unico campo hacia arriba que en disco es una lista.
 */
const TABLA_DE_ENLACES: FilaDeEnlace[] = [
  { tipo: 'dominio', campo: 'modulos', tipoCitado: 'modulo', vuelvePor: 'dominio', direccion: 'abajo' },
  { tipo: 'modulo', campo: 'dominio', tipoCitado: 'dominio', vuelvePor: 'modulos', direccion: 'arriba-unico' },
  { tipo: 'modulo', campo: 'capacidades', tipoCitado: 'capacidad', vuelvePor: 'modulo', direccion: 'abajo' },
  { tipo: 'capacidad', campo: 'modulo', tipoCitado: 'modulo', vuelvePor: 'capacidades', direccion: 'arriba-unico' },
  { tipo: 'capacidad', campo: 'reglas', tipoCitado: 'regla', vuelvePor: 'capacidades', direccion: 'abajo' },
  { tipo: 'regla', campo: 'capacidades', tipoCitado: 'capacidad', vuelvePor: 'reglas', direccion: 'arriba-lista' }
]

function frenteDe(pieza: PiezaLeida): Record<string, string> {
  return partirItem(pieza.texto)?.frente ?? {}
}

/**
 * Una arista por cada id que una pieza cita, en el campo que le corresponde a su tipo.
 *
 * Una pieza sin `id` no aporta ninguna: no hay de donde anclar el `desde`. Eso no es una
 * falla -ya la reporta `revisarPieza` aparte como `sin-frontmatter` o `falta-campo`- y aqui
 * simplemente no cuenta.
 */
export function aristasDelGrafo(piezas: PiezaLeida[]): Arista[] {
  const aristas: Arista[] = []
  for (const pieza of piezas) {
    const frente = frenteDe(pieza)
    const desde = frente.id
    if (!desde) continue
    for (const fila of TABLA_DE_ENLACES) {
      if (fila.tipo !== pieza.tipo) continue
      for (const hacia of idsDelCampo(frente[fila.campo])) {
        aristas.push({ desde, campo: fila.campo, hacia })
      }
    }
  }
  return aristas
}

function ordenFallas(a: FallaDeEnlace, b: FallaDeEnlace): number {
  return (
    a.ruta.localeCompare(b.ruta) ||
    a.clave.localeCompare(b.clave) ||
    a.campo.localeCompare(b.campo) ||
    a.citado.localeCompare(b.citado)
  )
}

/**
 * Camina el grafo que forman las piezas y devuelve donde el enlace se rompe.
 *
 * Se ordena por ruta primero para que `id-repetido` ancle en el segundo archivo por orden de
 * ruta, como pide la carta. El resultado sale siempre ordenado por ruta, clave, campo y
 * citado -sin eso la deuda declarada se volveria intermitente.
 */
export function revisarElGrafo(piezas: PiezaLeida[]): FallaDeEnlace[] {
  const ordenadas = [...piezas].sort((a, b) => a.ruta.localeCompare(b.ruta))
  const leidas = ordenadas.map((pieza) => ({ pieza, frente: frenteDe(pieza) }))

  const fallas: FallaDeEnlace[] = []

  // El indice: solo entra quien tiene id, y solo la primera vez que ese id aparece. La
  // repeticion se ancla en quien vino despues, con la ruta del primero como detalle.
  const indice = new Map<string, { tipo: TipoDePieza; ruta: string; frente: Record<string, string> }>()
  for (const { pieza, frente } of leidas) {
    const id = frente.id
    if (!id) continue
    const previa = indice.get(id)
    if (previa) {
      fallas.push({ clave: 'id-repetido', ruta: pieza.ruta, id, campo: 'id', citado: '', detalle: previa.ruta })
      continue
    }
    indice.set(id, { tipo: pieza.tipo, ruta: pieza.ruta, frente })
  }

  for (const { pieza, frente } of leidas) {
    const id = frente.id ?? ''
    for (const fila of TABLA_DE_ENLACES) {
      if (fila.tipo !== pieza.tipo) continue

      const valorCrudo = frente[fila.campo]
      const citados = idsDelCampo(valorCrudo)

      if (fila.direccion === 'arriba-lista' && valorCrudo === '[]') {
        fallas.push({ clave: 'sin-quien-lo-contenga', ruta: pieza.ruta, id, campo: fila.campo, citado: '' })
      }
      if (fila.direccion === 'arriba-unico' && citados.length > 1) {
        fallas.push({
          clave: 'mas-de-un-padre',
          ruta: pieza.ruta,
          id,
          campo: fila.campo,
          citado: '',
          detalle: citados.join(', ')
        })
      }

      for (const citado of citados) {
        const objetivo = indice.get(citado)
        if (!objetivo) {
          fallas.push({ clave: 'id-inexistente', ruta: pieza.ruta, id, campo: fila.campo, citado })
          continue
        }
        if (objetivo.tipo !== fila.tipoCitado) {
          fallas.push({
            clave: 'tipo-que-no-corresponde',
            ruta: pieza.ruta,
            id,
            campo: fila.campo,
            citado,
            detalle: objetivo.tipo
          })
          continue
        }
        const deVuelta = idsDelCampo(objetivo.frente[fila.vuelvePor])
        if (!deVuelta.includes(id)) {
          fallas.push({ clave: 'enlace-de-un-solo-lado', ruta: pieza.ruta, id, campo: fila.campo, citado })
        }
      }
    }
  }

  return fallas.sort(ordenFallas)
}

/** El formato de la llave de deuda, en un solo lugar para que capa 1 lo pueda probar. */
export function claveDeDeuda(falla: FallaDeEnlace): string {
  return `${falla.ruta} ${falla.clave} ${falla.campo}:${falla.citado}`
}
