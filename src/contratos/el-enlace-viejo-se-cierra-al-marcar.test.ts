import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * El contrato: cuando una pieza de esta corrida cita a una pieza que ya vivia en disco -de una
 * corrida anterior-, y esa pieza vieja no devuelve la cita, la fase «Marcar» recibe el dato para
 * cerrar el enlace, aunque el dictamen del auditor salga limpio.
 *
 * `src/contratos/el-conocimiento-no-se-escapa.test.ts` caza el sintoma en los archivos de verdad
 * de `product/conocimiento/`: enlaces de un solo lado, todos hacia una pieza de un paso anterior.
 * La causa: el molino solo invierte el enlace DENTRO de una misma corrida
 * (`conLasCapacidadesEnlazadas` y sus dos vecinos) -hacia una pieza vieja no hay quien lo haga,
 * porque «Registrar» solo puede crear archivos nuevos, nunca abrir uno que ya existia.
 *
 * Este archivo no corre el molino entero contra `product/conocimiento/` -los noventa minutos de
 * una corrida real no son una medicion aceptable aqui-. Mide, con el mismo doble de agente que
 * usan sus vecinos (`la-corrida-deja-renglon.test.ts`, `cada-agente-carga-su-carta.test.ts`), lo
 * que el molino calcula y lo que le manda a quien marca: si eso esta bien, cerrar el enlace de
 * verdad en el archivo es trabajo de la carta `marcar-lo-auditado`, no de mas codigo aqui.
 *
 * Igual que sus vecinos: no es un modulo TypeScript importable, lo ejecuta el runtime de Claude
 * Code inyectando `args`, `agent`, `log` y `phase`.
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
const ENTRADA = { paso: 'paso de prueba', transcript: 'sesion.jsonl' }
const HORA_MEDIDA = '2026-08-06T09:00:00-06:00'
const PREGUNTA = 'Desde cuando se le fia a un taller?'

const EXAMEN = { preguntas: [PREGUNTA] }
const EXAMEN_APROBADO = { respuestas: [{ pregunta: PREGUNTA, veredicto: 'contestada' }], senaladas: [], sinPieza: [] }
const SIN_HUECOS = { huecos: [], piezasLeidas: 1 }
const SIN_INVENTOS = { inventos: [], piezasCotejadas: 1 }
const SIN_FALLAS = { inventado: [], perdido: [], malMarcado: [], sirve: true, porque: 'sin fallas', transcriptLeido: 'sesion.jsonl' }
const INVENTARIO_VACIO = { piezas: [] }
const LO_QUE_FALTA = { deEstePaso: [], deAntes: [], archivosRecorridos: 1 }
const SIN_MARCAR = { marcados: [], perdido: [] }

/** Una regla que no cita a nadie -ninguna pieza vieja de por medio-. */
const REGLA_LIMPIA = {
  id: 'REG-1',
  renglon: 'A un taller con menos de tres meses no se le fia',
  capacidades: [] as string[],
  firmeza: 'dicho',
  origen: 'escuchado',
  enSusPalabras: 'a un taller que apenas abre no se le fia',
  deDondeSalio: 'salio de la misma platica, al fijar el limite en tres meses de antiguedad',
  queQuedaAbierto: 'nada'
}

const REGISTRO_LIMPIO = { dominios: [], capacidades: [], modulos: [], reglas: [REGLA_LIMPIA], dudas: [], senaladas: [] }

const ESCRITOS_DE_LA_REGLA = {
  archivos: [{ ruta: 'product/conocimiento/reglas/0002-antiguedad-minima.md', id: 'REG-0002', idDeTrabajo: 'REG-1', estado: 'completa' }],
  noEscritos: [] as string[],
  senalesSinPieza: [] as string[]
}

/**
 * Una capacidad nueva que cita, en su propio campo `reglas`, a una regla que ya vivia en disco.
 * `capacidad.reglas` es un campo "abajo": nadie lo reescribe despues de que Construir lo entrega
 * -a diferencia de `regla.capacidades`, que el molino SI reinvierte dentro de la corrida
 * (`conLasCapacidadesEnlazadas`)-, asi que sirve para probar el calculo sin tener que simular esa
 * inversion.
 */
