/**
 * El sacador de turnos.
 *
 * RM-0021: va primero — sin el, al molino solo le entra el resumen que redacta el
 * consultor, y un filtrado o suavizado suyo no deja rastro con que compararlo (RM-0014).
 *
 * Nucleo: funcion pura. No abre archivos ni pregunta al sistema — recibe el texto crudo
 * del `.jsonl` ya leido y devuelve la platica limpia. Quien lee el disco es el adaptador
 * que todavia no existe: nada en este cambio lo necesita (YAGNI), asi que no se escribe.
 *
 * «Resultado en vez de excepcion» (`product/arquitectura-desarrollo.md` §2.16) aqui no
 * necesita un tipo envoltorio: un `.jsonl` vacio, con lineas rotas o sin ningun turno de
 * los dos que hablan son casos normales, no fallas del programa — el propio arreglo, que
 * puede salir vacio, ya es el resultado. Una linea que no parsea como JSON se salta, no
 * tumba el sacador entero.
 *
 * RM-0016, la prueba de fuego: «lo que quede se lea de corrido como una platica entre dos
 * personas — si aparece algo que ninguno dijo, el sacador fallo.» Por eso se tira, linea
 * por linea y bloque por bloque:
 *   - los resultados de las herramientas (`tool_result`) y las llamadas a herramientas
 *     (`tool_use`) — ninguno de los dos lo dijo, es mecanica de la maquina;
 *   - el razonamiento interno del agente (`thinking`) — el experto nunca lo escucha, asi
 *     que tampoco es platica entre los dos;
 *   - los avisos que el sistema mete solo: `<system-reminder>`, `<task-notification>`,
 *     `<local-command-caveat>`, los mensajes de "[Request interrupted...]" y las lineas
 *     marcadas `isMeta: true` (incluye los mensajes que otra sesion de Claude manda sola);
 *   - los mensajes de comandos: `<command-name>`, `<command-message>`, `<command-args>` y
 *     su salida en `<local-command-stdout>`;
 *   - los turnos vacios: si despues de limpiar no queda nada, el turno no se escribe.
 *
 * **La excepcion, medida contra grabacion real.** Cuando el consultor pregunta con la
 * herramienta `AskUserQuestion`, la respuesta del experto llega al crudo como
 * `tool_result` — y la regla de arriba la tiraria justo cuando mas cuenta: la vez que el
 * experto contesta algo en sus propias palabras. Ese `tool_result` trae una marca fija
 * (`turnosDePreguntaYRespuesta`, mas abajo) y es el UNICO que se rescata; cualquier otro
 * `tool_result` — el contenido de un archivo, la salida de un comando, el reporte de otro
 * agente — se sigue tirando entero, como antes.
 *
 * RM-0017, sigue abierto en el roadmap. El supuesto autorizado para esta vuelta: de una
 * imagen solo queda la ruta en el crudo (`~/.claude/image-cache/<sesion>/1.png`), y esa
 * ruta sola no le dice nada a nadie — se cambia por la marca `[imagen]`, para no perder
 * que ahi hubo una sin arrastrar una ruta de la maquina del cliente al texto limpio.
 */

/** Los dos que hablan en una sesion. */
export type Quien = 'experto' | 'agente'

export type Turno = { quien: Quien; texto: string }

/** El texto que sustituye a una imagen — ver el supuesto de RM-0017 en el encabezado. */
const MARCA_DE_IMAGEN = '[imagen]'

/**
 * La ruta que deja una imagen en el crudo, tal como la describe RM-0017:
 * `~/.claude/image-cache/<sesion>/1.png`. Se acepta tambien la forma con `\` de Windows,
 * porque el crudo de esta maquina se genera ahi.
 */
