export const meta = {
  name: 'levanta-el-roadmap',
  description: 'Muele lo platicado en un paso de la sesion, lo deja escrito como hallazgos y lo audita contra el registro crudo.',
  whenToUse: 'Al cerrar un paso del mapa, o cuando el experto lo pida. Para la linea si quedan preguntas por cerrar; se vuelve a correr con las respuestas.',
  phases: [
    { title: 'Sacar', detail: 'leer la grabacion de la sesion y sacar la platica limpia con el sacador' },
    { title: 'Afinar', detail: 'sacar los hallazgos y cazar lo que no se puede escribir todavia' },
    { title: 'Leer en frio', detail: 'leer los hallazgos como el que no estuvo, antes de que lleguen a disco' },
    { title: 'Cotejar', detail: 'cotejar cada hallazgo contra la platica que lo produjo, antes de que lleguen a disco' },
    { title: 'Juntar', detail: 'senalar los hallazgos que son un mismo problema, antes de que lleguen a disco' },
    { title: 'Asentar', detail: 'un archivo por hallazgo' },
    { title: 'Auditar', detail: 'leer el crudo y dictaminar' }
  ]
}

// Lo que recibe:
//   args.paso       - como se llama el paso del mapa que se cerro
//   args.transcript - opcional. Ruta del .jsonl de la sesion. De ahi se saca la platica -con
//                      el sacador que ya existe en src/nucleo/sacar-turnos.ts- y contra ese
//                      mismo archivo se audita despues. Si no llega, «Sacar» resuelve la
//                      grabacion de la sesion en curso; el molino no la adivina por su cuenta,
//                      no tiene `process` ni `fs` para hacerlo.
//   args.respuestas - opcional. Lo que el experto contesto a las preguntas de una corrida anterior
//   args.hora      - la hora real del alta, ISO 8601 con huso. Al escribano se le pasa, nunca la inventa.
//
// Ya NO recibe `args.platica`. Antes, quien llamaba tecleaba el texto de la platica dentro de
// la llamada, y esa mano acababa siendo el filtro -medido en corrida real: una version
// recortada de la conversacion se colo como argumento y el auditor marco «perdido» material
// que nunca llego a entrar. Ahora el molino lee la grabacion el mismo, con el sacador.

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

