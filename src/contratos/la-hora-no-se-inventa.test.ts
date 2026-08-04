import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato: la hora del alta le llega al escribano estampada pieza por pieza, nunca deducida.
 *
 * Medido el 2026-07-31: quince items salieron con `12:00:00` porque la plantilla exige hora y a
 * quien escribia no le llegaba ninguna. Obedecio la forma inventando el contenido, y una hora
 * inventada se ve igual de bien que una real -esa es justo la razon por la que es peor.
 *
 * El molino tampoco la calcula: no tiene reloj. Entra por `args.hora` y el codigo la estampa en
 * cada pieza antes de mandarla, junto con el `paso`. Un campo que el agente pudiera llenar es un
 * campo que el agente puede perder.
 *
 * Igual que los otros contratos del molino: no es un modulo TypeScript importable, lo ejecuta el
 * runtime de Claude Code inyectando `args`, `agent`, `log` y `phase`.
 */

const RUTA_MOLINO = resolve(process.cwd(), '.claude/workflows/levanta-el-conocimiento.js')

type Llamada = { prompt: string; opts: Record<string, unknown> }

function cargarMolino(): (...args: unknown[]) => Promise<unknown> {
  const fuente = readFileSync(RUTA_MOLINO, 'utf8').replace(/^export const meta/, 'const meta')
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
    ...args: string[]
  ) => (...args: unknown[]) => Promise<unknown>
  return new AsyncFunction('args', 'agent', 'log', 'phase', fuente)
}

const HORA = '2026-07-31T09:20:00-06:00'

type Pieza = Record<string, unknown>

function regla(id: string, firmeza: string): Pieza {
  return {
    id,
    renglon: `una regla ${firmeza}`,
    capacidades: [],
    firmeza,
    origen: 'escuchado',
    enSusPalabras: 'lo que se dijo, entero',
    deDondeSalio: 'el caso contado entero',
    queQuedaAbierto: 'nada'
  }
}

const REGLAS_DE_PRUEBA = [regla('REG-1', 'dicho'), regla('REG-2', 'confirmado')]

function correrMolino(entrada: Record<string, unknown>, reglas: Pieza[] = REGLAS_DE_PRUEBA): Promise<{ llamadas: Llamada[] }> {
  const llamadas: Llamada[] = []

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    if (opts.phase === 'Sacar') return { platica: 'algo se dijo en la platica', transcriptLeido: 'sesion.jsonl' }
    if (opts.phase === 'Levantar el examen') return { preguntas: ['algo que contestar?'] }
    if (opts.phase === 'Construir') return { capacidades: [], modulos: [], reglas, dudas: [], senaladas: [] }
    if (opts.phase === 'Medir') {
      if (label.startsWith('leer-en-frio')) return { huecos: [], piezasLeidas: reglas.length }
      if (label.startsWith('cotejar')) return { inventos: [], piezasCotejadas: reglas.length }
      return { respuestas: [{ pregunta: 'algo que contestar?', veredicto: 'contestada' }], senaladas: [], sinPieza: [] }
    }
    if (opts.phase === 'Registrar') {
      return {
        archivos: reglas.map((r, i) => ({
          ruta: `product/conocimiento/reglas/000${i + 1}-de-prueba.md`,
          id: `REG-000${i + 1}`,
          idDeTrabajo: r.id,
          estado: 'completa'
        })),
        noEscritos: [],
        senalesSinPieza: []
      }
    }
    if (opts.phase === 'Auditar') {
      return { inventado: [], perdido: [], malMarcado: [], sirve: true, porque: 'sin fallas', transcriptLeido: 'sesion.jsonl' }
    }
    if (opts.phase === 'Armar lo que falta') return { deEstePaso: [], deAntes: [], archivosRecorridos: reglas.length }
    return null
  }

  const molino = cargarMolino()
  return molino(entrada, agent, () => {}, () => {}).then(() => ({ llamadas }))
}

function promptDeRegistrar(llamadas: Llamada[]): string {
  const llamada = llamadas.find((l) => l.opts.phase === 'Registrar')
  if (!llamada) throw new Error('el molino nunca llego a la fase Registrar')
  return llamada.prompt
}

/** Las reglas son el ultimo bloque del prompt: de su `--- Las reglas ---` al final. */
function reglasDelPrompt(prompt: string): Pieza[] {
  const marca = prompt.indexOf('--- Las reglas ---')
  if (marca === -1) throw new Error('el prompt de Registrar no trae el bloque de reglas')
  const resto = prompt.slice(marca)
  return JSON.parse(resto.slice(resto.indexOf('['), resto.lastIndexOf(']') + 1))
}

describe('la hora del alta le llega al escribano estampada en cada pieza', () => {
  it('cuando `args.hora` llega, cada pieza trae su propia `alta` con esa hora', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: HORA })

    const reglas = reglasDelPrompt(promptDeRegistrar(llamadas))
    expect(reglas).toHaveLength(2)
    for (const r of reglas) expect(r.alta).toBe(HORA)
  })

  it('la pieza `confirmado` ademas trae `confirmado` con esa misma hora; la `dicho` no', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: HORA })

    const reglas = reglasDelPrompt(promptDeRegistrar(llamadas))
    const confirmada = reglas.find((r) => r.firmeza === 'confirmado')
    const dicha = reglas.find((r) => r.firmeza === 'dicho')

    expect(confirmada?.confirmado).toBe(HORA)
    expect(dicha?.confirmado).toBeUndefined()
  })

  it('cuando `args.hora` no llega, ninguna pieza trae `alta` inventada: el campo se queda ausente', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl' })

    const prompt = promptDeRegistrar(llamadas)
    for (const r of reglasDelPrompt(prompt)) expect(r.alta).toBeUndefined()
    expect(prompt).toContain('No llego la hora del alta')
  })

  it('una hora vacia o solo de espacios cuenta como no recibida, no como una hora real', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: '   ' })

    const prompt = promptDeRegistrar(llamadas)
    for (const r of reglasDelPrompt(prompt)) expect(r.alta).toBeUndefined()
    expect(prompt).toContain('No llego la hora del alta')
  })

  it('30 piezas en una sola corrida salen las 30 con su `alta`, no solo la primera', async () => {
    const muchas = Array.from({ length: 30 }, (_, i) => regla(`REG-${i + 1}`, 'dicho'))
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: HORA }, muchas)

    const reglas = reglasDelPrompt(promptDeRegistrar(llamadas))
    expect(reglas).toHaveLength(30)
    for (const r of reglas) expect(r.alta).toBe(HORA)
  })

  it('el `paso` tambien se estampa, y es el que llego por `args`, no uno que el agente ponga', async () => {
    const { llamadas } = await correrMolino({ paso: 'el paso que se cerro', transcript: 'sesion.jsonl', hora: HORA })

    for (const r of reglasDelPrompt(promptDeRegistrar(llamadas))) expect(r.paso).toBe('el paso que se cerro')
  })

  it('a quien construye se le prohibe poner la hora y el paso: los estampa el codigo', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: HORA })
    const construir = llamadas.find((l) => l.opts.phase === 'Construir')

    expect(construir?.prompt).toContain('No pongas `paso`, `alta`, `confirmado` ni `estado`')
  })
})
