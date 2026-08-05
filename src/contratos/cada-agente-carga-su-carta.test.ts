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
  deDondeSalio: 'salio de la misma platica, al fijar el limite en tres meses de antiguedad',
  queQuedaAbierto: 'nada'
}

const DOMINIO = {
  id: 'DOM-1',
  renglon: 'Credito y cobranza',
  modulos: ['MOD-1'],
  quienLoSabe: 'quien autoriza que se le fie a un cliente',
  queAgrupa: 'lo que decide a quien se le fia y como se le cobra; no cae aqui lo que se surte',
  firmeza: 'dicho',
  origen: 'propuesto',
  enSusPalabras: 'el experto no nombro el area; el corte lo propuso el agente',
  deDondeSalio: 'sin este corte no se sabia con quien se levanta lo de adentro',
  queQuedaAbierto: 'nada'
}

const REGISTRO_LIMPIO = { dominios: [DOMINIO], capacidades: [CAPACIDAD], modulos: [MODULO], reglas: [REGLA], dudas: [], senaladas: [] }

const INVENTARIO_VACIO = { piezas: [] }
const SIN_MARCAR = { marcados: [], perdido: [] }

const SIN_HUECOS = { huecos: [], piezasLeidas: 3 }
const SIN_INVENTOS = { inventos: [], piezasCotejadas: 3 }
const EXAMEN_APROBADO = {
  respuestas: [{ pregunta: PREGUNTA, veredicto: 'contestada', respuesta: 'no, si lleva menos de tres meses', camino: ['CAP-1', 'REG-1'] }],
  senaladas: [],
  sinPieza: []
}