const CAPACIDAD_QUE_CITA_UNA_REGLA_VIEJA = {
  id: 'CAP-1',
  renglon: 'Dar credito a un taller que apenas abre',
  modulo: '',
  reglas: ['REG-0044'],
  firmeza: 'dicho',
  origen: 'escuchado',
  enSusPalabras: 'a un taller que apenas abre no se le fia',
  deDondeSalio: 'salio al contar el caso de un taller que llevaba dos meses operando',
  queQuedaAbierto: 'nada'
}

const REGISTRO_CON_CITA_VIEJA = { dominios: [], capacidades: [CAPACIDAD_QUE_CITA_UNA_REGLA_VIEJA], modulos: [], reglas: [], dudas: [], senaladas: [] }

const ESCRITOS_DE_LA_CAPACIDAD = {
  archivos: [{ ruta: 'product/conocimiento/capacidades/0011-dar-credito.md', id: 'CAP-0011', idDeTrabajo: 'CAP-1', estado: 'completa' }],
  noEscritos: [] as string[],
  senalesSinPieza: [] as string[]
}

const ENLACE_ESPERADO = { idNuevo: 'CAP-0011', campoQueCito: 'reglas', idViejo: 'REG-0044', campoQueLeFalta: 'capacidades' }

type OpcionesCorrida = {
  registro?: Record<string, unknown>
  escritos?: Record<string, unknown>
  dictamen?: Record<string, unknown> | null
  marcado?: Record<string, unknown> | null
}

function correrMolino(entrada: Record<string, unknown>, opciones: OpcionesCorrida = {}): Promise<Corrida> {
  const {
    registro = REGISTRO_LIMPIO,
    escritos = ESCRITOS_DE_LA_REGLA,
    dictamen = SIN_FALLAS,
    marcado = SIN_MARCAR
  } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    if (opts.phase === 'Sacar') return { platica: PLATICA_TEXTO, transcriptLeido: 'sesion.jsonl', horaDeAlta: HORA_MEDIDA }
    if (opts.phase === 'Inventariar') return INVENTARIO_VACIO
    if (opts.phase === 'Levantar el examen') return EXAMEN
    if (opts.phase === 'Construir') {
      const r = registro as Record<string, unknown>
      if (label.startsWith('construir:reglas')) return { reglas: r.reglas, dudas: r.dudas, senaladas: r.senaladas }
      if (label.startsWith('construir:capacidades')) return { capacidades: r.capacidades, dudas: r.dudas, senaladas: r.senaladas }
      if (label.startsWith('construir:modulos')) return { modulos: r.modulos }
      if (label.startsWith('construir:dominios')) return { dominios: r.dominios ?? [] }
      return null
    }
    if (opts.phase === 'Corregir') return null
    if (opts.phase === 'Medir') {
      if (label.startsWith('leer-en-frio')) return SIN_HUECOS
      if (label.startsWith('cotejar')) return SIN_INVENTOS
      if (label.startsWith('contestar-examen')) return EXAMEN_APROBADO
      return null
    }
    if (opts.phase === 'Registrar') return escritos
    if (opts.phase === 'Auditar') return dictamen
    if (opts.phase === 'Marcar') return marcado
    if (opts.phase === 'Armar lo que falta') return LO_QUE_FALTA
    if (opts.phase === 'Anotar') {
      if (label.startsWith('hora-de-cierre')) return { horaCierre: '2026-08-06T10:00:00-06:00', duracionMin: 60 }
      if (label.startsWith('anotar-la-corrida')) return { anotado: true }
      return null
    }
    return null
  }

  const molino = cargarMolino()
  return molino(entrada, agent, (m: string) => dichos.push(m), () => {}).then((salida) => ({
    llamadas,
    dichos,
    salida: (salida ?? {}) as Record<string, unknown>
  }))
}

function llamadaMarcar(llamadas: Llamada[]): Llamada | undefined {
  return llamadas.find((l) => l.opts.phase === 'Marcar')
}

/** El bloque estructurado de enlaces por cerrar, dentro del prompt de «Marcar». */
function enlacesDelPrompt(prompt: string): Array<Record<string, string>> {
  const marca = '--- Los enlaces que faltan cerrar, hacia piezas de otra corrida ---'
  const i = prompt.indexOf(marca)
  if (i === -1) return []
  const resto = prompt.slice(i + marca.length)
  return JSON.parse(resto.slice(resto.indexOf('['), resto.lastIndexOf(']') + 1))
}

