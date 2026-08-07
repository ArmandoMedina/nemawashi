import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato: antes de que una duda le llegue al experto, el molino intenta contestarla con
 * lo que ya existe -la platica de hoy y lo que ya esta escrito de antes- y funde las que son
 * el mismo problema contado con otras palabras.
 *
 * Medido en la corrida `wf_24861ad7-882`: de 37 dudas devueltas, 21 eran distintas y solo 13
 * las podia contestar unicamente el experto -seis estaban dichas en la misma platica que el
 * auditor acababa de leer, dos ya vivian escritas, y dieciseis eran la misma pregunta repetida
 * porque reglas y capacidades levantan sus dudas cada una por su lado y nadie las compara.
 *
 * El doble de `agent` es hostil a proposito -lo que ya costo una corrida real, documentado en
 * `cada-agente-carga-su-carta.test.ts` junto a `conLaCorreccionAplicada`-: las dudas que se
 * funden vienen con redaccion distinta, no copias literales, y toda prueba que filtra o funde
 * trae SIEMPRE una duda legitima de control que tiene que sobrevivir. Un doble complaciente que
 * solo prueba el camino feliz no habria cazado un filtro que se traga preguntas de verdad.
 *
 * Igual que los otros contratos del molino: no es un modulo TypeScript importable, lo ejecuta
 * el runtime de Claude Code inyectando `args`, `agent`, `log` y `phase`. Aqui se reproduce esa
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

/** Contiene, en palabras del experto, la respuesta a `YA_DICHA` -no un resumen, la frase misma. */
const PLATICA_TEXTO =
  'EXPERTO: los de abajo no le hablan entre si ni al consultor, solo le entregan al editor su ' +
  'hallazgo o su silencio.\n\nAGENTE: entendido'

const HORA_MEDIDA = '2026-08-07T09:00:00-06:00'
const ENTRADA = { paso: 'paso de prueba', transcript: 'sesion.jsonl' }

/** Ya la contesto el experto en esta misma platica -es la que NO tiene que sobrevivir. */
const YA_DICHA = { pregunta: 'Los revisores de atras avisan lo que vieron a quien despacha las notas?', falla: 'ambiguedad' as const }

/** El mismo problema que `PARAFRASEO_B`, dicho con otras palabras -las funde `juntar`. */
const PARAFRASEO_A = {
  pregunta: 'Los revisores de atras se hablan entre ellos y se pasan lo que vieron, o cada uno le entrega lo suyo a quien despacha las notas?',
  falla: 'ambiguedad' as const
}
const PARAFRASEO_B = {
  pregunta: 'Los agentes de atras se avisan entre ellos lo que vieron, o cada uno solo le entrega su hallazgo al editor?',
  falla: 'ambiguedad' as const
}

/** Nadie mas que el experto la puede contestar -la de control: nunca se tiene que perder. */
const LEGITIMA = { pregunta: 'A partir de cuantos dias de atraso ya no se le surte?', falla: 'umbral-sin-numero' as const }

const REGLA = {
  id: 'REG-1',
  renglon: 'A un taller con menos de tres meses no se le fia',
  capacidades: [],
  firmeza: 'dicho',
  origen: 'escuchado',
  enSusPalabras: 'a un taller que apenas abre no se le fia',
  deDondeSalio: 'salio de la misma platica',
  queQuedaAbierto: 'nada'
}

type OpcionesCorrida = {
  dudasDeReglas?: Array<{ pregunta: string; falla: string }>
  dudasDeCapacidades?: Array<{ pregunta: string; falla: string }>
  verificado?: Record<string, unknown> | null
  juntado?: Record<string, unknown> | null
}

function correrMolino(opciones: OpcionesCorrida = {}): Promise<Corrida> {
  const { dudasDeReglas = [], dudasDeCapacidades = [], verificado = null, juntado = null } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    if (opts.phase === 'Sacar') return { platica: PLATICA_TEXTO, transcriptLeido: 'sesion.jsonl', horaDeAlta: HORA_MEDIDA }
    if (opts.phase === 'Inventariar') return { piezas: [] }
    if (opts.phase === 'Levantar el examen') return { preguntas: ['algo que contestar?'] }
    if (opts.phase === 'Construir') {
      if (label.startsWith('construir:reglas')) return { reglas: [REGLA], dudas: dudasDeReglas, senaladas: [] }
      if (label.startsWith('construir:capacidades')) return { capacidades: [], dudas: dudasDeCapacidades, senaladas: [] }
      if (label.startsWith('construir:modulos')) return { modulos: [] }
      if (label.startsWith('construir:dominios')) return { dominios: [] }
      if (label.startsWith('verificar-dudas')) return verificado
      if (label.startsWith('juntar-dudas')) return juntado
      return null
    }
    return null
  }

  const molino = cargarMolino()
  return molino(ENTRADA, agent, (m: string) => dichos.push(m), () => {}).then((salida) => ({
    llamadas,
    dichos,
    salida: (salida ?? {}) as Record<string, unknown>
  }))
}