const ESCRITOS_LIMPIOS = {
  archivos: [
    { ruta: 'product/conocimiento/dominios/0001-credito-y-cobranza.md', id: 'DOM-0001', idDeTrabajo: 'DOM-1', estado: 'completa' },
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
  inventario?: Record<string, unknown> | null
  marcado?: Record<string, unknown> | null
  examen?: Record<string, unknown> | null
  registro?: Record<string, unknown> | null
  lecturas?: Array<Record<string, unknown> | null>
  cotejos?: Array<Record<string, unknown> | null>
  examenes?: Array<Record<string, unknown> | null>
  correccion?: Record<string, unknown> | null
  escritos?: Record<string, unknown> | null
  dictamen?: Record<string, unknown> | null
  respuestasSacadas?: Record<string, unknown> | null
}

/**
 * La fase «Medir» corre tres agentes a la vez, asi que aqui se distingue por el `label` y no
 * solo por la fase -es la primera vez que el molino manda tres llamadas bajo un mismo titulo.
 */
function correrMolino(entrada: Record<string, unknown>, opciones: OpcionesCorrida = {}): Promise<Corrida> {
  const {
    inventario = INVENTARIO_VACIO,
    marcado = SIN_MARCAR,
    examen = EXAMEN,
    registro = REGISTRO_LIMPIO,
    lecturas = [SIN_HUECOS],
    cotejos = [SIN_INVENTOS],
    examenes = [EXAMEN_APROBADO],
    correccion = null,
    escritos = ESCRITOS_LIMPIOS,
    dictamen = SIN_FALLAS,
    respuestasSacadas = { respuestas: 'desde los tres meses', archivoLeido: 'respuestas.md' }
  } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []
  let lecturasServidas = 0
  let cotejosServidos = 0
  let examenesServidos = 0

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    // `sacar-respuestas:` comparte prefijo con `sacar:` -se prueba primero, el mas especifico.
    if (opts.phase === 'Sacar') {
      if (label.startsWith('sacar-respuestas')) return respuestasSacadas
      return { platica: PLATICA_TEXTO, transcriptLeido: 'sesion.jsonl' }
    }
    if (opts.phase === 'Inventariar') return inventario
    if (opts.phase === 'Marcar') return marcado
    if (opts.phase === 'Levantar el examen') return examen
    if (opts.phase === 'Construir') {
      // Devuelve SOLO lo que le toca a cada llamada, no el registro entero: si le siguieramos
      // dando todo a las cuatro, un `.reglas` leido donde debia ir un `.capacidades` pasaria
      // sin que ninguna prueba lo notara -la misma leccion del 2026-08-04 con la correccion.
      const r = registro as Record<string, unknown>
      if (label.startsWith('construir:reglas')) return { reglas: r.reglas, dudas: r.dudas, senaladas: r.senaladas }
      if (label.startsWith('construir:capacidades')) return { capacidades: r.capacidades, dudas: r.dudas, senaladas: r.senaladas }
      if (label.startsWith('construir:modulos')) return { modulos: r.modulos }
      if (label.startsWith('construir:dominios')) return { dominios: r.dominios ?? [] }
      return null
    }
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

/** «Construir» ya no es una llamada, son cuatro -una por tipo, en el orden en que se enlazan. */
const PREFIJOS_DE_CONSTRUIR = ['construir:reglas', 'construir:capacidades', 'construir:modulos', 'construir:dominios']

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

  it('a «Sacar» se le dice que NO cargue ninguna carta: su tarea es mecanica -en las dos llamadas', async () => {
    const { llamadas } = await correrMolino({ ...ENTRADA, rutaRespuestas: 'respuestas.md' })
    const deSacar = llamadas.filter((l) => l.opts.phase === 'Sacar')

    expect(deSacar).toHaveLength(2)

    for (const l of deSacar) {
      const label = String(l.opts.label ?? '')
      expect(l.prompt, `${label} no lo dice`).toContain('no cargues ninguna de tus cartas')
      expect(l.prompt, `${label} carga una carta`).not.toMatch(/Carga tu carta/)
    }
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

  it('a quien construye se le pasa el examen ya levantado y se le dice que no lo toque -en las cuatro llamadas', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    for (const prefijo of PREFIJOS_DE_CONSTRUIR) {
      const construir = llamadaDe(llamadas, 'Construir', prefijo)
      expect(construir.prompt, `${prefijo} no ve el examen`).toContain(PREGUNTA)
      expect(construir.prompt, `${prefijo} no dice que no se puede tocar`).toContain('no lo puedes tocar')
    }
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
  it('a quien construye se le prohibe ponerlo, junto con el paso y la hora -en las cuatro llamadas', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    for (const prefijo of PREFIJOS_DE_CONSTRUIR) {
      const construir = llamadaDe(llamadas, 'Construir', prefijo)
      expect(construir.prompt, `${prefijo} no lo prohibe`).toContain('No pongas `paso`, `alta`, `confirmado` ni `estado`')
    }
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
    expect(altas).toHaveLength(4)
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
      { ...ENTRADA, rutaRespuestas: 'respuestas.md' },
      { registro: { ...REGISTRO_LIMPIO, dudas: [{ pregunta: 'Desde cuantos meses si se le fia?', falla: 'umbral-sin-numero' }] } }
    )

    expect(llamadas.find((l) => l.opts.phase === 'Registrar')).toBeDefined()
    expect(salida.estado).toBe('listo')
  })

  it('en la segunda corrida se le dice al constructor que no devuelva dudas -en las cuatro llamadas', async () => {
    const { llamadas } = await correrMolino({ ...ENTRADA, rutaRespuestas: 'respuestas.md' })

    for (const prefijo of PREFIJOS_DE_CONSTRUIR) {
      const construir = llamadaDe(llamadas, 'Construir', prefijo)
      expect(construir.prompt, `${prefijo} no lo dice`).toContain('no devuelvas dudas')
      expect(construir.prompt, `${prefijo} no ve la respuesta`).toContain('desde los tres meses')
    }
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

/**
 * Medido en la primera corrida real, el 2026-08-04. El molino cambiaba el registro entero por lo
 * que devolvia la vuelta de correccion, y a la vuelta se le pide -en su propio prompt- que
 * devuelva SOLO las piezas marcadas. El agente obedecio, mando una capacidad sin ningun modulo,
 * y el escribano se nego a escribir porque `CAP-1` citaba un `MOD-1` que ya no existia.
 *
 * Ninguna de las pruebas de arriba lo cazo: el agente falso siempre devolvia el registro
 * completo en la correccion. **Un doble mas complaciente que el agente real no mide nada.**
 */
describe('la correccion se funde con el registro, no lo reemplaza', () => {
  const SOLO_LA_CAPACIDAD = {
    capacidades: [{ ...CAPACIDAD, deDondeSalio: 'el caso completo, contado sin apodo' }],
    modulos: [],
    reglas: [],
    dudas: [],
    senaladas: []
  }

  const MARCA_LA_CAPACIDAD = { huecos: [{ id: 'CAP-1', renglon: CAPACIDAD.renglon, forma: 'apodo-de-caso' }], piezasLeidas: 3 }

  it('lo que la vuelta no devuelve sigue en pie: el modulo y la regla no se pierden', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [MARCA_LA_CAPACIDAD, SIN_HUECOS],
      correccion: SOLO_LA_CAPACIDAD
    })

    const registrar = llamadaDe(llamadas, 'Registrar')

    expect(registrar.prompt).toContain('"id": "MOD-1"')
    expect(registrar.prompt).toContain('"id": "REG-1"')
  })

  it('la pieza corregida si se reemplaza: llega la version nueva, no la vieja', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [MARCA_LA_CAPACIDAD, SIN_HUECOS],
      correccion: SOLO_LA_CAPACIDAD
    })

    const registrar = llamadaDe(llamadas, 'Registrar')

    expect(registrar.prompt).toContain('el caso completo, contado sin apodo')
    expect(registrar.prompt).not.toContain(CAPACIDAD.deDondeSalio)
  })

  it('ningun enlace queda apuntando a la nada despues de la vuelta', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [MARCA_LA_CAPACIDAD, SIN_HUECOS],
      correccion: SOLO_LA_CAPACIDAD
    })

    const prompt = llamadaDe(llamadas, 'Registrar').prompt
    const citados = (prompt.match(/"(?:modulo|reglas|capacidades)": (?:"[A-Z]+-\d+"|\[[^\]]*\])/g) ?? []).join(' ')
    const ids = citados.match(/[A-Z]+-\d+/g) ?? []

    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) expect(prompt, `${id} se cita y no existe`).toContain(`"id": "${id}"`)
  })
})