describe('una cita hacia una pieza de esta misma corrida no manda a nadie a marcar', () => {
  it('con el registro limpio y el dictamen limpio, «Marcar» no corre', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    expect(llamadaMarcar(llamadas)).toBeUndefined()
  })
})

describe('una cita hacia una pieza que ya vivia en disco manda a «Marcar», aunque el dictamen salga limpio', () => {
  it('«Marcar» corre aunque el dictamen no traiga ninguna falla', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      registro: REGISTRO_CON_CITA_VIEJA,
      escritos: ESCRITOS_DE_LA_CAPACIDAD,
      dictamen: SIN_FALLAS
    })
    expect(llamadaMarcar(llamadas)).toBeDefined()
  })

  it('el enlace por cerrar trae el id definitivo de quien cita, el campo por el que cito, el id viejo y el campo que le falta', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      registro: REGISTRO_CON_CITA_VIEJA,
      escritos: ESCRITOS_DE_LA_CAPACIDAD,
      dictamen: SIN_FALLAS
    })
    const marcar = llamadaMarcar(llamadas)
    if (!marcar) throw new Error('el molino nunca llego a la fase Marcar')

    expect(enlacesDelPrompt(marcar.prompt)).toEqual([ENLACE_ESPERADO])
  })

  it('quien marca es el escribano, con su carta', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      registro: REGISTRO_CON_CITA_VIEJA,
      escritos: ESCRITOS_DE_LA_CAPACIDAD,
      dictamen: SIN_FALLAS
    })
    const marcar = llamadaMarcar(llamadas)
    if (!marcar) throw new Error('el molino nunca llego a la fase Marcar')

    expect(marcar.opts.agentType).toBe('escribano')
    expect(marcar.prompt).toContain('`marcar-lo-auditado`')
  })

  it('si nadie marca, el molino lo dice sin culpar a un dictamen que no fallo', async () => {
    const { dichos } = await correrMolino(ENTRADA, {
      registro: REGISTRO_CON_CITA_VIEJA,
      escritos: ESCRITOS_DE_LA_CAPACIDAD,
      dictamen: SIN_FALLAS,
      marcado: null
    })

    expect(dichos.join('\n')).toContain('enlace(s) hacia una pieza de otra corrida seguian sin cerrar')
    expect(dichos.join('\n')).not.toContain('El dictamen encontro fallas')
  })
})