function llamadaDe(llamadas: Llamada[], prefijoDeLabel: string): Llamada | undefined {
  return llamadas.find((l) => String(l.opts.label ?? '').startsWith(prefijoDeLabel))
}

describe('una duda ya contestada en la platica no se le devuelve al experto', () => {
  it('la que el experto ya dijo no vuelve; la legitima si, y la corrida sigue frenada', async () => {
    const { salida } = await correrMolino({
      dudasDeReglas: [YA_DICHA],
      dudasDeCapacidades: [LEGITIMA],
      verificado: {
        respuestas: [
          { pregunta: YA_DICHA.pregunta, veredicto: 'contestada', deDonde: 'lo dijo el experto en esta misma sesion' },
          { pregunta: LEGITIMA.pregunta, veredicto: 'sin-contestar' }
        ]
      }
    })

    // El control: si el filtro se comiera de mas, esto dejaria de frenar y se perderia una
    // pregunta que solo el experto puede contestar -el riesgo que le importa a este contrato.
    expect(salida.estado).toBe('dudas-devueltas')
    expect(salida.dudas).toEqual([LEGITIMA])
  })

  it('la que salio `a-medias` se queda: el veredicto peor no es una respuesta', async () => {
    const { salida } = await correrMolino({
      dudasDeReglas: [YA_DICHA],
      dudasDeCapacidades: [LEGITIMA],
      verificado: {
        respuestas: [
          { pregunta: YA_DICHA.pregunta, veredicto: 'a-medias', deDonde: 'parte de la respuesta' },
          { pregunta: LEGITIMA.pregunta, veredicto: 'sin-contestar' }
        ]
      }
    })

    expect(salida.dudas).toEqual([YA_DICHA, LEGITIMA])
  })

  it('si nadie contesta la verificacion, la corrida sigue con las dudas sin filtrar -fallar abierto, no perder una', async () => {
    const { salida, dichos } = await correrMolino({
      dudasDeReglas: [YA_DICHA],
      dudasDeCapacidades: [LEGITIMA],
      verificado: null
    })

    expect(salida.dudas).toEqual([YA_DICHA, LEGITIMA])
    expect(dichos.join('\n')).toContain('Nadie verifico las dudas')
  })

  it('carga `contestar-el-examen`, ve la platica real y las dos dudas, y nunca escribe', async () => {
    const { llamadas } = await correrMolino({
      dudasDeReglas: [YA_DICHA],
      dudasDeCapacidades: [LEGITIMA],
      verificado: { respuestas: [] }
    })
    const verificar = llamadaDe(llamadas, 'verificar-dudas')

    expect(verificar).toBeDefined()
    expect(verificar!.prompt).toContain('`contestar-el-examen`')
    expect(verificar!.prompt).toMatch(/Carga tu carta/)
    expect(verificar!.prompt).toContain(PLATICA_TEXTO)
    expect(verificar!.prompt).toContain(YA_DICHA.pregunta)
    expect(verificar!.prompt).toContain(LEGITIMA.pregunta)
    expect(verificar!.opts.agentType).toBe('auditor')
  })
})

describe('dos parafraseos del mismo problema se funden en uno, sin perder la duda distinta', () => {
  it('juntar trabaja por posicion, no por texto identico: los dos parafraseos colapsan y la legitima queda aparte', async () => {
    const { salida } = await correrMolino({
      dudasDeReglas: [PARAFRASEO_A],
      dudasDeCapacidades: [PARAFRASEO_B, LEGITIMA],
      verificado: {
        respuestas: [
          { pregunta: PARAFRASEO_A.pregunta, veredicto: 'sin-contestar' },
          { pregunta: PARAFRASEO_B.pregunta, veredicto: 'sin-contestar' },
          { pregunta: LEGITIMA.pregunta, veredicto: 'sin-contestar' }
        ]
      },
      juntado: { grupos: [{ posiciones: [1, 2], porQue: 'la misma pregunta sobre si los de atras se avisan entre si' }] }
    })

    expect(salida.estado).toBe('dudas-devueltas')
    expect(salida.dudas).toEqual([PARAFRASEO_A, LEGITIMA])
  })

  it('carga `juntar` sobre lo que sobrevivio a la verificacion, con agentType auditor -nunca escribe', async () => {
    const { llamadas } = await correrMolino({
      dudasDeReglas: [PARAFRASEO_A],
      dudasDeCapacidades: [PARAFRASEO_B],
      verificado: { respuestas: [] },
      juntado: { grupos: [] }
    })
    const juntar = llamadaDe(llamadas, 'juntar-dudas')

    expect(juntar).toBeDefined()
    expect(juntar!.prompt).toContain('`juntar`')
    expect(juntar!.prompt).toMatch(/Carga tu carta/)
    expect(juntar!.prompt).toContain(PARAFRASEO_A.pregunta)
    expect(juntar!.prompt).toContain(PARAFRASEO_B.pregunta)
    expect(juntar!.opts.agentType).toBe('auditor')
  })

  it('con una sola duda sin contestar, no se molesta a nadie con juntar', async () => {
    const { llamadas } = await correrMolino({
      dudasDeReglas: [YA_DICHA],
      dudasDeCapacidades: [LEGITIMA],
      verificado: {
        respuestas: [
          { pregunta: YA_DICHA.pregunta, veredicto: 'contestada' },
          { pregunta: LEGITIMA.pregunta, veredicto: 'sin-contestar' }
        ]
      }
    })

    expect(llamadaDe(llamadas, 'juntar-dudas')).toBeUndefined()
  })

  it('si nadie junta, se devuelven las dudas tal como sobrevivieron a la verificacion -sin perder la legitima', async () => {
    const { salida, dichos } = await correrMolino({
      dudasDeReglas: [PARAFRASEO_A],
      dudasDeCapacidades: [LEGITIMA],
      verificado: {
        respuestas: [
          { pregunta: PARAFRASEO_A.pregunta, veredicto: 'sin-contestar' },
          { pregunta: LEGITIMA.pregunta, veredicto: 'sin-contestar' }
        ]
      },
      juntado: null
    })

    expect(salida.dudas).toEqual([PARAFRASEO_A, LEGITIMA])
    expect(dichos.join('\n')).toContain('Nadie junto las dudas')
  })
})

