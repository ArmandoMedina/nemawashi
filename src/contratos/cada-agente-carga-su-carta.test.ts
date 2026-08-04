import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * El contrato: cada caja del molino llama al agente que le toca y le nombra SU carta.
 *
 * Un agente sin carta no es un agente barato: es uno que trabaja por costumbre general. Las
 * fichas del auditor y del escribano no declaran carta -quien los llama les dice cual cargar-,
 * asi que el unico lugar donde esa asignacion existe es el prompt que arma este archivo. Si el
 * molino nombra la carta equivocada, o no nombra ninguna, nada falla: el agente contesta algo
 * razonable y la corrida sigue. Por eso hace falta medirlo.
 *
 * Se mide tambien el orden que ninguna carta puede garantizar sola: el examen se levanta antes
 * de que exista una sola pieza. No hay archivo que lo pruebe despues -el examen no toca disco
 * nunca-, asi que el orden de las llamadas es la unica garantia que queda.
 *
 * Igual que los otros contratos del molino: no es un modulo TypeScript importable, lo ejecuta
 * el runtime de Claude Code inyectando `args`, `agent`, `log` y `phase`. Aqui se reproduce esa
 * invocacion con un `agent` falso que contesta lo minimo que cada schema exige, y nada mas.
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

const PLATICA_TEXTO = 'EXPERTO: a un taller que apenas abre no se le fia\n\nAGENTE: entendido'
const ENTRADA = { paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: '2026-08-04T11:00:00-06:00' }

const PREGUNTA = 'A un taller que apenas abre se le puede dar credito?'
const EXAMEN = { preguntas: [PREGUNTA] }

const CAPACIDAD = {
  id: 'CAP-1',
  renglon: 'Dar credito a un taller que apenas abre',
  modulo: 'MOD-1',
  reglas: ['REG-1'],
  firmeza: 'dicho',
  origen: 'escuchado',
  enSusPalabras: 'a un taller que apenas abre no se le fia',
  deDondeSalio: 'salio al contar el caso de un taller que llevaba dos meses operando',
  queQuedaAbierto: 'nada'
}

const MODULO = {
  id: 'MOD-1',
  renglon: 'Credito',
  capacidades: ['CAP-1'],
  queAgrupa: 'lo que decide si se fia y por cuanto; no cae aqui el cobro de lo ya fiado',
  firmeza: 'dicho',
  origen: 'propuesto',
  enSusPalabras: 'el experto no lo nombro; el corte lo propuso el agente',
  deDondeSalio: 'sin este corte las reglas de fiar y las de cobrar caian en la misma bolsa',
  queQuedaAbierto: 'nada'
}

const REGLA = {
  id: 'REG-1',
  renglon: 'A un taller con menos de tres meses no se le fia',
  capacidades: ['CAP-1'],
  firmeza: 'dicho',
  origen: 'escuchado',
  enSusPalabras: 'a un taller que apenas abre no se le fia',
  deDondeSalio: 'salio al contar el caso de un taller que llevaba dos meses operando',
  queQuedaAbierto: 'nada'
}

const REGISTRO_LIMPIO = { capacidades: [CAPACIDAD], modulos: [MODULO], reglas: [REGLA], dudas: [], senaladas: [] }

const SIN_HUECOS = { huecos: [], piezasLeidas: 3 }
const SIN_INVENTOS = { inventos: [], piezasCotejadas: 3 }
const EXAMEN_APROBADO = {
  respuestas: [{ pregunta: PREGUNTA, veredicto: 'contestada', respuesta: 'no, si lleva menos de tres meses', camino: ['CAP-1', 'REG-1'] }],
  senaladas: [],
  sinPieza: []
}

const ESCRITOS_LIMPIOS = {
  archivos: [
    { ruta: 'product/conocimiento/capacidades/0001-credito-a-taller-nuevo.md', id: 'CAP-0001', idDeTrabajo: 'CAP-1', estado: 'completa' },
    { ruta: 'product/conocimiento/modulos/0001-credito.md', id: 'MOD-0001', idDeTrabajo: 'MOD-1', estado: 'completa' },
    { ruta: 'product/conocimiento/reglas/0001-antiguedad-minima.md', id: 'REG-0001', idDeTrabajo: 'REG-1', estado: 'completa' }
  ],
  noEscritos: [],
  senalesSinPieza: []
}

