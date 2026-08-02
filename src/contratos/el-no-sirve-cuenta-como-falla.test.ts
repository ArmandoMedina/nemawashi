import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato de la cuarta falla, y el del orden en que corre.
 *
 * Medido el 2026-07-31 sobre los 59 items del roadmap: 17 salieron con la procedencia apodada
 * -«el pleito de la tercera falla», «la pregunta 2»- y ninguno de los 59 uso el puntero. El
 * dictamen «no sirve» tenia que pesar en la cuenta de fallas, y ademas la revision que lo
 * detecta -leer los hallazgos como el que no estuvo- corria DESPUES de que el escribano ya
 * habia escrito los archivos: el molino ensuciaba el roadmap y solo avisaba.
 *
 * Este contrato mide las dos mitades del arreglo, ya con el orden nuevo:
 *   1. El «no sirve» pesa: entra en la cuenta y el estado devuelto deja de decir «listo».
 *   2. «Leer en frio» corre ANTES de Asentar, sobre los hallazgos que acaba de sacar Afinar
 *      -sin platica, sin paso y sin transcript. Lo que marca regresa a Afinar UNA sola vez
 *      para que lo cuente completo; lo que siga flaco despues de esa vuelta se escribe igual,
 *      y el molino lo reporta.
 *
 * Igual que el contrato de la hora, el molino no es un modulo importable: lo ejecuta el
 * runtime de Claude Code inyectando `args`, `agent`, `log` y `phase`. Aqui se reproduce esa
 * invocacion y nada mas — el `agent` es falso y contesta lo minimo que cada schema exige.
 */

const RUTA_MOLINO = resolve(process.cwd(), '.claude/workflows/levanta-el-roadmap.js')

type Llamada = { prompt: string; opts: Record<string, unknown> }
type Dictamen = {
  inventado: string[]
  perdido: string[]
  malMarcado: string[]
  sirve: boolean
  porque: string
  transcriptLeido: string
}
type Corrida = { llamadas: Llamada[]; dichos: string[]; salida: { estado?: string } }

function cargarMolino(): (...args: unknown[]) => Promise<unknown> {
  const fuente = readFileSync(RUTA_MOLINO, 'utf8').replace(/^export const meta/, 'const meta')
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
    ...args: string[]
  ) => (...args: unknown[]) => Promise<unknown>
  return new AsyncFunction('args', 'agent', 'log', 'phase', fuente)
}

const SIN_FALLAS: Dictamen = {
  inventado: [],
  perdido: [],
  malMarcado: [],
  sirve: true,
  porque: 'sin fallas',
  transcriptLeido: 'sesion.jsonl'
}

type Hueco = { indice: number; renglon: string; forma: string }
type Lectura = { huecos: Hueco[]; itemsLeidos: number }
type Hallazgo = { regla: string; deDondeSalio: string; firmeza: string }

const SIN_HUECOS: Lectura = { huecos: [], itemsLeidos: 1 }
const HALLAZGO_INICIAL: Hallazgo = { regla: 'una regla dicha', deDondeSalio: 'el caso contado', firmeza: 'dicho' }

type OpcionesCorrida = {
  dictamen?: Dictamen | null
  preguntasDeAfinar?: Array<{ pregunta: string; falla: string }>
  /** Una entrada por cada vez que se llama a «Leer en frio»: la primera, y la de la vuelta si la hay. */
  lecturas?: Array<Lectura | null>
  /** Lo que devuelve Afinar en la vuelta de arreglo (segunda llamada con phase «Afinar»). */
  correccion?: Hallazgo[] | null
}