describe('citas hacia una pieza vieja, en cada uno de los seis campos de enlace', () => {
  // Las tres columnas "abajo" -dominio.modulos, modulo.capacidades, capacidad.reglas- pasan
  // derecho de lo que Construir devuelve: nadie las reescribe despues. Las tres "arriba"
  // -modulo.dominio, capacidad.modulo, regla.capacidades- SI se reescriben, invertidas desde el
  // padre de la misma corrida (`conElDominioEnlazado` y compania); para que una cita a una pieza
  // vieja sobreviva ahi, el padre viejo tiene que "volver" a esta corrida -con su id real, no uno
  // de trabajo- diciendo que ahora tambien contiene al hijo nuevo, tal como ya lo describe el
  // prompt de Construir (`bloqueComunDeConstruir`: "esa pieza vuelve con su id de carpeta"). Ese
  // padre viejo no aparece en `escritos.archivos` -nadie lo vuelve a escribir- y por eso su
  // propia cita hacia el hijo nuevo no genera un enlace por cerrar: no es una cita rota, es la
  // pieza vieja anunciando lo que ya sabe.

  const DOMINIO_NUEVO_QUE_CITA_UN_MODULO_VIEJO = {
    id: 'DOM-1',
    renglon: 'Credito y cobranza',
    modulos: ['MOD-0002'],
    quienLoSabe: 'quien autoriza que se le fie a un cliente',
    queAgrupa: 'lo que decide a quien se le fia; no cae aqui lo que se surte',
    firmeza: 'dicho',
    origen: 'propuesto',
    enSusPalabras: 'el experto no nombro el area; el corte lo propuso el agente',
    deDondeSalio: 'sin este corte no se sabia con quien se levanta lo de adentro',
    queQuedaAbierto: 'nada'
  }

  const DOMINIO_VIEJO_REENLISTADO = {
    id: 'DOM-0005',
    renglon: 'Un dominio de una corrida anterior',
    modulos: ['MOD-1'],
    quienLoSabe: 'quien ya sabia esto de antes',
    queAgrupa: 'lo de siempre',
    firmeza: 'confirmado',
    origen: 'escuchado',
    enSusPalabras: 'esto ya estaba dicho de antes',
    deDondeSalio: 'una corrida anterior',
    queQuedaAbierto: 'nada'
  }

  const MODULO_NUEVO_QUE_CITA_UNA_CAPACIDAD_VIEJA = {
    id: 'MOD-1',
    renglon: 'Credito',
    dominio: '',
    capacidades: ['CAP-0077'],
    queAgrupa: 'lo que decide si se fia y por cuanto; no cae aqui el cobro de lo ya fiado',
    firmeza: 'dicho',
    origen: 'propuesto',
    enSusPalabras: 'el experto no lo nombro; el corte lo propuso el agente',
    deDondeSalio: 'sin este corte las reglas de fiar y las de cobrar caian en la misma bolsa',
    queQuedaAbierto: 'nada'
  }

  const MODULO_VIEJO_REENLISTADO = {
    id: 'MOD-0009',
    renglon: 'Un modulo de una corrida anterior',
    dominio: '',
    capacidades: ['CAP-1'],
    queAgrupa: 'lo de siempre',
    firmeza: 'confirmado',
    origen: 'escuchado',
    enSusPalabras: 'esto ya estaba dicho de antes',
    deDondeSalio: 'una corrida anterior',
    queQuedaAbierto: 'nada'
  }

  const CAPACIDAD_NUEVA_QUE_CITA_UNA_REGLA_VIEJA = {
    id: 'CAP-1',
    renglon: 'Dar credito a un taller que apenas abre',
    modulo: '',
    reglas: ['REG-0044'],
    firmeza: 'dicho',
    origen: 'escuchado',
    enSusPalabras: 'a un taller que apenas abre no se le fia',
    deDondeSalio: 'salio al contar el caso de un taller que llevaba dos meses operando',
    queQuedaAbierto: 'nada'
  }

  const CAPACIDAD_VIEJA_REENLISTADA = {
    id: 'CAP-0099',
    renglon: 'Una capacidad de una corrida anterior',
    modulo: '',
    reglas: ['REG-1'],
    firmeza: 'confirmado',
    origen: 'escuchado',
    enSusPalabras: 'esto ya estaba dicho de antes',
    deDondeSalio: 'una corrida anterior',
    queQuedaAbierto: 'nada'
  }

  const REGLA_NUEVA = { ...REGLA_LIMPIA, capacidades: [] }

  const REGISTRO_CON_LAS_SEIS_CITAS = {
    dominios: [DOMINIO_NUEVO_QUE_CITA_UN_MODULO_VIEJO, DOMINIO_VIEJO_REENLISTADO],
    modulos: [MODULO_NUEVO_QUE_CITA_UNA_CAPACIDAD_VIEJA, MODULO_VIEJO_REENLISTADO],
    capacidades: [CAPACIDAD_NUEVA_QUE_CITA_UNA_REGLA_VIEJA, CAPACIDAD_VIEJA_REENLISTADA],
    reglas: [REGLA_NUEVA],
    dudas: [],
    senaladas: []
  }

  const ESCRITOS_DE_LAS_CUATRO = {
    archivos: [
      { ruta: 'product/conocimiento/dominios/0003-credito-y-cobranza.md', id: 'DOM-0003', idDeTrabajo: 'DOM-1', estado: 'completa' },
      { ruta: 'product/conocimiento/modulos/0007-credito.md', id: 'MOD-0007', idDeTrabajo: 'MOD-1', estado: 'completa' },
      { ruta: 'product/conocimiento/capacidades/0011-dar-credito.md', id: 'CAP-0011', idDeTrabajo: 'CAP-1', estado: 'completa' },
      { ruta: 'product/conocimiento/reglas/0002-antiguedad-minima.md', id: 'REG-0002', idDeTrabajo: 'REG-1', estado: 'completa' }
    ],
    noEscritos: [] as string[],
    senalesSinPieza: [] as string[]
  }

  it('las seis filas -dominio.modulos, modulo.dominio, modulo.capacidades, capacidad.modulo, capacidad.reglas y regla.capacidades- salen completas, y solo ellas', async () => {
    const { llamadas } = await correrMolino(ENTRADA, {
      registro: REGISTRO_CON_LAS_SEIS_CITAS,
      escritos: ESCRITOS_DE_LAS_CUATRO,
      dictamen: SIN_FALLAS
    })
    const marcar = llamadaMarcar(llamadas)
    if (!marcar) throw new Error('el molino nunca llego a la fase Marcar')

    const enlaces = enlacesDelPrompt(marcar.prompt)
    expect(enlaces).toHaveLength(6)
    expect(enlaces).toEqual(
      expect.arrayContaining([
        { idNuevo: 'DOM-0003', campoQueCito: 'modulos', idViejo: 'MOD-0002', campoQueLeFalta: 'dominio' },
        { idNuevo: 'MOD-0007', campoQueCito: 'dominio', idViejo: 'DOM-0005', campoQueLeFalta: 'modulos' },
        { idNuevo: 'MOD-0007', campoQueCito: 'capacidades', idViejo: 'CAP-0077', campoQueLeFalta: 'modulo' },
        { idNuevo: 'CAP-0011', campoQueCito: 'modulo', idViejo: 'MOD-0009', campoQueLeFalta: 'capacidades' },
        { idNuevo: 'CAP-0011', campoQueCito: 'reglas', idViejo: 'REG-0044', campoQueLeFalta: 'capacidades' },
        { idNuevo: 'REG-0002', campoQueCito: 'capacidades', idViejo: 'CAP-0099', campoQueLeFalta: 'reglas' }
      ])
    )
  })
})

