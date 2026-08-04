import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato: el molino no recibe el texto de la platica en `args.platica`. Recibe -o resuelve
 * el solo- la ruta de un `.jsonl` de sesion, y saca la platica de ahi con el sacador que ya
 * existe (`sacarTurnos` / `platicaComoTexto` en `src/nucleo/sacar-turnos.ts`).
 *
 * Antes, quien llamaba tecleaba el material adentro de la llamada, y esa mano acababa siendo el
 * filtro: en una corrida real se paso una version recortada de la conversacion y el auditor
 * marco como «perdido» material que nunca llego a entrar.
 *
 * Orden: una fase «Sacar» antes de todo, que le pide a un agente -el unico con `Bash` entre los
 * que ya existen- que lea la grabacion y corra el sacador. Si no llega `args.transcript`, ese
 * mismo agente resuelve la grabacion de la sesion en curso; el molino no la adivina por su
 * cuenta -no tiene `process` ni `fs` para hacerlo.
 *
 * Igual que los otros contratos del molino: no es un modulo TypeScript importable, lo ejecuta el
 * runtime de Claude Code inyectando `args`, `agent`, `log` y `phase`. Aqui se reproduce esa
 * invocacion con un `agent` falso que contesta lo minimo que cada schema exige, y nada mas.
 */

const RUTA_MOLINO = resolve(process.cwd(), '.claude/workflows/levanta-el-conocimiento.js')

type Llamada = { prompt: string; opts: Record<string, unknown> }
type Corrida = { llamadas: Llamada[]; dichos: string[]; salida: Record<string, unknown> }

function cargarMolino(): (...args: unknown[]) => Promise<unknown> {
  const fuente = readFileSync(RUTA_MOLINO, 'utf8').replace(/^export const meta/, 'const meta')
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
    ...args: string[]
  ) => (...args: unknown[]) => Promise<unknown>
  return new AsyncFunction('args', 'agent', 'log', 'phase', fuente)
}

const PLATICA_SACADA = 'EXPERTO: algo se dijo\n\nAGENTE: algo se contesto'

const PIEZA = {
  id: 'REG-1',
  renglon: 'una regla dicha',
  capacidades: [],
  firmeza: 'dicho',
  origen: 'escuchado',
  enSusPalabras: 'algo se dijo',
  deDondeSalio: 'el caso contado entero',
  queQuedaAbierto: 'nada'
}

const REGISTRO = { capacidades: [], modulos: [], reglas: [PIEZA], dudas: [], senaladas: [] }
const ESCRITOS = {
  archivos: [{ ruta: 'product/conocimiento/reglas/0001-de-prueba.md', id: 'REG-0001', idDeTrabajo: 'REG-1', estado: 'completa' }],
  noEscritos: [],
  senalesSinPieza: []
}
const SIN_FALLAS = { inventado: [], perdido: [], malMarcado: [], sirve: true, porque: 'sin fallas', transcriptLeido: 'sesion.jsonl' }

type Sacado = { platica: string; transcriptLeido: string; noSePudo?: string } | null

function correrMolino(entrada: Record<string, unknown>, opciones: { sacado?: Sacado } = {}): Promise<Corrida> {
  const { sacado = { platica: PLATICA_SACADA, transcriptLeido: 'sesion.jsonl' } } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    if (opts.phase === 'Sacar') return sacado
    if (opts.phase === 'Levantar el examen') return { preguntas: ['algo que contestar?'] }
    if (opts.phase === 'Construir') return REGISTRO
    if (opts.phase === 'Medir') {
      if (label.startsWith('leer-en-frio')) return { huecos: [], piezasLeidas: 1 }
      if (label.startsWith('cotejar')) return { inventos: [], piezasCotejadas: 1 }
      return { respuestas: [{ pregunta: 'algo que contestar?', veredicto: 'contestada' }], senaladas: [], sinPieza: [] }
    }
    if (opts.phase === 'Registrar') return ESCRITOS
    if (opts.phase === 'Auditar') return SIN_FALLAS
    if (opts.phase === 'Armar lo que falta') return { deEstePaso: [], deAntes: [], archivosRecorridos: 1 }
    return null
  }

  const molino = cargarMolino()
  return molino(entrada, agent, (m: string) => dichos.push(m), () => {}).then((salida) => ({
    llamadas,
    dichos,
    salida: (salida ?? {}) as Record<string, unknown>
  }))
}

