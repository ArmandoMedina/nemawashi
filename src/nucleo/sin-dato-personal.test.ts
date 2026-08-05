import { describe, it, expect } from 'vitest'
import {
  encontrarDatoPersonal,
  buscarCadenasDeDenylist,
  dominioEstaPermitido,
  segmentoEsMarcador,
  EXTENSIONES_A_ESCANEAR
} from './sin-dato-personal'

/**
 * La logica sola: entrada exacta, salida exacta. Capa 1.
 *
 * Este archivo prueba un detector de dato personal, asi que no puede contener dato
 * personal el mismo — seria republicarlo en el mismo repo publico que el gate protege.
 * Por eso toda cadena trampa se arma por concatenacion en tiempo de ejecucion: no hay
 * ningun `algo@dominio.com` ni `C:\Users\alguien` escrito de un tiron en este archivo.
 *
 * Los casos negativos importan mas que los positivos: un gate que bloquea un enlace a
 * `@usuario` de GitHub, o una ruta de guia con marcador de posicion, es un gate que nadie
 * puede usar, y termina desactivado. Ver `src/nucleo/sin-dato-personal.ts` para lo que
 * este detector explicitamente NO cubre.
 */

const RUTA_DE_PRUEBA = 'documento-de-ejemplo.md'

describe('correo con dominio real', () => {
  it('marca un correo con dominio real', () => {
    const correo = 'alguien' + '@' + 'gmail.com'
    const hallazgos = encontrarDatoPersonal(`contacto: ${correo}`, RUTA_DE_PRUEBA)
    expect(hallazgos).toEqual([
      { ruta: RUTA_DE_PRUEBA, linea: 1, clase: 'correo-con-dominio-real', fragmento: correo }
    ])
  })

  it('no marca un handle de GitHub sin dominio dentro de un enlace', () => {
    const texto = 'gracias a [' + '@usuario' + '](https://github.com/usuario) por su ayuda'
    expect(encontrarDatoPersonal(texto, RUTA_DE_PRUEBA)).toEqual([])
  })

  it('no marca un correo de prueba con dominio .local', () => {
    const correo = 'prueba' + '@' + 'servicio.local'
    expect(encontrarDatoPersonal(correo, RUTA_DE_PRUEBA)).toEqual([])
  })

  it('no marca el noreply de GitHub, que existe justo para no exponer el correo real', () => {
    const correo = '12345+alguien' + '@' + 'users.noreply.github.com'
    expect(encontrarDatoPersonal(correo, RUTA_DE_PRUEBA)).toEqual([])
  })

  it('no marca example.com ni sus hermanos, reservados para documentacion', () => {
    for (const dominio of ['example.com', 'example.org', 'example.net']) {
      const correo = 'quien' + '@' + dominio
      expect(encontrarDatoPersonal(correo, RUTA_DE_PRUEBA)).toEqual([])
    }
  })

  it('dominioEstaPermitido reconoce cada allowlist por separado', () => {
    expect(dominioEstaPermitido('servicio.local')).toBe(true)
    expect(dominioEstaPermitido('servicio.test')).toBe(true)
    expect(dominioEstaPermitido('servicio.example')).toBe(true)
    expect(dominioEstaPermitido('servicio.invalid')).toBe(true)
    expect(dominioEstaPermitido('users.noreply.github.com')).toBe(true)
    expect(dominioEstaPermitido('example.com')).toBe(true)
    expect(dominioEstaPermitido('gmail.com')).toBe(false)
  })
})

describe('ruta de perfil de usuario en Windows', () => {
  it('marca una ruta con un segmento real', () => {
    const ruta = 'C:\\Users\\' + 'jperez' + '\\Documentos\\proyecto'
    const hallazgos = encontrarDatoPersonal(ruta, RUTA_DE_PRUEBA)
    expect(hallazgos).toEqual([
      {
        ruta: RUTA_DE_PRUEBA,
        linea: 1,
        clase: 'ruta-de-perfil-windows',
        fragmento: 'C:\\Users\\jperez'
      }
    ])
  })

  it('no marca C:\\Users\\x, el marcador mas corto', () => {
    expect(encontrarDatoPersonal('C:\\Users\\x\\repo', RUTA_DE_PRUEBA)).toEqual([])
  })

  it('no marca una ruta de guia que ni siquiera es de perfil de usuario', () => {
    expect(encontrarDatoPersonal('C:\\ruta\\a\\tu-repo', RUTA_DE_PRUEBA)).toEqual([])
  })

  it('no marca el marcador de posicion usado en las maquetas y en las cartas de los oficios', () => {
    expect(
      encontrarDatoPersonal('C:\\Users\\usuario\\OneDrive\\Documentos\\proyecto-ejemplo', RUTA_DE_PRUEBA)
    ).toEqual([])
  })

  it('no se traga la puntuacion de cierre de una ruta citada entre comillas o backticks', () => {
    const hallazgosComillas = encontrarDatoPersonal('la ruta es "C:\\Users\\jperez"', RUTA_DE_PRUEBA)
    expect(hallazgosComillas).toEqual([
      {
        ruta: RUTA_DE_PRUEBA,
        linea: 1,
        clase: 'ruta-de-perfil-windows',
        fragmento: 'C:\\Users\\jperez'
      }
    ])

    const hallazgosBackticks = encontrarDatoPersonal('la ruta es `C:\\Users\\jperez`', RUTA_DE_PRUEBA)
    expect(hallazgosBackticks[0]?.fragmento).toBe('C:\\Users\\jperez')
  })

  it('segmentoEsMarcador reconoce cada marcador de la lista, sin importar mayusculas', () => {
    for (const marcador of [
      'x',
      'usuario',
      'user',
      'tu-usuario',
      'nombre',
      'ruta',
      'you',
      'username',
      'tu',
      'yo',
      'USUARIO'
    ]) {
      expect(segmentoEsMarcador(marcador)).toBe(true)
    }
    expect(segmentoEsMarcador('jperez')).toBe(false)
  })
})