function correrMolino(entrada: Record<string, unknown>, opciones: OpcionesCorrida = {}): Promise<Corrida> {
  const { dictamen = SIN_FALLAS, preguntasDeAfinar = [], lecturas = [SIN_HUECOS], correccion = null } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []
  let lecturasServidas = 0

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })

    if (opts.phase === 'Afinar') {
      const llamadasDeAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar').length
      if (llamadasDeAfinar === 1) return { hallazgos: [HALLAZGO_INICIAL], preguntas: preguntasDeAfinar }
      // La vuelta de arreglo: lo que Afinar devuelve corregido.
      return { hallazgos: correccion ?? [{ ...HALLAZGO_INICIAL, deDondeSalio: 'el caso contado, ya reescrito completo' }], preguntas: [] }
    }
    if (opts.phase === 'Leer en frio') {
      const lectura = lecturas[lecturasServidas] ?? null
      lecturasServidas += 1
      return lectura
    }
    if (opts.phase === 'Asentar') {
      return { archivos: [{ ruta: 'roadmap/0099-de-prueba.md', regla: 'una regla dicha' }], noEscritos: [] }
    }
    if (opts.phase === 'Auditar') return dictamen
    return null
  }

  const molino = cargarMolino()
  return molino(entrada, agent, (m: string) => dichos.push(m), () => {}).then((salida) => ({
    llamadas,
    dichos,
    salida: (salida ?? {}) as { estado?: string }
  }))
}

const PLATICA = { paso: 'paso de prueba', platica: 'algo se dijo', hora: '2026-07-31T16:40:00-06:00' }

function promptDeFase(llamadas: Llamada[], fase: string, ocurrencia = 0): string {
  const dela = llamadas.filter((l) => l.opts.phase === fase)
  const llamada = dela[ocurrencia]
  if (!llamada) throw new Error(`el molino nunca llego a la ocurrencia ${ocurrencia} de la fase ${fase}`)
  return llamada.prompt
}

describe('el «no sirve» del auditor cuenta como falla', () => {
  it('con sirve:false el estado devuelto no dice «listo»', async () => {
    const { salida } = await correrMolino(PLATICA, {
      dictamen: {
        ...SIN_FALLAS,
        sirve: false,
        porque: 'RM-0014 dice «el pleito de la tercera falla» y ese pleito no esta en ningun archivo'
      }
    })

    expect(salida.estado).not.toBe('listo')
    expect(salida.estado).toBe('no-sirve')
  })

  it('con sirve:false NO se imprime «sin fallas», aunque las otras tres vengan vacias', async () => {
    const { dichos } = await correrMolino(PLATICA, { dictamen: { ...SIN_FALLAS, sirve: false, porque: 'apodado' } })

    expect(dichos.join('\n')).not.toContain('sin fallas')
    expect(dichos.join('\n')).toContain('1 falla')
  })

  it('el «no sirve» se suma a las otras tres, no las reemplaza', async () => {
    const { dichos } = await correrMolino(PLATICA, {
      dictamen: {
        ...SIN_FALLAS,
        inventado: ['RM-0099 dice algo que nadie dijo'],
        malMarcado: ['RM-0098 quedo confirmado sin un si'],
        sirve: false,
        porque: 'ademas esta apodado'
      }
    })

    expect(dichos.join('\n')).toContain('3 falla')
  })

  it('el porque del auditor sale en el log: un «no sirve» sin renglones no se puede arreglar', async () => {
    const { dichos } = await correrMolino(PLATICA, {
      dictamen: {
        ...SIN_FALLAS,
        sirve: false,
        porque: 'RM-0047 dice «medicion del recorrido del mapa» y eso no es procedencia'
      }
    })

    expect(dichos.join('\n')).toContain('RM-0047')
  })

  it('con sirve:true y las tres vacias, sigue cerrando en «listo» y sin fallas', async () => {
    const { salida, dichos } = await correrMolino(PLATICA)

    expect(salida.estado).toBe('listo')
    expect(dichos.join('\n')).toContain('sin fallas')
  })
})

