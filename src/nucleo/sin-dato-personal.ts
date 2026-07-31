/**
 * El gate anti dato personal. Nucleo: funciones puras sobre datos planos. Reciben el
 * texto de un archivo y su ruta, devuelven una lista plana de hallazgos. No leen disco,
 * no escriben nada, no lanzan excepciones — el «resultado en vez de excepcion» de §2.16
 * aqui no necesita un tipo envoltorio: escanear una cadena no tiene forma de fallar, asi
 * que el propio arreglo de hallazgos (que puede estar vacio) ya es el resultado.
 *
 * **La trampa central de diseno:** un gate anti dato personal no puede contener el dato
 * personal que busca. Este archivo detecta *formas* — un correo con dominio, una ruta de
 * perfil de usuario — nunca instancias. Un patron es una clase, no un caso, asi que vivir
 * en un repositorio publico no revela nada. Las cadenas literales de un entorno real viven
 * aparte, en `anti-pii.denylist.txt`, gitignoreado y nunca versionado; ver
 * `anti-pii.denylist.example.txt` en la raiz.
 *
 * **Modelo de amenaza: el accidente, no un adversario con push.** No hay nada aqui pensado
 * para resistir a alguien que quiera colar un dato a proposito.
 *
 * **Lo que este gate NO hace, y no finge cubrir:**
 * - No detecta secretos ni credenciales (llaves de API, tokens). Fuera de alcance.
 * - No detecta citas textuales ni identificadores de cliente. No hay forma estructural de
 *   reconocerlos — el ADR 0002 ya lo dice: eso se gobierna por regla escrita y revision
 *   humana, no por una lista de nombres versionada, que seria el mismo dano que se quiere
 *   evitar.
 */

export type ClaseDeHallazgo =
  | 'correo-con-dominio-real'
  | 'ruta-de-perfil-windows'
  | 'ruta-de-perfil-posix'
  | 'cadena-en-denylist'

export type Hallazgo = {
  ruta: string
  linea: number
  clase: ClaseDeHallazgo
  fragmento: string
}

/**
 * Extensiones que este repositorio realmente usa. Dato plano y unico: el contrato de la
 * capa 2 (`src/contratos/sin-dato-personal.test.ts`) lo importa en vez de repetir la
 * lista, para que escanear mas tipos de archivo sea agregar una linea aqui, no dos.
 */
export const EXTENSIONES_A_ESCANEAR = ['.ts', '.tsx', '.md', '.html', '.css', '.json', '.yml', '.yaml', '.txt']

/**
 * Los archivos de este mismo gate contienen los patrones por naturaleza — el nucleo los
 * escribe como texto, sus pruebas los arman por concatenacion, y la plantilla de la
 * denylist explica con ejemplos que forma tienen. Ninguno debe auto-bloquearse.
 */
export const ARCHIVOS_AUTOEXCLUIDOS = [
  'src/nucleo/sin-dato-personal.ts',
  'src/nucleo/sin-dato-personal.test.ts',
  'src/contratos/sin-dato-personal.test.ts',
  'anti-pii.denylist.example.txt'
]

/** TLD reservados para pruebas y documentacion: RFC 2606 y el equivalente local. */
const TLD_DE_PRUEBA = ['.local', '.test', '.example', '.invalid']

/** Dominios completos que no exponen a nadie, aunque no terminen en un TLD de prueba. */
const DOMINIOS_EXACTOS_PERMITIDOS = ['example.com', 'example.org', 'example.net', 'users.noreply.github.com']

/**
 * Marcadores de posicion usados en guias, maquetas y cartas de los oficios de este mismo
 * repositorio — `C:\Users\usuario\...`, `/home/usuario/...` — que no senalan a nadie real.
 */
const SEGMENTOS_MARCADOR = ['x', 'usuario', 'user', 'tu-usuario', 'nombre', 'ruta', 'you', 'username', 'tu', 'yo']

const PATRON_CORREO = /[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g

// El segmento se captura con caracteres de palabra: si se le agregara la puntuacion de
// cierre de una cita (comilla, backtick, parentesis), una ruta citada como ejemplo se
// tragaria esa puntuacion y el documento que la usa terminaria auto-bloqueandose.
const PATRON_RUTA_WINDOWS = /[A-Za-z]:\\Users\\([A-Za-z0-9._-]+)/g
const PATRON_RUTA_POSIX = /\/(?:home|Users)\/([A-Za-z0-9._-]+)/g

export function dominioEstaPermitido(dominio: string): boolean {
  const d = dominio.toLowerCase()
  return TLD_DE_PRUEBA.some((tld) => d.endsWith(tld)) || DOMINIOS_EXACTOS_PERMITIDOS.includes(d)
}

export function segmentoEsMarcador(segmento: string): boolean {
  return SEGMENTOS_MARCADOR.includes(segmento.toLowerCase())
}

function partirEnLineas(texto: string): string[] {
  return texto.split(/\r\n|\r|\n/)
}

function hallazgosDeCorreo(linea: string, numeroDeLinea: number, ruta: string): Hallazgo[] {
  const hallazgos: Hallazgo[] = []
  for (const coincidencia of linea.matchAll(PATRON_CORREO)) {
    const dominio = coincidencia[1]
    if (dominio && !dominioEstaPermitido(dominio)) {
      hallazgos.push({ ruta, linea: numeroDeLinea, clase: 'correo-con-dominio-real', fragmento: coincidencia[0] })
    }
  }
  return hallazgos
}

function hallazgosDeRuta(
  linea: string,
  numeroDeLinea: number,
  ruta: string,
  patron: RegExp,
  clase: 'ruta-de-perfil-windows' | 'ruta-de-perfil-posix'
): Hallazgo[] {
  const hallazgos: Hallazgo[] = []
  for (const coincidencia of linea.matchAll(patron)) {
    const segmento = coincidencia[1]
    if (segmento && !segmentoEsMarcador(segmento)) {
      hallazgos.push({ ruta, linea: numeroDeLinea, clase, fragmento: coincidencia[0] })
    }
  }
  return hallazgos
}

/**
 * Los tres detectores estructurales, sobre el texto de un archivo. Devuelve una lista
 * plana, vacia si no hay nada que marcar.
 */
export function encontrarDatoPersonal(texto: string, ruta: string): Hallazgo[] {
  return partirEnLineas(texto).flatMap((linea, i) => {
    const numeroDeLinea = i + 1
    return [
      ...hallazgosDeCorreo(linea, numeroDeLinea, ruta),
      ...hallazgosDeRuta(linea, numeroDeLinea, ruta, PATRON_RUTA_WINDOWS, 'ruta-de-perfil-windows'),
      ...hallazgosDeRuta(linea, numeroDeLinea, ruta, PATRON_RUTA_POSIX, 'ruta-de-perfil-posix')
    ]
  })
}

/**
 * Busca cadenas literales dentro del texto. Es pura: recibe las cadenas como dato, no
 * lee ningun archivo de denylist — eso es trabajo de quien la llama.
 */
export function buscarCadenasDeDenylist(texto: string, ruta: string, cadenas: string[]): Hallazgo[] {
  return partirEnLineas(texto).flatMap((linea, i) => {
    const numeroDeLinea = i + 1
    return cadenas
      .filter((cadena) => cadena.length > 0 && linea.includes(cadena))
      .map((cadena) => ({ ruta, linea: numeroDeLinea, clase: 'cadena-en-denylist' as const, fragmento: cadena }))
  })
}
