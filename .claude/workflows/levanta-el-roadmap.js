export const meta = {
  name: 'levanta-el-roadmap',
  description: 'Muele lo platicado en un paso de la sesion, lo deja escrito como hallazgos y lo audita contra el registro crudo.',
  whenToUse: 'Al cerrar un paso del mapa, o cuando el experto lo pida. Para la linea si quedan preguntas por cerrar; se vuelve a correr con las respuestas.',
  phases: [
    { title: 'Afinar', detail: 'sacar los hallazgos y cazar lo que no se puede escribir todavia' },
    { title: 'Leer en frio', detail: 'leer los hallazgos como el que no estuvo, antes de que lleguen a disco' },
    { title: 'Asentar', detail: 'un archivo por hallazgo' },
    { title: 'Auditar', detail: 'leer el crudo y dictaminar' }
  ]
}

// Lo que recibe:
//   args.paso      - como se llama el paso del mapa que se cerro
//   args.platica   - el texto de lo que se hablo en ese paso
//   args.respuestas - opcional. Lo que el experto contesto a las preguntas de una corrida anterior
//   args.transcript - opcional. Ruta del .jsonl de la sesion
//   args.hora      - la hora real del alta, ISO 8601 con huso. Al escribano se le pasa, nunca la inventa.

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
          deDondeSalio: {
            type: 'string',
            description:
              'El caso CONTADO, no su apodo: que paso, con que se toparon, que se decidio. ' +
              'Quien no estuvo en la sesion tiene que entenderlo sin preguntarle a nadie. ' +
              'Un apodo -«el pleito de la tercera falla», «la pregunta 2», «el caso del molino ' +
              'trabado»- es referencia sin cerrar y no vale. No lo recortes para que quepa: si no ' +
              'cabe en el item, el escribano lo manda al documento y le pone puntero.'
          },
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
    porque: { type: 'string', description: 'Si `sirve` es false, cada renglon que no se entiende sin haber estado, con su archivo.' },
    transcriptLeido: { type: 'string', description: 'Que archivo se leyo. Si no se pudo, decirlo aqui.' }
  }
}

