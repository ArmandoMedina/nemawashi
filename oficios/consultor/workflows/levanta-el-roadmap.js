export const meta = {
  name: 'levanta-el-roadmap',
  description: 'Muele lo platicado en un paso de la sesion, lo deja escrito como hallazgos y lo audita contra el registro crudo.',
  whenToUse: 'Al cerrar un paso del mapa, o cuando el experto lo pida. Para la linea si quedan preguntas por cerrar; se vuelve a correr con las respuestas.',
  phases: [
    { title: 'Afinar', detail: 'sacar los hallazgos y cazar lo que no se puede escribir todavia' },
    { title: 'Asentar', detail: 'un archivo por hallazgo' },
    { title: 'Auditar', detail: 'leer el crudo y dictaminar' }
  ]
}

// Lo que recibe:
//   args.paso      - como se llama el paso del mapa que se cerro
//   args.platica   - el texto de lo que se hablo en ese paso
//   args.respuestas - opcional. Lo que el experto contesto a las preguntas de una corrida anterior
//   args.transcript - opcional. Ruta del .jsonl de la sesion

const HALLAZGOS = {
  type: 'object',
  required: ['hallazgos', 'preguntas'],
  properties: {
    hallazgos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['regla', 'deDondeSalio', 'firmeza'],
        properties: {
          regla: { type: 'string', description: 'Una linea, en palabras del negocio' },
          deDondeSalio: { type: 'string', description: 'Que pregunta lo destapo, o de que caso concreto' },
          firmeza: { type: 'string', enum: ['dicho', 'confirmado', 'abierto'] },
          preguntaPendiente: { type: 'string', description: 'Solo si la firmeza es abierto: que quedo sin contestar' }
        }
      }
    },
    preguntas: {
      type: 'array',
      description: 'Ya convertidas en la pregunta que se le va a hacer al experto. Vacio si no hay nada que cerrar.',
      items: {
        type: 'object',
        required: ['pregunta', 'falla'],
        properties: {
          pregunta: { type: 'string' },
          falla: { type: 'string', enum: ['ambiguedad', 'contradiccion', 'frase-a-medias', 'referencia-sin-cerrar', 'umbral-sin-numero'] }
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
        required: ['ruta', 'regla'],
        properties: { ruta: { type: 'string' }, regla: { type: 'string' } }
      }
    },
    noEscritos: { type: 'array', items: { type: 'string' }, description: 'Lo que no se pudo escribir y por que. Vacio si nada.' }
  }
}

const DICTAMEN = {
  type: 'object',
  required: ['inventado', 'perdido', 'malMarcado', 'sirve', 'porque', 'transcriptLeido'],
  properties: {
    inventado: { type: 'array', items: { type: 'string' }, description: 'Escrito sin que nadie lo dijera. Cada uno con su prueba.' },
    perdido: { type: 'array', items: { type: 'string' }, description: 'Dicho y no escrito. Cada uno con su prueba.' },
    malMarcado: { type: 'array', items: { type: 'string' }, description: 'La firmeza no corresponde. Cada uno con su prueba.' },
    sospechas: { type: 'array', items: { type: 'string' } },
    sirve: { type: 'boolean', description: 'Le alcanza a alguien que no estuvo en la sesion para entender las reglas' },
    porque: { type: 'string' },
    transcriptLeido: { type: 'string', description: 'Que archivo se leyo. Si no se pudo, decirlo aqui.' }
  }
}

// Quien llama puede mandar los argumentos como datos o como texto. Las dos formas
// se han visto en corrida real, y leer texto como si fuera dato deja `platica`
// vacia - que se lee igual que "el paso no dejo nada". Aqui se aclara la entrada
// una sola vez, antes de que nadie la use.
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

const paso = entrada.paso ?? 'sin nombre'
const platica = typeof entrada.platica === 'string' ? entrada.platica : ''
const respuestas = entrada.respuestas
const transcript = entrada.transcript

if (!platica.trim()) {
  log('No llego texto de la platica: sin material, no es que el paso no dejara nada.')
  return { estado: 'sin-material', paso, motivo: 'la platica llego vacia o no llego' }
}

// --- Afinar --------------------------------------------------------------
// El auditor mide el material contra si mismo. Todavia no escribe nadie.

phase('Afinar')