describe('la procedencia se cuenta entera, y lo que no cabe usa el puntero', () => {
  it('al auditor se le pide el caso contado y se le prohibe el apodo', async () => {
    const { llamadas } = await correrMolino(PLATICA)
    const afinar = llamadas.find((l) => l.opts.phase === 'Afinar')
    const schema = JSON.stringify(afinar?.opts.schema ?? {})

    expect(schema).toContain('apodo')
    expect(schema).toMatch(/no estuvo/i)
  })

  it('al escribano se le dice que el tope manda al documento, no al recorte', async () => {
    const asentar = promptDeFase((await correrMolino(PLATICA)).llamadas, 'Asentar')

    expect(asentar).toContain('roadmap/documentos/')
    expect(asentar).toContain('puntero')
    expect(asentar.toLowerCase()).toContain('no lo recortes')
  })

  it('si el auditor del crudo no dictamina, los huecos del lector en frio no se pierden', async () => {
    // Antes se sumaba todo en un solo numero que se volvia null sin dictamen; los huecos
    // se iban en silencio con el mensaje de «queda sin medir». Aqui el hueco persiste incluso
    // despues de la vuelta de arreglo, para que la falta de dictamen no sea lo unico en juego.
    const huecoQuePersiste = { indice: 0, renglon: 'la pregunta 2', forma: 'puntero-a-la-nada' as const }
    const { salida, dichos } = await correrMolino(PLATICA, {
      dictamen: null,
      lecturas: [{ huecos: [huecoQuePersiste], itemsLeidos: 1 }, { huecos: [huecoQuePersiste], itemsLeidos: 1 }]
    })

    expect(salida.estado).toBe('no-sirve')
    expect(dichos.join('\n')).toContain('1 falla')
  })

  it('sin huecos y con el auditor conforme, el paso cierra en «listo»', async () => {
    const { salida, dichos } = await correrMolino(PLATICA)

    expect(salida.estado).toBe('listo')
    expect(dichos.join('\n')).toContain('sin fallas')
  })

  it('la procedencia que escribe el codigo tambien se entiende sin haber estado', async () => {
    // Segunda ronda: lo que el experto no cerro lo escribe el codigo, no el agente.
    // Se mide con la misma vara — nombra el paso y repite la pregunta completa.
    const { llamadas } = await correrMolino(
      { ...PLATICA, respuestas: 'lo que el experto contesto' },
      { preguntasDeAfinar: [{ pregunta: '¿A partir de cuantos dias de atraso ya no le surte?', falla: 'umbral-sin-numero' }] }
    )

    const asentado = promptDeFase(llamadas, 'Asentar')
    const hallazgos = JSON.parse(asentado.slice(asentado.indexOf('['), asentado.lastIndexOf(']') + 1))
    const abierto = hallazgos.find((h: { firmeza: string }) => h.firmeza === 'abierto')

    expect(abierto).toBeDefined()
    expect(abierto.deDondeSalio).toContain('paso de prueba')
    expect(abierto.deDondeSalio).toContain('¿A partir de cuantos dias de atraso ya no le surte?')
  })
})