// El lector en frio no compara nada: solo tiene los items. Por eso su hallazgo nombra el
// renglon y la forma de fallar, y NO lleva un campo para «que agregar» - el que dice que
// falta no es quien decide con que se llena, y ademas no tiene el material para hacerlo.
// Un esquema que le abriera ese campo lo convertiria en el agente que engorda cada item.
const LECTURA_EN_FRIO = {
  type: 'object',
  required: ['huecos', 'itemsLeidos'],
  properties: {
    huecos: {
      type: 'array',
      description: 'Solo los items que NO se entienden solos. Los que si se entienden no se listan.',
      items: {
        type: 'object',
        required: ['indice', 'renglon', 'forma'],
        properties: {
          indice: { type: 'number', description: 'La posicion del hallazgo en el arreglo que se le mando, empezando en 0. No hay archivo: esto corre antes de que se escriba nada.' },
          renglon: { type: 'string', description: 'El renglon exacto que no se entiende, copiado.' },
          forma: {
            type: 'string',
            enum: ['apodo-de-caso', 'puntero-a-la-nada', 'procedencia-de-relleno', 'palabra-sin-definir']
          }
        }
      }
    },
    itemsLeidos: { type: 'number', description: 'Cuantos items se leyeron en total.' }
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

// El escribano lee `alta` (y `confirmado`, si la firmeza lo pide) del propio objeto del
// hallazgo, no de una linea suelta en el prompt - medido en corrida real: una hora en
// prosa se queda en el aire y cada hallazgo sigue sin el campo que la plantilla exige.
// Por eso la hora se estampa aqui, en el dato, antes de que nadie escriba nada.
function conLaHoraEstampada(hallazgo, hora) {
  if (!hora) return hallazgo
  const conAlta = { ...hallazgo, alta: hora }
  return conAlta.firmeza === 'confirmado' ? { ...conAlta, confirmado: hora } : conAlta
}

const entrada = comoDatos(args)

const paso = entrada.paso ?? 'sin nombre'
const platica = typeof entrada.platica === 'string' ? entrada.platica : ''
const respuestas = entrada.respuestas
const transcript = entrada.transcript
const hora = typeof entrada.hora === 'string' && entrada.hora.trim() ? entrada.hora : undefined

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
  { label: `afinar:${paso}`, phase: 'Afinar', agentType: 'auditor-del-roadmap', schema: HALLAZGOS }
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
      // La procedencia que escribe el codigo se mide con la misma vara que la del agente:
      // tiene que entenderse sin haber estado. Por eso nombra el paso y repite la pregunta
      // completa, en vez de apoyarse en que quien lea ya sepa de que ronda se habla.
      deDondeSalio:
        `Se le pregunto al experto en el paso "${paso}" y siguio sin cerrarse despues de las dos ` +
        `rondas que permite el molino. La pregunta que se le hizo fue: «${p.pregunta}». ` +
        `El material fallaba por ${p.falla}.`,
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

// --- Leer en frio ----------------------------------------------------------
// El tercer auditor, y el unico que no ve el crudo ni la sesion: solo los hallazgos que
// acaba de sacar Afinar, antes de que nadie los escriba. El auditor de mas abajo ya sabe lo
// que paso porque lee el crudo - no puede sentir el hueco, lo tapo el mismo al leer. Este
// llega como llega quien abra el item dentro de seis meses, y por eso corre ANTES de
// Asentar: lo que marca nunca llega a tocar disco sin pasar primero por una vuelta de
// arreglo. Ni transcript, ni platica, ni el nombre del paso - solo los hallazgos.

phase('Leer en frio')

function hallazgosParaElLector(hallazgos) {
  return hallazgos.map((h, indice) => ({ indice, regla: h.regla, deDondeSalio: h.deDondeSalio, firmeza: h.firmeza }))
}

function promptParaElLector(hallazgos) {
  return [
    'Carga tu carta `leer-en-frio` antes de leer nada.',
    '',
    'Lee estos hallazgos y nada mas. No sabes de que paso salieron, no hay transcript que',
    'abrir y no hay platica que consultar: en cuanto te enteres de lo que paso, dejas de',
    'servir para esto.',
    '',
    JSON.stringify(hallazgosParaElLector(hallazgos), null, 2)
  ].join('\n')
}

let hallazgosFinales = afinado.hallazgos

let primeraLectura = await agent(promptParaElLector(hallazgosFinales), {
  label: 'leer-en-frio:primera',
  phase: 'Leer en frio',
  agentType: 'auditor-del-roadmap',
  schema: LECTURA_EN_FRIO
})

let segundaLectura = null

// Una vuelta y ya. El tope lo impone el codigo, no el agente: sin tope, cada revision
// encuentra algo mas y no se escribe nunca - la misma regla que RM-0009 fija para las
// preguntas al experto, aplicada aqui a la vuelta interna con Afinar.
if (primeraLectura && primeraLectura.huecos.length > 0) {
  log(`${primeraLectura.huecos.length} hallazgo(s) no se entienden solos: una vuelta a Afinar para que los cuente completos.`)

  const huecos = primeraLectura.huecos

  phase('Afinar')

  const arreglo = await agent(
    [
      'Carga tu carta `afinar` antes de escribir nada.',
      '',
      `Estos hallazgos del paso "${paso}" ya los sacaste, pero el lector en frio no los`,
      'entiende solos: marco el renglon exacto y la forma en que falla. Cuenta el caso',
      'completo con la platica que ya tienes abajo. **Esta vuelta es interna: no se le',
      'pregunta nada al experto.**',
      '',
      '--- La platica ---',
      platica,
      '',
      'Reescribe, uno por uno y en el mismo orden, el hallazgo completo que corresponde a',
      'cada renglon marcado. `preguntas` va vacio.',
      '',
      JSON.stringify(
        huecos.map((h) => ({
          hallazgoOriginal: hallazgosFinales[h.indice],
          renglonQueNoSeEntendio: h.renglon,
          forma: h.forma
        })),
        null,
        2
      )
    ].join('\n'),
    { label: `afinar:arreglo:${paso}`, phase: 'Afinar', agentType: 'auditor-del-roadmap', schema: HALLAZGOS }
  )

  if (arreglo && Array.isArray(arreglo.hallazgos)) {
    hallazgosFinales = hallazgosFinales.map((h, indice) => {
      const posicion = huecos.findIndex((hueco) => hueco.indice === indice)
      return posicion === -1 ? h : (arreglo.hallazgos[posicion] ?? h)
    })
  }

  phase('Leer en frio')

  segundaLectura = await agent(promptParaElLector(hallazgosFinales), {
    label: 'leer-en-frio:segunda',
    phase: 'Leer en frio',
    agentType: 'auditor-del-roadmap',
    schema: LECTURA_EN_FRIO
  })
}

// Lo que siga flaco tras la vuelta se escribe igual mas abajo: perder lo que dijo el
// experto es peor que tenerlo mal redactado. Esta es la ultima lectura que corrio, y es la
// que cuenta para el dictamen final.
const enFrio = segundaLectura ?? primeraLectura

// --- Asentar -------------------------------------------------------------

phase('Asentar')

const hallazgosParaEscribano = hallazgosFinales.map((h) => conLaHoraEstampada(h, hora))

const escritos = await agent(
  [
    `Escribe estos hallazgos del paso "${paso}". Ya pasaron por el auditor y el experto cerro sus preguntas.`,
    '',
    'Antes de escribir nada, lee `roadmap/0000-plantilla.md`: la forma la manda esa plantilla, no tu carta.',
    'Uno por archivo, en `roadmap/`. La regla no pasa de 120 caracteres y el cuerpo no pasa de 900.',
    '',
    '`deDondeSalio` te llega con el caso contado entero. **No lo recortes y no lo apodes.**',
    'Si no cabe en los 900, ese es justo el momento del puntero: escribes el detalle en',
    '`roadmap/documentos/` con su plantilla, y en el item pones la ruta en `puntero`.',
    'El tope no es permiso para resumir: es la senal de que el desahogo va al documento.',
    hora
      ? 'Cada hallazgo ya trae su `alta` (y su `confirmado` si la firmeza lo pide) estampados abajo.'
      : 'No llego la hora del alta: ningun hallazgo trae `alta`. No la inventes - repórtalo como no escrito.',
    '',
    JSON.stringify(hallazgosParaEscribano, null, 2)
  ].join('\n'),
  { label: `asentar:${paso}`, phase: 'Asentar', agentType: 'escribano-del-roadmap', schema: ESCRITOS }
)

if (!escritos) {
  log('El escribano no reporto. No se puede auditar lo que no se sabe si existe.')
  return { estado: 'sin-registro', paso, hallazgos: hallazgosFinales }
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
  { label: `auditar:${paso}`, phase: 'Auditar', agentType: 'auditor-del-roadmap', schema: DICTAMEN }
)

// El «no sirve» es la cuarta falla y cuenta como las otras tres. Medido el 2026-07-31: el
// auditor ya contestaba la pregunta del final -si le alcanza a alguien que no estuvo- y la
// suma la ignoraba, asi que un dictamen «no sirve» salia impreso como «sin fallas» y el
// estado como «listo». Diecisiete de cincuenta y nueve items quedaron con la procedencia
// apodada y nadie se entero. Una medicion que no cuenta es una medicion que no se hizo.
//
// Los dos caminos llegan a la misma falla desde lados opuestos: el auditor con el crudo
// enfrente, el lector en frio sin nada. Basta uno para pararla — el de enfrente cacha lo
// que se perdio, el de a ciegas cacha lo que solo se entiende habiendo estado.
const huecos = enFrio ? enFrio.huecos.length : 0
const noSirve = (dictamen ? dictamen.sirve === false : false) || huecos > 0

// Los dos auditores se cuentan por separado: si uno de los dos no contesto, lo que el otro
// si midio no se puede perder. Sumar en un solo numero que se vuelve null cuando falta el
// dictamen dejaria pasar en silencio los huecos del lector en frio.
const fallasDelCrudo = dictamen
  ? dictamen.inventado.length + dictamen.perdido.length + dictamen.malMarcado.length
  : null

const fallas = (fallasDelCrudo ?? 0) + (noSirve ? 1 : 0)

if (fallasDelCrudo === null) log('El auditor no dictamino. Lo escrito queda sin medir contra el crudo.')
if (!enFrio) log('El lector en frio no contesto. Nadie leyo los items como el que no estuvo.')

if (fallas === 0 && fallasDelCrudo !== null && enFrio) {
  log(`Paso "${paso}": ${escritos.archivos.length} hallazgo(s) escrito(s), sin fallas.`)
} else if (fallas > 0) {
  log(`Paso "${paso}": ${escritos.archivos.length} escrito(s), ${fallas} falla(s) que el consultor tiene que atender.`)
}

// El porque puede venir de cualquiera de los dos, o de los dos. Se dicen los que haya:
// un «no sirve» sin el renglon señalado no se puede arreglar.
if (noSirve) {
  if (huecos > 0) {
    log(`No le alcanza a quien no estuvo: ${huecos} de ${enFrio.itemsLeidos} item(s) no se entienden solos, incluso despues de la vuelta de arreglo.`)
    for (const h of enFrio.huecos) {
      const ruta = escritos.archivos[h.indice]?.ruta ?? `hallazgo ${h.indice}`
      log(`  ${ruta} — ${h.forma}: «${h.renglon}»`)
    }
  }
  if (dictamen?.sirve === false) log(`El auditor del crudo coincide: ${dictamen.porque}`)
}

return {
  // Escrito no es lo mismo que listo. Si al que no estuvo no le alcanza, el paso no cerro.
  estado: noSirve ? 'no-sirve' : 'listo',
  paso,
  archivos: escritos.archivos,
  noEscritos: escritos.noEscritos,
  dictamen,
  enFrio
}