/**
 * Medido el 2026-08-04, en la primera corrida real: el dictamen del auditor se imprimia, se sumaba
 * al estado de salida del molino, y NO tocaba un solo archivo. Una regla que el auditor llamo
 * inventada entera se quedo en disco diciendo `estado: completa`.
 *
 * Es el defecto del 2026-07-31 otra vez: una medicion que no cuenta es una medicion que no se hizo.
 * Que cuente quiere decir que llegue al archivo, no al reporte.
 */
describe('el dictamen del auditor llega a los archivos', () => {
  const CON_FALLAS = { ...SIN_FALLAS, sirve: false, porque: 'REG-0001 dice algo que nadie dijo', inventado: ['reglas/0001: no esta en el crudo'] }

  it('con fallas, corre una fase que marca, y corre DESPUES de auditar', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { dictamen: CON_FALLAS })

    const indiceAuditar = llamadas.findIndex((l) => l.opts.phase === 'Auditar')
    const indiceMarcar = llamadas.findIndex((l) => l.opts.phase === 'Marcar')

    expect(indiceAuditar).toBeGreaterThanOrEqual(0)
    expect(indiceMarcar).toBeGreaterThan(indiceAuditar)
  })

  it('quien marca es el escribano, con su carta, y le llega el dictamen entero', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { dictamen: CON_FALLAS })
    const marcar = llamadaDe(llamadas, 'Marcar')

    expect(marcar.opts.agentType).toBe('escribano')
    expect(marcar.prompt).toContain('`marcar-lo-auditado`')
    expect(marcar.prompt).toContain('no esta en el crudo')
  })

  it('se le prohibe borrar y reescribir: solo agrega y sube el estado', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { dictamen: CON_FALLAS })
    const marcar = llamadaDe(llamadas, 'Marcar')

    expect(marcar.prompt).toContain('No borras, no reescribes el cuerpo y no quitas ninguna marca')
    expect(marcar.prompt).toContain('se AGREGA')
  })

  it('con un dictamen limpio no se manda a nadie a abrir treinta archivos', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    expect(llamadas.find((l) => l.opts.phase === 'Marcar')).toBeUndefined()
  })

  it('un «no sirve» sin listas tambien manda a marcar: la cuarta falla cuenta como las tres', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { dictamen: { ...SIN_FALLAS, sirve: false, porque: 'no le alcanza a quien no estuvo' } })

    expect(llamadaDe(llamadas, 'Marcar')).toBeDefined()
  })

  it('si hay fallas y nadie las marca, se dice: lo escrito se lee como si estuviera bien', async () => {
    const { dichos } = await correrMolino(ENTRADA, { dictamen: CON_FALLAS, marcado: null })

    expect(dichos.join('\n')).toContain('nadie las marco en los archivos')
  })
})