const PATRON_RUTA_DE_IMAGEN = /~?[\\/]?\.claude[\\/]image-cache[\\/][^\s"'<>]+/g

/**
 * Los avisos y comandos que el sistema mete solo, con su contenido: se quitan por
 * completo, sea que ocupen el mensaje entero o que vengan pegados a texto real. Una sola
 * pasada por esta lista basta para los dos casos — un turno que se queda vacio despues se
 * tira como turno vacio, sin necesitar una regla aparte para "el mensaje completo era
 * esto".
 */
const ETIQUETAS_INYECTADAS = [
  'command-name',
  'command-message',
  'command-args',
  'local-command-stdout',
  'local-command-caveat',
  'task-notification',
  'system-reminder',
  'agent-message'
]

const PATRONES_DE_ETIQUETA = ETIQUETAS_INYECTADAS.map(
  (etiqueta) => new RegExp(`<${etiqueta}[^>]*>[\\s\\S]*?</${etiqueta}>`, 'g')
)

/** Frases sueltas que el sistema escribe cuando interrumpe, no una de las dos personas. */
const PATRON_INTERRUPCION = /\[Request interrupted by user(?: for tool use)?\]/g

function quitarInyeccionesDelSistema(texto: string): string {
  let limpio = texto
  for (const patron of PATRONES_DE_ETIQUETA) limpio = limpio.replace(patron, ' ')
  limpio = limpio.replace(PATRON_INTERRUPCION, ' ')
  return limpio
}

function conMarcaDeImagen(texto: string): string {
  return texto.replace(PATRON_RUTA_DE_IMAGEN, MARCA_DE_IMAGEN)
}

/** Lo que puede traer un bloque de contenido del registro crudo. Nunca se confia en la forma. */
type BloqueDeContenido = { type?: unknown; text?: unknown }

function textoDelBloque(bloque: unknown): string {
  if (!bloque || typeof bloque !== 'object') return ''
  const b = bloque as BloqueDeContenido

  if (b.type === 'image') return MARCA_DE_IMAGEN
  if (b.type === 'text' && typeof b.text === 'string') return b.text

  // tool_use, tool_result, thinking y cualquier otro bloque desconocido: no es lo que
  // ninguna de las dos personas dijo, se descarta sin dejar rastro.
  return ''
}

/** El contenido de un mensaje del registro crudo, sea cadena o arreglo de bloques. */
function textoDelContenido(contenido: unknown): string {
  if (typeof contenido === 'string') return contenido
  if (Array.isArray(contenido)) {
    return contenido
      .map(textoDelBloque)
      .filter((t) => t.length > 0)
      .join('\n\n')
  }
  return ''
}

/**
 * La marca fija que deja `AskUserQuestion` al principio de su `tool_result` — verificada
 * contra grabaciones reales del proyecto. Si el `tool_result` no empieza asi, no es una
 * respuesta directa y se tira entero, igual que cualquier otro.
 */
const MARCA_RESPUESTA_DE_PREGUNTA = 'The user answered:'

/**
 * Cada par viene como `"PREGUNTA"="RESPUESTA"`, uno o mas separados por coma, con las
 * comillas de adentro escapadas (`\"`) cuando las hay. `(?:[^"\\]|\\.)*` capta cualquier
 * caracter que no sea comilla ni backslash, o un backslash seguido de lo que sea — asi una
 * coma o una comilla escapada adentro del texto no cierran el par antes de tiempo.
 */
const PATRON_PAR_PREGUNTA_RESPUESTA = /"((?:[^"\\]|\\.)*)"="((?:[^"\\]|\\.)*)"/g

/** Solo se desescapa la comilla — es lo unico que RM (la medicion real) reporto escapado. */
function quitarEscapesDeComillas(texto: string): string {
  return texto.replace(/\\"/g, '"')
}

/**
 * De un `tool_result` de `AskUserQuestion`, dos turnos por cada par: la pregunta como
 * turno del agente (la redacto el consultor) y la respuesta como turno del experto (es lo
 * que el contesto) — asi la platica se sigue leyendo de corrido: pregunta, respuesta.
 *
 * El experto a veces escribe su propia respuesta y a veces escoge una opcion que el
 * consultor le redacto; en el crudo las dos se ven identicas y este sacador no adivina
 * cual es cual — eso es un asunto del roadmap, no de este sacador.
 *
 * Lo que venga despues del ultimo par reconocido (una nota que la herramienta agrega, o
 * texto que no tiene la forma de un par) no lo dijo ninguno de los dos: no se incluye,
 * porque `matchAll` solo encuentra los pares que si tienen la forma exacta.
 *
 * Con la marca pero sin ningun par reconocible, o sin la marca, da un arreglo vacio — el
 * `tool_result` se tira entero, como cualquier otro que no trae nada que rescatar.
 */
function turnosDePreguntaYRespuesta(contenido: string): Turno[] {
  if (!contenido.startsWith(MARCA_RESPUESTA_DE_PREGUNTA)) return []

  const turnos: Turno[] = []
  for (const coincidencia of contenido.matchAll(PATRON_PAR_PREGUNTA_RESPUESTA)) {
    const pregunta = quitarEscapesDeComillas(coincidencia[1] ?? '').trim()
    const respuesta = quitarEscapesDeComillas(coincidencia[2] ?? '').trim()
    if (pregunta) turnos.push({ quien: 'agente', texto: pregunta })
    if (respuesta) turnos.push({ quien: 'experto', texto: respuesta })
  }
  return turnos
}

/**
 * Busca, entre los bloques de un mensaje, los `tool_result` que traen la marca de
 * `AskUserQuestion` y los convierte en turnos. Otros `tool_result` en el mismo mensaje
 * (herramientas en paralelo) no traen la marca y se ignoran aqui — los tira el camino
 * normal, igual que siempre.
 */
function turnosRescatadosDelContenido(contenido: unknown): Turno[] {
  if (!Array.isArray(contenido)) return []

  return contenido.flatMap((bloque) => {
    if (!bloque || typeof bloque !== 'object') return []
    const b = bloque as BloqueDeContenido & { content?: unknown }
    if (b.type !== 'tool_result' || typeof b.content !== 'string') return []
    return turnosDePreguntaYRespuesta(b.content)
  })
}

/** Lo que trae cada renglon del `.jsonl`. Nunca se confia en la forma de un archivo ajeno. */
type EntradaCruda = {
  type?: unknown
  isMeta?: unknown
  message?: { content?: unknown }
}

const QUIEN_POR_TIPO: Record<string, Quien> = { user: 'experto', assistant: 'agente' }

/** Un renglon puede dar cero, uno o varios turnos — el rescate de una pregunta da dos por par. */
function turnosDeEntrada(entrada: EntradaCruda): Turno[] {
  if (typeof entrada.type !== 'string') return []
  const quien = QUIEN_POR_TIPO[entrada.type]
  if (!quien) return []

  // Los avisos que otra sesion o el propio sistema meten solos llegan marcados asi —
  // incluye el aviso de que se corrio un comando local y los mensajes entre agentes.
  if (entrada.isMeta === true) return []

  const contenido = entrada.message?.content

  const rescatados = turnosRescatadosDelContenido(contenido)
  if (rescatados.length > 0) return rescatados

  const bruto = textoDelContenido(contenido)
  const texto = quitarInyeccionesDelSistema(conMarcaDeImagen(bruto)).trim()

  if (!texto) return []

  return [{ quien, texto }]
}

/** Parte el crudo en renglones, tolerando los dos finales de linea. */
function renglones(crudo: string): string[] {
  return crudo.split(/\r\n|\r|\n/).filter((renglon) => renglon.trim().length > 0)
}

/**
 * De `.jsonl` crudo a platica limpia: solo los turnos de los dos que hablan.
 *
 * Nunca lanza: una linea que no es JSON valido se salta, igual que una linea que no trae
 * la forma esperada. Un crudo vacio o sin ningun turno de los dos da un arreglo vacio, que
 * ya es una respuesta completa — no una falla a medias.
 */
export function sacarTurnos(crudo: string): Turno[] {
  const turnos: Turno[] = []

  for (const renglon of renglones(crudo)) {
    let entrada: unknown
    try {
      entrada = JSON.parse(renglon)
    } catch {
      continue
    }

    if (!entrada || typeof entrada !== 'object') continue

    turnos.push(...turnosDeEntrada(entrada as EntradaCruda))
  }

  return turnos
}

const ETIQUETA_POR_QUIEN: Record<Quien, string> = { experto: 'EXPERTO', agente: 'AGENTE' }

/**
 * La platica, lista para leerse de corrido — el formato que el molino espera en
 * `args.platica` (texto). Un renglon en blanco separa cada turno para que la lectura no
 * los pegue.
 */
export function platicaComoTexto(turnos: Turno[]): string {
  return turnos.map((t) => `${ETIQUETA_POR_QUIEN[t.quien]}: ${t.texto}`).join('\n\n')
}