const SIN_FALLAS = { inventado: [], perdido: [], malMarcado: [], sirve: true, porque: 'sin fallas', transcriptLeido: 'sesion.jsonl' }

const LO_QUE_FALTA = { deEstePaso: [], deAntes: [], archivosRecorridos: 3 }

type OpcionesCorrida = {
  examen?: Record<string, unknown> | null
  registro?: Record<string, unknown> | null
  lecturas?: Array<Record<string, unknown> | null>
  cotejos?: Array<Record<string, unknown> | null>
  examenes?: Array<Record<string, unknown> | null>
  correccion?: Record<string, unknown> | null
  escritos?: Record<string, unknown> | null
  dictamen?: Record<string, unknown> | null
}

/**
 * La fase «Medir» corre tres agentes a la vez, asi que aqui se distingue por el `label` y no
 * solo por la fase -es la primera vez que el molino manda tres llamadas bajo un mismo titulo.
 */
function correrMolino(entrada: Record<string, unknown>, opciones: OpcionesCorrida = {}): Promise<Corrida> {
  const {
    examen = EXAMEN,
    registro = REGISTRO_LIMPIO,
    lecturas = [SIN_HUECOS],
    cotejos = [SIN_INVENTOS],
    examenes = [EXAMEN_APROBADO],
    correccion = null,
    escritos = ESCRITOS_LIMPIOS,
    dictamen = SIN_FALLAS
  } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []
  let lecturasServidas = 0
  let cotejosServidos = 0
  let examenesServidos = 0

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    if (opts.phase === 'Sacar') return { platica: PLATICA_TEXTO, transcriptLeido: 'sesion.jsonl' }
    if (opts.phase === 'Levantar el examen') return examen
    if (opts.phase === 'Construir') return registro
    if (opts.phase === 'Corregir') return correccion
    if (opts.phase === 'Medir') {
      if (label.startsWith('leer-en-frio')) return lecturas[lecturasServidas++] ?? null
      if (label.startsWith('cotejar')) return cotejos[cotejosServidos++] ?? null
      if (label.startsWith('contestar-examen')) return examenes[examenesServidos++] ?? null
      return null
    }
    if (opts.phase === 'Registrar') return escritos
    if (opts.phase === 'Auditar') return dictamen
    if (opts.phase === 'Armar lo que falta') return LO_QUE_FALTA
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
  if (!llamada) throw new Error(`el molino nunca llego a la fase ${fase}${prefijoDeLabel ? ` con label ${prefijoDeLabel}` : ''}`)
  return llamada
}