/**
 * Medido el 2026-08-04: la primera auditoria de un registro de segunda corrida reporto diecisiete
 * piezas inventadas que no lo estaban. Salian de las respuestas del experto, que viajan por
 * `args.respuestas` y nunca llegaban a quien auditaba: buscaba cada frase en la grabacion, no la
 * encontraba, y dictaminaba lo unico que podia con lo que tenia.
 */
describe('quien audita ve todo lo que dijo el experto, no solo la grabacion', () => {
  it('en una segunda corrida, las respuestas -y su ruta- le llegan al auditor', async () => {
    const { llamadas } = await correrMolino(
      { ...ENTRADA, rutaRespuestas: 'respuestas.md' },
      { respuestasSacadas: { respuestas: 'desde los tres meses, no antes', archivoLeido: 'respuestas.md' } }
    )
    const auditar = llamadaDe(llamadas, 'Auditar')

    expect(auditar.prompt).toContain('desde los tres meses, no antes')
    expect(auditar.prompt).toContain('El crudo son DOS cosas')
    expect(auditar.prompt).toContain('respuestas.md')
  })

  it('en una primera corrida no hay respuestas y no se le inventa el bloque', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const auditar = llamadaDe(llamadas, 'Auditar')

    expect(auditar.prompt).not.toContain('El crudo son DOS cosas')
  })
})

/**
 * Medido el 2026-08-04: tres reglas salieron con `estado: con-huecos` y `que-queda-abierto`
 * diciendo «nada», que su propia plantilla prohibe. Al escribano le llegaba la marca sin el motivo,
 * y una regla que solo pide no se cumple: si no tiene con que llenarlo, lo deja en nada.
 */
describe('la razon del hueco viaja pegada a la pieza', () => {
  it('una pieza senalada llega con lo que dijo el reporte que la senalo', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [{ huecos: [{ id: 'REG-1', renglon: REGLA.renglon, forma: 'palabra-sin-definir' }], piezasLeidas: 4 }],
      correccion: null
    })

    const registrar = llamadaDe(llamadas, 'Registrar')

    expect(registrar.prompt).toContain('"porQueTieneHueco"')
    expect(registrar.prompt).toContain('palabra-sin-definir')
    expect(registrar.prompt).toContain('No se entiende solo')
  })

  it('una pieza que nadie senalo no lleva razon, porque no hay ninguna', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const registrar = llamadaDe(llamadas, 'Registrar')

    // El campo, no la instruccion que lo explica: esa aparece siempre.
    expect(registrar.prompt).not.toContain('"porQueTieneHueco"')
  })

  it('al escribano se le dice que ese campo no se escribe al archivo', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [{ huecos: [{ id: 'REG-1', renglon: REGLA.renglon, forma: 'apodo-de-caso' }], piezasLeidas: 4 }],
      correccion: null
    })

    expect(llamadaDe(llamadas, 'Registrar').prompt).toContain('no se escribe al archivo')
  })
})

