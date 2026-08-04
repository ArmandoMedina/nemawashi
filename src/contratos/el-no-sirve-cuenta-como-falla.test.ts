import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato: el «no sirve» del auditor es la cuarta falla y cuenta como las otras tres.
 *
 * Medido el 2026-07-31: el auditor ya contestaba la pregunta del final -si le alcanza a alguien
 * que no estuvo- y la suma la ignoraba, asi que un dictamen «no sirve» salia impreso como «sin
 * fallas» y el estado como «listo». Diecisiete de cincuenta y nueve items quedaron con la
 * procedencia apodada y nadie se entero. Una medicion que no cuenta es una medicion que no se
 * hizo.
 *
 * De ahi salen las otras dos verdades de este archivo: que la procedencia se entrega contada y
 * no apodada -el esquema no deja lugar para el apodo-, y que todo lo que compara contra lo dicho
 * ve tambien lo que el experto contesto en una corrida anterior, para que una pieza salida de
 * sus respuestas no parezca inventada.
 *
 * Lo que se midio aqui cuando el molino producia hallazgos planos y ahora vive en
 * `cada-agente-carga-su-carta.test.ts`: el orden de las fases, que cada agente cargue su carta,
 * que el lector en frio vaya a ciegas, y el tope de dos vueltas. No se perdio medicion: cambio
 * de archivo, para que ninguna verdad quede escrita en dos lugares.
 *
 * Igual que los otros contratos del molino: no es un modulo TypeScript importable, lo ejecuta el
 * runtime de Claude Code inyectando `args`, `agent`, `log` y `phase`.
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

const PLATICA_TEXTO = 'EXPERTO: a un taller que apenas abre no se le fia\n\nAGENTE: entendido'
const ENTRADA = { paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: '2026-08-04T11:00:00-06:00' }

const REGLA = {
  id: 'REG-1',
  renglon: 'A un taller con menos de tres meses no se le fia',
  capacidades: [],
  firmeza: 'dicho',
  origen: 'escuchado',
  enSusPalabras: 'a un taller que apenas abre no se le fia',
  deDondeSalio: 'salio al contar el caso de un taller que llevaba dos meses operando',
  queQuedaAbierto: 'nada'
}

const REGISTRO = { capacidades: [], modulos: [], reglas: [REGLA], dudas: [], senaladas: [] }
const ESCRITOS = {
  archivos: [{ ruta: 'product/conocimiento/reglas/0001-antiguedad-minima.md', id: 'REG-0001', idDeTrabajo: 'REG-1', estado: 'completa' }],
  noEscritos: [],
  senalesSinPieza: []
}
const SIN_FALLAS = { inventado: [], perdido: [], malMarcado: [], sirve: true, porque: 'sin fallas', transcriptLeido: 'sesion.jsonl' }

type OpcionesCorrida = { dictamen?: Record<string, unknown> | null }