describe('ruta de perfil de usuario en POSIX', () => {
  it('marca una ruta con un segmento real bajo /home', () => {
    const ruta = '/home/' + 'jperez' + '/proyecto'
    const hallazgos = encontrarDatoPersonal(ruta, RUTA_DE_PRUEBA)
    expect(hallazgos).toEqual([
      { ruta: RUTA_DE_PRUEBA, linea: 1, clase: 'ruta-de-perfil-posix', fragmento: '/home/jperez' }
    ])
  })

  it('marca una ruta con un segmento real bajo /Users', () => {
    const ruta = '/Users/' + 'jperez' + '/proyecto'
    const hallazgos = encontrarDatoPersonal(ruta, RUTA_DE_PRUEBA)
    expect(hallazgos).toEqual([
      { ruta: RUTA_DE_PRUEBA, linea: 1, clase: 'ruta-de-perfil-posix', fragmento: '/Users/jperez' }
    ])
  })

  it('no marca /home/usuario, el marcador de posicion', () => {
    expect(encontrarDatoPersonal('/home/usuario/repo', RUTA_DE_PRUEBA)).toEqual([])
  })
})

describe('casos generales', () => {
  it('un texto vacio no produce ningun hallazgo', () => {
    expect(encontrarDatoPersonal('', RUTA_DE_PRUEBA)).toEqual([])
  })

  it('un texto sin nada sospechoso no produce ningun hallazgo', () => {
    expect(encontrarDatoPersonal('esto es un documento normal, sin nada que marcar', RUTA_DE_PRUEBA)).toEqual(
      []
    )
  })

  it('reporta la linea correcta cuando el hallazgo no esta en la primera linea', () => {
    const correo = 'alguien' + '@' + 'gmail.com'
    const texto = ['primera linea', 'segunda linea', `tercera linea con ${correo}`].join('\n')
    const hallazgos = encontrarDatoPersonal(texto, RUTA_DE_PRUEBA)
    expect(hallazgos).toEqual([
      { ruta: RUTA_DE_PRUEBA, linea: 3, clase: 'correo-con-dominio-real', fragmento: correo }
    ])
  })

  it('junta varios hallazgos de distinta clase, no solo el primero', () => {
    const correo = 'alguien' + '@' + 'gmail.com'
    const rutaWindows = 'C:\\Users\\' + 'jperez'
    const texto = `contacto ${correo} y ruta ${rutaWindows}`
    const hallazgos = encontrarDatoPersonal(texto, RUTA_DE_PRUEBA)
    expect(hallazgos.map((h) => h.clase).sort()).toEqual(
      ['correo-con-dominio-real', 'ruta-de-perfil-windows'].sort()
    )
  })
})

describe('extensiones a escanear', () => {
  it('incluye .jsonl: docs/mediciones/corridas.jsonl se versiona y le aplica la misma regla', () => {
    expect(EXTENSIONES_A_ESCANEAR).toContain('.jsonl')
  })
})

describe('cadenas de la denylist local', () => {
  it('marca una cadena literal de la denylist si aparece en el texto', () => {
    const cadenaUnica = 'nombre-de-proyecto-real-del-cliente-x9f2'
    const hallazgos = buscarCadenasDeDenylist(
      `esto menciona a ${cadenaUnica} de pasada`,
      RUTA_DE_PRUEBA,
      [cadenaUnica]
    )
    expect(hallazgos).toEqual([
      { ruta: RUTA_DE_PRUEBA, linea: 1, clase: 'cadena-en-denylist', fragmento: cadenaUnica }
    ])
  })

  it('no marca nada si la lista de cadenas esta vacia', () => {
    expect(buscarCadenasDeDenylist('cualquier texto', RUTA_DE_PRUEBA, [])).toEqual([])
  })

  it('no marca nada si ninguna cadena de la denylist aparece', () => {
    expect(buscarCadenasDeDenylist('texto sin nada especial', RUTA_DE_PRUEBA, ['otra-cosa-larga-y-unica'])).toEqual(
      []
    )
  })
})
