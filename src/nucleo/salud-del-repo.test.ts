import { describe, it, expect } from 'vitest'
import { revisarRepo, esCarpetaSincronizada, esUnidadDeRed, esRutaLarga } from './salud-del-repo'

/**
 * La logica sola: entrada exacta, salida exacta.
 *
 * Que Nemawashi no arregle nada por su cuenta —la cualidad «no invadir»— no se vigila desde
 * aqui: leer los textos de los avisos buscando promesas se esquiva cambiando una palabra.
 * Se vigila en `src/contratos/el-nucleo-no-escribe.test.ts`, donde se comprueba que el
 * nucleo no importa nada con que escribir.
 *
 * El nucleo devuelve **claves**, no palabras: redactar es presentacion, y la presentacion
 * no vive aqui (`arquitectura-desarrollo.md` §2.4). Quien convierte una clave en palabras
 * es la pantalla, con `src/renderer/src/textos.ts`. Por eso estas pruebas comparan contra
 * la clave exacta y no contra ningun titulo.
 */

const sano = { ruta: 'D:\\trabajo\\proyecto-ejemplo', tieneGitattributes: true }

describe('revision de salud del repositorio', () => {
  it('un repositorio sano no levanta ningun aviso', () => {
    expect(revisarRepo(sano)).toEqual([])
  })

  it('avisa cuando el repositorio esta dentro de una carpeta sincronizada', () => {
    const avisos = revisarRepo({
      ...sano,
      ruta: 'C:\\Users\\usuario\\OneDrive\\Documentos\\proyecto-ejemplo'
    })
    expect(avisos).toEqual(['carpeta-sincronizada'])
  })

  it('avisa cuando el repositorio no fija el fin de linea', () => {
    const avisos = revisarRepo({ ...sano, tieneGitattributes: false })
    expect(avisos).toEqual(['sin-gitattributes'])
  })

  it('junta todos los avisos que apliquen, no solo el primero', () => {
    const avisos = revisarRepo({
      ruta: '\\\\servidor\\equipo\\Dropbox\\' + 'carpeta\\'.repeat(30) + 'proyecto',
      tieneGitattributes: false
    })
    expect([...avisos].sort()).toEqual(
      ['carpeta-sincronizada', 'ruta-larga', 'sin-gitattributes', 'unidad-de-red'].sort()
    )
  })
})

describe('los reconocedores por separado', () => {
  it('reconoce las carpetas que se sincronizan solas, sin importar mayusculas', () => {
    expect(esCarpetaSincronizada('C:\\Users\\x\\onedrive\\repo')).toBe(true)
    expect(esCarpetaSincronizada('C:\\Users\\x\\Google Drive\\repo')).toBe(true)
    expect(esCarpetaSincronizada('D:\\trabajo\\repo')).toBe(false)
  })

  it('reconoce una unidad de red por su prefijo', () => {
    expect(esUnidadDeRed('\\\\servidor\\equipo\\repo')).toBe(true)
    expect(esUnidadDeRed('C:\\repo')).toBe(false)
  })

  it('reconoce una ruta que se acerca al limite de Windows', () => {
    expect(esRutaLarga('C:\\' + 'a'.repeat(250))).toBe(true)
    expect(esRutaLarga('C:\\repo')).toBe(false)
  })
})