describe('«leer en frio» corre antes de escribir, sobre los hallazgos y no sobre archivos', () => {
  it('el lector en frio corre antes que Asentar', async () => {
    const { llamadas } = await correrMolino(PLATICA)

    const indiceLector = llamadas.findIndex((l) => l.opts.phase === 'Leer en frio')
    const indiceAsentar = llamadas.findIndex((l) => l.opts.phase === 'Asentar')

    expect(indiceLector).toBeGreaterThanOrEqual(0)
    expect(indiceAsentar).toBeGreaterThan(indiceLector)
  })

  it('al lector en frio no le llega la platica ni el nombre del paso', async () => {
    const { llamadas } = await correrMolino(PLATICA)
    const lector = llamadas.find((l) => l.opts.phase === 'Leer en frio')
    if (!lector) throw new Error('el molino nunca llego a la fase Leer en frio')

    expect(lector.prompt).toContain('leer-en-frio')
    expect(lector.prompt).not.toContain(PLATICA.platica)
    expect(lector.prompt).not.toContain(PLATICA.paso)
  })

  it('su esquema identifica el hallazgo por posicion, no por archivo, y no tiene donde decir «que agregar»', async () => {
    const lector = (await correrMolino(PLATICA)).llamadas.find((l) => l.opts.phase === 'Leer en frio')
    const schema = JSON.stringify(lector?.opts.schema ?? {})

    expect(schema).toContain('indice')
    expect(schema).toContain('renglon')
    expect(schema).not.toMatch(/"archivo"/)
    expect(schema).not.toMatch(/agregar|sugerencia|recomend|queFalta/i)
  })

  it('sin huecos, nada regresa a Afinar y el paso cierra en «listo»', async () => {
    const { llamadas, salida } = await correrMolino(PLATICA, { lecturas: [SIN_HUECOS] })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(1)
    expect(salida.estado).toBe('listo')
  })

  it('un hallazgo marcado regresa a Afinar con su renglon, y lo corregido llega a Asentar', async () => {
    const { llamadas } = await correrMolino(PLATICA, {
      lecturas: [
        { huecos: [{ indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' }], itemsLeidos: 1 },
        SIN_HUECOS
      ],
      correccion: [{ ...HALLAZGO_INICIAL, deDondeSalio: 'el caso completo, sin apodo, contado paso a paso' }]
    })

    const vuelta = promptDeFase(llamadas, 'Afinar', 1)
    expect(vuelta).toContain('el caso contado')
    expect(vuelta).toContain('apodo-de-caso')

    const asentado = promptDeFase(llamadas, 'Asentar')
    expect(asentado).toContain('el caso completo, sin apodo, contado paso a paso')
    expect(asentado).not.toContain('"deDondeSalio": "el caso contado"')
  })

  it('la vuelta de arreglo ocurre una sola vez, aunque el lector siga marcando cosas en la segunda pasada', async () => {
    const huecoQuePersiste = { indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' as const }
    const { llamadas } = await correrMolino(PLATICA, {
      lecturas: [
        { huecos: [huecoQuePersiste], itemsLeidos: 1 },
        { huecos: [huecoQuePersiste], itemsLeidos: 1 }
      ]
    })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    const llamadasLector = llamadas.filter((l) => l.opts.phase === 'Leer en frio')

    expect(llamadasAfinar).toHaveLength(2)
    expect(llamadasLector).toHaveLength(2)
  })

  it('lo que sigue flaco tras la vuelta se escribe igual: se llama a Asentar con ese hallazgo incluido', async () => {
    const huecoQuePersiste = { indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' as const }
    const { llamadas } = await correrMolino(PLATICA, {
      lecturas: [{ huecos: [huecoQuePersiste], itemsLeidos: 1 }, { huecos: [huecoQuePersiste], itemsLeidos: 1 }]
    })

    const asentar = llamadas.find((l) => l.opts.phase === 'Asentar')
    expect(asentar).toBeDefined()
    const hallazgos = JSON.parse(asentar!.prompt.slice(asentar!.prompt.indexOf('['), asentar!.prompt.lastIndexOf(']') + 1))
    expect(hallazgos).toHaveLength(1)
  })

  it('lo que sigue flaco tras la vuelta se reporta en el log y el estado queda «no-sirve»', async () => {
    const huecoQuePersiste = { indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' as const }
    const { salida, dichos } = await correrMolino(PLATICA, {
      lecturas: [{ huecos: [huecoQuePersiste], itemsLeidos: 1 }, { huecos: [huecoQuePersiste], itemsLeidos: 1 }]
    })

    expect(salida.estado).toBe('no-sirve')
    expect(dichos.join('\n')).toContain('el caso contado')
    expect(dichos.join('\n')).toContain('apodo-de-caso')
  })

  it('si el lector en frio no contesta la primera vez, no se cuenta como que todo estuvo bien', async () => {
    const { dichos } = await correrMolino(PLATICA, { lecturas: [null] })

    expect(dichos.join('\n')).not.toContain('sin fallas')
    expect(dichos.join('\n')).toContain('lector en frio no contesto')
  })
})