describe('no se vuelve a escribir lo que otra sesion ya escribio', () => {
  const YA_ESCRITO = {
    piezas: [
      { id: 'REG-0012', tipo: 'regla', renglon: 'A un taller con menos de tres meses no se le fia', firmeza: 'confirmado', alta: '2026-07-14T10:00:00-06:00', estado: 'completa' }
    ]
  }

  it('inventariar corre antes de construir, y sin cargar ninguna carta', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    const indiceInventario = llamadas.findIndex((l) => l.opts.phase === 'Inventariar')
    const indiceConstruir = llamadas.findIndex((l) => l.opts.phase === 'Construir')

    expect(indiceInventario).toBeGreaterThanOrEqual(0)
    expect(indiceConstruir).toBeGreaterThan(indiceInventario)
    expect(llamadaDe(llamadas, 'Inventariar').prompt).toContain('no cargues ninguna de tus cartas')
  })

  it('lo ya escrito le llega al constructor con su firmeza y su fecha', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { inventario: YA_ESCRITO })
    const construir = llamadaDe(llamadas, 'Construir')

    expect(construir.prompt).toContain('REG-0012')
    expect(construir.prompt).toContain('2026-07-14T10:00:00-06:00')
    expect(construir.prompt).toContain('"firmeza": "confirmado"')
    expect(construir.prompt).toContain('no se vuelve a escribir')
  })

  it('se le dice que una contradiccion no es un duplicado, y que no decida el cual gana', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { inventario: YA_ESCRITO })
    const construir = llamadaDe(llamadas, 'Construir')

    expect(construir.prompt).toContain('es una contradiccion')
    expect(construir.prompt).toContain('nunca decidas tu cual gana')
  })

  it('en la primera corrida del proyecto se dice que no hay nada, en vez de callarlo', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    expect(llamadaDe(llamadas, 'Construir').prompt).toContain('primera corrida del proyecto')
  })

  it('si el inventario falla, la corrida sigue pero se dice que puede salir repetido', async () => {
    const { llamadas, dichos } = await correrMolino(ENTRADA, { inventario: null })

    expect(llamadaDe(llamadas, 'Construir')).toBeDefined()
    expect(dichos.join('\n')).toContain('puede salir repetido')
  })
})