// «Sacar» no juzga nada: lee la grabacion y corre el sacador que ya existe. Por eso su
// esquema no trae `sospechas` ni `porque` en el sentido de los otros dos auditores - solo
// lo que saco y de donde, y `noSePudo` cuando no hubo manera de sacar nada. Reusa el nombre
// `transcriptLeido` que ya usa DICTAMEN mas abajo: es el mismo archivo, y quien lo audita al
// final usa esta misma ruta, no una que adivine por su cuenta.
const SACADO = {
  type: 'object',
  required: ['platica', 'transcriptLeido'],
  properties: {
    platica: {
      type: 'string',
      description:
        'La salida de `platicaComoTexto(sacarTurnos(crudo))`, tal cual la imprimio el comando. ' +
        'Vacia si no se pudo leer el archivo o correr el sacador -nunca un resumen ni un invento.'
    },
    transcriptLeido: {
      type: 'string',
      description: 'La ruta del `.jsonl` que se leyo. Vacia si no se pudo determinar ni leer.'
    },
    noSePudo: {
      type: 'string',
      description: 'Por que no se pudo leer el archivo o correr el sacador. Vacio si si se pudo.'
    }
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

// El cotejador SI ve la platica -a diferencia del lector en frio-, pero igual que el, no
// decide con que se llena un hueco: solo nombra la frase que la platica no dijo. Por eso su
// esquema tampoco trae un campo para «que poner en su lugar». Un invento no es solo la
// mentira grande: un numero que nadie dijo, un motivo que nadie dio, una glosa razonable que
// nadie sostuvo, tambien lo son.
const COTEJO = {
  type: 'object',
  required: ['inventos', 'hallazgosCotejados'],
  properties: {
    inventos: {
      type: 'array',
      description: 'Solo los hallazgos que traen algo que la platica NO dijo. Los que si estan dichos no se listan.',
      items: {
        type: 'object',
        required: ['indice', 'frase'],
        properties: {
          indice: { type: 'number', description: 'La posicion del hallazgo en el arreglo que se le mando, empezando en 0.' },
          frase: { type: 'string', description: 'La frase inventada, copiada tal cual del hallazgo.' }
        }
      }
    },
    hallazgosCotejados: { type: 'number', description: 'Cuantos hallazgos se cotejaron en total.' }
  }
}

// Quien junta tampoco ve la platica ni el nombre del paso -igual que el lector en frio-, porque
// la pregunta se contesta con los hallazgos solos: «alguien podria atender esto sin atender
// aquello?» es la misma pregunta que ya fija `afinar`. Por eso su esquema tampoco trae un campo
// para «como quedaria el renglon junto»: quien junta senala el grupo, Afinar -que si tiene la
// platica- es quien redacta.
const JUNTAR = {
  type: 'object',
  required: ['grupos', 'hallazgosRevisados'],
  properties: {
    grupos: {
      type: 'array',
      description: 'Solo los grupos de hallazgos que son un mismo problema. Lo que ya esta bien repartido no se lista.',
      items: {
        type: 'object',
        required: ['indices', 'porque'],
        properties: {
          indices: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            description: 'Las posiciones de los hallazgos que son uno solo, en el arreglo que se le mando, empezando en 0.'
          },
          porque: {
            type: 'string',
            description: 'Por que son el mismo problema, en una linea. No dice como quedaria el renglon junto.'
          }
        }
      }
    },
    hallazgosRevisados: { type: 'number', description: 'Cuantos hallazgos se revisaron en total.' }
  }
}

// Quien llama puede mandar los argumentos como datos o como texto JSON - las dos formas
// se han visto en corrida real. Aqui se aclara la entrada una sola vez, antes de que nadie
// la use. Un texto que no es JSON valido ya no tiene donde caer -no hay `platica` que
// rescatar-, asi que se trata como entrada vacia: sin `paso` ni `transcript`, «Sacar» lo va
// a reportar como material que no se pudo determinar, en vez de perderlo en silencio.
function comoDatos(entrada) {
  if (typeof entrada === 'string') {
    try {
      return JSON.parse(entrada)
    } catch (e) {
      return {}
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
const respuestas = entrada.respuestas
const rutaTranscriptPedida = typeof entrada.transcript === 'string' && entrada.transcript.trim() ? entrada.transcript : undefined
const hora = typeof entrada.hora === 'string' && entrada.hora.trim() ? entrada.hora : undefined

// --- Sacar -----------------------------------------------------------------
// El unico paso que corre antes que Afinar y no mide nada: lee la grabacion cruda y saca la
// platica limpia con el sacador que ya existe (`sacarTurnos` / `platicaComoTexto` en
// `src/nucleo/sacar-turnos.ts`) - no se reescribe esa logica aqui ni se le pide al agente que
// la invente. Va al agente y no al propio script porque el script no tiene `fs` ni `process`
// para abrir un archivo o correr un comando; el agente si, con `Bash` y `Read`.
//
// Si no llega `args.transcript`, el propio agente resuelve la grabacion de esta sesion: la
// variable de entorno `CLAUDE_CODE_SESSION_ID` trae el id de la sesion en curso, y ese mismo
// id nombra su `.jsonl` dentro de `~/.claude/projects/`. Medido en esta maquina: el id de la
// variable coincide exactamente con el nombre del archivo de la sesion que lo consulta. Lo
// que no se mide desde aqui es que un agente disparado dentro de un workflow -no una sesion
// de equipo- herede la misma variable; por eso, si no la encuentra o no hay archivo con ese
// nombre, el agente lo reporta en `noSePudo` en vez de adivinar una ruta.

phase('Sacar')

function promptParaSacar(rutaPedida) {
  return [
    'Tu tarea aqui es mecanica, no de juicio: no cargues ninguna de tus cartas para esto.',
    '',
    rutaPedida
      ? `Lee con tu herramienta Read el archivo \`${rutaPedida}\`: es la grabacion de la sesion.`
      : [
          'No te dieron la ruta de la grabacion. Para encontrar la de esta misma sesion:',
          '',
          '1. Con Bash, corre `echo $CLAUDE_CODE_SESSION_ID` para sacar el id de esta sesion.',
          '2. Busca un archivo `<ese-id>.jsonl` dentro de `~/.claude/projects/` -con Bash o con Glob-.',
          '3. Lee ese archivo.',
          '',
          '**No inventes una ruta.** Si la variable no esta, o no hay archivo con ese nombre, no',
          'sigas: reportalo en `noSePudo` y deja `platica` y `transcriptLeido` vacios.'
        ].join('\n'),
    '',
    'Con el contenido crudo del `.jsonl` ya leido, saca la platica limpia corriendo -con Bash,',
    'desde la raiz del repositorio- el sacador que ya existe. No escribas tu propio extractor',
    'ni repitas su logica a mano; corre exactamente esto, sustituyendo la ruta del archivo que',
    'leiste, y borra el script temporal al terminar:',
    '',
    '```',
    "cat > ./_sacar_platica_tmp.mts << 'SACADOR_EOF'",
    "import { readFileSync } from 'node:fs'",
    "import { sacarTurnos, platicaComoTexto } from './src/nucleo/sacar-turnos.ts'",
    "const crudo = readFileSync(process.argv[2], 'utf8')",
    'console.log(platicaComoTexto(sacarTurnos(crudo)))',
    'SACADOR_EOF',
    'npx tsx ./_sacar_platica_tmp.mts "<la ruta del .jsonl que leiste>"',
    'rm ./_sacar_platica_tmp.mts',
    '```',
    '',
    'Regresa la salida de ese comando tal cual en `platica`, y la ruta del `.jsonl` que usaste',
    'en `transcriptLeido`. Si no pudiste leer el archivo o correr el comando, `platica` y',
    '`transcriptLeido` van vacios y `noSePudo` dice por que -no inventes contenido ni ruta.'
  ].join('\n')
}

const sacado = await agent(promptParaSacar(rutaTranscriptPedida), {
  label: `sacar:${paso}`,
  phase: 'Sacar',
  agentType: 'auditor-del-roadmap',
  schema: SACADO
})

if (!sacado) {
  log('El sacador no contesto. No hay material que afinar.')
  return { estado: 'sin-medicion', paso }
}

const platica = typeof sacado.platica === 'string' ? sacado.platica : ''
// El transcript contra el que se audita al final es este, el que «Sacar» de verdad resolvio y
// leyo -no el que se pidio-, para que los dos pasos que necesitan el archivo usen siempre el
// mismo. Si «Sacar» no lo reporto, el transcript pedido sirve de respaldo.
const transcript =
  typeof sacado.transcriptLeido === 'string' && sacado.transcriptLeido.trim() ? sacado.transcriptLeido : rutaTranscriptPedida

// Las dos son turno del experto y las dos valen igual como respaldo: lo que el cotejador
// mide contra "lo que se dijo" tiene que incluir la ronda de respuestas, no solo la platica
// inicial. Sin esto, todo hallazgo que salio de las respuestas le parece inventado al
// cotejador -no esta en lo unico que el ve- y la vuelta de arreglo lo borra.
const loQueDijoElExperto = respuestas
  ? platica + '\n\n--- Lo que el experto contesto despues ---\n' + respuestas
  : platica

if (!platica.trim()) {
  log(`No se pudo sacar la platica: ${sacado.noSePudo || 'el sacador la devolvio vacia sin decir por que'}.`)
  return { estado: 'sin-material', paso, motivo: sacado.noSePudo || 'la platica llego vacia o no llego' }
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

// --- Leer en frio, Cotejar y Juntar -----------------------------------------
// Tres auditores mas, y los unicos que corren antes de que nadie escriba nada. Miden cosas
// distintas y por eso no se funden en uno: el lector en frio no ve el crudo ni la platica -
// solo los hallazgos que acaba de sacar Afinar, para sentir el hueco que el que ya leyo la
// sesion no puede sentir. El cotejador si ve la platica, y busca en ella lo que cada
// hallazgo afirma: lo que no este dicho ahi, es un invento, por sensato que suene. Quien
// junta tampoco ve la platica -igual que el lector en frio-, y mide otra cosa: si dos o mas
// hallazgos, aunque cada uno se entienda y este dicho, son el mismo problema contado dos veces.
//
// Los tres corren ANTES de Asentar: lo que cualquiera marca nunca llega a tocar disco sin
// pasar primero por una vuelta de arreglo.
//
// La primera vuelta es UNA sola, compartida entre los tres - RM-0009 prohibe una linea que
// nunca cierra. Pero arreglar un hueco es escribir mas (y siempre se puede escribir mas: una
// vuelta es el tope sano), y juntar un grupo es fundir dos renglones en uno, mientras que
// arreglar un invento es QUITAR una frase, y quitar converge. Por eso el cotejo, y solo el
// cotejo, tiene una segunda vuelta - el riesgo real de esa segunda vuelta es que quien repara
// invente algo nuevo al reescribir (incluido al fundir un grupo), y esa vuelta caza justo eso.
// Juntar no dispara su propia segunda vuelta: lo que siga picado tras la vuelta 1 se acepta y
// se reporta, igual que un hueco que sobrevive. Dos es tope duro, lo impone el codigo y no el
// agente, igual que el tope de preguntas al experto de mas arriba. Nunca hay una tercera.

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

function promptParaElCotejador(hallazgos, loQueDijoElExperto) {
  return [
    'Carga tu carta `cotejar` antes de leer nada.',
    '',
    'Coteja estos hallazgos contra todo lo que dijo el experto. Por cada uno, busca en ese',
    'material lo que el hallazgo afirma: lo que no este dicho ahi, nombralo como invento -no',
    'importa que suene razonable. No corrijas, no reescribas y no propongas que poner: solo',
    'senala la frase.',
    '',
    '--- Lo que dijo el experto ---',
    loQueDijoElExperto,
    '',
    '--- Los hallazgos ---',
    JSON.stringify(hallazgosParaElLector(hallazgos), null, 2)
  ].join('\n')
}

function promptParaJuntar(hallazgos) {
  return [
    'Carga tu carta `juntar` antes de leer nada.',
    '',
    'Revisa estos hallazgos y nada mas. No sabes de que paso salieron, no hay transcript que',
    'abrir y no hay platica que consultar: la pregunta se contesta con los hallazgos solos.',
    'Senala solo los grupos que son un mismo problema -«¿alguien podria atender esto sin',
    'atender aquello?»-, y no digas como quedaria el renglon junto.',
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

phase('Cotejar')

let primerCotejo = await agent(promptParaElCotejador(hallazgosFinales, loQueDijoElExperto), {
  label: 'cotejar:primera',
  phase: 'Cotejar',
  agentType: 'auditor-del-roadmap',
  schema: COTEJO
})

phase('Juntar')

let primerJuntar = await agent(promptParaJuntar(hallazgosFinales), {
  label: 'juntar:primera',
  phase: 'Juntar',
  agentType: 'auditor-del-roadmap',
  schema: JUNTAR
})

let segundaLectura = null
let segundoCotejo = null
let segundoJuntar = null

const huecosIniciales = primeraLectura ? primeraLectura.huecos : []
const inventosIniciales = primerCotejo ? primerCotejo.inventos : []
const gruposIniciales = primerJuntar ? primerJuntar.grupos : []

// Una vuelta y ya. El tope lo impone el codigo, no el agente: sin tope, cada revision
// encuentra algo mas y no se escribe nunca - la misma regla que RM-0009 fija para las
// preguntas al experto, aplicada aqui a la vuelta interna con Afinar. Las tres revisiones
// comparten esta unica vuelta: si cualquiera de las tres marco algo, el encargo a Afinar
// trae los tres tipos juntos, no uno despues del otro.
if (huecosIniciales.length > 0 || inventosIniciales.length > 0 || gruposIniciales.length > 0) {
  log(
    `${huecosIniciales.length} hallazgo(s) no se entienden solos, ${inventosIniciales.length} traen algo inventado ` +
      `y ${gruposIniciales.length} grupo(s) son el mismo problema contado dos veces: ` +
      'una vuelta a Afinar para que los cuente completos.'
  )

  const indicesMarcados = Array.from(
    new Set([
      ...huecosIniciales.map((h) => h.indice),
      ...inventosIniciales.map((i) => i.indice),
      ...gruposIniciales.flatMap((g) => g.indices)
    ])
  ).sort((a, b) => a - b)

  phase('Afinar')

  const arreglo = await agent(
    [
      'Carga tu carta `afinar` antes de escribir nada.',
      '',
      `Estos hallazgos del paso "${paso}" ya los sacaste, pero tres revisiones marcaron`,
      'problemas antes de escribir nada: el lector en frio dice que no se entienden solos, el',
      'cotejador encontro frases que no estan dichas, y quien junta senalo grupos de',
      'hallazgos que son un mismo problema contado dos veces -«¿alguien podria atender esto',
      'sin atender aquello?» contesto que no. Arregla los tres tipos de una vez con lo que',
      'dijo el experto, que ya tienes abajo: donde haya un grupo, escribe el hallazgo unico',
      'que junta lo que corresponde. **Esta vuelta es interna: no se le pregunta nada al',
      'experto.**',
      '',
      '--- Lo que dijo el experto ---',
      loQueDijoElExperto,
      '',
      'Reescribe, uno por uno y en el mismo orden, el hallazgo completo que corresponde a',
      'cada renglon marcado. `preguntas` va vacio.',
      '',
      JSON.stringify(
        indicesMarcados.map((indice) => ({
          hallazgoOriginal: hallazgosFinales[indice],
          huecoMarcado: huecosIniciales.find((h) => h.indice === indice) ?? null,
          inventoMarcado: inventosIniciales.find((i) => i.indice === indice) ?? null,
          grupoMarcado: gruposIniciales.find((g) => g.indices.includes(indice)) ?? null
        })),
        null,
        2
      )
    ].join('\n'),
    { label: `afinar:arreglo:${paso}`, phase: 'Afinar', agentType: 'auditor-del-roadmap', schema: HALLAZGOS }
  )

  if (arreglo && Array.isArray(arreglo.hallazgos)) {
    hallazgosFinales = hallazgosFinales.map((h, indice) => {
      const posicion = indicesMarcados.indexOf(indice)
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

  phase('Cotejar')

  segundoCotejo = await agent(promptParaElCotejador(hallazgosFinales, loQueDijoElExperto), {
    label: 'cotejar:segunda',
    phase: 'Cotejar',
    agentType: 'auditor-del-roadmap',
    schema: COTEJO
  })

  phase('Juntar')

  // Corre otra vez para medir si el grupo quedo bien fundido - pero, a diferencia del cotejo,
  // lo que siga marcando aqui NUNCA dispara la vuelta 2: esa vuelta es solo de inventos, porque
  // reescribir un grupo puede inventar y ahi el cotejo tiene la ultima palabra, no quien junta.
  segundoJuntar = await agent(promptParaJuntar(hallazgosFinales), {
    label: 'juntar:segunda',
    phase: 'Juntar',
    agentType: 'auditor-del-roadmap',
    schema: JUNTAR
  })
}

let tercerCotejo = null

// La segunda vuelta: solo si el cotejo, ya despues de la primera vuelta, sigue marcando algo.
// El hueco no la dispara por si solo -no es lo que esta vuelta caza- y su encargo trae SOLO
// los inventos: lo que el lector en frio haya marcado en este punto ya no se manda, se acepta
// como esta.
const inventosTrasRonda1 = segundoCotejo ? segundoCotejo.inventos : []

if (inventosTrasRonda1.length > 0) {
  log(`${inventosTrasRonda1.length} invento(s) siguen despues de la primera vuelta: segunda y ultima vuelta, solo con los inventos.`)

  phase('Afinar')

  const arreglo2 = await agent(
    [
      'Carga tu carta `afinar` antes de escribir nada.',
      '',
      `Estos hallazgos del paso "${paso}" ya pasaron por una vuelta de arreglo, pero el`,
      'cotejador sigue encontrando frases que no estan dichas. **Esta es la segunda y',
      'ultima vuelta, y trae SOLO los inventos** - lo que haya marcado el lector en frio en',
      'este punto no se manda aqui, ya se acepto como esta. Quita la frase inventada con lo',
      'que dijo el experto, que ya tienes abajo. **Esta vuelta es interna: no se le pregunta',
      'nada al experto.**',
      '',
      '--- Lo que dijo el experto ---',
      loQueDijoElExperto,
      '',
      'Reescribe, uno por uno y en el mismo orden, el hallazgo completo que corresponde a',
      'cada invento marcado. `preguntas` va vacio.',
      '',
      JSON.stringify(
        inventosTrasRonda1.map((i) => ({
          hallazgoOriginal: hallazgosFinales[i.indice],
          inventoMarcado: i
        })),
        null,
        2
      )
    ].join('\n'),
    { label: `afinar:arreglo-inventos:${paso}`, phase: 'Afinar', agentType: 'auditor-del-roadmap', schema: HALLAZGOS }
  )

  if (arreglo2 && Array.isArray(arreglo2.hallazgos)) {
    hallazgosFinales = hallazgosFinales.map((h, indice) => {
      const posicion = inventosTrasRonda1.findIndex((i) => i.indice === indice)
      return posicion === -1 ? h : (arreglo2.hallazgos[posicion] ?? h)
    })
  }

  phase('Cotejar')

  tercerCotejo = await agent(promptParaElCotejador(hallazgosFinales, loQueDijoElExperto), {
    label: 'cotejar:tercera',
    phase: 'Cotejar',
    agentType: 'auditor-del-roadmap',
    schema: COTEJO
  })
}

// Lo que siga flaco, inventado o picado tras las vueltas se escribe igual mas abajo: perder lo
// que dijo el experto es peor que tenerlo mal redactado, y es peor todavia dejar un invento sin
// avisar o una lista partida sin marcar. `enFrio` es la ultima lectura que corrio -nunca hay
// segunda vuelta para ella-, `cotejo` es el ultimo cotejo que corrio, que puede ser el de la
// segunda vuelta, y `juntado` es la ultima medicion de quien junta -tampoco tiene segunda vuelta
// propia, corre a lo mas dos veces, dentro de la vuelta 1.
const enFrio = segundaLectura ?? primeraLectura
const cotejo = tercerCotejo ?? segundoCotejo ?? primerCotejo
const juntado = segundoJuntar ?? primerJuntar

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
// Los cuatro caminos llegan a la misma falla desde lados distintos: el auditor con el crudo
// enfrente, el lector en frio sin nada, el cotejador con la platica, y quien junta con los
// hallazgos solos. Basta uno para pararla — el de enfrente cacha lo que se perdio, el de a
// ciegas cacha lo que solo se entiende habiendo estado, el cotejador cacha lo que nadie dijo,
// y quien junta cacha lo que se pudo decir en un solo renglon y se dijo en dos.
const huecos = enFrio ? enFrio.huecos.length : 0
const inventos = cotejo ? cotejo.inventos.length : 0
const grupos = juntado ? juntado.grupos.length : 0
const noSirve = (dictamen ? dictamen.sirve === false : false) || huecos > 0 || inventos > 0 || grupos > 0

// Los cuatro auditores se cuentan por separado: si uno no contesto, lo que los otros si
// midieron no se puede perder. Sumar en un solo numero que se vuelve null cuando falta el
// dictamen dejaria pasar en silencio lo que si midieron el lector en frio, el cotejador y
// quien junta.
const fallasDelCrudo = dictamen
  ? dictamen.inventado.length + dictamen.perdido.length + dictamen.malMarcado.length
  : null

const fallas = (fallasDelCrudo ?? 0) + (noSirve ? 1 : 0)

if (fallasDelCrudo === null) log('El auditor no dictamino. Lo escrito queda sin medir contra el crudo.')
if (!enFrio) log('El lector en frio no contesto. Nadie leyo los items como el que no estuvo.')
if (!cotejo) log('El cotejador no contesto. Nadie coteja los hallazgos contra la platica.')
if (!juntado) log('Quien junta no contesto. Nadie midio si los hallazgos escritos eran el mismo problema.')

if (fallas === 0 && fallasDelCrudo !== null && enFrio && cotejo && juntado) {
  log(`Paso "${paso}": ${escritos.archivos.length} hallazgo(s) escrito(s), sin fallas.`)
} else if (fallas > 0) {
  log(`Paso "${paso}": ${escritos.archivos.length} escrito(s), ${fallas} falla(s) que el consultor tiene que atender.`)
}

// El porque puede venir de cualquiera de los cuatro, o de varios a la vez. Se dicen los que
// haya: un «no sirve» sin el renglon señalado no se puede arreglar.
if (noSirve) {
  if (huecos > 0) {
    log(`No le alcanza a quien no estuvo: ${huecos} de ${enFrio.itemsLeidos} item(s) no se entienden solos, incluso despues de la vuelta de arreglo.`)
    for (const h of enFrio.huecos) {
      const ruta = escritos.archivos[h.indice]?.ruta ?? `hallazgo ${h.indice}`
      log(`  ${ruta} — ${h.forma}: «${h.renglon}»`)
    }
  }
  if (inventos > 0) {
    log(`Tiene lo inventado: ${inventos} de ${cotejo.hallazgosCotejados} hallazgo(s) traen algo que la platica no dijo, incluso despues de la vuelta de arreglo.`)
    for (const i of cotejo.inventos) {
      const ruta = escritos.archivos[i.indice]?.ruta ?? `hallazgo ${i.indice}`
      log(`  ${ruta} — inventado: «${i.frase}»`)
    }
  }
  if (grupos > 0) {
    log(`Sigue picado: ${grupos} grupo(s) son el mismo problema contado dos veces, incluso despues de la vuelta de arreglo.`)
    for (const g of juntado.grupos) {
      const rutas = g.indices.map((indice) => escritos.archivos[indice]?.ruta ?? `hallazgo ${indice}`).join(', ')
      log(`  ${rutas} — ${g.porque}`)
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
  enFrio,
  cotejo,
  juntado
}
