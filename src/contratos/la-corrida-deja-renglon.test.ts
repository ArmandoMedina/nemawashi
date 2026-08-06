import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * El contrato: cada corrida del molino deja un renglon en `docs/mediciones/corridas.jsonl`, sin
 * importar en cual de los catorce `return` termine. La logica de armarlo -de donde sale cada
 * numero- vive en linea dentro de `.claude/workflows/levanta-el-conocimiento.js`, junto a
 * `idsSenalados`: el molino corre como cuerpo de funcion suelto, sin `import` posible
 * (`src/contratos/la-hora-no-se-inventa.test.ts`).
 *
 * Por eso este contrato no importa un modulo TypeScript: carga el molino igual que sus cuatro
 * vecinos y mide lo que le manda al agente `anotar-la-corrida`, que es el unico lugar donde el
 * renglon completo sale a la luz. La corrida en si sigue devolviendo lo mismo que devolvia antes
 * de que existiera «Anotar» -eso tambien se mide aqui.
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
const ENTRADA = { paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: '2026-08-05T09:00:00-06:00' }
const PREGUNTA = 'Desde cuando se le fia a un taller?'

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

const EXAMEN = { preguntas: [PREGUNTA] }
const EXAMEN_APROBADO = { respuestas: [{ pregunta: PREGUNTA, veredicto: 'contestada' }], senaladas: [], sinPieza: [] }
const REGISTRO_LIMPIO = { capacidades: [], modulos: [], dominios: [], reglas: [REGLA], dudas: [], senaladas: [] }
const SIN_HUECOS = { huecos: [], piezasLeidas: 1 }
const SIN_INVENTOS = { inventos: [], piezasCotejadas: 1 }
const ESCRITOS_LIMPIOS = {
  archivos: [{ ruta: 'product/conocimiento/reglas/0001-antiguedad-minima.md', id: 'REG-0001', idDeTrabajo: 'REG-1', estado: 'completa' }],
  noEscritos: [],
  senalesSinPieza: []
}
const SIN_FALLAS = { inventado: [], perdido: [], malMarcado: [], sirve: true, porque: 'sin fallas', transcriptLeido: 'sesion.jsonl' }
const HORA_DE_CIERRE_DE_PRUEBA = { horaCierre: '2026-08-05T10:30:00-06:00', duracionMin: 90 }
const ANOTADO_DE_PRUEBA = { anotado: true }

type OpcionesCorrida = {
  nulos?: string[]
  lanza?: string[]
  examen?: Record<string, unknown> | null
  registro?: Record<string, unknown>
  lecturas?: Array<Record<string, unknown> | null>
  cotejos?: Array<Record<string, unknown> | null>
  examenes?: Array<Record<string, unknown> | null>
  correccion?: Record<string, unknown> | null
  escritos?: Record<string, unknown> | null
  dictamen?: Record<string, unknown> | null
  horaDeCierre?: Record<string, unknown> | null
  anotado?: Record<string, unknown> | null
}