describe('el dominio es el cuarto nivel, y llega hasta el disco', () => {
  it('la llamada que construye dominios pide `dominios` y `quienLoSabe`', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const schema = JSON.stringify(llamadaDe(llamadas, 'Construir', 'construir:dominios').opts.schema ?? {})

    expect(schema).toContain('dominios')
    expect(schema).toContain('quienLoSabe')
  })

  it('el dominio se define por quien lo sabe, y eso no admite el nombre de una persona', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const schema = JSON.stringify(llamadaDe(llamadas, 'Construir', 'construir:dominios').opts.schema ?? {})

    expect(schema).toContain('nunca la persona')
  })

  it('el dominio llega al escribano con su paso y su hora, como las demas piezas', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const registrar = llamadaDe(llamadas, 'Registrar')

    expect(registrar.prompt).toContain('--- Los dominios ---')
    expect(registrar.prompt).toContain('"id": "DOM-1"')
    expect(registrar.prompt).toContain('"quienLoSabe"')
  })

  it('al lector en frio el dominio le llega pelado, igual que el resto', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const lector = llamadaDe(llamadas, 'Medir', 'leer-en-frio')

    expect(lector.prompt).toContain('DOM-1')
    expect(lector.prompt).not.toContain('"origen"')
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

/**
 * El contrato que cazo el defecto del 2026-08-04: el esquema `REGISTRO`, con las cuatro piezas
 * juntas, pesaba 7806 caracteres serializados y el clasificador de seguridad lo rechazo en una
 * corrida real -«Construir» murio con `output schema too large to classify safely`. Ninguna
 * prueba de este archivo media el tamano del esquema; esta es la primera.
 */
describe('ninguna llamada del molino manda un esquema mayor al tope', () => {
  const TOPE = 2000

  it('en una corrida con marcas en los cuatro tipos -Construir, Corregir y Marcar de por medio- ningun esquema pasa del tope', async () => {
    const marcaEnLosCuatroTipos = {
      huecos: [
        { id: 'REG-1', renglon: REGLA.renglon, forma: 'palabra-sin-definir' },
        { id: 'CAP-1', renglon: CAPACIDAD.renglon, forma: 'apodo-de-caso' },
        { id: 'MOD-1', renglon: MODULO.renglon, forma: 'puntero-a-la-nada' },
        { id: 'DOM-1', renglon: DOMINIO.renglon, forma: 'palabra-sin-definir' }
      ],
      piezasLeidas: 4
    }

    const { llamadas } = await correrMolino(
      { ...ENTRADA, rutaRespuestas: 'respuestas.md' },
      {
        lecturas: [marcaEnLosCuatroTipos, SIN_HUECOS],
        correccion: REGISTRO_LIMPIO,
        dictamen: { ...SIN_FALLAS, sirve: false, porque: 'no le alcanza a quien no estuvo' }
      }
    )

    const conSchema = llamadas.filter((l) => l.opts.schema)
    // Si esto no crece de aqui, la corrida de la prueba dejo de tocar Corregir o Marcar -o de
    // leer las respuestas por ruta, que agrega su propio esquema `RESPUESTAS_SACADAS`-, y el
    // contrato quedaria midiendo menos de lo que dice medir.
    expect(conSchema.length).toBeGreaterThanOrEqual(21)

    for (const l of conSchema) {
      const caracteres = JSON.stringify(l.opts.schema).length
      expect(caracteres, `${l.opts.label} manda un esquema de ${caracteres} caracteres`).toBeLessThanOrEqual(TOPE)
    }
  })
})

describe('«Corregir» manda solo el esquema del tipo que corrige', () => {
  const marcaEnLosCuatroTipos = {
    huecos: [
      { id: 'REG-1', renglon: REGLA.renglon, forma: 'palabra-sin-definir' },
      { id: 'CAP-1', renglon: CAPACIDAD.renglon, forma: 'apodo-de-caso' },
      { id: 'MOD-1', renglon: MODULO.renglon, forma: 'puntero-a-la-nada' },
      { id: 'DOM-1', renglon: DOMINIO.renglon, forma: 'palabra-sin-definir' }
    ],
    piezasLeidas: 4
  }

  it('la correccion de una regla no manda el esquema de capacidades, modulos ni dominios', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [marcaEnLosCuatroTipos, SIN_HUECOS],
      correccion: REGISTRO_LIMPIO
    })

    const corregirReglas = llamadaDe(llamadas, 'Corregir', 'corregir:vuelta-1:reglas')
    const schema = JSON.stringify(corregirReglas.opts.schema ?? {})

    expect(schema).toContain('"reglas"')
    expect(schema).not.toContain('quienLoSabe')
    expect(schema).not.toContain('queAgrupa')
  })

  it('corre una vez por cada tipo con marcas, y cada una carga `construir-el-registro`', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [marcaEnLosCuatroTipos, SIN_HUECOS],
      correccion: REGISTRO_LIMPIO
    })

    for (const prefijo of ['corregir:vuelta-1:reglas', 'corregir:vuelta-1:capacidades', 'corregir:vuelta-1:modulos', 'corregir:vuelta-1:dominios']) {
      const corregir = llamadaDe(llamadas, 'Corregir', prefijo)
      expect(corregir.prompt, `${prefijo} no carga su carta`).toContain('`construir-el-registro`')
      expect(corregir.prompt, `${prefijo} no dice que la cargue`).toMatch(/Carga tu carta/)
      expect(corregir.opts.agentType).toBe('auditor')
    }
  })
})

describe('las cuatro llamadas de «Construir» cargan la carta que les toca', () => {
  it('reglas, capacidades, modulos y dominios, cada una con `construir-el-registro`', async () => {
    const { llamadas } = await correrMolino(ENTRADA)

    for (const prefijo of PREFIJOS_DE_CONSTRUIR) {
      const construir = llamadaDe(llamadas, 'Construir', prefijo)
      expect(construir.prompt, `${prefijo} no carga su carta`).toContain('`construir-el-registro`')
      expect(construir.prompt, `${prefijo} no dice que la cargue`).toMatch(/Carga tu carta/)
      expect(construir.opts.agentType).toBe('auditor')
    }
  })
})

