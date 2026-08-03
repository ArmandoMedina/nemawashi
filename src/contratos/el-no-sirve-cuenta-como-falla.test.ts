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
type Invento = { indice: number; frase: string }
type Cotejo = { inventos: Invento[]; hallazgosCotejados: number }
type Grupo = { indices: number[]; porque: string }
type Juntado = { grupos: Grupo[]; hallazgosRevisados: number }
type Hallazgo = { regla: string; deDondeSalio: string; firmeza: string }

const SIN_HUECOS: Lectura = { huecos: [], itemsLeidos: 1 }
const SIN_INVENTOS: Cotejo = { inventos: [], hallazgosCotejados: 1 }
const SIN_GRUPOS: Juntado = { grupos: [], hallazgosRevisados: 1 }
const HALLAZGO_INICIAL: Hallazgo = { regla: 'una regla dicha', deDondeSalio: 'el caso contado', firmeza: 'dicho' }

type OpcionesCorrida = {
  dictamen?: Dictamen | null
  preguntasDeAfinar?: Array<{ pregunta: string; falla: string }>
  /** Una entrada por cada vez que se llama a «Leer en frio»: la primera, y la de la vuelta si la hay. */
  lecturas?: Array<Lectura | null>
  /** Una entrada por cada vez que se llama a «Cotejar»: la primera, y la de la vuelta si la hay. */
  cotejos?: Array<Cotejo | null>
  /** Una entrada por cada vez que se llama a «Juntar»: la primera, y la de la vuelta si la hay. Nunca hay una tercera. */
  juntes?: Array<Juntado | null>
  /** Lo que devuelve Afinar en la vuelta de arreglo (segunda llamada con phase «Afinar»). */
  correccion?: Hallazgo[] | null
}

