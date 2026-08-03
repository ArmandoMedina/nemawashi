import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato del cambio: el molino ya no recibe el texto de la platica en `args.platica`.
 * Recibe -o resuelve el solo- la ruta de un `.jsonl` de sesion, y saca la platica de ahi
 * con el sacador que ya existe (`sacarTurnos` / `platicaComoTexto` en
 * `src/nucleo/sacar-turnos.ts`). Antes, quien llamaba tecleaba el material adentro de la
 * llamada, y esa mano acababa siendo el filtro: en una corrida real se paso una version
 * recortada de la conversacion y el auditor marco como «perdido» material que nunca llego
 * a entrar.
 *
 * Orden nuevo: una fase «Sacar», antes de «Afinar», que le pide a un agente -el unico con
 * `Bash` entre los que ya existen- que lea la grabacion y corra el sacador. Si no llega
 * `args.transcript`, ese mismo agente resuelve la grabacion de la sesion en curso; el molino
 * no la adivina por su cuenta -no tiene `process` ni `fs` para hacerlo.
 *
 * Igual que los otros contratos del molino: no es un modulo TypeScript importable, lo
 * ejecuta el runtime de Claude Code inyectando `args`, `agent`, `log` y `phase`. Aqui se
 * reproduce esa invocacion con un `agent` falso que contesta lo minimo que cada schema
 * exige, y nada mas.
 */

const RUTA_MOLINO = resolve(process.cwd(), '.claude/workflows/levanta-el-roadmap.js')

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

type Sacado = { platica: string; transcriptLeido: string; noSePudo?: string } | null

type OpcionesCorrida = {
  sacado?: Sacado
  dictamen?: Record<string, unknown> | null
}

const SIN_FALLAS = { inventado: [], perdido: [], malMarcado: [], sirve: true, porque: 'sin fallas', transcriptLeido: 'x' }
const HALLAZGO = { regla: 'una regla dicha', deDondeSalio: 'el caso contado', firmeza: 'dicho' }
const SIN_HUECOS = { huecos: [], itemsLeidos: 1 }
const SIN_INVENTOS = { inventos: [], hallazgosCotejados: 1 }
const SIN_GRUPOS = { grupos: [], hallazgosRevisados: 1 }

function correrMolino(entrada: Record<string, unknown>, opciones: OpcionesCorrida = {}): Promise<Corrida> {
  const { sacado = { platica: PLATICA_SACADA, transcriptLeido: 'sesion.jsonl' }, dictamen = SIN_FALLAS } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })

    if (opts.phase === 'Sacar') return sacado
    if (opts.phase === 'Afinar') return { hallazgos: [HALLAZGO], preguntas: [] }
    if (opts.phase === 'Leer en frio') return SIN_HUECOS
    if (opts.phase === 'Cotejar') return SIN_INVENTOS
    if (opts.phase === 'Juntar') return SIN_GRUPOS
    if (opts.phase === 'Asentar') return { archivos: [{ ruta: 'roadmap/0099-de-prueba.md', regla: 'una regla dicha' }], noEscritos: [] }
    if (opts.phase === 'Auditar') return dictamen
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

describe('el molino ya no recibe texto: recibe -o resuelve- la ruta del transcript', () => {
  it('«Sacar» corre antes que «Afinar»', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl' })

    const indiceSacar = llamadas.findIndex((l) => l.opts.phase === 'Sacar')
    const indiceAfinar = llamadas.findIndex((l) => l.opts.phase === 'Afinar')

    expect(indiceSacar).toBeGreaterThanOrEqual(0)
    expect(indiceAfinar).toBeGreaterThan(indiceSacar)
  })

  it('a «Sacar» se le pide correr el sacador que ya existe, no inventar uno', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl' })
    const sacar = promptDeFase(llamadas, 'Sacar')

    expect(sacar).toContain('sacarTurnos')
    expect(sacar).toContain('platicaComoTexto')
  })

  it('con `args.transcript`, el prompt de «Sacar» trae esa ruta y no las instrucciones de sesion en curso', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'D:/repos/cliente/sesion-de-prueba.jsonl' })
    const sacar = promptDeFase(llamadas, 'Sacar')

    expect(sacar).toContain('D:/repos/cliente/sesion-de-prueba.jsonl')
    expect(sacar).not.toContain('CLAUDE_CODE_SESSION_ID')
  })

  it('sin `args.transcript`, el prompt de «Sacar» dice como resolver la sesion en curso, sin inventar una ruta', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba' })
    const sacar = promptDeFase(llamadas, 'Sacar')

    expect(sacar).toContain('CLAUDE_CODE_SESSION_ID')
    expect(sacar.toLowerCase()).toContain('no inventes')
  })

  it('la platica que devuelve «Sacar» es la que llega al prompt de «Afinar»', async () => {
    const { llamadas } = await correrMolino(
      { paso: 'paso de prueba', transcript: 'una-ruta.jsonl' },
      { sacado: { platica: PLATICA_SACADA, transcriptLeido: 'una-ruta.jsonl' } }
    )
    const afinar = promptDeFase(llamadas, 'Afinar')

    expect(afinar).toContain(PLATICA_SACADA)
  })

  it('`args.platica` ya no existe en el contrato: aunque llegue, no reemplaza lo que saca el sacador', async () => {
    const { llamadas } = await correrMolino(
      { paso: 'paso de prueba', transcript: 'una-ruta.jsonl', platica: 'texto tecleado a mano, fuera del contrato' },
      { sacado: { platica: PLATICA_SACADA, transcriptLeido: 'una-ruta.jsonl' } }
    )
    const afinar = promptDeFase(llamadas, 'Afinar')

    expect(afinar).toContain(PLATICA_SACADA)
    expect(afinar).not.toContain('texto tecleado a mano, fuera del contrato')
  })

  it('si «Sacar» no contesta, el molino para ahi: no hay material que afinar', async () => {
    const { llamadas, salida, dichos } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl' }, { sacado: null })

    expect(llamadas.find((l) => l.opts.phase === 'Afinar')).toBeUndefined()
    expect(salida.estado).toBe('sin-medicion')
    expect(dichos.join('\n')).toContain('sacador')
  })

  it('si «Sacar» devuelve la platica vacia, el motivo reportado es el `noSePudo` del sacador', async () => {
    const { llamadas, salida } = await correrMolino(
      { paso: 'paso de prueba', transcript: 'una-ruta.jsonl' },
      { sacado: { platica: '', transcriptLeido: '', noSePudo: 'el archivo no se pudo leer' } }
    )

    expect(llamadas.find((l) => l.opts.phase === 'Afinar')).toBeUndefined()
    expect(salida.estado).toBe('sin-material')
    expect(salida.motivo).toContain('el archivo no se pudo leer')
  })

  it('el `transcriptLeido` que resolvio «Sacar» es el que se usa al auditar contra el crudo', async () => {
    const { llamadas } = await correrMolino(
      { paso: 'paso de prueba' },
      { sacado: { platica: PLATICA_SACADA, transcriptLeido: '/ruta/que/resolvio/sacar/sesion.jsonl' } }
    )
    const auditar = promptDeFase(llamadas, 'Auditar')

    expect(auditar).toContain('/ruta/que/resolvio/sacar/sesion.jsonl')
  })
})