describe('bordes del calculo', () => {
  it('citar el mismo id viejo dos veces en el mismo campo no duplica el enlace', async () => {
    const capacidadConCitaRepetida = { ...CAPACIDAD_QUE_CITA_UNA_REGLA_VIEJA, reglas: ['REG-0044', 'REG-0044'] }
    const registro = { ...REGISTRO_CON_CITA_VIEJA, capacidades: [capacidadConCitaRepetida] }

    const { llamadas } = await correrMolino(ENTRADA, { registro, escritos: ESCRITOS_DE_LA_CAPACIDAD, dictamen: SIN_FALLAS })
    const marcar = llamadaMarcar(llamadas)
    if (!marcar) throw new Error('el molino nunca llego a la fase Marcar')

    expect(enlacesDelPrompt(marcar.prompt)).toHaveLength(1)
  })

  it('una pieza que cito una vieja y no se alcanzo a escribir no genera enlace, y no truena', async () => {
    const escritosSinLaCapacidad = { archivos: [], noEscritos: ['CAP-1: no se pudo escribir'], senalesSinPieza: [] }

    const { llamadas } = await correrMolino(ENTRADA, {
      registro: REGISTRO_CON_CITA_VIEJA,
      escritos: escritosSinLaCapacidad,
      dictamen: SIN_FALLAS
    })
    expect(llamadaMarcar(llamadas)).toBeUndefined()
  })

  it('el calculo no depende de si el dictamen trae fallas: con fallas Y con enlaces, «Marcar» recibe las dos cosas', async () => {
    const CON_FALLAS = { ...SIN_FALLAS, sirve: false, porque: 'CAP-0011 dice algo que nadie dijo', inventado: ['capacidades/0011: no esta en el crudo'] }

    const { llamadas } = await correrMolino(ENTRADA, {
      registro: REGISTRO_CON_CITA_VIEJA,
      escritos: ESCRITOS_DE_LA_CAPACIDAD,
      dictamen: CON_FALLAS
    })
    const marcar = llamadaMarcar(llamadas)
    if (!marcar) throw new Error('el molino nunca llego a la fase Marcar')

    expect(marcar.prompt).toContain('--- El dictamen ---')
    expect(enlacesDelPrompt(marcar.prompt)).toEqual([ENLACE_ESPERADO])
  })
})