const afinado = await agent(
  [
    'Carga tu carta `afinar` antes de medir nada.',
    '',
    `Este es lo que se hablo en el paso "${paso}" de una sesion con un experto de negocio.`,
    'Saca los hallazgos candidatos y las preguntas que hay que cerrar con el.',
    '',
    respuestas
      ? [
          'El experto YA contesto las preguntas de una corrida anterior - vienen abajo.',
          '',
          '**Esta es la segunda y ultima ronda: no devuelvas preguntas.** Lo que siga sin cerrar',
          'despues de sus respuestas se marca `abierto`, con lo que falto en `preguntaPendiente`.',
          'Un hueco registrado sirve; una pregunta que nadie contesta detiene la linea para siempre.'
        ].join('\n')
      : '',
    '',
    '--- La platica ---',
    platica,
    respuestas ? '\n--- Lo que el experto contesto despues ---\n' + respuestas : ''
  ].join('\n'),
  { label: `afinar:${paso}`, phase: 'Afinar', agentType: 'consultor:auditor', schema: HALLAZGOS }
)

if (!afinado) {
  log('El auditor no devolvio nada. No se escribe nada.')
  return { estado: 'sin-medicion' }
}

// El andon para la linea una vez, no para siempre. Medido en corrida real: sin
// tope, cada ronda de respuestas destapa preguntas nuevas y nunca se escribe
// nada. Un freno que no se levanta no es freno, es candado.
const segundaRonda = Boolean(respuestas && String(respuestas).trim())

if (afinado.preguntas.length > 0 && !segundaRonda) {
  log(`${afinado.preguntas.length} pregunta(s) por cerrar con el experto. No se escribe todavia.`)
  return {
    estado: 'faltan-preguntas',
    paso,
    preguntas: afinado.preguntas,
    hallazgosEnEspera: afinado.hallazgos
  }
}

// Segunda ronda: lo que siga sin cerrar se registra como hueco y no vuelve a
// parar nada. Lo hace el codigo y no el agente, porque el agente ya demostro
// que siempre encuentra una pregunta mas.
if (afinado.preguntas.length > 0) {
  for (const p of afinado.preguntas) {
    afinado.hallazgos.push({
      regla: `Sin cerrar: ${p.pregunta}`,
      deDondeSalio: `Quedo abierto despues de dos rondas. Falla detectada: ${p.falla}.`,
      firmeza: 'abierto',
      preguntaPendiente: p.pregunta
    })
  }
  log(`${afinado.preguntas.length} pregunta(s) sin cerrar: se escriben como hallazgo abierto.`)
}

if (afinado.hallazgos.length === 0) {
  log(`El paso "${paso}" no dejo hallazgos. No es un fracaso: todavia no llegan a nada firme.`)
  return { estado: 'sin-hallazgos', paso }
}

// --- Asentar -------------------------------------------------------------

phase('Asentar')

const escritos = await agent(
  [
    `Escribe estos hallazgos del paso "${paso}". Ya pasaron por el auditor y el experto cerro sus preguntas.`,
    '',
    'Uno por archivo, en `roadmap/`, con la forma de tu carta.',
    '',
    JSON.stringify(afinado.hallazgos, null, 2)
  ].join('\n'),
  { label: `asentar:${paso}`, phase: 'Asentar', agentType: 'consultor:escribano', schema: ESCRITOS }
)

if (!escritos) {
  log('El escribano no reporto. No se puede auditar lo que no se sabe si existe.')
  return { estado: 'sin-registro', paso, hallazgos: afinado.hallazgos }
}

// --- Auditar -------------------------------------------------------------
// Otro auditor, contexto limpio: no vio afinar y no sabe que se escribio hasta
// que lee el crudo. Si leyera lo escrito primero, confirmaria en vez de medir.

phase('Auditar')

const dictamen = await agent(
  [
    'Carga tu carta `auditar` antes de abrir nada.',
    '',
    'El orden no se invierte: primero el registro crudo, despues los archivos.',
    transcript ? `El transcript de la sesion esta en: ${transcript}` : 'No te dieron la ruta del transcript: toma el .jsonl mas reciente de la carpeta del proyecto y declara cual usaste.',
    '',
    `Se acaba de escribir el paso "${paso}" en \`roadmap/\`. Dictamina lo inventado, lo perdido y lo mal marcado.`
  ].join('\n'),
  { label: `auditar:${paso}`, phase: 'Auditar', agentType: 'consultor:auditor', schema: DICTAMEN }
)

const fallas = dictamen
  ? dictamen.inventado.length + dictamen.perdido.length + dictamen.malMarcado.length
  : null

if (fallas === null) log('El auditor no dictamino. Lo escrito queda sin medir.')
else if (fallas === 0) log(`Paso "${paso}": ${escritos.archivos.length} hallazgo(s) escrito(s), sin fallas.`)
else log(`Paso "${paso}": ${escritos.archivos.length} escrito(s), ${fallas} falla(s) que el consultor tiene que atender.`)

return {
  estado: 'listo',
  paso,
  archivos: escritos.archivos,
  noEscritos: escritos.noEscritos,
  dictamen
}
