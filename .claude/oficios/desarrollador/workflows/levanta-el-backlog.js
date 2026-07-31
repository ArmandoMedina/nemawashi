export const meta = {
  name: 'levanta-el-backlog',
  description: 'Muele una tanda de items del roadmap platicada con quien construye, la deja escrita como tareas del backlog con su origen, y la audita contra el registro crudo.',
  whenToUse: 'Al cerrar una tanda de tareas firmadas, o cuando quien construye lo pida. Para la linea si quedan preguntas por cerrar; se vuelve a correr con las respuestas.',
  phases: [
    { title: 'Afinar', detail: 'sacar las tareas y cazar lo que no se puede escribir todavia' },
    { title: 'Asentar', detail: 'un archivo por tarea, con su origen' },
    { title: 'Auditar', detail: 'leer el crudo y dictaminar' }
  ]
}

// Lo que recibe:
//   args.tanda      - nombre corto de la tanda que se cerro
//   args.platica    - el texto de lo que se hablo, textual
//   args.origenes   - los ids RM de los items del roadmap trabajados
//   args.respuestas - opcional. Lo que quien construye contesto a las preguntas de una corrida anterior
//   args.transcript - opcional. Ruta del registro crudo de la sesion
//   args.hora       - la hora real del alta, ISO 8601 con huso. Al escribano se le pasa, nunca la inventa.

const TAREAS = {
  type: 'object',
  required: ['tareas', 'preguntas'],
  properties: {
    tareas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['tarea', 'origen', 'paraQuien', 'criterio'],
        properties: {
          tarea: { type: 'string', description: 'Una linea: el comportamiento observable que va a existir' },
          origen: { type: 'array', items: { type: 'string' }, description: 'Ids RM-NNNN del roadmap de donde salio. Nunca vacio.' },
          paraQuien: { type: 'string', description: 'Quien lo necesita y que gana, en palabras del negocio' },
          criterio: { type: 'string', description: 'Como se sabe que ya, observable desde afuera' },
          borde: { type: 'string', description: 'Que NO incluye' },
          sugerencias: { type: 'string', description: 'Opcional. Lo que ahorra tiempo a quien implemente. Nunca el como obligatorio.' }
        }
      }
    },
    preguntas: {
      type: 'array',
      description: 'Ya redactadas para quien construye. Vacio si no hay nada que cerrar.',
      items: {
        type: 'object',
        required: ['pregunta', 'falla'],
        properties: {
          pregunta: { type: 'string' },
          falla: { type: 'string', enum: ['sin-origen', 'criterio-no-observable', 'el-como-colado', 'ambiguedad', 'borde-sin-trazar'] }
        }
      }
    }
  }
}

const ESCRITOS = {
  type: 'object',
  required: ['archivos', 'noEscritos'],
  properties: {
    archivos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['ruta', 'tarea'],
        properties: { ruta: { type: 'string' }, tarea: { type: 'string' } }
      }
    },
    noEscritos: { type: 'array', items: { type: 'string' }, description: 'Lo que no se pudo escribir y por que. Vacio si nada.' }
  }
}

const DICTAMEN = {
  type: 'object',
  required: ['inventado', 'perdido', 'sinOrigenReal', 'sirve', 'porque', 'transcriptLeido'],
  properties: {
    inventado: { type: 'array', items: { type: 'string' }, description: 'Escrito sin que nadie lo firmara. Cada uno con su prueba.' },
    perdido: { type: 'array', items: { type: 'string' }, description: 'Firmado y no escrito. Cada uno con su prueba.' },
    sinOrigenReal: { type: 'array', items: { type: 'string' }, description: 'El origen apunta a un item que no existe o no dice eso. Cada uno con su prueba.' },
    sospechas: { type: 'array', items: { type: 'string' } },
    sirve: { type: 'boolean', description: 'Alguien que no estuvo puede agarrar las tareas y saber que construir y cuando esta terminado' },
    porque: { type: 'string' },
    transcriptLeido: { type: 'string', description: 'Que archivo se leyo. Si no se pudo, decirlo aqui.' }
  }
}

function comoDatos(entrada) {
  if (typeof entrada === 'string') {
    try {
      return JSON.parse(entrada)
    } catch (e) {
      return { platica: entrada }
    }
  }
  return entrada ?? {}
}

const entrada = comoDatos(args)

const tanda = entrada.tanda ?? 'sin nombre'
const platica = typeof entrada.platica === 'string' ? entrada.platica : ''
const origenes = Array.isArray(entrada.origenes) ? entrada.origenes : []
const respuestas = entrada.respuestas
const transcript = entrada.transcript

if (!platica.trim()) {
  log('No llego texto de la platica: sin material, no es que la tanda no dejara nada.')
  return { estado: 'sin-material', tanda, motivo: 'la platica llego vacia o no llego' }
}

// --- Afinar --------------------------------------------------------------