describe('cada caja del molino nombra la carta del agente que la hace', () => {
  it('cada fase carga su carta, y ninguna carga la de otra', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    const esperadas: Array<[string, string | undefined, string]> = [
      ['Levantar el examen', undefined, 'levantar-el-examen'],
      ['Construir', undefined, 'construir-el-registro'],
      ['Medir', 'leer-en-frio', 'leer-en-frio'],
      ['Medir', 'cotejar', 'cotejar'],
      ['Medir', 'contestar-examen', 'contestar-el-examen'],
      ['Registrar', undefined, 'registrar-el-conocimiento'],
      ['Auditar', undefined, 'auditar'],
      ['Armar lo que falta', undefined, 'armar-lo-que-falta']
    ]

    for (const [fase, prefijo, carta] of esperadas) {
      const llamada = llamadaDe(llamadas, fase, prefijo)
      expect(llamada.prompt, `${fase} no nombra su carta`).toContain(`\`${carta}\``)
      expect(llamada.prompt, `${fase} no dice que la cargue`).toMatch(/Carga tu carta/)
    }
  })

  it('a «Sacar» se le dice que NO cargue ninguna carta: su tarea es mecanica', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const sacar = llamadaDe(llamadas, 'Sacar')

    expect(sacar.prompt).toContain('no cargues ninguna de tus cartas')
    expect(sacar.prompt).not.toMatch(/Carga tu carta/)
  })

  it('escribe el escribano, y todo lo demas lo mide el auditor', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    const escribanos = llamadas.filter((l) => l.opts.agentType === 'escribano')
    expect(escribanos).toHaveLength(1)
    expect(escribanos.map((l) => l.opts.phase)).toEqual(['Registrar'])

    for (const l of llamadas) {
      expect(['auditor', 'escribano']).toContain(l.opts.agentType)
    }
  })

  it('la carta del roadmap no aparece por ningun lado: `asentar` escribe en otra carpeta', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const registrar = llamadaDe(llamadas, 'Registrar')

    expect(registrar.prompt).not.toContain('`asentar`')
    expect(registrar.prompt).toContain('product/conocimiento/')
    expect(registrar.prompt).not.toMatch(/escribes en `roadmap\//)
  })
})

describe('el examen se levanta antes de que exista una sola pieza', () => {
  it('«Levantar el examen» corre antes que «Construir»', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    const indiceExamen = llamadas.findIndex((l) => l.opts.phase === 'Levantar el examen')
    const indiceConstruir = llamadas.findIndex((l) => l.opts.phase === 'Construir')

    expect(indiceExamen).toBeGreaterThanOrEqual(0)
    expect(indiceConstruir).toBeGreaterThan(indiceExamen)
  })

  it('a quien levanta el examen no le llega ninguna pieza, porque todavia no existen', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const examen = llamadaDe(llamadas, 'Levantar el examen')

    expect(examen.prompt).toContain(PLATICA_TEXTO)
    expect(examen.prompt).not.toContain('CAP-1')
    expect(examen.prompt).not.toContain(CAPACIDAD.renglon)
  })

  it('a quien construye se le pasa el examen ya levantado y se le dice que no lo toque', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const construir = llamadaDe(llamadas, 'Construir')

    expect(construir.prompt).toContain(PREGUNTA)
    expect(construir.prompt).toContain('no lo puedes tocar')
  })

  it('si la platica no dio ninguna pregunta, no se construye nada', async () => {
    const { llamadas, salida } = await correrMolino(ENTRADA, { examen: { preguntas: [] } })

    expect(llamadas.find((l) => l.opts.phase === 'Construir')).toBeUndefined()
    expect(salida.estado).toBe('sin-examen')
  })
})

describe('las tres mediciones corren antes de escribir, y cada una ve algo distinto', () => {
  it('las tres corren antes que «Registrar»', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    const indiceRegistrar = llamadas.findIndex((l) => l.opts.phase === 'Registrar')
    const mediciones = llamadas.map((l, i) => ({ i, l })).filter(({ l }) => l.opts.phase === 'Medir')

    expect(mediciones).toHaveLength(3)
    expect(indiceRegistrar).toBeGreaterThanOrEqual(0)
    for (const { i } of mediciones) expect(indiceRegistrar).toBeGreaterThan(i)
  })

  it('al lector en frio no le llega la platica ni el nombre del paso ni el examen', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const lector = llamadaDe(llamadas, 'Medir', 'leer-en-frio')

    expect(lector.prompt).not.toContain(PLATICA_TEXTO)
    expect(lector.prompt).not.toContain(ENTRADA.paso)
    expect(lector.prompt).not.toContain(PREGUNTA)
  })

  it('al lector en frio tampoco le llega `origen` ni `firmeza`: saber de donde salio es enterarse', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const lector = llamadaDe(llamadas, 'Medir', 'leer-en-frio')

    expect(lector.prompt).not.toContain('"origen"')
    expect(lector.prompt).not.toContain('"firmeza"')
  })

  it('al cotejador SI le llega la platica y el `origen`, que es lo que decide que coteja', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const cotejador = llamadaDe(llamadas, 'Medir', 'cotejar')

    expect(cotejador.prompt).toContain(PLATICA_TEXTO)
    expect(cotejador.prompt).toContain('"origen"')
    expect(cotejador.prompt).toContain('solo lo `escuchado`')
  })

  it('a quien contesta el examen le llega el registro y las preguntas, pero NO la platica', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const examinador = llamadaDe(llamadas, 'Medir', 'contestar-examen')

    expect(examinador.prompt).toContain(PREGUNTA)
    expect(examinador.prompt).toContain('CAP-1')
    expect(examinador.prompt).not.toContain(PLATICA_TEXTO)
  })
})

describe('el `estado` lo produce un solo lado', () => {
  it('a quien construye se le prohibe ponerlo, junto con el paso y la hora', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const construir = llamadaDe(llamadas, 'Construir')

    expect(construir.prompt).toContain('No pongas `paso`, `alta`, `confirmado` ni `estado`')
  })

  it('una pieza que ninguna medicion senalo llega al escribano como `completa`', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const registrar = llamadaDe(llamadas, 'Registrar')

    expect(registrar.prompt).toContain('"estado": "completa"')
    expect(registrar.prompt).not.toContain('"estado": "con-huecos"')
  })

  it('basta que UNA medicion la senale para que llegue `con-huecos`, aunque las otras dos salgan limpias', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [{ huecos: [{ id: 'REG-1', renglon: REGLA.renglon, forma: 'palabra-sin-definir' }], piezasLeidas: 3 }],
      correccion: null
    })

    const registrar = llamadaDe(llamadas, 'Registrar')
    const marcadas = registrar.prompt.match(/"estado": "con-huecos"/g) ?? []

    expect(marcadas).toHaveLength(1)
    expect(registrar.prompt).toContain('No lo cambies')
  })

  it('una senal que el escribano no marco en disco se cuenta igual: la marca no se pierde en el reporte', async () => {
    const { salida, dichos } = await correrMolino(ENTRADA, {
      lecturas: [{ huecos: [{ id: 'REG-1', renglon: REGLA.renglon, forma: 'palabra-sin-definir' }], piezasLeidas: 3 }],
      correccion: null,
      escritos: ESCRITOS_LIMPIOS
    })

    expect(salida.estado).toBe('con-huecos')
    expect(salida.senaladasSinMarcar).toEqual(['REG-1'])
    expect(dichos.join('\n')).toContain('no quedaron marcadas en disco')
  })

  it('lo que el examen no rozaba se le pasa aparte, sin traducirlo a una pieza', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      examenes: [{ respuestas: [], senaladas: [], sinPieza: ['Quien autoriza una excepcion?'] }]
    })

    const registrar = llamadaDe(llamadas, 'Registrar')
    expect(registrar.prompt).toContain('Quien autoriza una excepcion?')
    expect(registrar.prompt).toContain('NO corresponde a ninguna pieza')
  })
})

describe('la hora y el paso se estampan, nunca los pone el agente', () => {
  it('cada pieza le llega al escribano con su `alta` y su `paso`', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const registrar = llamadaDe(llamadas, 'Registrar')

    const altas = registrar.prompt.match(/"alta": "2026-08-04T11:00:00-06:00"/g) ?? []
    expect(altas).toHaveLength(3)
    expect(registrar.prompt).toContain('"paso": "paso de prueba"')
  })

  it('sin hora, ninguna pieza trae `alta` inventada y al escribano se le dice', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl' })
    const registrar = llamadaDe(llamadas, 'Registrar')

    expect(registrar.prompt).not.toContain('"alta"')
    expect(registrar.prompt).toContain('No llego la hora del alta')
  })

  it('`confirmado` sale de la firmeza, no del agente: solo lo trae la pieza confirmada', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      registro: { ...REGISTRO_LIMPIO, reglas: [{ ...REGLA, firmeza: 'confirmado' }] }
    })

    const registrar = llamadaDe(llamadas, 'Registrar')
    const confirmados = registrar.prompt.match(/"confirmado": "2026-08-04T11:00:00-06:00"/g) ?? []

    expect(confirmados).toHaveLength(1)
  })
})

describe('las dudas paran la corrida una vez, no para siempre', () => {
  it('con dudas en la primera corrida no se escribe nada', async () => {
    const { llamadas, salida } = await correrMolino(ENTRADA, {
      registro: { ...REGISTRO_LIMPIO, dudas: [{ pregunta: 'Desde cuantos meses si se le fia?', falla: 'umbral-sin-numero' }] }
    })

    expect(llamadas.find((l) => l.opts.phase === 'Registrar')).toBeUndefined()
    expect(salida.estado).toBe('dudas-devueltas')
  })

  it('con respuestas del experto, las mismas dudas ya no paran nada y se escribe', async () => {
    const { llamadas, salida } = await correrMolino(
      { ...ENTRADA, respuestas: 'desde los tres meses' },
      { registro: { ...REGISTRO_LIMPIO, dudas: [{ pregunta: 'Desde cuantos meses si se le fia?', falla: 'umbral-sin-numero' }] } }
    )

    expect(llamadas.find((l) => l.opts.phase === 'Registrar')).toBeDefined()
    expect(salida.estado).toBe('listo')
  })

  it('en la segunda corrida se le dice al constructor que no devuelva dudas', async () => {
    const { llamadas } = await correrMolino({ ...ENTRADA, respuestas: 'desde los tres meses' })
    const construir = llamadaDe(llamadas, 'Construir')

    expect(construir.prompt).toContain('no devuelvas dudas')
    expect(construir.prompt).toContain('desde los tres meses')
  })
})

describe('las vueltas de correccion tienen tope, y lo pone el codigo', () => {
  it('nunca hay una tercera vuelta, aunque el cotejo siga marcando: la linea sigue y escribe', async () => {
    const conInvento = { inventos: [{ id: 'CAP-1', frase: 'una frase que nadie dijo' }], piezasCotejadas: 3 }

    const { llamadas, salida } = await correrMolino(ENTRADA, {
      cotejos: [conInvento, conInvento, conInvento],
      correccion: REGISTRO_LIMPIO
    })

    expect(llamadas.filter((l) => l.opts.phase === 'Corregir')).toHaveLength(2)
    expect(llamadas.find((l) => l.opts.phase === 'Registrar')).toBeDefined()
    expect(salida.estado).toBe('con-huecos')
  })

  it('lo que no se entiende solo no dispara la segunda vuelta: eso se cierra con el experto, no reescribiendo', async () => {
    const conHueco = { huecos: [{ id: 'CAP-1', renglon: CAPACIDAD.renglon, forma: 'apodo-de-caso' }], piezasLeidas: 3 }

    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [conHueco, conHueco],
      correccion: REGISTRO_LIMPIO
    })

    expect(llamadas.filter((l) => l.opts.phase === 'Corregir')).toHaveLength(1)
  })
})

describe('el cierre dice lo que se midio, y lo que no', () => {
  it('con un dictamen «no sirve» el estado no dice «listo», aunque las tres listas vengan vacias', async () => {
    const { dichos, salida } = await correrMolino(ENTRADA, {
      dictamen: { ...SIN_FALLAS, sirve: false, porque: 'la capacidad 0001 esta apodada' }
    })

    expect(salida.estado).toBe('con-huecos')
    expect(dichos.join('\n')).toContain('la capacidad 0001 esta apodada')
  })

  it('el agente que no contesta se nombra: un silencio no es una aprobacion', async () => {
    const { dichos } = await correrMolino(ENTRADA, { dictamen: null, examenes: [null] })

    expect(dichos.join('\n')).toContain('El auditor no dictamino')
    expect(dichos.join('\n')).toContain('Nadie contesto el examen')
  })

  it('al auditor se le dice donde se escribio, para que no audite la carpeta equivocada', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const auditar = llamadaDe(llamadas, 'Auditar')

    expect(auditar.prompt).toContain('product/conocimiento/')
    expect(auditar.prompt).toContain('sesion.jsonl')
    expect(auditar.prompt).toContain('antes de abrir un solo archivo escrito')
  })
})