function promptDeFase(llamadas: Llamada[], fase: string): string {
  const llamada = llamadas.find((l) => l.opts.phase === fase)
  if (!llamada) throw new Error(`el molino nunca llego a la fase ${fase}`)
  return llamada.prompt
}

describe('el molino no recibe texto: recibe -o resuelve- la ruta del transcript', () => {
  it('«Sacar» corre antes que todo lo demas', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl' })

    const indiceSacar = llamadas.findIndex((l) => l.opts.phase === 'Sacar')
    const indiceExamen = llamadas.findIndex((l) => l.opts.phase === 'Levantar el examen')

    expect(indiceSacar).toBe(0)
    expect(indiceExamen).toBeGreaterThan(indiceSacar)
  })

  it('a «Sacar» se le pide correr el sacador que ya existe, no inventar uno', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl' })
    const sacar = promptDeFase(llamadas, 'Sacar')

    expect(sacar).toContain('sacarTurnos')
    expect(sacar).toContain('platicaComoTexto')
    expect(sacar).toContain('src/nucleo/sacar-turnos.ts')
  })

  it('con `args.transcript` el prompt trae esa ruta y no manda buscar la sesion', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl' })
    const sacar = promptDeFase(llamadas, 'Sacar')

    expect(sacar).toContain('una-ruta.jsonl')
    expect(sacar).not.toContain('CLAUDE_CODE_SESSION_ID')
  })

  it('sin `args.transcript` se le dice como resolverla, y que no la invente', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba' })
    const sacar = promptDeFase(llamadas, 'Sacar')

    expect(sacar).toContain('CLAUDE_CODE_SESSION_ID')
    expect(sacar).toContain('No inventes una ruta')
  })

  it('aunque llegue `args.platica`, no reemplaza lo que saca el sacador', async () => {
    const { llamadas } = await correrMolino({
      paso: 'paso de prueba',
      transcript: 'una-ruta.jsonl',
      platica: 'ESTE TEXTO LO TECLEO ALGUIEN A MANO'
    })

    const examen = promptDeFase(llamadas, 'Levantar el examen')
    expect(examen).toContain(PLATICA_SACADA)
    expect(examen).not.toContain('ESTE TEXTO LO TECLEO ALGUIEN A MANO')
  })

  it('si «Sacar» no contesta, el molino para ahi: no hay material que moler', async () => {
    const { llamadas, salida } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl' }, { sacado: null })

    expect(llamadas.find((l) => l.opts.phase === 'Levantar el examen')).toBeUndefined()
    expect(salida.estado).toBe('sin-medicion')
  })

  it('si «Sacar» devuelve la platica vacia, el motivo reportado es el `noSePudo` del sacador', async () => {
    const { llamadas, salida } = await correrMolino(
      { paso: 'paso de prueba', transcript: 'una-ruta.jsonl' },
      { sacado: { platica: '', transcriptLeido: '', noSePudo: 'el archivo no se pudo leer' } }
    )

    expect(llamadas.find((l) => l.opts.phase === 'Levantar el examen')).toBeUndefined()
    expect(salida.estado).toBe('sin-material')
    expect(salida.motivo).toContain('el archivo no se pudo leer')
  })

  it('el `transcriptLeido` que resolvio el sacador es el que se le pasa a quien audita', async () => {
    const { llamadas } = await correrMolino(
      { paso: 'paso de prueba' },
      { sacado: { platica: PLATICA_SACADA, transcriptLeido: 'la-que-de-verdad-leyo.jsonl' } }
    )

    expect(promptDeFase(llamadas, 'Auditar')).toContain('la-que-de-verdad-leyo.jsonl')
  })
})