/** `nulos` simula que ese agente no contesto, sin importar la fase: el prefijo del `label`. */
function correrMolino(entrada: Record<string, unknown>, opciones: OpcionesCorrida = {}): Promise<Corrida> {
  const {
    nulos = [],
    lanza = [],
    examen = EXAMEN,
    registro = REGISTRO_LIMPIO,
    lecturas = [SIN_HUECOS],
    cotejos = [SIN_INVENTOS],
    examenes = [EXAMEN_APROBADO],
    correccion = null,
    escritos = ESCRITOS_LIMPIOS,
    dictamen = SIN_FALLAS,
    horaDeCierre = HORA_DE_CIERRE_DE_PRUEBA,
    anotado = ANOTADO_DE_PRUEBA
  } = opciones

  const llamadas: Llamada[] = []
  const dichos: string[] = []
  let lecturasServidas = 0
  let cotejosServidas = 0
  let examenesServidas = 0

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    if (lanza.some((prefijo) => label.startsWith(prefijo))) throw new Error(`agente de prueba: ${label} tronó a proposito`)
    if (nulos.some((prefijo) => label.startsWith(prefijo))) return null

    if (opts.phase === 'Sacar') {
      if (label.startsWith('sacar-respuestas')) return { respuestas: 'una respuesta', archivoLeido: 'respuestas.md' }
      return { platica: PLATICA_TEXTO, transcriptLeido: 'sesion.jsonl', horaDeAlta: '2026-08-05T09:00:00-06:00' }
    }
    if (opts.phase === 'Inventariar') return { piezas: [] }
    if (opts.phase === 'Levantar el examen') return examen
    if (opts.phase === 'Construir') {
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
      if (label.startsWith('cotejar')) return cotejos[cotejosServidas++] ?? null
      if (label.startsWith('contestar-examen')) return examenes[examenesServidas++] ?? null
      return null
    }
    if (opts.phase === 'Registrar') return escritos
    if (opts.phase === 'Auditar') return dictamen
    if (opts.phase === 'Marcar') return { marcados: [], perdido: [] }
    if (opts.phase === 'Armar lo que falta') return { deEstePaso: [], deAntes: [], archivosRecorridos: 1 }
    if (opts.phase === 'Anotar') {
      if (label.startsWith('hora-de-cierre')) return horaDeCierre
      if (label.startsWith('anotar-la-corrida')) return anotado
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

/** El renglon completo solo sale a la luz en el prompt de `anotar-la-corrida`. */
function lineaCruda(llamadas: Llamada[]): string {
  const anotar = llamadas.find((l) => String(l.opts.label ?? '').startsWith('anotar-la-corrida'))
  if (!anotar) throw new Error('el molino nunca llamo a anotar-la-corrida')
  const marca = '--- La linea ---\n'
  const i = anotar.prompt.indexOf(marca)
  if (i === -1) throw new Error('el prompt de anotar-la-corrida no trae el bloque de la linea')
  return anotar.prompt.slice(i + marca.length)
}

function renglonAnotado(llamadas: Llamada[]): Record<string, unknown> {
  return JSON.parse(lineaCruda(llamadas))
}

describe('cada corrida deja su renglon, sin importar donde termine', () => {
  it('una corrida que se muere en Sacar deja renglon igual: sin-medicion, dondeParo "sacar", todo en ceros', async () => {
    const { llamadas, salida } = await correrMolino(ENTRADA, { nulos: ['sacar:'] })

    expect(salida.estado).toBe('sin-medicion')

    const renglon = renglonAnotado(llamadas)
    expect(renglon).toMatchObject({
      estado: 'sin-medicion',
      dondeParo: 'sacar',
      escritas: { dominios: 0, modulos: 0, capacidades: 0, reglas: 0 },
      conHuecos: { dominios: 0, modulos: 0, capacidades: 0, reglas: 0 },
      marcoQuien: { construir: 0, 'leer-en-frio': 0, cotejar: 0, 'contestar-examen': 0 },
      dudas: 0,
      senaladasSinMarcar: 0,
      noEscritas: 0,
      preguntasSinPieza: 0
    })
    expect(renglon.noContestaron).toEqual(['sacar'])
  })

  it('un agente que no contesta aparece en noContestaron', async () => {
    const { llamadas } = await correrMolino(ENTRADA, { nulos: ['examen:'] })
    const renglon = renglonAnotado(llamadas)
    expect(renglon.noContestaron).toEqual(['examen'])
  })

  it('un agente de Corregir que no contesta tambien aparece en noContestaron, aunque hoy no deje ni un log', async () => {
    const conHueco = { huecos: [{ id: 'REG-1', renglon: REGLA.renglon, forma: 'palabra-sin-definir' }], piezasLeidas: 1 }
    const { llamadas } = await correrMolino(ENTRADA, {
      lecturas: [conHueco, SIN_HUECOS],
      nulos: ['corregir:vuelta-1:reglas:']
    })
    const renglon = renglonAnotado(llamadas)
    expect(renglon.noContestaron).toContain('corregir:vuelta-1:reglas')
  })

  it('una ruta fuera de las cuatro carpetas no suma en ningun tipo', async () => {
    const escritosConRutaAjena = {
      archivos: [{ ruta: 'roadmap/0001-algo.md', id: 'ALGO-0001', idDeTrabajo: 'REG-1', estado: 'completa' }],
      noEscritos: [],
      senalesSinPieza: []
    }
    const { llamadas } = await correrMolino(ENTRADA, { escritos: escritosConRutaAjena })
    const renglon = renglonAnotado(llamadas)
    expect(renglon.escritas).toEqual({ dominios: 0, modulos: 0, capacidades: 0, reglas: 0 })
    expect(renglon.conHuecos).toEqual({ dominios: 0, modulos: 0, capacidades: 0, reglas: 0 })
  })

  it('clasifica por la carpeta de la ruta, aunque el id y el idDeTrabajo discrepen de verdad y apunten a otro tipo', async () => {
    // La ruta dice "reglas", pero tanto `id` como `idDeTrabajo` traen prefijo de modulo. Si la
    // clasificacion leyera cualquiera de los dos campos en vez de la carpeta, esto contaria como
    // `modulos`, no como `reglas`.
    const escritosConIdDeOtroTipo = {
      archivos: [{ ruta: 'product/conocimiento/reglas/0007-alguna.md', id: 'MOD-0001', idDeTrabajo: 'MOD-7', estado: 'completa' }],
      noEscritos: [],
      senalesSinPieza: []
    }
    const { llamadas } = await correrMolino(ENTRADA, { escritos: escritosConIdDeOtroTipo })
    const renglon = renglonAnotado(llamadas)
    expect(renglon.escritas).toEqual({ dominios: 0, modulos: 0, capacidades: 0, reglas: 1 })
  })

  it('una pieza que senalaron el lector en frio y el cotejador suma 1 en cada uno de los dos', async () => {
    const conHueco = { huecos: [{ id: 'REG-1', renglon: REGLA.renglon, forma: 'apodo-de-caso' }], piezasLeidas: 1 }
    const conInvento = { inventos: [{ id: 'REG-1', frase: 'algo que nadie dijo' }], piezasCotejadas: 1 }

    const { llamadas } = await correrMolino(ENTRADA, { lecturas: [conHueco], cotejos: [conInvento] })

    const renglon = renglonAnotado(llamadas) as { marcoQuien: Record<string, number> }
    expect(renglon.marcoQuien['leer-en-frio']).toBe(1)
    expect(renglon.marcoQuien.cotejar).toBe(1)
  })

  it('la linea que recibe el escribano termina en un solo salto de linea, y no trae sangria', async () => {
    const { llamadas } = await correrMolino(ENTRADA)
    const linea = lineaCruda(llamadas)

    expect(linea.endsWith('\n')).toBe(true)
    expect(linea.slice(0, -1).includes('\n')).toBe(false)
    expect(linea).not.toMatch(/^\{\s{2,}/)
  })

  it('el orden de las llaves es el mismo sin importar el dato: un renglon "listo" y uno que muere en Sacar', async () => {
    const clavesDe = (linea: string): string[] => Array.from(linea.matchAll(/"([a-zA-Z-]+)":/g)).map((m) => m[1] ?? '')

    const listo = await correrMolino(ENTRADA)
    const muereEnSacar = await correrMolino(ENTRADA, { nulos: ['sacar:'] })

    expect(clavesDe(lineaCruda(listo.llamadas))).toEqual(clavesDe(lineaCruda(muereEnSacar.llamadas)))
  })

  it('si el auditor de la hora no contesta, la corrida devuelve lo suyo igual y el renglon sale sin duracion', async () => {
    const { llamadas, salida, dichos } = await correrMolino(ENTRADA, { nulos: ['hora-de-cierre:'] })

    expect(salida.estado).toBe('listo')
    const renglon = renglonAnotado(llamadas)
    expect(renglon.duracionMin).toBeNull()
    expect(renglon.horaCierre).toBeNull()
    expect(dichos.join('\n')).toContain('hora de cierre')
  })

  it('si el escribano de Anotar no contesta, la corrida devuelve lo suyo igual y el renglon sale por log', async () => {
    const { salida, dichos } = await correrMolino(ENTRADA, { nulos: ['anotar-la-corrida:'] })

    expect(salida.estado).toBe('listo')
    expect(dichos.join('\n')).toContain('"estado":"listo"')
  })

  it('si el auditor de la hora truena, la corrida devuelve lo suyo igual, sin que la excepcion se propague', async () => {
    const { salida, dichos } = await correrMolino(ENTRADA, { lanza: ['hora-de-cierre:'] })

    expect(salida.estado).toBe('listo')
    expect(dichos.join('\n')).toContain('tronó')
  })

  it('si el escribano de Anotar truena, la corrida devuelve lo suyo igual, sin que la excepcion se propague', async () => {
    const { salida, dichos } = await correrMolino(ENTRADA, { lanza: ['anotar-la-corrida:'] })

    expect(salida.estado).toBe('listo')
    expect(dichos.join('\n')).toContain('tronó')
  })

  it('un dictamen "no sirve" tambien deja su renglon, con la falla contada', async () => {
    const { llamadas, salida } = await correrMolino(ENTRADA, {
      dictamen: { ...SIN_FALLAS, sirve: false, porque: 'la regla 0001 esta apodada' }
    })

    expect(salida.estado).toBe('con-huecos')
    const renglon = renglonAnotado(llamadas) as { fallas: Record<string, unknown> }
    expect(renglon.fallas.noSirve).toBe(true)
  })

  it('sin fallas de ningun lado, el renglon sale "listo" con noSirve en false', async () => {
    const { llamadas, salida } = await correrMolino(ENTRADA)

    expect(salida.estado).toBe('listo')
    const renglon = renglonAnotado(llamadas) as { fallas: Record<string, unknown> }
    expect(renglon.fallas.noSirve).toBe(false)
  })
})

/**
 * El contrato de forma: no basta con que un puñado de escenarios pase por `cerrar` -catorce
 * `return` existen, y un doble de agente sólo prueba los caminos que alguien pensó en forzar.
 * Medido en revision real: cambiar UN `return await cerrar({...})` por un `return {...}` directo
 * deja la suite de comportamiento en verde, porque ninguno de los dobles fuerza esa rama exacta.
 *
 * Por eso esto no se mide corriendo el molino: se lee su fuente con el compilador de TypeScript
 * -igual que `el-nucleo-no-escribe.test.ts` mide el nucleo- y se afirma un hecho estructural
 * sobre los catorce a la vez. Si alguien agrega el return quince y se le olvida `cerrar`, esta
 * prueba se pone roja sola, sin que nadie tenga que pensar en el caso que lo dispara.
 */
describe('todo return de la corrida pasa por cerrar', () => {
  const ES_FUNCION = (nodo: ts.Node): boolean =>
    ts.isFunctionDeclaration(nodo) ||
    ts.isFunctionExpression(nodo) ||
    ts.isArrowFunction(nodo) ||
    ts.isMethodDeclaration(nodo)

  /**
   * Los `return` de la corrida son los que no viven dentro de ninguna funcion -helper, prompt
   * o la propia `cerrar`-: la corrida entera es el cuerpo suelto que el runtime ejecuta como
   * `AsyncFunction`, así que sus `return` son los unicos sin una funcion propia que los contenga.
   */
  function returnsDeLaCorrida(archivo: ts.SourceFile): ts.ReturnStatement[] {
    const encontrados: ts.ReturnStatement[] = []

    const visitar = (nodo: ts.Node, dentroDeFuncion: boolean): void => {
      if (ts.isReturnStatement(nodo) && !dentroDeFuncion) encontrados.push(nodo)
      const entraAFuncion = dentroDeFuncion || ES_FUNCION(nodo)
      ts.forEachChild(nodo, (hijo) => visitar(hijo, entraAFuncion))
    }

    visitar(archivo, false)
    return encontrados
  }

  function esReturnDeCerrar(nodo: ts.ReturnStatement): boolean {
    const expr = nodo.expression
    if (!expr || !ts.isAwaitExpression(expr)) return false
    const llamada = expr.expression
    return ts.isCallExpression(llamada) && ts.isIdentifier(llamada.expression) && llamada.expression.text === 'cerrar'
  }

  it('cada return fuera de una funcion ayudante es exactamente `return await cerrar(...)`', () => {
    const fuente = readFileSync(RUTA_MOLINO, 'utf8')
    const archivo = ts.createSourceFile('levanta-el-conocimiento.js', fuente, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)

    const returns = returnsDeLaCorrida(archivo)

    // Si esto deja de encontrar los quince, la prueba dejo de medir lo que dice medir -por
    // ejemplo porque alguien envolvio la corrida en una funcion y todos sus return pasaron a
    // vivir "dentro de una funcion" segun este mismo criterio.
    expect(returns.length).toBe(15)

    const sinCerrar = returns
      .filter((r) => !esReturnDeCerrar(r))
      .map((r) => archivo.getLineAndCharacterOfPosition(r.getStart(archivo)).line + 1)

    expect(sinCerrar).toEqual([])
  })
})
