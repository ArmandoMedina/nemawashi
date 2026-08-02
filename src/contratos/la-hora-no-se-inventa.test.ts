import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato de RM-0012: la hora del alta se le pasa al escribano, nunca la deduce el
 * molino ni la inventa el escribano.
 *
 * Medido en corrida real (seis corridas seguidas sin escribir nada): una hora suelta en el
 * texto del prompt no basta. El escribano lee `alta` -y `confirmado`, cuando la firmeza lo
 * pide- del propio objeto de cada hallazgo, no de una linea de prosa aparte. Por eso este
 * contrato no se conforma con que la hora aparezca en algun lado del prompt: verifica que
 * el arreglo de hallazgos que se manda a Asentar traiga el campo estampado, hallazgo por
 * hallazgo, y que la ausencia de la hora se refleje en la ausencia del campo -nunca en un
 * valor inventado.
 *
 * El molino (`.claude/workflows/levanta-el-roadmap.js`) no es un modulo
 * TypeScript importable: lo ejecuta el runtime de Claude Code inyectando `args`, `agent`,
 * `log` y `phase` como si fueran parametros de una funcion. Aqui se reproduce exactamente
 * esa forma de invocacion -sin marcarlo como AsyncFunction el archivo ni siquiera se puede
 * correr-, y no se prueba nada mas: no se abre ventana, no se llama a Claude de verdad, el
 * `agent` de la prueba es una funcion falsa que contesta lo minimo que cada schema exige.
 */

const RUTA_MOLINO = resolve(process.cwd(), '.claude/workflows/levanta-el-roadmap.js')

type Hallazgo = {
  regla: string
  deDondeSalio: string
  firmeza: 'dicho' | 'confirmado' | 'abierto'
  alta?: string
  confirmado?: string
}

type Llamada = { prompt: string; opts: Record<string, unknown> }

function cargarMolino(): (...args: unknown[]) => Promise<unknown> {
  const fuente = readFileSync(RUTA_MOLINO, 'utf8').replace(/^export const meta/, 'const meta')
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
    ...args: string[]
  ) => (...args: unknown[]) => Promise<unknown>
  return new AsyncFunction('args', 'agent', 'log', 'phase', fuente)
}

const HALLAZGOS_DE_PRUEBA: Hallazgo[] = [
  { regla: 'una regla dicha en la platica', deDondeSalio: 'la platica', firmeza: 'dicho' },
  { regla: 'una regla que el experto confirmo', deDondeSalio: 'la platica', firmeza: 'confirmado' }
]

function correrMolino(
  entrada: Record<string, unknown>,
  hallazgosDeAfinar: Hallazgo[] = HALLAZGOS_DE_PRUEBA
): Promise<{ llamadas: Llamada[] }> {
  const llamadas: Llamada[] = []

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    if (opts.phase === 'Afinar') return { hallazgos: hallazgosDeAfinar, preguntas: [] }
    if (opts.phase === 'Asentar') {
      return { archivos: [{ ruta: 'roadmap/0099-de-prueba.md', regla: 'una regla dicha en la platica' }], noEscritos: [] }
    }
    if (opts.phase === 'Auditar') {
      return { inventado: [], perdido: [], malMarcado: [], sirve: true, porque: 'sin fallas', transcriptLeido: 'x' }
    }
    return null
  }

  const molino = cargarMolino()
  return molino(entrada, agent, () => {}, () => {}).then(() => ({ llamadas }))
}

function promptDeAsentar(llamadas: Llamada[]): string {
  const llamada = llamadas.find((l) => l.opts.phase === 'Asentar')
  if (!llamada) throw new Error('el molino nunca llego a la fase Asentar')
  return llamada.prompt
}

/** El JSON de hallazgos es el ultimo bloque del prompt: de su primer `[` a su ultimo `]`. */
function hallazgosDelPrompt(prompt: string): Hallazgo[] {
  const inicio = prompt.indexOf('[')
  const fin = prompt.lastIndexOf(']')
  if (inicio === -1 || fin === -1) throw new Error('el prompt de Asentar no trae un arreglo de hallazgos')
  return JSON.parse(prompt.slice(inicio, fin + 1))
}

describe('la hora del alta le llega al escribano estampada en cada hallazgo', () => {
  it('cuando args.hora llega, cada hallazgo trae su propia `alta` con esa hora', async () => {
    const { llamadas } = await correrMolino({
      paso: 'paso de prueba',
      platica: 'algo se dijo en la platica',
      hora: '2026-07-31T09:20:00-06:00'
    })

    const hallazgos = hallazgosDelPrompt(promptDeAsentar(llamadas))
    expect(hallazgos).toHaveLength(HALLAZGOS_DE_PRUEBA.length)
    for (const h of hallazgos) expect(h.alta).toBe('2026-07-31T09:20:00-06:00')
  })

  it('el hallazgo `confirmado` ademas trae `confirmado` con esa misma hora; el `dicho` no', async () => {
    const { llamadas } = await correrMolino({
      paso: 'paso de prueba',
      platica: 'algo se dijo en la platica',
      hora: '2026-07-31T09:20:00-06:00'
    })

    const hallazgos = hallazgosDelPrompt(promptDeAsentar(llamadas))
    const confirmado = hallazgos.find((h) => h.firmeza === 'confirmado')
    const dicho = hallazgos.find((h) => h.firmeza === 'dicho')
    expect(confirmado?.confirmado).toBe('2026-07-31T09:20:00-06:00')
    expect(dicho?.confirmado).toBeUndefined()
  })

  it('cuando args.hora no llega, ningun hallazgo trae `alta` inventada: el campo se queda ausente', async () => {
    const { llamadas } = await correrMolino({
      paso: 'paso de prueba',
      platica: 'algo se dijo en la platica'
    })

    const hallazgos = hallazgosDelPrompt(promptDeAsentar(llamadas))
    for (const h of hallazgos) {
      expect(h.alta).toBeUndefined()
      expect(h.confirmado).toBeUndefined()
    }
    expect(promptDeAsentar(llamadas).toLowerCase()).toContain('no llego la hora')
  })

  it('una hora vacia o solo de espacios cuenta como no recibida, no como una hora real', async () => {
    const { llamadas } = await correrMolino({
      paso: 'paso de prueba',
      platica: 'algo se dijo en la platica',
      hora: '   '
    })

    const hallazgos = hallazgosDelPrompt(promptDeAsentar(llamadas))
    for (const h of hallazgos) expect(h.alta).toBeUndefined()
  })

  it('30 hallazgos en una sola corrida salen los 30 con su `alta`, no solo el primero', async () => {
    const muchos: Hallazgo[] = Array.from({ length: 30 }, (_, i) => ({
      regla: `regla numero ${i}`,
      deDondeSalio: 'la platica',
      firmeza: 'dicho'
    }))

    const { llamadas } = await correrMolino(
      { paso: 'un dia usando nemawashi', platica: 'una sesion larga', hora: '2026-07-31T15:05:52-06:00' },
      muchos
    )

    const hallazgos = hallazgosDelPrompt(promptDeAsentar(llamadas))
    expect(hallazgos).toHaveLength(30)
    expect(hallazgos.every((h) => h.alta === '2026-07-31T15:05:52-06:00')).toBe(true)
  })
})