function correrMolino(entrada: Record<string, unknown>, opciones: OpcionesCorrida = {}): Promise<Corrida> {
  const {
    dictamen = SIN_FALLAS,
    preguntasDeAfinar = [],
    lecturas = [SIN_HUECOS],
    cotejos = [SIN_INVENTOS],
    juntes = [SIN_GRUPOS],
    correccion = null
  } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []
  let lecturasServidas = 0
  let cotejosServidos = 0
  let juntesServidos = 0

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })

    if (opts.phase === 'Sacar') return { platica: PLATICA_TEXTO, transcriptLeido: 'sesion.jsonl' }
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
    if (opts.phase === 'Cotejar') {
      const cotejo = cotejos[cotejosServidos] ?? null
      cotejosServidos += 1
      return cotejo
    }
    if (opts.phase === 'Juntar') {
      const junte = juntes[juntesServidos] ?? null
      juntesServidos += 1
      return junte
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

const PLATICA_TEXTO = 'algo se dijo'
const PLATICA = { paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: '2026-07-31T16:40:00-06:00' }

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
    expect(lector.prompt).not.toContain(PLATICA_TEXTO)
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

describe('«cotejar» corre antes de escribir, y a diferencia del lector en frio si ve la platica', () => {
  it('el cotejo corre antes de Asentar', async () => {
    const { llamadas } = await correrMolino(PLATICA)

    const indiceCotejo = llamadas.findIndex((l) => l.opts.phase === 'Cotejar')
    const indiceAsentar = llamadas.findIndex((l) => l.opts.phase === 'Asentar')

    expect(indiceCotejo).toBeGreaterThanOrEqual(0)
    expect(indiceAsentar).toBeGreaterThan(indiceCotejo)
  })

  it('al cotejador SI le llega la platica, a diferencia del lector en frio', async () => {
    const { llamadas } = await correrMolino(PLATICA)
    const cotejo = llamadas.find((l) => l.opts.phase === 'Cotejar')
    if (!cotejo) throw new Error('el molino nunca llego a la fase Cotejar')

    expect(cotejo.prompt).toContain('cotejar')
    expect(cotejo.prompt).toContain(PLATICA_TEXTO)
  })

  it('un invento marcado regresa a Afinar con su frase señalada, y lo corregido llega a Asentar', async () => {
    const { llamadas } = await correrMolino(PLATICA, {
      cotejos: [{ inventos: [{ indice: 0, frase: 'se le pregunto dos veces' }], hallazgosCotejados: 1 }, SIN_INVENTOS],
      correccion: [{ ...HALLAZGO_INICIAL, deDondeSalio: 'se le pregunto una vez, sin el invento' }]
    })

    const vuelta = promptDeFase(llamadas, 'Afinar', 1)
    expect(vuelta).toContain('se le pregunto dos veces')

    const asentado = promptDeFase(llamadas, 'Asentar')
    expect(asentado).toContain('se le pregunto una vez, sin el invento')
  })

  it('cuando las dos revisiones marcan cosas, hay UNA sola vuelta a Afinar, y el encargo trae los dos tipos', async () => {
    const { llamadas } = await correrMolino(PLATICA, {
      lecturas: [{ huecos: [{ indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' }], itemsLeidos: 1 }, SIN_HUECOS],
      cotejos: [{ inventos: [{ indice: 0, frase: 'se le pregunto dos veces' }], hallazgosCotejados: 1 }, SIN_INVENTOS]
    })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(2)

    const vuelta = promptDeFase(llamadas, 'Afinar', 1)
    expect(vuelta).toContain('el caso contado')
    expect(vuelta).toContain('apodo-de-caso')
    expect(vuelta).toContain('se le pregunto dos veces')
  })

  it('sin inventos ni huecos, nada regresa a Afinar y el paso cierra en «listo»', async () => {
    const { llamadas, salida } = await correrMolino(PLATICA, { lecturas: [SIN_HUECOS], cotejos: [SIN_INVENTOS] })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(1)
    expect(salida.estado).toBe('listo')
  })

  it('lo que siga inventado tras las DOS vueltas se escribe igual: se llama a Asentar con ese hallazgo incluido', async () => {
    const inventoQuePersiste = { indice: 0, frase: 'se le pregunto dos veces' }
    const { llamadas } = await correrMolino(PLATICA, {
      cotejos: [
        { inventos: [inventoQuePersiste], hallazgosCotejados: 1 },
        { inventos: [inventoQuePersiste], hallazgosCotejados: 1 },
        { inventos: [inventoQuePersiste], hallazgosCotejados: 1 }
      ]
    })

    const asentar = llamadas.find((l) => l.opts.phase === 'Asentar')
    expect(asentar).toBeDefined()
    const hallazgos = JSON.parse(asentar!.prompt.slice(asentar!.prompt.indexOf('['), asentar!.prompt.lastIndexOf(']') + 1))
    expect(hallazgos).toHaveLength(1)
  })

  it('lo que sigue inventado tras las dos vueltas se reporta en el log con su archivo y su frase, no solo un conteo', async () => {
    const inventoQuePersiste = { indice: 0, frase: 'se le pregunto dos veces' }
    const { salida, dichos } = await correrMolino(PLATICA, {
      cotejos: [
        { inventos: [inventoQuePersiste], hallazgosCotejados: 1 },
        { inventos: [inventoQuePersiste], hallazgosCotejados: 1 },
        { inventos: [inventoQuePersiste], hallazgosCotejados: 1 }
      ]
    })

    expect(salida.estado).toBe('no-sirve')
    expect(dichos.join('\n')).toContain('roadmap/0099-de-prueba.md')
    expect(dichos.join('\n')).toContain('se le pregunto dos veces')
  })

  it('si el cotejador no contesta, no se cuenta como que todo salio bien', async () => {
    const { dichos } = await correrMolino(PLATICA, { cotejos: [null] })

    expect(dichos.join('\n')).not.toContain('sin fallas')
    expect(dichos.join('\n')).toContain('cotejador no contesto')
  })

  it('con inventos que sobreviven la primera vuelta, hay una SEGUNDA llamada de arreglo a Afinar, y su encargo trae solo los inventos', async () => {
    const huecoQuePersiste = { indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' }
    const inventoQuePersisteUnaVuelta = { indice: 0, frase: 'se le pregunto dos veces' }
    const { llamadas } = await correrMolino(PLATICA, {
      // El hueco sigue marcado en las dos lecturas: no dispara segunda vuelta por si solo,
      // y el encargo de la segunda vuelta no lo tiene que traer.
      lecturas: [{ huecos: [huecoQuePersiste], itemsLeidos: 1 }, { huecos: [huecoQuePersiste], itemsLeidos: 1 }],
      cotejos: [
        { inventos: [inventoQuePersisteUnaVuelta], hallazgosCotejados: 1 },
        { inventos: [inventoQuePersisteUnaVuelta], hallazgosCotejados: 1 },
        SIN_INVENTOS
      ],
      // El default del mock reescribe con «el caso contado, ya reescrito completo», y esa
      // frase chocaria con la aserción de abajo por casualidad de las palabras, no por una
      // falla real. Se manda una reescritura explicita sin esas palabras.
      correccion: [{ ...HALLAZGO_INICIAL, deDondeSalio: 'reescrito sin la frase inventada' }]
    })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(3)

    const segundaVuelta = promptDeFase(llamadas, 'Afinar', 2)
    expect(segundaVuelta).toContain('se le pregunto dos veces')
    expect(segundaVuelta).not.toContain('apodo-de-caso')
    expect(segundaVuelta).not.toContain('el caso contado')
  })

  it('nunca hay una tercera vuelta, aunque el cotejo siga marcando despues de la segunda: la linea sigue y escribe', async () => {
    const inventoQueNuncaSeArregla = { indice: 0, frase: 'se le pregunto dos veces' }
    const { llamadas, salida } = await correrMolino(PLATICA, {
      cotejos: [
        { inventos: [inventoQueNuncaSeArregla], hallazgosCotejados: 1 },
        { inventos: [inventoQueNuncaSeArregla], hallazgosCotejados: 1 },
        { inventos: [inventoQueNuncaSeArregla], hallazgosCotejados: 1 }
      ]
    })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    const llamadasCotejar = llamadas.filter((l) => l.opts.phase === 'Cotejar')
    const llamadasAsentar = llamadas.filter((l) => l.opts.phase === 'Asentar')

    expect(llamadasAfinar).toHaveLength(3)
    expect(llamadasCotejar).toHaveLength(3)
    expect(llamadasAsentar).toHaveLength(1)
    expect(salida.estado).toBe('no-sirve')
  })

  it('un hueco que sobrevive la primera vuelta NO provoca segunda vuelta por si solo', async () => {
    const huecoQuePersiste = { indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' }
    const { llamadas, salida } = await correrMolino(PLATICA, {
      lecturas: [{ huecos: [huecoQuePersiste], itemsLeidos: 1 }, { huecos: [huecoQuePersiste], itemsLeidos: 1 }],
      cotejos: [SIN_INVENTOS, SIN_INVENTOS]
    })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(2)
    expect(salida.estado).toBe('no-sirve')
  })

  it('sin inventos ni huecos, sigue sin haber ninguna vuelta y el paso cierra en «listo»', async () => {
    const { llamadas, salida } = await correrMolino(PLATICA, { lecturas: [SIN_HUECOS], cotejos: [SIN_INVENTOS] })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(1)
    expect(salida.estado).toBe('listo')
  })
})

describe('el cotejador ve todo lo que dijo el experto, la platica y las respuestas', () => {
  const CON_RESPUESTAS = {
    ...PLATICA,
    respuestas: 'El experto contesto: la marca de firmeza la pone el auditor, no el escribano.'
  }

  it('cuando llegan respuestas, el prompt del cotejador las contiene en la primera vuelta y en la de arreglo', async () => {
    const { llamadas } = await correrMolino(CON_RESPUESTAS, {
      cotejos: [{ inventos: [{ indice: 0, frase: 'algo inventado' }], hallazgosCotejados: 1 }, SIN_INVENTOS]
    })

    const primeraVuelta = promptDeFase(llamadas, 'Cotejar', 0)
    const segundaVuelta = promptDeFase(llamadas, 'Cotejar', 1)

    expect(primeraVuelta).toContain(CON_RESPUESTAS.respuestas)
    expect(segundaVuelta).toContain(CON_RESPUESTAS.respuestas)
  })

  it('cuando llegan respuestas, el prompt del lector en frio no las contiene: sigue ciego', async () => {
    const { llamadas } = await correrMolino(CON_RESPUESTAS)
    const lector = llamadas.find((l) => l.opts.phase === 'Leer en frio')
    if (!lector) throw new Error('el molino nunca llego a la fase Leer en frio')

    expect(lector.prompt).not.toContain(CON_RESPUESTAS.respuestas)
  })

  it('cuando llegan respuestas, a quien junta tampoco le llegan', async () => {
    const { llamadas } = await correrMolino(CON_RESPUESTAS)
    const juntar = llamadas.find((l) => l.opts.phase === 'Juntar')
    if (!juntar) throw new Error('el molino nunca llego a la fase Juntar')

    expect(juntar.prompt).not.toContain(CON_RESPUESTAS.respuestas)
  })

  it('sin respuestas, el cotejador sigue recibiendo la platica y todo funciona igual que hoy', async () => {
    const { llamadas } = await correrMolino(PLATICA)
    const cotejo = llamadas.find((l) => l.opts.phase === 'Cotejar')
    if (!cotejo) throw new Error('el molino nunca llego a la fase Cotejar')

    expect(cotejo.prompt).toContain(PLATICA_TEXTO)
  })
})

describe('las vueltas de arreglo de Afinar ven todo lo que dijo el experto, no solo la platica', () => {
  const CON_RESPUESTAS = {
    ...PLATICA,
    respuestas: 'El experto contesto: la marca de firmeza la pone el auditor, no el escribano.'
  }

  it('con respuestas, el prompt de la vuelta compartida (huecos/inventos/grupos) las contiene', async () => {
    const { llamadas } = await correrMolino(CON_RESPUESTAS, {
      lecturas: [{ huecos: [{ indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' }], itemsLeidos: 1 }, SIN_HUECOS],
      cotejos: [SIN_INVENTOS, SIN_INVENTOS]
    })

    const vuelta = promptDeFase(llamadas, 'Afinar', 1)
    expect(vuelta).toContain(CON_RESPUESTAS.respuestas)
  })

  it('con respuestas, el prompt de la vuelta de solo-inventos las contiene', async () => {
    const inventoQuePersisteUnaVuelta = { indice: 0, frase: 'se le pregunto dos veces' }
    const { llamadas } = await correrMolino(CON_RESPUESTAS, {
      cotejos: [
        { inventos: [inventoQuePersisteUnaVuelta], hallazgosCotejados: 1 },
        { inventos: [inventoQuePersisteUnaVuelta], hallazgosCotejados: 1 },
        SIN_INVENTOS
      ]
    })

    const segundaVuelta = promptDeFase(llamadas, 'Afinar', 2)
    expect(segundaVuelta).toContain(CON_RESPUESTAS.respuestas)
  })

  it('sin respuestas, la vuelta compartida sigue recibiendo la platica y nada cambia', async () => {
    const { llamadas } = await correrMolino(PLATICA, {
      lecturas: [{ huecos: [{ indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' }], itemsLeidos: 1 }, SIN_HUECOS],
      cotejos: [SIN_INVENTOS, SIN_INVENTOS]
    })

    const vuelta = promptDeFase(llamadas, 'Afinar', 1)
    expect(vuelta).toContain(PLATICA_TEXTO)
  })

  it('sin respuestas, la vuelta de solo-inventos sigue recibiendo la platica y nada cambia', async () => {
    const inventoQuePersisteUnaVuelta = { indice: 0, frase: 'se le pregunto dos veces' }
    const { llamadas } = await correrMolino(PLATICA, {
      cotejos: [
        { inventos: [inventoQuePersisteUnaVuelta], hallazgosCotejados: 1 },
        { inventos: [inventoQuePersisteUnaVuelta], hallazgosCotejados: 1 },
        SIN_INVENTOS
      ]
    })

    const segundaVuelta = promptDeFase(llamadas, 'Afinar', 2)
    expect(segundaVuelta).toContain(PLATICA_TEXTO)
  })
})

describe('«juntar» señala los hallazgos que son un mismo problema, y corre en la vuelta 1, nunca en la vuelta 2', () => {
  it('quien junta corre antes de Asentar', async () => {
    const { llamadas } = await correrMolino(PLATICA)

    const indiceJuntar = llamadas.findIndex((l) => l.opts.phase === 'Juntar')
    const indiceAsentar = llamadas.findIndex((l) => l.opts.phase === 'Asentar')

    expect(indiceJuntar).toBeGreaterThanOrEqual(0)
    expect(indiceAsentar).toBeGreaterThan(indiceJuntar)
  })

  it('a quien junta no le llega la platica ni el nombre del paso', async () => {
    const { llamadas } = await correrMolino(PLATICA)
    const juntar = llamadas.find((l) => l.opts.phase === 'Juntar')
    if (!juntar) throw new Error('el molino nunca llego a la fase Juntar')

    expect(juntar.prompt).toContain('juntar')
    expect(juntar.prompt).not.toContain(PLATICA_TEXTO)
    expect(juntar.prompt).not.toContain(PLATICA.paso)
  })

  it('su esquema pide indices y motivo, y no tiene campo para redactar el renglon junto', async () => {
    const juntar = (await correrMolino(PLATICA)).llamadas.find((l) => l.opts.phase === 'Juntar')
    const schema = JSON.stringify(juntar?.opts.schema ?? {})

    expect(schema).toContain('indices')
    expect(schema).toContain('porque')
    expect(schema).not.toMatch(/renglonJunto|comoQuedaria|redact|reescri/i)
  })

  it('un grupo marcado regresa a Afinar en la vuelta 1, en el mismo encargo que los huecos y los inventos', async () => {
    const { llamadas } = await correrMolino(PLATICA, {
      lecturas: [{ huecos: [{ indice: 0, renglon: 'el caso contado', forma: 'apodo-de-caso' }], itemsLeidos: 1 }, SIN_HUECOS],
      cotejos: [{ inventos: [{ indice: 0, frase: 'se le pregunto dos veces' }], hallazgosCotejados: 1 }, SIN_INVENTOS],
      juntes: [{ grupos: [{ indices: [0, 1], porque: 'son el mismo problema' }], hallazgosRevisados: 2 }, SIN_GRUPOS]
    })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(2)

    const vuelta = promptDeFase(llamadas, 'Afinar', 1)
    expect(vuelta).toContain('el caso contado')
    expect(vuelta).toContain('apodo-de-caso')
    expect(vuelta).toContain('se le pregunto dos veces')
    expect(vuelta).toContain('son el mismo problema')
  })

  it('un grupo por si solo, sin huecos ni inventos, tambien dispara la vuelta 1', async () => {
    const { llamadas } = await correrMolino(PLATICA, {
      juntes: [{ grupos: [{ indices: [0, 1], porque: 'son el mismo problema' }], hallazgosRevisados: 2 }, SIN_GRUPOS]
    })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(2)
  })

  it('un grupo que sobrevive la vuelta 1 NO dispara la vuelta 2: esa sigue siendo solo de inventos', async () => {
    const grupoQuePersiste = { indices: [0, 1], porque: 'son el mismo problema' }
    const { llamadas, salida } = await correrMolino(PLATICA, {
      juntes: [{ grupos: [grupoQuePersiste], hallazgosRevisados: 2 }, { grupos: [grupoQuePersiste], hallazgosRevisados: 2 }],
      cotejos: [SIN_INVENTOS, SIN_INVENTOS]
    })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(2)
    expect(salida.estado).toBe('no-sirve')
  })

  it('lo que sigue picado tras la vuelta se escribe igual y sale en el log con sus archivos', async () => {
    const grupoQuePersiste = { indices: [0, 1], porque: 'son el mismo problema' }
    const { llamadas, dichos } = await correrMolino(PLATICA, {
      juntes: [{ grupos: [grupoQuePersiste], hallazgosRevisados: 2 }, { grupos: [grupoQuePersiste], hallazgosRevisados: 2 }]
    })

    const asentar = llamadas.find((l) => l.opts.phase === 'Asentar')
    expect(asentar).toBeDefined()
    const hallazgos = JSON.parse(asentar!.prompt.slice(asentar!.prompt.indexOf('['), asentar!.prompt.lastIndexOf(']') + 1))
    expect(hallazgos).toHaveLength(1)

    expect(dichos.join('\n')).toContain('roadmap/0099-de-prueba.md')
    expect(dichos.join('\n')).toContain('son el mismo problema')
  })

  it('sin huecos, sin inventos y sin grupos, no hay ninguna vuelta y el paso cierra en «listo»', async () => {
    const { llamadas, salida } = await correrMolino(PLATICA, { lecturas: [SIN_HUECOS], cotejos: [SIN_INVENTOS], juntes: [SIN_GRUPOS] })

    const llamadasAfinar = llamadas.filter((l) => l.opts.phase === 'Afinar')
    expect(llamadasAfinar).toHaveLength(1)
    expect(salida.estado).toBe('listo')
  })

  it('si quien junta no contesta, no se cuenta como que todo salio bien', async () => {
    const { dichos } = await correrMolino(PLATICA, { juntes: [null] })

    expect(dichos.join('\n')).not.toContain('sin fallas')
    expect(dichos.join('\n')).toContain('junta no contesto')
  })
})
