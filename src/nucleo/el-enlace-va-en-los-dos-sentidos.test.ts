import { describe, expect, it } from 'vitest'
import {
  idsDelCampo,
  aristasDelGrafo,
  revisarElGrafo,
  claveDeDeuda,
  type PiezaLeida,
  type FallaDeEnlace
} from './el-enlace-va-en-los-dos-sentidos'

/**
 * Capa 1: entrada exacta, salida exacta. Sin disco y sin ventana.
 *
 * `idsDelCampo` cubre las cinco particiones que existen en disco. `aristasDelGrafo` cubre
 * las seis filas de la tabla de bidireccionalidad, mas el caso de una pieza sin id.
 * `revisarElGrafo` cubre las seis clases de falla, mas las dos fronteras que no lo son
 * -campo hacia arriba vacio, y el tipo que se decide por la carpeta y no por el prefijo del
 * id.
 */

function pieza(ruta: string, tipo: PiezaLeida['tipo'], frente: Record<string, string>): PiezaLeida {
  const renglones = Object.entries(frente).map(([clave, valor]) => `${clave}: ${valor}`)
  return { ruta, tipo, texto: `---\n${renglones.join('\n')}\n---\n\ncuerpo\n` }
}

describe('idsDelCampo', () => {
  it('sin el campo, no hay ids', () => {
    expect(idsDelCampo(undefined)).toEqual([])
  })

  it('el campo vacio, no hay ids', () => {
    expect(idsDelCampo('')).toEqual([])
  })

  it('una lista vacia, no hay ids', () => {
    expect(idsDelCampo('[]')).toEqual([])
  })

  it('un solo id sin corchetes, es un id', () => {
    expect(idsDelCampo('MOD-0001')).toEqual(['MOD-0001'])
  })

  it('una lista con dos ids, son los dos', () => {
    expect(idsDelCampo('[MOD-0004, MOD-0002]')).toEqual(['MOD-0004', 'MOD-0002'])
  })
})

describe('aristasDelGrafo', () => {
  it('un dominio que cita dos modulos produce dos aristas, una por cada uno', () => {
    const piezas = [pieza('a.md', 'dominio', { id: 'DOM-1', modulos: '[MOD-1, MOD-2]' })]
    expect(aristasDelGrafo(piezas)).toEqual([
      { desde: 'DOM-1', campo: 'modulos', hacia: 'MOD-1' },
      { desde: 'DOM-1', campo: 'modulos', hacia: 'MOD-2' }
    ])
  })

  it('recorre las seis filas de la tabla, una por cada tipo', () => {
    const piezas = [
      pieza('a.md', 'dominio', { id: 'DOM-1', modulos: '[MOD-1]' }),
      pieza('b.md', 'modulo', { id: 'MOD-1', dominio: 'DOM-1', capacidades: '[CAP-1]' }),
      pieza('c.md', 'capacidad', { id: 'CAP-1', modulo: 'MOD-1', reglas: '[REG-1]' }),
      pieza('d.md', 'regla', { id: 'REG-1', capacidades: '[CAP-1]' })
    ]
    expect(aristasDelGrafo(piezas)).toEqual([
      { desde: 'DOM-1', campo: 'modulos', hacia: 'MOD-1' },
      { desde: 'MOD-1', campo: 'dominio', hacia: 'DOM-1' },
      { desde: 'MOD-1', campo: 'capacidades', hacia: 'CAP-1' },
      { desde: 'CAP-1', campo: 'modulo', hacia: 'MOD-1' },
      { desde: 'CAP-1', campo: 'reglas', hacia: 'REG-1' },
      { desde: 'REG-1', campo: 'capacidades', hacia: 'CAP-1' }
    ])
  })

  it('una pieza sin id no aporta ninguna arista: no hay de donde anclar el "desde"', () => {
    const piezas = [pieza('a.md', 'modulo', { dominio: 'DOM-1', capacidades: '[CAP-1]' })]
    expect(aristasDelGrafo(piezas)).toEqual([])
  })

  it('un campo ausente o vacio no aporta arista', () => {
    const piezas = [pieza('a.md', 'modulo', { id: 'MOD-1', capacidades: '[]' })]
    expect(aristasDelGrafo(piezas)).toEqual([])
  })
})

