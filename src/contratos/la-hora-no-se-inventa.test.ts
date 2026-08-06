import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ts from 'typescript'
import { describe, it, expect } from 'vitest'

/**
 * El contrato: la hora del alta le llega al escribano estampada pieza por pieza, nunca deducida.
 *
 * Medido el 2026-07-31: quince items salieron con `12:00:00` porque la plantilla exige hora y a
 * quien escribia no le llegaba ninguna. Obedecio la forma inventando el contenido, y una hora
 * inventada se ve igual de bien que una real -esa es justo la razon por la que es peor.
 *
 * Medido otra vez el 2026-08-05, con la primera correccion ya en pie: la hora entraba por
 * `args.hora`, a quien lanzo el molino se le olvido pasarla, y una corrida real molio 34 piezas
 * sin que ninguna trajera `alta`. El escribano se nego a escribirlas -su carta prohibe un
 * archivo al que le falte un campo obligatorio- y la falla se descubrio hasta el final.
 *
 * Ahora `args.hora` ya no se acepta -si llega, se ignora-. La unica fuente es el propio agente
 * que ya corre en «Sacar», midiendo `date -Iseconds`. El codigo no le cree la forma: la valida el
 * con una funcion pura, y si no llego o no tiene huso explicito, la corrida para en seco antes de
 * «Construir» y antes de «Registrar».
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

/** La hora que el agente de «Sacar» mide corriendo `date -Iseconds`. */
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

/**
 * `horaDeAlta` es lo que el agente de «Sacar» dice haber medido con `date -Iseconds` -por
 * defecto, una hora valida, para que las pruebas que no estan midiendo el freno lleguen hasta
 * «Registrar» como antes. Las pruebas del freno la pisan con vacio o con una forma invalida.
 */
function correrMolino(
  entrada: Record<string, unknown>,
  reglas: Pieza[] = REGLAS_DE_PRUEBA,
  horaDeAlta: string | undefined = HORA
): Promise<{ llamadas: Llamada[]; resultado: unknown; logs: string[] }> {
  const llamadas: Llamada[] = []
  const logs: string[] = []

  const agent = async (prompt: string, opts: Record<string, unknown>) => {
    llamadas.push({ prompt, opts })
    const label = String(opts.label ?? '')

    if (opts.phase === 'Sacar') return { platica: 'algo se dijo en la platica', transcriptLeido: 'sesion.jsonl', horaDeAlta }
    if (opts.phase === 'Levantar el examen') return { preguntas: ['algo que contestar?'] }
    if (opts.phase === 'Construir') {
      // Solo lo que le toca a cada llamada, no el registro entero.
      if (label.startsWith('construir:reglas')) return { reglas, dudas: [], senaladas: [] }
      if (label.startsWith('construir:capacidades')) return { capacidades: [], dudas: [], senaladas: [] }
      if (label.startsWith('construir:modulos')) return { modulos: [] }
      if (label.startsWith('construir:dominios')) return { dominios: [] }
      return null
    }
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
  return molino(entrada, agent, (m: string) => logs.push(m), () => {}).then((resultado) => ({ llamadas, resultado, logs }))
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
  it('cada pieza que llega al escribano trae `alta` igual a la hora que devolvio «Sacar»', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl' })

    const reglas = reglasDelPrompt(promptDeRegistrar(llamadas))
    expect(reglas).toHaveLength(2)
    for (const r of reglas) expect(r.alta).toBe(HORA)
  })

  it('la pieza `confirmado` ademas trae `confirmado` con esa misma hora; la `dicho` no', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl' })

    const reglas = reglasDelPrompt(promptDeRegistrar(llamadas))
    const confirmada = reglas.find((r) => r.firmeza === 'confirmado')
    const dicha = reglas.find((r) => r.firmeza === 'dicho')

    expect(confirmada?.confirmado).toBe(HORA)
    expect(dicha?.confirmado).toBeUndefined()
  })

  it('si llega `args.hora`, se ignora: la que cuenta es la que devolvio «Sacar»', async () => {
    const { llamadas, logs } = await correrMolino(
      { paso: 'paso de prueba', transcript: 'sesion.jsonl', hora: '2020-01-01T00:00:00Z' },
      REGLAS_DE_PRUEBA,
      HORA
    )

    const reglas = reglasDelPrompt(promptDeRegistrar(llamadas))
    for (const r of reglas) expect(r.alta).toBe(HORA)
    expect(logs.some((m) => m.includes('`args.hora`'))).toBe(true)
  })

  it('si «Sacar» devuelve `horaDeAlta` vacia, la corrida para antes de «Construir» y «Registrar»', async () => {
    const { llamadas, resultado } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl' }, REGLAS_DE_PRUEBA, '')

    // Solo «Sacar» y las dos llamadas mecanicas de «Anotar» -que dejan el renglon de esta
    // corrida aunque se haya cortado aqui. Ni «Inventariar», ni «Levantar el examen», ni
    // «Construir», ni «Registrar»: eso es lo caro que este freno evita gastar.
    expect(llamadas.map((l) => l.opts.phase)).toEqual(['Sacar', 'Anotar', 'Anotar'])
    expect(llamadas.some((l) => l.opts.phase === 'Construir')).toBe(false)
    expect(llamadas.some((l) => l.opts.phase === 'Registrar')).toBe(false)
    expect((resultado as { estado: string }).estado).toBe('sin-hora')
  })

  it('si `horaDeAlta` viene sin huso -la trampa facil-, cuenta igual que si no hubiera llegado', async () => {
    const { llamadas, resultado } = await correrMolino(
      { paso: 'paso de prueba', transcript: 'sesion.jsonl' },
      REGLAS_DE_PRUEBA,
      '2026-07-31T09:20:00'
    )

    expect(llamadas.map((l) => l.opts.phase)).toEqual(['Sacar', 'Anotar', 'Anotar'])
    expect(llamadas.some((l) => l.opts.phase === 'Construir')).toBe(false)
    expect(llamadas.some((l) => l.opts.phase === 'Registrar')).toBe(false)
    expect((resultado as { estado: string }).estado).toBe('sin-hora')
  })

  it('30 piezas en una sola corrida salen las 30 con su `alta`, no solo la primera', async () => {
    const muchas = Array.from({ length: 30 }, (_, i) => regla(`REG-${i + 1}`, 'dicho'))
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl' }, muchas)

    const reglas = reglasDelPrompt(promptDeRegistrar(llamadas))
    expect(reglas).toHaveLength(30)
    for (const r of reglas) expect(r.alta).toBe(HORA)
  })

  it('el `paso` tambien se estampa, y es el que llego por `args`, no uno que el agente ponga', async () => {
    const { llamadas } = await correrMolino({ paso: 'el paso que se cerro', transcript: 'sesion.jsonl' })

    for (const r of reglasDelPrompt(promptDeRegistrar(llamadas))) expect(r.paso).toBe('el paso que se cerro')
  })

  it('a quien construye se le prohibe poner la hora y el paso: los estampa el codigo -en las cuatro llamadas', async () => {
    const { llamadas } = await correrMolino({ paso: 'paso de prueba', transcript: 'sesion.jsonl' })

    for (const prefijo of ['construir:reglas', 'construir:capacidades', 'construir:modulos', 'construir:dominios']) {
      const construir = llamadas.find((l) => l.opts.phase === 'Construir' && String(l.opts.label ?? '').startsWith(prefijo))
      expect(construir?.prompt, `${prefijo} no lo prohibe`).toContain('No pongas `paso`, `alta`, `confirmado` ni `estado`')
    }
  })
})