function correrMolino(entrada: Record<string, unknown>, opciones: OpcionesCorrida = {}): Promise<Corrida> {
  const { dictamen = SIN_FALLAS } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    if (opts.phase === 'Sacar') return { platica: PLATICA_TEXTO, transcriptLeido: 'sesion.jsonl' }
    if (opts.phase === 'Levantar el examen') return { preguntas: ['Desde cuando se le fia a un taller?'] }
    if (opts.phase === 'Construir') {
      // Solo lo que le toca a cada llamada, no el registro entero -la misma leccion del
      // 2026-08-04: un doble que siempre devuelve todo no mide nada.
      if (label.startsWith('construir:reglas')) return { reglas: REGISTRO.reglas, dudas: REGISTRO.dudas, senaladas: REGISTRO.senaladas }
      if (label.startsWith('construir:capacidades')) return { capacidades: REGISTRO.capacidades, dudas: REGISTRO.dudas, senaladas: REGISTRO.senaladas }
      if (label.startsWith('construir:modulos')) return { modulos: REGISTRO.modulos }
      if (label.startsWith('construir:dominios')) return { dominios: [] }
      return null
    }
    if (opts.phase === 'Medir') {
      if (label.startsWith('leer-en-frio')) return { huecos: [], piezasLeidas: 1 }
      if (label.startsWith('cotejar')) return { inventos: [], piezasCotejadas: 1 }
      return { respuestas: [{ pregunta: 'Desde cuando se le fia a un taller?', veredicto: 'contestada' }], senaladas: [], sinPieza: [] }
    }
    if (opts.phase === 'Registrar') return ESCRITOS
    if (opts.phase === 'Auditar') return dictamen
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

function llamadaDe(llamadas: Llamada[], fase: string, prefijoDeLabel?: string): Llamada {
  const llamada = llamadas.find((l) => l.opts.phase === fase && (!prefijoDeLabel || String(l.opts.label ?? '').startsWith(prefijoDeLabel)))
  if (!llamada) throw new Error(`el molino nunca llego a la fase ${fase}`)
  return llamada
}

describe('el «no sirve» del auditor cuenta como falla', () => {
  it('con `sirve: false` el estado devuelto no dice «listo»', async () => {
    const { salida } = await correrMolino(ENTRADA, { dictamen: { ...SIN_FALLAS, sirve: false, porque: 'la regla 0001 esta apodada' } })

    expect(salida.estado).toBe('con-huecos')
  })

  it('con `sirve: false` NO se imprime «sin fallas», aunque las otras tres listas vengan vacias', async () => {
    const { dichos } = await correrMolino(ENTRADA, { dictamen: { ...SIN_FALLAS, sirve: false, porque: 'apodado' } })

    expect(dichos.join('\n')).not.toContain('sin fallas')
  })

  it('el `porque` del dictamen sale en el log: un «no sirve» sin renglones no se puede arreglar', async () => {
    const { dichos } = await correrMolino(ENTRADA, {
      dictamen: { ...SIN_FALLAS, sirve: false, porque: 'reglas/0001 dice «el caso del taller» y eso no esta en ningun archivo' }
    })

    expect(dichos.join('\n')).toContain('reglas/0001 dice «el caso del taller»')
  })

  it('las fallas contra el crudo tambien cuentan, aunque el auditor diga que si sirve', async () => {
    const { salida, dichos } = await correrMolino(ENTRADA, {
      dictamen: { ...SIN_FALLAS, malMarcado: ['reglas/0001: dice `escuchado` y nadie lo dijo'] }
    })

    expect(salida.estado).toBe('con-huecos')
    expect(dichos.join('\n')).toContain('1 falla(s) contra el crudo')
  })

  it('si el auditor no dictamina, se dice: lo escrito queda sin medir contra el crudo', async () => {
    const { dichos, salida } = await correrMolino(ENTRADA, { dictamen: null })

    expect(dichos.join('\n')).toContain('El auditor no dictamino')
    expect(salida.estado).toBe('listo')
  })
})

describe('la procedencia se cuenta entera, y el esquema no deja lugar para el apodo', () => {
  it('el esquema de quien construye exige `deDondeSalio` y le dice que no lo apode', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const construir = llamadaDe(llamadas, 'Construir')
    const schema = JSON.stringify(construir.opts.schema ?? {})

    expect(schema).toContain('deDondeSalio')
    expect(schema).toContain('CONTADO, no apodado')
    expect(schema).toMatch(/apodo/)
  })

  it('el esquema no tiene un campo de resumen ni de tope: el cuerpo se cuenta entero', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const schema = JSON.stringify(llamadaDe(llamadas, 'Construir').opts.schema ?? {})

    expect(schema).toContain('sin recortar')
    expect(schema).not.toMatch(/"resumen"|"puntero"|"extracto"/)
  })

  it('la procedencia llega entera al escribano, sin recortarse en el camino', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const registrar = llamadaDe(llamadas, 'Registrar')

    expect(registrar.prompt).toContain(REGLA.deDondeSalio)
  })

  it('los esquemas de las mediciones no tienen donde decir «que agregar»', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    for (const prefijo of ['leer-en-frio', 'cotejar', 'contestar-examen']) {
      const schema = JSON.stringify(llamadaDe(llamadas, 'Medir', prefijo).opts.schema ?? {})
      expect(schema, `${prefijo} tiene donde sugerir`).not.toMatch(/agregar|sugerencia|recomend|queFalta|comoQuedaria/i)
    }
  })
})

describe('lo que el experto contesto despues vale igual que la platica', () => {
  it('quien construye ve la platica y las respuestas, las dos -en las cuatro llamadas, no solo en la primera', async () => {
    const { llamadas } = await correrMolino({ ...ENTRADA, respuestas: 'desde los tres meses' })

    for (const prefijo of ['construir:reglas', 'construir:capacidades', 'construir:modulos', 'construir:dominios']) {
      const construir = llamadaDe(llamadas, 'Construir', prefijo)
      expect(construir.prompt, `${prefijo} no ve la platica`).toContain(PLATICA_TEXTO)
      expect(construir.prompt, `${prefijo} no ve las respuestas`).toContain('desde los tres meses')
    }
  })

  it('el cotejador ve las dos, para que una pieza salida de las respuestas no parezca inventada', async () => {
    const { llamadas } = await correrMolino({ ...ENTRADA, respuestas: 'desde los tres meses' })
    const cotejador = llamadaDe(llamadas, 'Medir', 'cotejar')

    expect(cotejador.prompt).toContain(PLATICA_TEXTO)
    expect(cotejador.prompt).toContain('desde los tres meses')
  })

  it('el lector en frio no ve ninguna de las dos: sigue a ciegas aunque haya respuestas', async () => {
    const { llamadas } = await correrMolino({ ...ENTRADA, respuestas: 'desde los tres meses' })
    const lector = llamadaDe(llamadas, 'Medir', 'leer-en-frio')

    expect(lector.prompt).not.toContain(PLATICA_TEXTO)
    expect(lector.prompt).not.toContain('desde los tres meses')
  })

  it('quien contesta el examen tampoco las ve: mide el registro, no la conversacion', async () => {
    const { llamadas } = await correrMolino({ ...ENTRADA, respuestas: 'desde los tres meses' })
    const examinador = llamadaDe(llamadas, 'Medir', 'contestar-examen')

    expect(examinador.prompt).not.toContain(PLATICA_TEXTO)
    expect(examinador.prompt).not.toContain('desde los tres meses')
  })
})