describe('revisarElGrafo, las seis clases de falla', () => {
  function comoClaves(fallas: FallaDeEnlace[]): string[] {
    return fallas.map((f) => f.clave)
  }

  it('id-repetido: dos archivos declaran el mismo id, y ancla en el segundo por orden de ruta', () => {
    const piezas = [
      pieza('b.md', 'modulo', { id: 'MOD-9', modulo: 'segundo' }),
      pieza('a.md', 'modulo', { id: 'MOD-9', modulo: 'primero' })
    ]
    const fallas = revisarElGrafo(piezas)
    expect(fallas).toEqual([{ clave: 'id-repetido', ruta: 'b.md', id: 'MOD-9', campo: 'id', citado: '', detalle: 'a.md' }])
  })

  it('id-inexistente: el id citado no corresponde a ningun archivo del conjunto', () => {
    const piezas = [pieza('a.md', 'modulo', { id: 'MOD-1', dominio: 'DOM-99' })]
    expect(revisarElGrafo(piezas)).toEqual([
      { clave: 'id-inexistente', ruta: 'a.md', id: 'MOD-1', campo: 'dominio', citado: 'DOM-99' }
    ])
  })

  it('tipo-que-no-corresponde: el id citado existe pero es de otro tipo', () => {
    const piezas = [
      pieza('a.md', 'modulo', { id: 'MOD-1', dominio: 'CAP-1' }),
      pieza('b.md', 'capacidad', { id: 'CAP-1' })
    ]
    expect(revisarElGrafo(piezas)).toEqual([
      { clave: 'tipo-que-no-corresponde', ruta: 'a.md', id: 'MOD-1', campo: 'dominio', citado: 'CAP-1', detalle: 'capacidad' }
    ])
  })

  it('enlace-de-un-solo-lado: A cita a B, B existe, y B no cita a A de vuelta -ancla en A', () => {
    const piezas = [
      pieza('a.md', 'dominio', { id: 'DOM-1', modulos: '[MOD-1]' }),
      pieza('b.md', 'modulo', { id: 'MOD-1' })
    ]
    expect(revisarElGrafo(piezas)).toEqual([
      { clave: 'enlace-de-un-solo-lado', ruta: 'a.md', id: 'DOM-1', campo: 'modulos', citado: 'MOD-1' }
    ])
  })

  it('sin-quien-lo-contenga: el campo hacia arriba de una regla llega como lista vacia', () => {
    const piezas = [pieza('a.md', 'regla', { id: 'REG-1', capacidades: '[]' })]
    expect(revisarElGrafo(piezas)).toEqual([
      { clave: 'sin-quien-lo-contenga', ruta: 'a.md', id: 'REG-1', campo: 'capacidades', citado: '' }
    ])
  })

  it('mas-de-un-padre: el campo hacia arriba de valor unico trae dos ids', () => {
    const piezas = [
      pieza('a.md', 'modulo', { id: 'MOD-1', dominio: '[DOM-1, DOM-2]' }),
      pieza('b.md', 'dominio', { id: 'DOM-1', modulos: '[MOD-1]' }),
      pieza('c.md', 'dominio', { id: 'DOM-2', modulos: '[MOD-1]' })
    ]
    expect(comoClaves(revisarElGrafo(piezas))).toEqual(['mas-de-un-padre'])
  })

  it('devuelve las fallas ordenadas por ruta, clave, campo y citado', () => {
    const piezas = [
      pieza('z.md', 'modulo', { id: 'MOD-9', dominio: 'DOM-99' }),
      pieza('a.md', 'modulo', { id: 'MOD-1', dominio: 'DOM-98' })
    ]
    const fallas = revisarElGrafo(piezas)
    expect(fallas.map((f) => f.ruta)).toEqual(['a.md', 'z.md'])
  })
})

describe('revisarElGrafo, las tres fronteras que no son falla de enlace', () => {
  it('un campo hacia arriba ausente no es falla de enlace -eso ya lo reporta falta-campo en otra prueba', () => {
    const piezas = [pieza('a.md', 'modulo', { id: 'MOD-1', capacidades: '[]' })]
    expect(revisarElGrafo(piezas)).toEqual([])
  })

  it('un campo hacia arriba presente pero vacio tampoco es falla de enlace', () => {
    const piezas = [pieza('a.md', 'modulo', { id: 'MOD-1', dominio: '' })]
    expect(revisarElGrafo(piezas)).toEqual([])
  })

  it('capacidad.reglas vacio no es falla: "vacio es hueco, no error" ya lo dice el esquema de la capacidad', () => {
    const piezas = [pieza('a.md', 'capacidad', { id: 'CAP-1', reglas: '[]' })]
    expect(revisarElGrafo(piezas)).toEqual([])
  })

  it('el tipo se decide por la carpeta -el tipo de la pieza-, nunca por el prefijo del id', () => {
    // CAP-9 tiene prefijo de capacidad pero se declara como tipo "modulo": si el codigo
    // infiriera el tipo del prefijo, esto saldria tipo-que-no-corresponde. No debe.
    const piezas = [
      pieza('a.md', 'modulo', { id: 'MOD-1', capacidades: '[CAP-9]' }),
      pieza('b.md', 'capacidad', { id: 'CAP-9', modulo: 'MOD-1' })
    ]
    expect(revisarElGrafo(piezas)).toEqual([])
  })
})

describe('claveDeDeuda', () => {
  it('junta ruta, clave y campo:citado en un solo renglon', () => {
    const falla: FallaDeEnlace = {
      clave: 'id-inexistente',
      ruta: 'a.md',
      id: 'MOD-1',
      campo: 'dominio',
      citado: 'DOM-9'
    }
    expect(claveDeDeuda(falla)).toBe('a.md id-inexistente dominio:DOM-9')
  })
})