phase('Afinar')

const afinado = await agent(
  [
    'Es tu momento uno: afinar, antes de que se escriba.',
    '',
    `Esto es lo que se hablo en la tanda "${tanda}" con quien construye.`,
    `Items del roadmap trabajados: ${origenes.length ? origenes.join(', ') : 'no declarados - eso ya es una falla de sin-origen'}.`,
    'Saca las tareas candidatas y las preguntas que hay que cerrar con quien construye.',
    '',
    respuestas
      ? [
          'Quien construye YA contesto las preguntas de una corrida anterior - vienen abajo.',
          '',
          '**Esta es la segunda y ultima ronda: no devuelvas preguntas.** Lo que siga sin cerrar',
          'despues de sus respuestas no se escribe como tarea: se reporta en la lista de preguntas',
          'que quedaron y el codigo decide. Una pregunta que nadie contesta detiene la linea para siempre.'
        ].join('\n')
      : '',
    '',
    '--- La platica ---',
    platica,
    respuestas ? '\n--- Lo que quien construye contesto despues ---\n' + respuestas : ''
  ].join('\n'),
  { label: `afinar:${tanda}`, phase: 'Afinar', agentType: 'desarrollador:auditor', schema: TAREAS }
)

if (!afinado) {
  log('El auditor no devolvio nada. No se escribe nada.')
  return { estado: 'sin-medicion', tanda }
}

// El andon para la linea una vez, no para siempre - mismo tope que el molino
// del roadmap, decidido por el codigo y no por el agente.
const segundaRonda = Boolean(respuestas && String(respuestas).trim())

if (afinado.preguntas.length > 0 && !segundaRonda) {
  log(`${afinado.preguntas.length} pregunta(s) por cerrar con quien construye. No se escribe todavia.`)
  return {
    estado: 'faltan-preguntas',
    tanda,
    preguntas: afinado.preguntas,
    tareasEnEspera: afinado.tareas
  }
}

if (afinado.preguntas.length > 0) {
  log(`${afinado.preguntas.length} pregunta(s) sin cerrar tras dos rondas: esas tareas no se escriben y quedan reportadas.`)
}

if (afinado.tareas.length === 0) {
  log(`La tanda "${tanda}" no dejo tareas firmes. No es un fracaso.`)
  return { estado: 'sin-tareas', tanda, preguntasQueQuedaron: afinado.preguntas }
}

// --- Asentar -------------------------------------------------------------

phase('Asentar')

const escritos = await agent(
  [
    `Escribe estas tareas de la tanda "${tanda}". Ya pasaron por el auditor y quien construye las firmo.`,
    '',
    'Antes de escribir nada, lee `backlog/0000-plantilla.md`: la forma la manda esa plantilla, no tu carta.',
    'Una por archivo, en `backlog/`. Comprueba que cada id de `origen` exista como archivo en `roadmap/`.',
    `La hora de alta es: ${entrada.hora ?? 'NO TE LLEGO - no escribas y reportalo'}`,
    '',
    JSON.stringify(afinado.tareas, null, 2)
  ].join('\n'),
  { label: `asentar:${tanda}`, phase: 'Asentar', agentType: 'desarrollador:escribano', schema: ESCRITOS }
)

if (!escritos) {
  log('El escribano no reporto. No se puede auditar lo que no se sabe si existe.')
  return { estado: 'sin-registro', tanda, tareas: afinado.tareas }
}

// --- Auditar -------------------------------------------------------------

phase('Auditar')

const dictamen = await agent(
  [
    'Es tu momento dos: auditar, despues de que se escribio.',
    '',
    'El orden no se invierte: primero el registro crudo, despues los archivos.',
    transcript ? `El registro crudo de la sesion esta en: ${transcript}` : 'No te dieron la ruta del registro crudo: dilo en transcriptLeido.',
    '',
    `Se acaba de escribir la tanda "${tanda}" en \`backlog/\`. Dictamina lo inventado, lo perdido y lo sin origen real.`
  ].join('\n'),
  { label: `auditar:${tanda}`, phase: 'Auditar', agentType: 'desarrollador:auditor', schema: DICTAMEN }
)

const fallas = dictamen
  ? dictamen.inventado.length + dictamen.perdido.length + dictamen.sinOrigenReal.length
  : null

if (fallas === null) log('El auditor no dictamino. Lo escrito queda sin medir.')
else if (fallas === 0) log(`Tanda "${tanda}": ${escritos.archivos.length} tarea(s) escrita(s), sin fallas.`)
else log(`Tanda "${tanda}": ${escritos.archivos.length} escrita(s), ${fallas} falla(s) que atender.`)

return {
  estado: dictamen ? 'listo' : 'sin-dictamen',
  tanda,
  archivos: escritos.archivos,
  noEscritos: escritos.noEscritos,
  preguntasQueQuedaron: afinado.preguntas,
  dictamen
}