describe('una posicion repetida dentro del mismo grupo no borra la duda que nombra', () => {
  it('`[3,3]` no es una pareja real: las tres dudas sobreviven', async () => {
    const { salida } = await correrMolino({
      dudasDeReglas: [PARAFRASEO_A],
      dudasDeCapacidades: [PARAFRASEO_B, LEGITIMA],
      verificado: {
        respuestas: [
          { pregunta: PARAFRASEO_A.pregunta, veredicto: 'sin-contestar' },
          { pregunta: PARAFRASEO_B.pregunta, veredicto: 'sin-contestar' },
          { pregunta: LEGITIMA.pregunta, veredicto: 'sin-contestar' }
        ]
      },
      // La posicion 3 es `LEGITIMA`: un grupo que la nombra dos veces no la vuelve duplicada de
      // nada. Si el codigo cuenta las repeticiones sin quitarlas primero, la pierde igual que si
      // de verdad tuviera pareja -es la falla medida: `[3,3]` pasaba el guardia de «hacen falta
      // dos para fundir» y la posicion 3 se iba a la lista de que se quitan.
      juntado: { grupos: [{ posiciones: [3, 3], porQue: 'grupo mal armado, la misma posicion dos veces' }] }
    })

    expect(salida.dudas).toEqual([PARAFRASEO_A, PARAFRASEO_B, LEGITIMA])
  })

  it('`[1,1,2]` es una posicion repetida mas una real: solo la 2 se quita, la 1 sobrevive como representante', async () => {
    const { salida } = await correrMolino({
      dudasDeReglas: [PARAFRASEO_A],
      dudasDeCapacidades: [PARAFRASEO_B, LEGITIMA],
      verificado: {
        respuestas: [
          { pregunta: PARAFRASEO_A.pregunta, veredicto: 'sin-contestar' },
          { pregunta: PARAFRASEO_B.pregunta, veredicto: 'sin-contestar' },
          { pregunta: LEGITIMA.pregunta, veredicto: 'sin-contestar' }
        ]
      },
      juntado: { grupos: [{ posiciones: [1, 1, 2], porQue: 'la 1 repetida, mas la 2 de verdad' }] }
    })

    expect(salida.dudas).toEqual([PARAFRASEO_A, LEGITIMA])
  })
})

describe('el inventario tambien mira las corridas anteriores', () => {
  it('a quien inventaria se le pide ademas leer docs/mediciones/corridas.jsonl', async () => {
    const { llamadas } = await correrMolino({ verificado: { respuestas: [] } })
    const inventariar = llamadas.find((l) => l.opts.phase === 'Inventariar')

    expect(inventariar).toBeDefined()
    expect(inventariar!.prompt).toContain('docs/mediciones/corridas.jsonl')
  })

  // `docs/mediciones/corridas.jsonl` trae `"dondeParo": null` en varios renglones -asi lo deja
  // el propio molino al anotar-, y el esquema de esta llamada pide `dondeParo` como `string`. Si
  // el prompt le dice al agente que copie el campo «tal cual» y el agente obedece devolviendo
  // `null`, la validacion del esquema rechaza la salida entera y la fase completa vuelve `null`
  // -no una duda, un renglon: toda la fase de Inventariar, que es la que evita repetir lo ya
  // escrito. El prompt tiene que decir explicito que hacer con ese `null`.
  it('le dice al agente que hacer si `dondeParo` viene `null` en el renglon de la corrida', async () => {
    const { llamadas } = await correrMolino({ verificado: { respuestas: [] } })
    const inventariar = llamadas.find((l) => l.opts.phase === 'Inventariar')

    expect(inventariar).toBeDefined()
    expect(inventariar!.prompt).toMatch(/dondeParo.{0,80}null|null.{0,80}dondeParo/is)
  })
})
