import { describe, expect, it } from 'vitest'
import {
  LARGO_MAXIMO_DE_LA_REGLA,
  LARGO_MAXIMO_DEL_CUERPO,
  cuerpoQueCuenta,
  partirItem,
  revisarItem
} from './el-item-va-flaco'

/** Construye un item a la medida del caso. Nada de material real recortado. */
function itemDeRoadmap(cambios: Record<string, string> = {}, cuerpo = 'Salio de un caso.'): string {
  const frente: Record<string, string> = {
    id: 'RM-0001',
    regla: 'Al taller nuevo se le abre credito solo si otro que ya paga responde por el',
    paso: 'credito',
    firmeza: 'dicho',
    alta: '2026-07-31T09:20:00-06:00',
    ...cambios
  }
  const renglones = Object.entries(frente)
    .filter(([, v]) => v !== '__fuera__')
    .map(([k, v]) => `${k}: ${v}`)
  return `---\n${renglones.join('\n')}\n---\n\n${cuerpo}\n`
}

describe('partir el item', () => {
  it('separa el frente del cuerpo', () => {
    const partido = partirItem(itemDeRoadmap({}, 'El cuerpo.'))
    expect(partido?.frente.id).toBe('RM-0001')
    expect(partido?.cuerpo.trim()).toBe('El cuerpo.')
  })

  it('no adivina una forma que no esta', () => {
    expect(partirItem('nada mas prosa suelta')).toBeNull()
    expect(partirItem('---\nid: RM-0001\nsin cierre')).toBeNull()
  })

  it('sobrevive a los fines de linea de Windows', () => {
    expect(partirItem('---\r\nid: RM-0001\r\n---\r\n\r\ncuerpo')?.frente.id).toBe('RM-0001')
  })
})

describe('el item bien puesto', () => {
  it('no levanta ninguna falla', () => {
    expect(revisarItem(itemDeRoadmap(), 'roadmap')).toEqual([])
  })

  it('acepta las tres firmezas y ninguna cuarta', () => {
    expect(revisarItem(itemDeRoadmap({ firmeza: 'abierto' }), 'roadmap')).toEqual([])
    expect(revisarItem(itemDeRoadmap({ firmeza: 'casi' }), 'roadmap')).toContainEqual({
      clave: 'firmeza-desconocida',
      detalle: 'casi'
    })
  })
})

describe('el tope que evita que el item engorde', () => {
  it('deja pasar la regla que llega justo al limite', () => {
    const justa = 'a'.repeat(LARGO_MAXIMO_DE_LA_REGLA)
    expect(revisarItem(itemDeRoadmap({ regla: justa }), 'roadmap')).toEqual([])
  })

  it('caza la regla que se pasa por uno', () => {
    const pasada = 'a'.repeat(LARGO_MAXIMO_DE_LA_REGLA + 1)
    expect(revisarItem(itemDeRoadmap({ regla: pasada }), 'roadmap')).toContainEqual({
      clave: 'regla-larga',
      detalle: String(LARGO_MAXIMO_DE_LA_REGLA + 1)
    })
  })

  it('caza el cuerpo que se volvio un parrafo', () => {
    const gordo = 'x'.repeat(LARGO_MAXIMO_DEL_CUERPO + 1)
    const fallas = revisarItem(itemDeRoadmap({}, gordo), 'roadmap')
    expect(fallas.map((f) => f.clave)).toContain('cuerpo-gordo')
  })

  it('no cuenta el instructivo en comentario, que es donde vive la plantilla', () => {
    const instructivo = `<!--\n${'y'.repeat(LARGO_MAXIMO_DEL_CUERPO * 2)}\n-->`
    expect(cuerpoQueCuenta(instructivo)).toBe('')
    expect(revisarItem(itemDeRoadmap({}, instructivo), 'roadmap')).toEqual([])
  })
})

describe('la procedencia sin la cual el item no sirve', () => {
  it('exige los campos obligatorios y dice cual falta', () => {
    const fallas = revisarItem(itemDeRoadmap({ paso: '__fuera__' }), 'roadmap')
    expect(fallas).toContainEqual({ clave: 'falta-campo', detalle: 'paso' })
  })

  it('rechaza la fecha sin huso, porque sin huso no dice si sigue vigente', () => {
    expect(revisarItem(itemDeRoadmap({ alta: '2026-07-31' }), 'roadmap')).toContainEqual({
      clave: 'fecha-sin-huso',
      detalle: 'alta'
    })
  })

  it('exige el cuando a todo lo que se declara confirmado', () => {
    const fallas = revisarItem(itemDeRoadmap({ firmeza: 'confirmado' }), 'roadmap')
    expect(fallas).toContainEqual({ clave: 'confirmado-sin-fecha' })
  })

  it('caza el confirmado que quedo con fecha y sin firmeza', () => {
    const fallas = revisarItem(
      itemDeRoadmap({ firmeza: 'dicho', confirmado: '2026-07-31T10:00:00-06:00' }),
      'roadmap'
    )
    expect(fallas).toContainEqual({ clave: 'confirmado-sin-firmeza' })
  })

  it('el item de backlog sin origen es trabajo que nadie pidio', () => {
    const sinOrigen = '---\nid: BL-0001\ntarea: Algo\nalta: 2026-07-31T09:00:00-06:00\n---\n\nx'
    expect(revisarItem(sinOrigen, 'backlog')).toContainEqual({
      clave: 'falta-campo',
      detalle: 'origen'
    })

    const vacio = sinOrigen.replace('tarea: Algo', 'tarea: Algo\norigen: []')
    expect(revisarItem(vacio, 'backlog')).toContainEqual({ clave: 'origen-vacio' })
  })
})

describe('lo que no es un item', () => {
  it('un archivo sin frontmatter no se interpreta, se reporta', () => {
    expect(revisarItem('# Solo un titulo\n\nprosa', 'roadmap')).toEqual([{ clave: 'sin-frontmatter' }])
  })

  it('el vacio tambien', () => {
    expect(revisarItem('', 'roadmap')).toEqual([{ clave: 'sin-frontmatter' }])
  })
})