/**
 * El doble de agente de las pruebas de arriba nunca mira `opts.schema` -contesta lo que el test
 * le manda, no lo que el esquema exige-. Por eso quitar `horaDeAlta` del `required` de `SACADO`
 * no pone en rojo ninguna prueba de comportamiento de las de arriba: en produccion es justo ese
 * `required` el que fuerza al agente real a devolver el campo, y sin este renglon se podria
 * borrar sin que nada se entere. Se lee el texto del molino con el compilador de TypeScript y se
 * afirma el hecho estructural directamente sobre el esquema -mismo patron que ya usa
 * `la-corrida-deja-renglon.test.ts` para contar los `return` de la corrida.
 */
describe('el esquema de «Sacar» exige la hora, no solo la promete en un comentario', () => {
  it('`horaDeAlta` esta en el `required` del esquema `SACADO`', () => {
    const fuente = readFileSync(RUTA_MOLINO, 'utf8')
    const archivo = ts.createSourceFile('levanta-el-conocimiento.js', fuente, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)

    let requeridos: string[] | null = null

    const visitar = (nodo: ts.Node): void => {
      if (
        ts.isVariableDeclaration(nodo) &&
        ts.isIdentifier(nodo.name) &&
        nodo.name.text === 'SACADO' &&
        nodo.initializer &&
        ts.isObjectLiteralExpression(nodo.initializer)
      ) {
        const requiredProp = nodo.initializer.properties.find(
          (p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'required'
        )
        if (requiredProp && ts.isArrayLiteralExpression(requiredProp.initializer)) {
          requeridos = requiredProp.initializer.elements.filter(ts.isStringLiteral).map((e) => e.text)
        }
      }
      ts.forEachChild(nodo, visitar)
    }

    visitar(archivo)

    expect(requeridos, 'no se encontro `required` dentro de la declaracion de SACADO').not.toBeNull()
    expect(requeridos).toContain('horaDeAlta')
  })
})
