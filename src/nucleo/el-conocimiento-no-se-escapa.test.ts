import { describe, expect, it } from 'vitest'
import {
  encontrarRutaDeMaquina,
  revisarPieza,
  type Falla,
  type TipoDePieza
} from './el-conocimiento-no-se-escapa'

/**
 * Capa 1: entrada exacta, salida exacta. Sin disco y sin ventana.
 *
 * `encontrarRutaDeMaquina` cubre las particiones de una linea de texto: sin ruta, con una,
 * con dos, con una que no es ruta de maquina (URL, ratio, ruta relativa del repositorio).
 * `revisarPieza` cubre las particiones del frontmatter y el cuerpo de las cuatro plantillas.
 */

function comoClaves(fallas: Falla[]): string[] {
  return fallas.map((f) => (f.detalle ? `${f.clave}:${f.detalle}` : f.clave))
}

function piezaValida(tipo: TipoDePieza, sobrescribe: Record<string, string> = {}, cuerpo?: string): string {
  const campos: Record<TipoDePieza, Record<string, string>> = {
    dominio: { id: 'DOM-1', dominio: 'un area', modulos: '[MOD-1]' },
    modulo: { id: 'MOD-1', modulo: 'un pedazo', dominio: 'DOM-1', capacidades: '[CAP-1]' },
    capacidad: { id: 'CAP-1', capacidad: 'hacer algo', modulo: 'MOD-1', reglas: '[REG-1]' },
    regla: { id: 'REG-1', regla: 'una verdad que sostiene', capacidades: '[CAP-1]' }
  }

  const frente: Record<string, string> = {
    ...campos[tipo],
    firmeza: 'dicho',
    origen: 'escuchado',
    estado: 'completa',
    paso: 'el paso de prueba',
    alta: '2026-08-04T09:00:00-06:00',
    ...sobrescribe
  }

  const renglones = Object.entries(frente).map(([clave, valor]) => `${clave}: ${valor}`)
  const cuerpoFinal = cuerpo ?? `<${tipo}>\n<que-queda-abierto>\nnada\n</que-queda-abierto>\n</${tipo}>`

  return `---\n${renglones.join('\n')}\n---\n\n${cuerpoFinal}\n`
}

describe('encontrarRutaDeMaquina', () => {
  it('una linea sin ruta no produce hallazgos', () => {
    expect(encontrarRutaDeMaquina('el experto lo dijo al presentarlo', 'a.md')).toEqual([])
  })

  it('una ruta absoluta con backslash se cuenta, con su numero de linea', () => {
    const texto = 'primer renglon\nla ruta es C:\\trabajo\\proyecto-ejemplo\\archivo.md'
    const hallazgos = encontrarRutaDeMaquina(texto, 'a.md')
    expect(hallazgos).toHaveLength(1)
    expect(hallazgos[0]).toMatchObject({ ruta: 'a.md', linea: 2, clase: 'ruta-de-unidad' })
  })

  it('una ruta absoluta con slash tambien se cuenta', () => {
    expect(encontrarRutaDeMaquina('la ruta es D:/trabajo/proyecto', 'a.md')).toHaveLength(1)
  })

  it('dos rutas en la misma linea producen dos hallazgos', () => {
    const hallazgos = encontrarRutaDeMaquina('de C:\\uno a D:\\dos', 'a.md')
    expect(hallazgos).toHaveLength(2)
  })

  it('una URL con esquema no se confunde con una ruta de maquina', () => {
    expect(encontrarRutaDeMaquina('ver http://example.com/pagina', 'a.md')).toEqual([])
  })

  it('un ratio de dos numeros no se confunde con una ruta', () => {
    expect(encontrarRutaDeMaquina('la pantalla mide 16:9', 'a.md')).toEqual([])
  })

  it('una ruta relativa del propio repositorio no se confunde con una ruta de maquina', () => {
    const texto = 'ver product/conocimiento/reglas/0001-archivo.md'
    expect(encontrarRutaDeMaquina(texto, 'a.md')).toEqual([])
  })
})

describe('revisarPieza, la forma que exige cada plantilla', () => {
  for (const tipo of ['dominio', 'modulo', 'capacidad', 'regla'] as const) {
    it(`una pieza de tipo "${tipo}" con todos sus campos no tiene fallas`, () => {
      expect(revisarPieza(piezaValida(tipo), tipo)).toEqual([])
    })
  }

  it('sin frontmatter, la unica falla es "sin-frontmatter"', () => {
    expect(comoClaves(revisarPieza('nada mas que texto suelto', 'regla'))).toEqual(['sin-frontmatter'])
  })

  it('un campo comun ausente se reporta con su nombre', () => {
    const texto = piezaValida('regla').replace('paso: el paso de prueba\n', '')
    expect(comoClaves(revisarPieza(texto, 'regla'))).toContain('falta-campo:paso')
  })

  it('un campo propio del tipo ausente se reporta con su nombre', () => {
    const texto = piezaValida('capacidad').replace('modulo: MOD-1\n', '')
    expect(comoClaves(revisarPieza(texto, 'capacidad'))).toContain('falta-campo:modulo')
  })

  it('una firmeza que no es de las tres se reporta con el valor leido', () => {
    const texto = piezaValida('regla', { firmeza: 'segura' })
    expect(comoClaves(revisarPieza(texto, 'regla'))).toContain('firmeza-desconocida:segura')
  })

  it('un origen que no es de los dos se reporta con el valor leido', () => {
    const texto = piezaValida('regla', { origen: 'inventado' })
    expect(comoClaves(revisarPieza(texto, 'regla'))).toContain('origen-desconocido:inventado')
  })

  it('un estado que no es de los dos se reporta con el valor leido', () => {
    const texto = piezaValida('regla', { estado: 'a-medias' })
    expect(comoClaves(revisarPieza(texto, 'regla'))).toContain('estado-desconocido:a-medias')
  })

  it('con-huecos y que-queda-abierto en "nada" es un hueco mudo', () => {
    const texto = piezaValida('regla', { estado: 'con-huecos' })
    expect(comoClaves(revisarPieza(texto, 'regla'))).toContain('hueco-mudo')
  })

  it('con-huecos y la etiqueta vacia tambien es un hueco mudo', () => {
    const cuerpo = '<regla>\n<que-queda-abierto>\n</que-queda-abierto>\n</regla>'
    const texto = piezaValida('regla', { estado: 'con-huecos' }, cuerpo)
    expect(comoClaves(revisarPieza(texto, 'regla'))).toContain('hueco-mudo')
  })

  it('con-huecos y sin la etiqueta tambien es un hueco mudo', () => {
    const texto = piezaValida('regla', { estado: 'con-huecos' }, '<regla>\nsin la etiqueta\n</regla>')
    expect(comoClaves(revisarPieza(texto, 'regla'))).toContain('hueco-mudo')
  })

  it('con-huecos y que-queda-abierto con la pregunta real no es un hueco mudo', () => {
    const cuerpo = '<regla>\n<que-queda-abierto>\nfalta que el experto confirme el numero\n</que-queda-abierto>\n</regla>'
    const texto = piezaValida('regla', { estado: 'con-huecos' }, cuerpo)
    expect(comoClaves(revisarPieza(texto, 'regla'))).toEqual([])
  })

  it('completa con que-queda-abierto en "nada" no es un hueco mudo: la regla solo aplica a con-huecos', () => {
    expect(revisarPieza(piezaValida('regla'), 'regla')).toEqual([])
  })
})