/**
 * Medido en corrida real, el 2026-08-04: al constructor de reglas solo le llegaba el indice de
 * reglas -no el de capacidades, modulos ni dominios-, y cuatro enunciados que ya vivian escritos
 * como capacidades no los cazo por eso: los caso leyendo el disco por su cuenta, que nadie le
 * habia pedido. En la misma corrida, el constructor de dominios vio solo los modulos que agrupa
 * y no las reglas ni las capacidades de mas abajo.
 *
 * Lo que se filtra es que se le pide ESCRIBIR a cada llamada -eso ya lo hace su propio esquema-,
 * no que se le deja VER: por eso el indice completo, de los cuatro tipos, tiene que llegar a las
 * cuatro llamadas, y cada una tiene que ver tambien lo que construyeron las que corrieron antes
 * en esta misma corrida, no solo la inmediata anterior.
 */
describe('las cuatro llamadas de «Construir» ven el indice completo, no solo el de su propio tipo', () => {
  const PIEZA_CAPACIDAD_YA_ESCRITA = {
    id: 'CAP-0001',
    tipo: 'capacidad',
    renglon: 'Dar credito a un taller nuevo, ya escrito en otra sesion',
    firmeza: 'confirmado',
    origen: 'escuchado',
    alta: '2026-07-01T10:00:00-06:00',
    estado: 'completa'
  }

  const INVENTARIO_CUATRO_TIPOS = {
    piezas: [
      {
        id: 'DOM-0001',
        tipo: 'dominio',
        renglon: 'Credito y cobranza, ya escrito en otra sesion',
        firmeza: 'confirmado',
        origen: 'propuesto',
        alta: '2026-07-01T10:00:00-06:00',
        estado: 'completa'
      },
      {
        id: 'MOD-0001',
        tipo: 'modulo',
        renglon: 'Credito, ya escrito en otra sesion',
        firmeza: 'confirmado',
        origen: 'propuesto',
        alta: '2026-07-01T10:00:00-06:00',
        estado: 'completa'
      },
      PIEZA_CAPACIDAD_YA_ESCRITA,
      {
        id: 'REG-0001',
        tipo: 'regla',
        renglon: 'A un taller con menos de tres meses no se le fia, ya escrito en otra sesion',
        firmeza: 'confirmado',
        origen: 'escuchado',
        alta: '2026-07-01T10:00:00-06:00',
        estado: 'completa'
      }
    ]
  }

  it('cada una de las cuatro llamadas ve las piezas ya escritas de los cuatro tipos, no solo del suyo', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { inventario: INVENTARIO_CUATRO_TIPOS })

    for (const prefijo of PREFIJOS_DE_CONSTRUIR) {
      const construir = llamadaDe(llamadas, 'Construir', prefijo)
      for (const pieza of INVENTARIO_CUATRO_TIPOS.piezas) {
        expect(construir.prompt, `${prefijo} no ve ${pieza.id} (${pieza.tipo})`).toContain(pieza.id)
      }
    }
  })

  it('el indice trae `origen`, y llega al prompt de las cuatro llamadas', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { inventario: INVENTARIO_CUATRO_TIPOS })

    for (const prefijo of PREFIJOS_DE_CONSTRUIR) {
      const construir = llamadaDe(llamadas, 'Construir', prefijo)
      expect(construir.prompt, `${prefijo} no ve el origen`).toContain('"origen": "escuchado"')
    }
  })

  it('la llamada de dominios ve las reglas y las capacidades de esta corrida, no solo los modulos que agrupa', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const dominios = llamadaDe(llamadas, 'Construir', 'construir:dominios')

    expect(dominios.prompt, 'no ve la regla que se construyo en esta corrida').toContain(REGLA.renglon)
    expect(dominios.prompt, 'no ve la capacidad que se construyo en esta corrida').toContain(CAPACIDAD.renglon)
  })

  it('cada llamada sigue sabiendo que le toca escribir, aunque vea los otros tres tipos', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { inventario: INVENTARIO_CUATRO_TIPOS })
    const reglas = llamadaDe(llamadas, 'Construir', 'construir:reglas')

    expect(reglas.prompt, 'ya no dice que arma reglas').toContain('Arma las reglas dichas')
    expect(reglas.prompt, 'no ve la capacidad ya escrita').toContain(PIEZA_CAPACIDAD_YA_ESCRITA.renglon)
  })
})
