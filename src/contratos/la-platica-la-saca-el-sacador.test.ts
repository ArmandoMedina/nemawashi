import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato: el molino no recibe texto tecleado a mano. Ni la platica -en `args.platica`- ni
 * las respuestas de una corrida anterior -en `args.respuestas`. Las dos entran por ruta, y las
 * dos las lee un agente: la platica con el sacador que ya existe (`sacarTurnos` /
 * `platicaComoTexto` en `src/nucleo/sacar-turnos.ts`), las respuestas con un simple `Read` -son
 * un `.md` plano, no una grabacion.
 *
 * Antes, quien llamaba tecleaba el material adentro de la llamada, y esa mano acababa siendo el
 * filtro: en una corrida real se paso una version recortada de la conversacion y el auditor
 * marco como «perdido» material que nunca llego a entrar. Con las respuestas paso algo mas caro
 * todavia, medido el 2026-08-05: pasar 15664 caracteres a mano rompe la reanudacion del
 * workflow -un salto de linea de diferencia entre lo tecleado y el archivo cambia el prompt y
 * tira el cache de `resumeFromRunId`, obligando a rehacer cuarenta minutos de agentes.
 *
 * Orden: una fase «Sacar» antes de todo, con dos llamadas si hay respuestas que leer. La primera
 * -el unico agente con `Bash` entre los que ya existen- lee la grabacion y corre el sacador; si
 * no llega `args.transcript`, ese mismo agente resuelve la grabacion de la sesion en curso -el
 * molino no la adivina por su cuenta, no tiene `process` ni `fs` para hacerlo. La segunda, solo
 * si llego `args.rutaRespuestas`, lee ese archivo con `Read` y nada mas.
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

/** La hora que el agente de «Sacar» dice haber medido con `date -Iseconds`. */
const HORA_VALIDA = '2026-08-05T09:00:00-06:00'

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

type Sacado = { platica: string; transcriptLeido: string; horaDeAlta?: string; noSePudo?: string } | null
type RespuestasSacadas = { respuestas: string; archivoLeido: string; noSePudo?: string } | null

function correrMolino(
  entrada: Record<string, unknown>,
  opciones: { sacado?: Sacado; respuestasSacadas?: RespuestasSacadas } = {}
): Promise<Corrida> {
  const {
    sacado = { platica: PLATICA_SACADA, transcriptLeido: 'sesion.jsonl', horaDeAlta: HORA_VALIDA },
    respuestasSacadas = { respuestas: 'una respuesta cualquiera', archivoLeido: 'respuestas.md' }
  } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    // La trampa a evitar: `sacar:` y `sacar-respuestas:` comparten prefijo. Se prueba el mas
    // largo -y mas especifico- primero, o la llamada de las respuestas caeria en la rama del
    // sacador y contestaria con lo que no le toca.
    if (opts.phase === 'Sacar') {
      if (label.startsWith('sacar-respuestas')) return respuestasSacadas
      // Se completa `horaDeAlta` si el override de la prueba no la trae: casi ninguna prueba de
      // este archivo mide el freno de la hora -eso vive en `la-hora-no-se-inventa.test.ts`-, asi
      // que sin este relleno cualquier override de `sacado` tumbaria la corrida antes de tiempo.
      return sacado ? { horaDeAlta: HORA_VALIDA, ...sacado } : sacado
    }
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

describe('las respuestas tambien entran por ruta, y las lee un agente', () => {
  it('con `rutaRespuestas` corre una segunda llamada en fase «Sacar», con esa ruta en el prompt', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl', rutaRespuestas: 'respuestas.md' })

    const sacarRespuestas = llamadas.find((l) => String(l.opts.label ?? '').startsWith('sacar-respuestas'))

    expect(sacarRespuestas).toBeDefined()
    expect(sacarRespuestas!.opts.phase).toBe('Sacar')
    expect(sacarRespuestas!.opts.agentType).toBe('auditor')
    expect(sacarRespuestas!.prompt).toContain('respuestas.md')
  })

  it('a esa llamada no se le pide correr el sacador: es un `.md` plano, no una grabacion', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl', rutaRespuestas: 'respuestas.md' })

    const sacarRespuestas = llamadas.find((l) => String(l.opts.label ?? '').startsWith('sacar-respuestas'))!

    expect(sacarRespuestas.prompt).not.toContain('sacarTurnos')
    expect(sacarRespuestas.prompt).not.toContain('npx tsx')
  })

  it('sin `rutaRespuestas` hay una sola llamada de «Sacar»', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl' })

    expect(llamadas.filter((l) => l.opts.phase === 'Sacar')).toHaveLength(1)
  })

  it('`rutaRespuestas` en blanco se trata como que no llego -la particion que hoy no existe por no validar el argumento', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'una-ruta.jsonl', rutaRespuestas: '   ' })

    expect(llamadas.filter((l) => l.opts.phase === 'Sacar')).toHaveLength(1)
  })

  it('si el lector de respuestas las devuelve vacias, la corrida para con «sin-respuestas» y no registra', async () => {
    const { llamadas, salida } = await correrMolino(
      { paso: 'paso de prueba', transcript: 'una-ruta.jsonl', rutaRespuestas: 'respuestas.md' },
      { respuestasSacadas: { respuestas: '', archivoLeido: '', noSePudo: 'el archivo no existe' } }
    )

    expect(salida.estado).toBe('sin-respuestas')
    expect(salida.motivo).toContain('el archivo no existe')
    expect(llamadas.find((l) => l.opts.phase === 'Registrar')).toBeUndefined()
  })

  it('unas respuestas vacias tampoco corren como primera corrida: no hay llamada de «Construir»', async () => {
    const { llamadas } = await correrMolino(
      { paso: 'paso de prueba', transcript: 'una-ruta.jsonl', rutaRespuestas: 'respuestas.md' },
      { respuestasSacadas: { respuestas: '', archivoLeido: '', noSePudo: 'el archivo no existe' } }
    )

    expect(llamadas.find((l) => l.opts.phase === 'Construir')).toBeUndefined()
  })

  it('a «Construir» le llega el texto que devolvio el lector, no la ruta que se le pidio', async () => {
    const { llamadas } = await correrMolino(
      { paso: 'paso de prueba', transcript: 'una-ruta.jsonl', rutaRespuestas: 'respuestas.md' },
      { respuestasSacadas: { respuestas: 'desde los tres meses', archivoLeido: 'respuestas.md' } }
    )

    const construir = llamadas.find((l) => l.opts.phase === 'Construir')!

    expect(construir.prompt).toContain('desde los tres meses')
    expect(construir.prompt).not.toContain('respuestas.md')
  })

  it('`args.respuestas` con texto ya no se acepta: para con «sin-respuestas» y el log nombra `rutaRespuestas`', async () => {
    const { llamadas, dichos, salida } = await correrMolino({
      paso: 'paso de prueba',
      transcript: 'una-ruta.jsonl',
      respuestas: 'desde los tres meses'
    })

    expect(salida.estado).toBe('sin-respuestas')
    expect(dichos.join('\n')).toContain('rutaRespuestas')
    // Para antes de gastar un solo agente DE LA CORRIDA: ignorarlo en silencio corre como
    // primera corrida, y eso son cuarenta minutos para acabar preguntando lo que el experto ya
    // habia contestado. Las dos llamadas que si quedan son mecanicas -de «Anotar», que deja el
    // renglon de esta corrida aunque se haya cortado en el freno.
    expect(llamadas).toHaveLength(2)
    expect(llamadas.map((l) => l.opts.phase)).toEqual(['Anotar', 'Anotar'])
  })
})
