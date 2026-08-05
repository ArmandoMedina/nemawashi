export const meta = {
  name: 'levanta-el-conocimiento',
  description: 'Muele lo platicado en un paso de la sesion y lo deja escrito como capacidades, modulos y reglas enlazadas, medidas contra el examen que se levanto antes de construirlas.',
  whenToUse: 'Al cerrar un paso del mapa, o cuando el experto lo pida. Para la linea si quedan dudas por cerrar; se vuelve a correr con la ruta de las respuestas.',
  phases: [
    { title: 'Sacar', detail: 'leer la grabacion de la sesion y sacar la platica limpia con el sacador' },
    { title: 'Inventariar', detail: 'listar lo que otras sesiones ya escribieron, para no volver a proponerlo' },
    { title: 'Levantar el examen', detail: 'las preguntas que el registro va a tener que contestar, antes de que exista una sola pieza' },
    { title: 'Construir', detail: 'armar capacidades, modulos y reglas enlazadas, y cazar lo que no se puede escribir todavia' },
    { title: 'Medir', detail: 'leer en frio, cotejar contra la platica y contestar el examen, las tres a la vez' },
    { title: 'Corregir', detail: 'volver sobre lo que las mediciones marcaron, antes de que llegue a disco' },
    { title: 'Registrar', detail: 'un archivo por pieza, con la marca de lo que quedo a medias' },
    { title: 'Auditar', detail: 'leer el crudo y dictaminar' },
    { title: 'Marcar', detail: 'llevar el dictamen a los archivos, para que la medicion cuente' },
    { title: 'Armar lo que falta', detail: 'lo que hay que preguntarle al experto la proxima vez' }
  ]
}

// Lo que recibe:
//   args.paso           - como se llamo el tramo de sesion. Va al campo `paso` de cada pieza.
//   args.transcript     - opcional. La ruta del `.jsonl`. Si no llega, «Sacar» resuelve la de
//                         esta misma sesion; el molino no la adivina -no tiene `fs` ni `process`.
//   args.hora           - la hora real del alta, ISO 8601 con huso. Se estampa pieza por pieza.
//                         El molino no la calcula: no tiene reloj.
//   args.rutaRespuestas - opcional. La ruta del `.md` con lo que el experto contesto a las dudas
//                         de una corrida anterior. Que el lector la abra y traiga algo dentro es
//                         lo que marca la segunda corrida -nunca la ruta por si sola.
//
// Ya NO recibe `args.platica` ni `args.respuestas`. Antes, quien llamaba tecleaba el texto
// dentro de la llamada, y esa mano acababa siendo el filtro -medido en corrida real: una version
// recortada se colo como argumento y el auditor marco «perdido» material que nunca llego a
// entrar. Con las respuestas paso algo mas caro todavia, medido el 2026-08-05: pasar 15664
// caracteres a mano rompe la reanudacion del workflow -un salto de linea de diferencia entre lo
// tecleado y el archivo cambia el prompt, tira el cache de `resumeFromRunId` y obliga a rehacer
// cuarenta minutos de agentes. Paso dos veces en la misma sesion.

// --- Los esquemas ----------------------------------------------------------

// «Sacar» no juzga nada: lee la grabacion y corre el sacador que ya existe. Por eso su
// esquema no trae veredicto -solo lo que saco y de donde, y `noSePudo` cuando no hubo manera.
// `transcriptLeido` es el mismo nombre que usa DICTAMEN mas abajo: es el mismo archivo, y
// quien audita al final usa esta ruta, no una que adivine por su cuenta.
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

// El mismo trato que `SACADO`, con los mismos nombres de campo para que el paralelo se lea. Aqui
// no hay nada que sacar -es un `.md` plano, no una grabacion- asi que basta con leerlo.
const RESPUESTAS_SACADAS = {
  type: 'object',
  required: ['respuestas', 'archivoLeido'],
  properties: {
    respuestas: {
      type: 'string',
      description:
        'Lo que el experto contesto, tal cual esta escrito en el archivo. Vacia si no se pudo ' +
        'leer -nunca un resumen ni un invento.'
    },
    archivoLeido: {
      type: 'string',
      description: 'La ruta del `.md` que se leyo. Vacia si no se pudo determinar ni leer.'
    },
    noSePudo: {
      type: 'string',
      description: 'Por que no se pudo leer el archivo. Vacio si si se pudo.'
    }
  }
}

// El inventario trae el rengon de cada pieza que ya esta escrita, no su cuerpo: el cuerpo no
// cabria, y para saber si algo ya se dijo basta el renglon. Trae `firmeza` y `alta` porque sin
// ellas quien construye ve dos reglas que chocan y no sabe cual es la vieja ni que tan cerrada
// quedo -y esa es justo la diferencia entre un duplicado y una contradiccion. Trae `origen`
// porque ese campo ya existe en las 36 piezas escritas -`escuchado` o `propuesto`, definido en
// `product/conocimiento/README.md`-, y sin verlo aqui quien construye no sabe que ya esta
// resuelto y lo vuelve a preguntar.
const INVENTARIO = {
  type: 'object',
  required: ['piezas'],
  properties: {
    piezas: {
      type: 'array',
      description: 'Todo lo que ya esta escrito en las cuatro carpetas. Vacio si es la primera corrida del proyecto.',
      items: {
        type: 'object',
        required: ['id', 'tipo', 'renglon', 'firmeza'],
        properties: {
          id: { type: 'string', description: 'El de carpeta, el que vive dentro del archivo: CAP-0007.' },
          tipo: { type: 'string', enum: ['dominio', 'modulo', 'capacidad', 'regla'] },
          renglon: { type: 'string', description: 'El campo de una linea del frontmatter, copiado tal cual.' },
          firmeza: { type: 'string', enum: ['dicho', 'confirmado', 'abierto'] },
          origen: { type: 'string', enum: ['escuchado', 'propuesto'], description: 'El campo de una linea del frontmatter, copiado tal cual.' },
          alta: { type: 'string', description: 'Cuando se escribio. Es lo que dice cual es la vieja cuando dos chocan.' },
          estado: { type: 'string', enum: ['completa', 'con-huecos'] }
        }
      }
    },
    noSePudo: { type: 'string', description: 'Por que no se pudo leer alguna carpeta. Vacio si se leyeron todas.' }
  }
}

// El examen no lleva nada mas que las preguntas. Ni categorias, ni prioridad, ni a que
// capacidad apuntan: en este momento no existe ninguna capacidad, y ese es justo el punto. Un
// examen que supiera contra que se va a medir seria un examen escrito despues.
const EXAMEN = {
  type: 'object',
  required: ['preguntas'],
  properties: {
    preguntas: {
      type: 'array',
      description:
        'Lo que alguien del negocio querria contestar mirando el registro. Ya partidas -una sola ' +
        'respuesta por pregunta- y sin nombres propios. Vacio si la platica no dio ninguna.',
      items: { type: 'string' }
    }
  }
}

// Cuatro campos que ningun esquema de pieza tiene, cada uno por su razon:
//
//   `paso` y `alta`  - los estampa el codigo al salir de aqui, pieza por pieza. Un campo que
//                      el agente pudiera llenar es un campo que el agente puede perder, y una
//                      hora inventada se ve igual de bien que una real.
//   `confirmado`     - se deriva de la firmeza y de la hora, y eso lo hace el codigo.
//   `estado`         - lo pone el escribano traduciendo los reportes de las mediciones, que
//                      todavia no han corrido. Producirlo desde dos lados es la falla que hace
//                      que una marca borre a la otra sin que nadie se entere.
//
// Los `id` son de trabajo -`CAP-1`, `REG-2`- y valen solo dentro de esta corrida. Los
// definitivos salen de numerar la carpeta, y eso pasa al escribir.
const CAMPOS_DE_PIEZA = {
  id: { type: 'string', description: 'De trabajo, no de carpeta: CAP-1. No inventes numero de archivo.' },
  renglon: { type: 'string', description: 'Una linea, en palabras del negocio. Tope de 120 caracteres.' },
  firmeza: { type: 'string', enum: ['dicho', 'confirmado', 'abierto'] },
  origen: {
    type: 'string',
    enum: ['escuchado', 'propuesto'],
    description: 'No sustituye a la firmeza. Solo lo `escuchado` se coteja contra la platica.'
  },
  enSusPalabras: {
    type: 'string',
    description: 'Lo que se dijo, entero, sin recortar -sin tope. Si es `propuesto`, el caso contado y lo que se saco de el.'
  },
  deDondeSalio: {
    type: 'string',
    description: 'Que pregunta lo destapo. CONTADO, no apodado -un apodo nombra algo que no esta en ningun archivo. Si es `propuesto`, por que el conjunto no cerraba sin ella.'
  },
  queQuedaAbierto: {
    type: 'string',
    description: 'Pendiente si es `abierto`. Si no queda nada, la palabra «nada» -el silencio no se interpreta.'
  }
}

const REQUERIDOS_DE_PIEZA = ['id', 'renglon', 'firmeza', 'origen', 'enSusPalabras', 'deDondeSalio', 'queQuedaAbierto']

// El registro enlazado se pedia antes en una sola llamada, con las cuatro piezas juntas: pesaba
// 7806 caracteres serializados, y el clasificador de seguridad la rechazo en una corrida real
// -medido el 2026-08-04, «Construir» murio con `output schema too large to classify safely`. Se
// parte en cuatro llamadas, cada una con su propio esquema, mas chico y en cadena: reglas,
// despues capacidades -que ya conocen las reglas-, despues modulos -que ya conocen las
// capacidades-, y al final dominios -que ya conocen los modulos. `Corregir` toma la misma
// particion: nunca manda el esquema de un tipo que no esta corrigiendo.
//
// Tres enlaces se piden en un sentido y no en el otro, a proposito: cuando se construye cada
// tipo, el que lo va a contener todavia no existe -las reglas no conocen capacidad, las
// capacidades no conocen modulo, los modulos no conocen dominio. Pedirle al agente que cite un
// id que no existe es pedirle que lo invente. El lado que falta se deja vacio aqui y lo enlaza
// el codigo por su cuenta mas abajo (`conLasCapacidadesEnlazadas`, `conElModuloEnlazado`,
// `conElDominioEnlazado`), invirtiendo el lado que si se pudo declarar cuando la pieza de arriba
// se construyo.
const PIEZA_REGLA = {
  type: 'object',
  required: REQUERIDOS_DE_PIEZA.concat(['capacidades']),
  properties: Object.assign({}, CAMPOS_DE_PIEZA, {
    capacidades: {
      type: 'array',
      items: { type: 'string' },
      description: 'Ids de las capacidades que sostiene. Aun no existe ninguna: DEJA VACIO, el codigo lo enlaza despues.'
    }
  })
}

const PIEZA_CAPACIDAD = {
  type: 'object',
  required: REQUERIDOS_DE_PIEZA.concat(['modulo', 'reglas']),
  properties: Object.assign({}, CAMPOS_DE_PIEZA, {
    modulo: { type: 'string', description: 'Id del modulo. Aun no existe: DEJA VACIO, el codigo lo enlaza despues.' },
    reglas: { type: 'array', items: { type: 'string' }, description: 'Ids de las reglas que sostiene. Vacio es hueco, no error.' }
  })
}

const PIEZA_MODULO = {
  type: 'object',
  required: REQUERIDOS_DE_PIEZA.concat(['dominio', 'capacidades', 'queAgrupa']),
  properties: Object.assign({}, CAMPOS_DE_PIEZA, {
    dominio: {
      type: 'string',
      description: 'Id del dominio que lo contiene. Aun no existe ninguno: DEJA VACIO, el codigo lo enlaza despues.'
    },
    capacidades: { type: 'array', items: { type: 'string' }, description: 'Ids de las capacidades que contiene.' },
    queAgrupa: { type: 'string', description: 'Que cae dentro Y QUE NO -la segunda mitad es la que sirve para ubicar una capacidad nueva.' }
  })
}

const PIEZA_DOMINIO = {
  type: 'object',
  required: REQUERIDOS_DE_PIEZA.concat(['modulos', 'quienLoSabe', 'queAgrupa']),
  properties: Object.assign({}, CAMPOS_DE_PIEZA, {
    modulos: { type: 'array', items: { type: 'string' }, description: 'Ids de los modulos que contiene.' },
    quienLoSabe: {
      type: 'string',
      description:
        'El PAPEL que puede contestar esto -quien cobra, quien surte, quien autoriza-, nunca la persona: ' +
        'ningun nombre entra a un archivo. Si dos dominios necesitan a la misma persona en la sala, no son dos.'
    },
    queAgrupa: { type: 'string', description: 'Que modulos caen dentro Y CUALES NO -la segunda mitad es la que sirve.' }
  })
}

// `dudas` y `senaladas` solo viajan en las llamadas que todavia estan proponiendo -reglas y
// capacidades-. Las de modulos y dominios solo agrupan lo que ya existe y no proponen nada suelto
// que pudiera generar una duda nueva; y una vuelta de `Corregir` solo corrige lo que ya se
// marco, nunca abre una duda que nadie pidio.
const CAMPO_DUDAS = {
  type: 'array',
  description: 'La pregunta ya armada. Para la corrida si hay alguna; vacio de verdad si no hay nada que cerrar.',
  items: {
    type: 'object',
    required: ['pregunta', 'falla'],
    properties: {
      pregunta: { type: 'string' },
      falla: {
        type: 'string',
        enum: ['ambiguedad', 'contradiccion', 'frase-a-medias', 'referencia-sin-cerrar', 'umbral-sin-numero', 'reglas-que-chocan', 'capacidad-sin-casa']
      }
    }
  }
}

const CAMPO_SENALADAS = {
  type: 'array',
  description: 'Ids sin cerrar; el escribano lo traduce a `con-huecos`. Vacio si ninguna.',
  items: { type: 'string' }
}

const CONSTRUIR_REGLAS = {
  type: 'object',
  required: ['reglas', 'dudas', 'senaladas'],
  properties: { reglas: { type: 'array', items: PIEZA_REGLA }, dudas: CAMPO_DUDAS, senaladas: CAMPO_SENALADAS }
}

const CONSTRUIR_CAPACIDADES = {
  type: 'object',
  required: ['capacidades', 'dudas', 'senaladas'],
  properties: { capacidades: { type: 'array', items: PIEZA_CAPACIDAD }, dudas: CAMPO_DUDAS, senaladas: CAMPO_SENALADAS }
}

const CONSTRUIR_MODULOS = {
  type: 'object',
  required: ['modulos'],
  properties: { modulos: { type: 'array', items: PIEZA_MODULO } }
}

const CONSTRUIR_DOMINIOS = {
  type: 'object',
  required: ['dominios'],
  properties: { dominios: { type: 'array', items: PIEZA_DOMINIO } }
}

// `Corregir` manda solo el esquema del tipo que esta corrigiendo -nunca el de los otros tres, y
// nunca `dudas`: una correccion no abre dudas nuevas, arregla lo que ya se marco o lo deja
// `abierto` con su id en `senaladas`.
const CORREGIR_REGLAS = {
  type: 'object',
  required: ['reglas', 'senaladas'],
  properties: { reglas: { type: 'array', items: PIEZA_REGLA }, senaladas: CAMPO_SENALADAS }
}

const CORREGIR_CAPACIDADES = {
  type: 'object',
  required: ['capacidades', 'senaladas'],
  properties: { capacidades: { type: 'array', items: PIEZA_CAPACIDAD }, senaladas: CAMPO_SENALADAS }
}

const CORREGIR_MODULOS = {
  type: 'object',
  required: ['modulos', 'senaladas'],
  properties: { modulos: { type: 'array', items: PIEZA_MODULO }, senaladas: CAMPO_SENALADAS }
}

const CORREGIR_DOMINIOS = {
  type: 'object',
  required: ['dominios', 'senaladas'],
  properties: { dominios: { type: 'array', items: PIEZA_DOMINIO }, senaladas: CAMPO_SENALADAS }
}

// Los cuatro tipos, en el orden en que se construyen -reglas, capacidades, modulos, dominios-,
// con la clave de su campo en el registro y el esquema que le toca a `Corregir`. `Construir` no
// usa esta lista: ahi cada llamada tiene ademas su propio contexto (que ya se construyo antes),
// y no hay tres usos iguales todavia que abstraer.
const TIPOS_DE_PIEZA = [
  { tipo: 'regla', clave: 'reglas', schema: CORREGIR_REGLAS },
  { tipo: 'capacidad', clave: 'capacidades', schema: CORREGIR_CAPACIDADES },
  { tipo: 'modulo', clave: 'modulos', schema: CORREGIR_MODULOS },
  { tipo: 'dominio', clave: 'dominios', schema: CORREGIR_DOMINIOS }
]

// El lector en frio no compara nada: solo tiene las piezas. Por eso su hallazgo nombra el
// renglon y la forma de fallar, y NO lleva un campo para «que agregar» - el que dice que falta
// no es quien decide con que se llena, y ademas no tiene el material para hacerlo.
const LECTURA_EN_FRIO = {
  type: 'object',
  required: ['huecos', 'piezasLeidas'],
  properties: {
    huecos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'renglon', 'forma'],
        properties: {
          id: { type: 'string', description: 'El id de trabajo de la pieza que no se entiende sola.' },
          renglon: { type: 'string', description: 'El renglon exacto, copiado.' },
          forma: { type: 'string', enum: ['apodo-de-caso', 'puntero-a-la-nada', 'procedencia-de-relleno', 'palabra-sin-definir'] }
        }
      }
    },
    piezasLeidas: { type: 'number' }
  }
}

// El cotejador SI ve la platica -a diferencia del lector en frio-, pero igual que el, no
// decide con que se llena un hueco: solo nombra la frase que la platica no dijo. Y coteja SOLO
// lo de origen `escuchado`: lo `propuesto` nadie lo dijo, asi que buscarlo daria que no
// siempre, y reportarlo todo dejaria una lista tan larga que los inventos de verdad se pierden
// entre ellos.
const COTEJO = {
  type: 'object',
  required: ['inventos', 'piezasCotejadas'],
  properties: {
    inventos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'frase'],
        properties: {
          id: { type: 'string', description: 'El id de trabajo de la pieza.' },
          frase: { type: 'string', description: 'La frase inventada, copiada tal cual.' }
        }
      }
    },
    piezasCotejadas: { type: 'number' }
  }
}

// Quien contesta el examen mide lo que las otras dos no alcanzan: si el conjunto sirve para
// algo. Por eso su esquema separa dos listas que se confunden facil -y la segunda no tiene
// `id` a proposito: una pregunta que ninguna pieza tocaba no tiene pieza a la que senalar, y
// el escribano no la puede marcar en ningun archivo.
const EXAMEN_CONTESTADO = {
  type: 'object',
  required: ['respuestas', 'senaladas', 'sinPieza'],
  properties: {
    respuestas: {
      type: 'array',
      items: {
        type: 'object',
        required: ['pregunta', 'veredicto'],
        properties: {
          pregunta: { type: 'string' },
          veredicto: { type: 'string', enum: ['contestada', 'a-medias', 'sin-contestar'] },
          respuesta: { type: 'string', description: 'La respuesta armada, si la hubo.' },
          camino: {
            type: 'array',
            items: { type: 'string' },
            description: 'Los ids de trabajo por los que pasaste. Una respuesta sin camino no se puede revisar.'
          }
        }
      }
    },
    senaladas: {
      type: 'array',
      description: 'Los ids de trabajo de las piezas que salieron en una respuesta `a-medias` o `sin-contestar`.',
      items: { type: 'string' }
    },
    sinPieza: {
      type: 'array',
      description:
        'Las preguntas que ninguna pieza tocaba, tal como venian en el examen. Sin id, porque no hay ' +
        'pieza. No propongas la pieza que faltaria: eso seria proponer el arreglo, y quien mide no arregla.',
      items: { type: 'string' }
    }
  }
}

// El escribano devuelve la correspondencia porque sin ella los reportes quedan huerfanos: las
// mediciones citaron `CAP-1` y en disco quedo `CAP-0007`. Y devuelve aparte las senales que no
// correspondian a ninguna pieza, porque no las puede marcar en ningun archivo.
const ESCRITOS = {
  type: 'object',
  required: ['archivos', 'noEscritos'],
  properties: {
    archivos: {
      type: 'array',
      items: {
        type: 'object',
        required: ['ruta', 'id', 'idDeTrabajo', 'estado'],
        properties: {
          ruta: { type: 'string' },
          id: { type: 'string', description: 'El definitivo, el que quedo dentro del archivo: CAP-0007.' },
          idDeTrabajo: { type: 'string', description: 'El que traia al llegar: CAP-1.' },
          estado: { type: 'string', enum: ['completa', 'con-huecos'] }
        }
      }
    },
    noEscritos: { type: 'array', items: { type: 'string' }, description: 'Que no se pudo escribir y por que.' },
    senalesSinPieza: {
      type: 'array',
      items: { type: 'string' },
      description: 'Lo que un reporte senalo y no correspondia a ninguna pieza. Se pasa tal cual, sin traducir.'
    }
  }
}

const DICTAMEN = {
  type: 'object',
  required: ['inventado', 'perdido', 'malMarcado', 'sirve', 'porque', 'transcriptLeido'],
  properties: {
    inventado: { type: 'array', items: { type: 'string' }, description: 'Escrito y nadie lo dijo. Con su archivo.' },
    perdido: { type: 'array', items: { type: 'string' }, description: 'Dicho y no quedo escrito.' },
    malMarcado: { type: 'array', items: { type: 'string' }, description: 'La firmeza o el origen no corresponden, o un enlace apunta a la nada.' },
    sospechas: { type: 'array', items: { type: 'string' } },
    sirve: { type: 'boolean', description: 'Le alcanza a alguien que no estuvo? Un `false` cuenta como falla igual que las otras tres.' },
    porque: { type: 'string', description: 'Si no sirve, la lista de renglones con su archivo. Nunca una opinion general.' },
    transcriptLeido: { type: 'string' }
  }
}

// Sin esto el dictamen se imprime y se pierde: el archivo se queda diciendo `completa` aunque el
// auditor haya probado que lo que dice nadie lo dijo. Medido el 2026-07-31 y VUELTO A MEDIR el
// 2026-08-04, cuando el molino ya contaba el dictamen para su estado de salida y aun asi ningun
// archivo cambio, porque nadie tenia permiso de tocarlos. Que la medicion cuente quiere decir que
// llegue al archivo, no al reporte.
const MARCADO = {
  type: 'object',
  required: ['marcados', 'perdido'],
  properties: {
    marcados: {
      type: 'array',
      items: {
        type: 'object',
        required: ['ruta', 'id', 'falla'],
        properties: {
          ruta: { type: 'string' },
          id: { type: 'string' },
          falla: { type: 'string', description: 'Cual de las cuatro del dictamen le toco a esta pieza.' }
        }
      }
    },
    perdido: {
      type: 'array',
      items: { type: 'string' },
      description: 'Lo que el auditor dijo que se perdio. No tiene archivo donde marcarse -por eso se perdio- y se pasa entero.'
    },
    noSePudo: {
      type: 'array',
      items: { type: 'string' },
      description: 'Archivos que el dictamen nombraba y no se pudieron abrir o no existen. Un dictamen que apunta a la nada es un dato.'
    }
  }
}

// Lo que abre la sesion siguiente. Los dos bloques van separados a proposito: un hueco de hace
// tres semanas que sigue abierto sigue siendo un hueco, y si solo se mira el paso de hoy la
// lista se ve corta y el registro se pudre por abajo.
const LO_QUE_FALTA = {
  type: 'object',
  required: ['deEstePaso', 'deAntes', 'archivosRecorridos'],
  properties: {
    deEstePaso: {
      type: 'array',
      items: {
        type: 'object',
        required: ['pregunta'],
        properties: {
          pregunta: { type: 'string', description: 'La pregunta que se le hace al experto, no el diagnostico.' },
          id: { type: 'string', description: 'El id del archivo que se cierra al contestarla. Vacio si no hay pieza.' }
        }
      }
    },
    deAntes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['pregunta'],
        properties: {
          pregunta: { type: 'string' },
          id: { type: 'string' },
          paso: { type: 'string', description: 'De que paso viene.' }
        }
      }
    },
    archivosRecorridos: { type: 'number' }
  }
}

// --- Los ayudantes ---------------------------------------------------------

// Quien llama puede mandar los argumentos como datos o como texto JSON - las dos formas se han
// visto en corrida real. Aqui se aclara la entrada una sola vez, antes de que nadie la use. Un
// texto que no es JSON valido ya no tiene donde caer, asi que se trata como entrada vacia:
// «Sacar» lo va a reportar como material que no se pudo determinar, en vez de perderlo en
// silencio.
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

// El paso y la hora se estampan aqui y no los pone el agente. Un campo que el agente pudiera
// llenar es un campo que el agente puede perder, y una hora inventada se ve igual de bien que
// una real. `confirmado` se deriva: solo existe si la firmeza lo pide, y lleva la misma hora,
// porque el si del experto ocurrio dentro de esta corrida.
function conElPasoYLaHora(pieza, paso, hora) {
  const estampada = Object.assign({}, pieza, { paso })
  if (hora) {
    estampada.alta = hora
    if (pieza.firmeza === 'confirmado') estampada.confirmado = hora
  }
  return estampada
}

function todasLasPiezas(registro) {
  return (registro.dominios ?? []).concat(registro.capacidades, registro.modulos, registro.reglas)
}

// Las reglas se construyen antes de que exista una sola capacidad, asi que a su turno se les
// pidio dejar `capacidades` vacio -no podian saberlo-. Cuando las capacidades ya existen, cada
// una SI declara sus reglas (`capacidad.reglas`, un id que ya existia cuando ella se construyo),
// y de ahi se invierte el enlace que a la regla le faltaba. Dato plano entra, dato plano nuevo
// sale; nunca se toca el original.
function conLasCapacidadesEnlazadas(reglas, capacidades) {
  return reglas.map((r) => Object.assign({}, r, {
    capacidades: capacidades.filter((c) => (c.reglas ?? []).indexOf(r.id) !== -1).map((c) => c.id)
  }))
}

// La misma historia un nivel arriba: al construir las capacidades no existe ningun modulo, asi
// que `capacidad.modulo` se les pidio vacio. Cuando los modulos ya existen, cada uno SI declara
// sus capacidades (`modulo.capacidades`), y de ahi se invierte el enlace que a la capacidad le
// faltaba. Si ningun modulo la reclamo, se queda con lo que haya traido -una capacidad sin casa
// es justo lo que las mediciones de abajo tienen que cazar, no algo que este codigo deba tapar.
function conElModuloEnlazado(capacidades, modulos) {
  return capacidades.map((c) => {
    const suyo = modulos.find((m) => (m.capacidades ?? []).indexOf(c.id) !== -1)
    return Object.assign({}, c, { modulo: suyo ? suyo.id : c.modulo })
  })
}

// La misma inversion, un nivel mas arriba: al construir los modulos no existe ningun dominio,
// asi que `modulo.dominio` se les pidio vacio. Cuando los dominios ya existen, cada uno SI
// declara sus modulos (`dominio.modulos`), y de ahi se invierte el enlace que al modulo le
// faltaba.
function conElDominioEnlazado(modulos, dominios) {
  return modulos.map((m) => {
    const suyo = dominios.find((d) => (d.modulos ?? []).indexOf(m.id) !== -1)
    return Object.assign({}, m, { dominio: suyo ? suyo.id : m.dominio })
  })
}

// Cada senal viene con su razon, y la razon viaja pegada a la pieza hasta el escribano. Medido el
// 2026-08-04: tres reglas salieron con `estado: con-huecos` y `que-queda-abierto` diciendo «nada»,
// que su propia plantilla prohibe. Pasaba porque al escribano le llegaba la marca sin el motivo, y
// una regla que solo pide no se cumple: si no tiene con que llenarlo, lo deja en nada.
function razonesPorId(registro, enFrio, cotejo, contestado) {
  const razones = {}
  const agregar = (id, texto) => {
    if (!razones[id]) razones[id] = []
    razones[id].push(texto)
  }

  for (const id of registro.senaladas) agregar(id, 'Quedo sin cerrar al construir el registro.')
  if (enFrio) for (const h of enFrio.huecos) agregar(h.id, `No se entiende solo (${h.forma}): «${h.renglon}»`)
  if (cotejo) for (const i of cotejo.inventos) agregar(i.id, `Esto no esta dicho en la platica: «${i.frase}»`)
  if (contestado) {
    for (const r of contestado.respuestas) {
      if (r.veredicto === 'contestada') continue
      for (const id of r.camino ?? []) agregar(id, `El examen quedo ${r.veredicto} en: «${r.pregunta}»`)
    }
    for (const id of contestado.senaladas) {
      if (!razones[id]) agregar(id, 'El examen no se pudo contestar con esta pieza.')
    }
  }

  return razones
}

// Una pieza senalada por cualquier reporte se escribe `con-huecos`. **Basta uno:** cada
// medicion mira algo que las otras no ven, y perdonar la senal porque las demas salieron
// limpias es como no haber medido. La union se arma aqui, en el codigo, y no en el escribano:
// si cada reporte le llegara suelto, el que escribe tendria que decidir cual pesa mas, y esa
// decision es justo la que hace que una marca borre a la otra.
function idsSenalados(senaladasDelRegistro, enFrio, cotejo, contestado) {
  const ids = []
  for (const id of senaladasDelRegistro) ids.push(id)
  if (enFrio) for (const h of enFrio.huecos) ids.push(h.id)
  if (cotejo) for (const i of cotejo.inventos) ids.push(i.id)
  if (contestado) for (const id of contestado.senaladas) ids.push(id)
  return ids.filter((id, i) => ids.indexOf(id) === i)
}

// Agrupa por tipo, no por el prefijo del id: el id de trabajo no es un contrato, y de donde
// sale la pieza -de `registro.reglas`, de `registro.modulos`- si lo es.
function piezasDelTipoMarcadas(registro, tipo, ids) {
  const clave = TIPOS_DE_PIEZA.find((t) => t.tipo === tipo).clave
  return (registro[clave] ?? []).filter((p) => ids.indexOf(p.id) !== -1)
}

// La vuelta de correccion devuelve SOLO las piezas marcadas -asi se le pide, y asi hay que
// recibirla. Reemplazar el registro entero con lo que vuelve pierde todo lo que estaba bien.
//
// Medido en la primera corrida real, el 2026-08-04: la vuelta devolvio capacidades sin ningun
// modulo, el codigo cambio el registro completo por eso, y el escribano se nego a escribir
// porque `CAP-1` citaba un `MOD-1` que ya no existia. **El escribano tenia razon y el molino
// no.** Ninguna de las 29 pruebas lo cazo, porque el agente falso siempre devolvia el registro
// entero -un doble mas complaciente que el agente real.
//
// Lo que sigue senalado se une en vez de reemplazarse: si una pieza se arreglo y aun asi queda
// marcada, sale con hueco de mas. Ese es el lado seguro del error.
function conLaCorreccionAplicada(registro, corregido) {
  const fundir = (viejas, nuevas) => {
    const corregidas = viejas.map((v) => nuevas.find((n) => n.id === v.id) ?? v)
    const nacidas = nuevas.filter((n) => !viejas.some((v) => v.id === n.id))
    return corregidas.concat(nacidas)
  }

  const senaladas = (corregido.senaladas ?? []).concat(registro.senaladas)

  return {
    dominios: fundir(registro.dominios ?? [], corregido.dominios ?? []),
    capacidades: fundir(registro.capacidades, corregido.capacidades ?? []),
    modulos: fundir(registro.modulos, corregido.modulos ?? []),
    reglas: fundir(registro.reglas, corregido.reglas ?? []),
    dudas: registro.dudas,
    senaladas: senaladas.filter((id, i) => senaladas.indexOf(id) === i)
  }
}

// --- Los prompts -----------------------------------------------------------

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

function promptParaSacarLasRespuestas(ruta) {
  return [
    'Tu tarea aqui es mecanica, no de juicio: no cargues ninguna de tus cartas para esto.',
    '',
    `Lee con tu herramienta Read el archivo \`${ruta}\`: son las respuestas que el experto`,
    'contesto a las dudas de una corrida anterior.',
    '',
    '**Es un `.md` plano, no una grabacion: no corras el sacador, no corras ningun comando y no',
    'escribas ningun script.** Aqui basta con leer el archivo.',
    '',
    'Regresa el contenido tal cual en `respuestas` -sin resumir y sin recortar. Lo que recortes',
    'aqui, mas adelante el auditor lo va a marcar como inventado, porque no lo va a encontrar en',
    'el crudo. Y la ruta que leiste en `archivoLeido`.',
    '',
    'Si no pudiste leer el archivo, `respuestas` y `archivoLeido` van vacios y `noSePudo` dice',
    'por que. **No lo escribas de memoria:** una respuesta inventada se ve igual de bien que una',
    'real.'
  ].join('\n')
}

function promptParaInventariar() {
  return [
    'Tu tarea aqui es mecanica, no de juicio: no cargues ninguna de tus cartas para esto.',
    '',
    'Lista lo que ya esta escrito en `product/conocimiento/`, en sus cuatro carpetas: `dominios/`,',
    '`modulos/`, `capacidades/` y `reglas/`.',
    '',
    'De cada archivo `NNNN-*.md` -**no de las plantillas `0000-plantilla.md`, ni del README**- saca',
    'del frontmatter: el `id`, el renglon de una linea (`dominio`, `modulo`, `capacidad` o `regla`',
    'segun la carpeta), la `firmeza`, el `origen`, el `alta` y el `estado`. **El cuerpo no**: no cabe',
    'y no hace falta para saber si algo ya se dijo.',
    '',
    'Si una carpeta no existe todavia, no es un error: es la primera corrida. Devuelve lo que si',
    'haya y sigue. Si una carpeta existe y no la pudiste leer, eso si se dice en `noSePudo`.',
    '',
    '**No abras el cuerpo de los archivos, no los resumas y no opines sobre ellos.** Aqui solo se',
    'lista lo que hay.'
  ].join('\n')
}

function promptParaElExamen(paso, platica) {
  return [
    'Carga tu carta `levantar-el-examen` antes de leer nada.',
    '',
    `Esto es lo que se hablo en el paso "${paso}" de una sesion con un experto de negocio.`,
    'Saca las preguntas que el registro va a tener que poder contestar.',
    '',
    '**Todavia no existe ninguna capacidad, ninguna regla y ningun modulo, y eso es a proposito.**',
    'Un examen escrito despues de ver el resultado siempre lo aprueba. Este es el unico momento',
    'en que se puede levantar sin haber visto contra que se va a medir.',
    '',
    '--- La platica ---',
    platica
  ].join('\n')
}

// Lo que se filtra es que se le pide ESCRIBIR a cada llamada -eso ya lo hace su propio esquema,
// mas abajo-, no que se le deja VER: por eso el indice completo, de los cuatro tipos, va a las
// cuatro llamadas por igual. Medido en corrida real el 2026-08-04: al constructor de reglas solo
// le llegaba el indice de reglas, y cuatro enunciados que ya vivian escritos como capacidades no
// los cazo por eso -los caso leyendo el disco por su cuenta, que nadie le habia pedido.
function piezasYaEscritas(inventario) {
  return inventario ? inventario.piezas : []
}

// Lo que las cuatro llamadas de «Construir» comparten: el indice completo de lo ya escrito, el
// aviso de segunda corrida, las reglas de los `id` de trabajo, la prohibicion de estampar
// paso/alta/confirmado/estado, y el examen que no se puede tocar. Antes vivia una sola vez porque
// habia una sola llamada. `queDevuelve` nombra el tipo que le toca a ESTA llamada -`reglas`,
// `capacidades`, `modulos` o `dominios`- para poder aclarar la diferencia: el indice de abajo
// trae los cuatro tipos, pero lo unico que esta llamada devuelve es el suyo.
function bloqueComunDeConstruir(examen, indiceCompleto, segundaCorrida, queDevuelve) {
  return [
    indiceCompleto.length > 0
      ? [
          '--- Lo que otras sesiones YA escribieron, en las cuatro carpetas ---',
          '',
          `**Esto es TODO lo que ya existe -dominios, modulos, capacidades y reglas-, no solo`,
          `${queDevuelve}: cotejar contra los cuatro tipos es lo que deja cazar que algo de hoy ya`,
          `vive escrito, aunque hoy viviera de otro tipo. Tu SIGUES devolviendo solo ${queDevuelve}`,
          '-eso no cambia-, pero leelo entero antes de proponer nada.**',
          '',
          'Lo que ya este aqui no se vuelve a escribir: se enlaza, o se dice que esta platica lo',
          'completa, y entonces esa pieza vuelve **con su id de carpeta** -no con uno de trabajo- y',
          'solo con lo que cambia.',
          '',
          'Y si lo de hoy **no puede ser cierto al mismo tiempo** que algo de aqui, eso no es un',
          'duplicado: es una contradiccion, y va a las dudas con las dos fechas en la mano. Nunca la',
          'sobrescribas en silencio y nunca decidas tu cual gana -que lo de hoy sea mas nuevo no lo',
          'hace mas cierto.',
          '',
          JSON.stringify(indiceCompleto, null, 2)
        ].join('\n')
      : '--- Es la primera corrida del proyecto: no hay nada escrito todavia ---',
    '',
    segundaCorrida
      ? [
          'El experto YA contesto las dudas de una corrida anterior - vienen abajo.',
          '',
          '**Esta es la segunda y ultima corrida: no devuelvas dudas.** Lo que siga sin cerrar',
          'despues de sus respuestas se marca con firmeza `abierto`, con lo que falto en',
          '`queQuedaAbierto`, y su id va en `senaladas`. Un hueco registrado sirve; una pregunta',
          'que nadie contesta detiene la linea para siempre.'
        ].join('\n')
      : 'Esta es la primera corrida: si quedan dudas, la corrida se para y se le llevan al experto.',
    '',
    '**Los `id` son de trabajo y valen solo aqui:** CAP-1, MOD-1, REG-1, DOM-1. Los numeros de',
    'carpeta salen de numerar `product/conocimiento/`, y eso pasa al escribir, despues de las',
    'mediciones. Si adivinas un numero de carpeta, el registro apunta a la pieza de otra sesion.',
    '',
    '**No pongas `paso`, `alta`, `confirmado` ni `estado`.** Los tres primeros se estampan al',
    'salir de aqui; el `estado` lo pone el escribano traduciendo lo que senalen las mediciones,',
    'que todavia no han corrido.',
    '',
    '--- El examen que ya se levanto, y no lo puedes tocar ---',
    examen.preguntas.map((p, i) => `${i + 1}. ${p}`).join('\n')
  ].join('\n')
}

// «Construir» ya no es una llamada, son cuatro: reglas, despues capacidades -que citan las
// reglas que acaban de nacer-, despues modulos -que citan esas capacidades-, y al final dominios
// -que citan esos modulos. La razon es de tamano, no de metodo: el registro entero pesaba 7806
// caracteres serializados y el clasificador de seguridad lo rechazo en una corrida real, medido
// el 2026-08-04. Todas reciben lo mismo que antes recibia la unica llamada -el examen, lo que
// dijo el experto, si es segunda corrida, el indice completo de lo ya escrito-; las tres ultimas
// reciben ademas TODO lo que ya se construyo en esta corrida, no solo lo de la llamada
// inmediata anterior: quien arma dominios agrupa modulos, pero tambien tiene que poder ver las
// capacidades y las reglas de las que esos modulos salieron. Medido en corrida real el
// 2026-08-04: sin esto, quien construia dominios solo veia modulos.

function promptParaConstruirReglas(paso, loQueDijoElExperto, examen, segundaCorrida, inventario) {
  return [
    'Carga tu carta `construir-el-registro` antes de medir nada.',
    '',
    `Arma las reglas dichas del paso "${paso}": lo que el experto dijo que se cumple siempre, nunca,`,
    'o bajo una condicion.',
    '',
    'Todavia no existe ninguna capacidad -eso se construye despues-, asi que **deja `capacidades`',
    'vacio en cada regla.** No es un hueco: el codigo enlaza ese lado solo, en cuanto las',
    'capacidades ya existan.',
    '',
    bloqueComunDeConstruir(examen, piezasYaEscritas(inventario), segundaCorrida, 'reglas'),
    '',
    '--- Lo que dijo el experto ---',
    loQueDijoElExperto
  ].join('\n')
}

function promptParaConstruirCapacidades(paso, loQueDijoElExperto, examen, segundaCorrida, inventario, reglas) {
  return [
    'Carga tu carta `construir-el-registro` antes de medir nada.',
    '',
    `Arma las capacidades del paso "${paso}": lo que el sistema tiene que poder hacer, sacado de las`,
    'reglas de abajo -son las que puedes citar en `reglas`.',
    '',
    'Todavia no existe ningun modulo -eso se construye despues-, asi que **deja `modulo` vacio en',
    'cada capacidad.** No es un hueco: el codigo enlaza ese lado solo, en cuanto los modulos ya',
    'existan.',
    '',
    bloqueComunDeConstruir(examen, piezasYaEscritas(inventario), segundaCorrida, 'capacidades'),
    '',
    '--- Las reglas que ya se construyeron en esta corrida ---',
    JSON.stringify(reglas, null, 2),
    '',
    '--- Lo que dijo el experto ---',
    loQueDijoElExperto
  ].join('\n')
}

function promptParaConstruirModulos(paso, loQueDijoElExperto, examen, segundaCorrida, inventario, capacidades, reglas) {
  return [
    'Carga tu carta `construir-el-registro` antes de medir nada.',
    '',
    `Arma los modulos del paso "${paso}", agrupando las capacidades de abajo -son las que puedes`,
    'citar en `capacidades`.',
    '',
    'Todavia no existe ningun dominio -eso se construye despues-, asi que **deja `dominio` vacio en',
    'cada modulo.** No es un hueco: el codigo enlaza ese lado solo, en cuanto los dominios ya',
    'existan.',
    '',
    bloqueComunDeConstruir(examen, piezasYaEscritas(inventario), segundaCorrida, 'modulos'),
    '',
    '--- Las capacidades que ya se construyeron en esta corrida ---',
    JSON.stringify(capacidades, null, 2),
    '',
    '--- Las reglas que ya se construyeron en esta corrida ---',
    JSON.stringify(reglas, null, 2),
    '',
    '--- Lo que dijo el experto ---',
    loQueDijoElExperto
  ].join('\n')
}

function promptParaConstruirDominios(paso, loQueDijoElExperto, examen, segundaCorrida, inventario, modulos, capacidades, reglas) {
  return [
    'Carga tu carta `construir-el-registro` antes de medir nada.',
    '',
    `Arma los dominios del paso "${paso}", agrupando los modulos de abajo -son los que puedes citar`,
    'en `modulos`.',
    '',
    bloqueComunDeConstruir(examen, piezasYaEscritas(inventario), segundaCorrida, 'dominios'),
    '',
    '--- Los modulos que ya se construyeron en esta corrida ---',
    JSON.stringify(modulos, null, 2),
    '',
    '--- Las capacidades que ya se construyeron en esta corrida ---',
    JSON.stringify(capacidades, null, 2),
    '',
    '--- Las reglas que ya se construyeron en esta corrida ---',
    JSON.stringify(reglas, null, 2),
    '',
    '--- Lo que dijo el experto ---',
    loQueDijoElExperto
  ].join('\n')
}

// Al lector en frio se le manda el registro pelado: sin platica, sin el nombre del paso y sin
// el examen. En cuanto se entera de lo que paso, deja de servir para esto -tapa el hueco el
// mismo al leer, igual que el que audita con el transcript enfrente. Tampoco lleva `firmeza` ni
// `origen`: esas marcas dicen de donde salio la pieza, y saberlo es enterarse.
function registroParaElLector(registro) {
  const pelar = (p) => ({
    id: p.id,
    renglon: p.renglon,
    enSusPalabras: p.enSusPalabras,
    deDondeSalio: p.deDondeSalio,
    queQuedaAbierto: p.queQuedaAbierto
  })
  return {
    dominios: (registro.dominios ?? []).map((d) => Object.assign(pelar(d), { modulos: d.modulos, quienLoSabe: d.quienLoSabe, queAgrupa: d.queAgrupa })),
    modulos: registro.modulos.map((m) => Object.assign(pelar(m), { dominio: m.dominio, capacidades: m.capacidades, queAgrupa: m.queAgrupa })),
    capacidades: registro.capacidades.map((c) => Object.assign(pelar(c), { modulo: c.modulo, reglas: c.reglas })),
    reglas: registro.reglas.map((r) => Object.assign(pelar(r), { capacidades: r.capacidades }))
  }
}

function promptParaElLector(registro) {
  return [
    'Carga tu carta `leer-en-frio` antes de leer nada.',
    '',
    'Lee este registro y nada mas. No sabes de que paso salio, no hay transcript que abrir y no',
    'hay platica que consultar: en cuanto te enteres de lo que paso, dejas de servir para esto.',
    '',
    '**Cada pieza se lee sola, no apoyada en su vecina.** Entender la capacidad porque recuerdas',
    'la regla que leiste hace un momento es el mismo autoengano: quien abra ese archivo dentro de',
    'seis meses va a abrir uno, no todos.',
    '',
    JSON.stringify(registroParaElLector(registro), null, 2)
  ].join('\n')
}

// Al cotejador se le manda el registro CON el origen, porque el origen es lo que decide que
// coteja. Sin ese campo reportaria como invento todo lo propuesto -que nadie dijo, por
// definicion- y la lista saldria tan larga que los inventos de verdad se pierden entre ellos.
function registroParaElCotejador(registro) {
  return todasLasPiezas(registro).map((p) => ({
    id: p.id,
    renglon: p.renglon,
    enSusPalabras: p.enSusPalabras,
    deDondeSalio: p.deDondeSalio,
    firmeza: p.firmeza,
    origen: p.origen
  }))
}

function promptParaElCotejador(registro, loQueDijoElExperto) {
  return [
    'Carga tu carta `cotejar` antes de leer nada.',
    '',
    'Coteja estas piezas contra todo lo que dijo el experto. Lo que no este dicho ahi, nombralo',
    'como invento -no importa que suene razonable. No corrijas, no reescribas y no propongas que',
    'poner: solo senala la frase.',
    '',
    '**Cada pieza trae su `origen`, y eso decide que cotejas:** solo lo `escuchado`. Lo `propuesto`',
    'lo armo el agente para que el conjunto cerrara y nadie lo dijo, asi que buscarlo daria que no',
    'siempre. No lo reportes como invento: se mide en otro lado, contestando el examen.',
    '',
    '--- Lo que dijo el experto ---',
    loQueDijoElExperto,
    '',
    '--- Las piezas ---',
    JSON.stringify(registroParaElCotejador(registro), null, 2)
  ].join('\n')
}

function promptParaContestarElExamen(registro, examen) {
  return [
    'Carga tu carta `contestar-el-examen` antes de leer nada.',
    '',
    'Intenta contestar cada una de estas preguntas usando solo el registro de abajo. **No pidas la',
    'platica, no la busques y no la abras si la tienes a la mano:** si contestas con algo que',
    'recuerdas de la conversacion en vez de con lo que esta escrito, la medicion se rompe y nadie',
    'se entera.',
    '',
    'Las piezas todavia no estan en disco -esto corre antes de escribir-, asi que se citan por su',
    '`id` de trabajo. No hay rutas.',
    '',
    '--- El examen ---',
    examen.preguntas.map((p, i) => `${i + 1}. ${p}`).join('\n'),
    '',
    '--- El registro ---',
    JSON.stringify(registroParaElLector(registro), null, 2)
  ].join('\n')
}

// «Corregir» corre una vez por cada tipo que tenga piezas marcadas -antes corria una sola vez con
// todo junto, con el esquema `REGISTRO` completo-. Aqui solo se le manda a cada llamada lo que le
// toca a su propio tipo: sus piezas marcadas, y de los tres reportes de medicion, solo lo que
// senalaron ids de ese mismo tipo -mandarle el reporte entero a quien solo corrige reglas no
// ayuda, y es la clase de ruido que hace que el agente arregle algo que no le tocaba.
function promptParaCorregir(paso, loQueDijoElExperto, clave, marcadas, enFrio, cotejo, contestado, esLaSegundaVuelta) {
  const idsDelTipo = marcadas.map((p) => p.id)
  const huecosDelTipo = enFrio ? enFrio.huecos.filter((h) => idsDelTipo.indexOf(h.id) !== -1) : []
  const inventosDelTipo = cotejo ? cotejo.inventos.filter((i) => idsDelTipo.indexOf(i.id) !== -1) : []
  const sinContestarDelTipo = contestado
    ? contestado.respuestas.filter((r) => r.veredicto !== 'contestada' && (r.camino ?? []).some((id) => idsDelTipo.indexOf(id) !== -1))
    : []

  return [
    'Carga tu carta `construir-el-registro` antes de medir nada.',
    '',
    `Estas ${clave} del paso "${paso}" salieron marcadas por las mediciones. Devuelvelas corregidas,`,
    'con los mismos `id` de trabajo y la misma forma. Las que no vienen abajo no se tocan.',
    '',
    esLaSegundaVuelta
      ? '**Esta es la segunda y ultima vuelta.** Lo que siga marcado despues se escribe con su marca, no se corrige otra vez.'
      : 'Si algo no se puede arreglar sin preguntarle al experto, dejalo con firmeza `abierto` y su id en `senaladas`.',
    '',
    '--- Lo que marco el lector en frio (no se entiende solo) ---',
    huecosDelTipo.length > 0 ? JSON.stringify(huecosDelTipo, null, 2) : 'nada',
    '',
    '--- Lo que marco el cotejador (no esta dicho) ---',
    inventosDelTipo.length > 0 ? JSON.stringify(inventosDelTipo, null, 2) : 'nada',
    '',
    '--- Lo que quedo sin contestar del examen ---',
    sinContestarDelTipo.length > 0 ? JSON.stringify(sinContestarDelTipo, null, 2) : 'nada',
    '',
    `--- Las ${clave} marcadas ---`,
    JSON.stringify(marcadas, null, 2),
    '',
    '--- Lo que dijo el experto ---',
    loQueDijoElExperto
  ].join('\n')
}

function promptParaRegistrar(paso, registro, senaladas, razones, sinPieza, hora) {
  // La razon viaja pegada a la pieza. Sin ella el escribano tiene la marca y no tiene con que
  // llenar `que-queda-abierto`, y lo deja en «nada» -que es justo lo que su plantilla prohibe.
  const conEstado = (p) => {
    if (senaladas.indexOf(p.id) === -1) return Object.assign({}, p, { estado: 'completa' })
    return Object.assign({}, p, { estado: 'con-huecos', porQueTieneHueco: razones[p.id] ?? ['Una medicion la senalo sin decir por que.'] })
  }
  return [
    `Escribe este registro del paso "${paso}". Ya paso por las tres mediciones.`,
    '',
    'Carga tu carta `registrar-el-conocimiento` antes de escribir nada: ahi viene donde escribes',
    'y con que forma. Despues lee las tres plantillas de `product/conocimiento/*/0000-plantilla.md`:',
    'la forma la mandan ellas, no tu carta.',
    '',
    '**Los `id` que traen son de trabajo.** Numera las carpetas, arma la correspondencia completa,',
    '**traduce tambien los enlaces** -una capacidad que llega apuntando a REG-1 se escribe apuntando',
    'al definitivo- y hasta entonces escribe. Un enlace sin traducir apunta a la nada, o peor, a la',
    'pieza de otra sesion que casualmente tiene ese numero.',
    '',
    '**El `estado` ya viene puesto en cada pieza.** Lo pusieron las mediciones, no tu lectura: una',
    'pieza senalada por cualquier reporte va `con-huecos`, basta uno. No lo cambies.',
    '',
    '**Cada pieza `con-huecos` trae ademas `porQueTieneHueco`**, con lo que dijo el reporte que la',
    'senalo. Eso va copiado en su `<que-queda-abierto>`, debajo de lo que ya trajera. Una pieza',
    '`con-huecos` cuyo `<que-queda-abierto>` diga «nada» no sirve de nada: la sesion siguiente la',
    'encuentra y no sabe que cerrar. **El campo `porQueTieneHueco` no se escribe al archivo** -no',
    'esta en la plantilla-: es de donde sacas el texto.',
    '',
    hora
      ? 'Cada pieza ya trae su `alta` (y su `confirmado` si la firmeza lo pide) estampados abajo.'
      : 'No llego la hora del alta: ninguna pieza trae `alta`. No la inventes - reportalo en `noEscritos`.',
    '',
    sinPieza.length > 0
      ? [
          '**Esto lo senalo una medicion y NO corresponde a ninguna pieza** -son preguntas que el',
          'registro entero no rozaba. No tienen archivo donde marcarse y no son tuyas: pasalas tal',
          'cual en `senalesSinPieza`, sin traducirlas a nada y sin inventar la pieza que faltaria.',
          '',
          JSON.stringify(sinPieza, null, 2)
        ].join('\n')
      : '',
    '',
    '--- Los dominios ---',
    JSON.stringify((registro.dominios ?? []).map(conEstado), null, 2),
    '',
    '--- Los modulos ---',
    JSON.stringify(registro.modulos.map(conEstado), null, 2),
    '',
    '--- Las capacidades ---',
    JSON.stringify(registro.capacidades.map(conEstado), null, 2),
    '',
    '--- Las reglas ---',
    JSON.stringify(registro.reglas.map(conEstado), null, 2)
  ].join('\n')
}

function promptParaAuditar(paso, rutaTranscript, escritos, respuestas, rutaRespuestas) {
  return [
    'Carga tu carta `auditar` antes de abrir nada.',
    '',
    // Medido el 2026-08-04: la primera auditoria de un registro de segunda corrida reporto
    // diecisiete piezas inventadas. No lo estaban -salian de las respuestas del experto, que
    // viajan por `args.respuestas` y nunca llegaban aqui. Quien auditaba buscaba cada frase en la
    // grabacion, no la encontraba, y dictaminaba lo unico que podia con lo que tenia. Un dictamen
    // que miente es peor que ninguno: el siguiente lo va a ignorar.
    respuestas
      ? [
          '**El crudo son DOS cosas en esta corrida.** La grabacion, y ademas lo que el experto',
          `contesto despues, leido de \`${rutaRespuestas}\` -la grabacion se cerro antes de que el`,
          'contestara- y valen exactamente igual: lo que salga de ellas NO es inventado.',
          '',
          '--- Lo que el experto contesto despues ---',
          respuestas,
          ''
        ].join('\n')
      : '',
    `Se acaba de escribir el paso "${paso}" en \`product/conocimiento/\` -las tres carpetas:`,
    '`capacidades/`, `modulos/` y `reglas/`. **Ese es el lugar; no lo adivines y no busques en**',
    '`roadmap/`, que es de otro molino.',
    '',
    rutaTranscript
      ? `El crudo de la sesion esta en \`${rutaTranscript}\`. **Leelo antes de abrir un solo archivo escrito.**`
      : 'No te dieron la ruta del crudo: toma el `.jsonl` mas reciente de la carpeta del proyecto, declara cual usaste, y leelo antes de abrir un solo archivo escrito.',
    '',
    'Estas piezas traen `origen` ademas de firmeza, y las dos marcas se auditan por separado. Lo',
    '`escuchado` se prueba en el crudo como lo inventado; que lo `propuesto` no aparezca en el',
    'crudo NO es falla -es lo que el campo declara.',
    '',
    '--- Lo que se escribio ---',
    JSON.stringify(escritos.archivos, null, 2)
  ].join('\n')
}

function promptParaMarcar(paso, dictamen, hora) {
  return [
    'Carga tu carta `marcar-lo-auditado` antes de abrir nada.',
    '',
    `El paso "${paso}" ya se escribio en \`product/conocimiento/\` y ya se audito contra el crudo.`,
    'Abajo va el dictamen. **Llevalo a los archivos que nombra, y solo a esos.**',
    '',
    'Sin esto el dictamen se imprime y se pierde: el archivo se queda diciendo `completa` aunque el',
    'auditor haya probado que lo que dice nadie lo dijo, y quien lo abra dentro de seis meses se lo',
    'cree. Que la medicion cuente quiere decir que llegue al archivo, no al reporte.',
    '',
    hora
      ? `La hora para el campo \`marcado\` es \`${hora}\`. No la deduzcas.`
      : 'No llego la hora: no marques nada y reportalo. Una hora inventada se ve igual de bien que una real.',
    '',
    '**No borras, no reescribes el cuerpo y no quitas ninguna marca.** El `estado` solo va de',
    '`completa` a `con-huecos`, y lo del auditor se AGREGA al final de `<que-queda-abierto>`,',
    'copiado con sus palabras.',
    '',
    '--- El dictamen ---',
    JSON.stringify(dictamen, null, 2)
  ].join('\n')
}

function promptParaArmarLoQueFalta(paso, escritos, senalesSinPieza) {
  return [
    'Carga tu carta `armar-lo-que-falta` antes de leer nada.',
    '',
    `Se acaba de cerrar el paso "${paso}". Arma la lista de lo que hay que preguntarle al experto`,
    'la proxima vez: es la primera plana de la sesion que viene, no un resumen de esta.',
    '',
    'El registro esta en `product/conocimiento/capacidades/`, `/modulos/` y `/reglas/`. **Recorrelo',
    'con tus herramientas de lectura y busqueda** -un comando escrito para otro sistema operativo',
    'falla callado y devuelve cero, que se lee igual que «no hay huecos».',
    '',
    '**Las tres carpetas guardan todos los pasos, no solo el de hoy.** Separa lo de este paso de lo',
    'que sigue abierto de antes. Un hueco de hace tres semanas que nadie vuelve a nombrar no se',
    'cierra nunca.',
    '',
    senalesSinPieza && senalesSinPieza.length > 0
      ? [
          '**Esto lo senalo una medicion y no quedo marcado en ningun archivo**, porque no habia',
          'pieza que marcar. Es la cuarta fuente de tu carta y se pierde si no la recoges aqui:',
          '',
          JSON.stringify(senalesSinPieza, null, 2)
        ].join('\n')
      : '',
    '',
    '--- Lo que se acaba de escribir ---',
    JSON.stringify(escritos.archivos, null, 2)
  ].join('\n')
}

// --- La corrida ------------------------------------------------------------

const entrada = comoDatos(args)

const paso = entrada.paso ?? 'sin nombre'
const rutaTranscriptPedida = typeof entrada.transcript === 'string' && entrada.transcript.trim() ? entrada.transcript : undefined
const rutaRespuestasPedida = typeof entrada.rutaRespuestas === 'string' && entrada.rutaRespuestas.trim() ? entrada.rutaRespuestas : undefined
const hora = typeof entrada.hora === 'string' && entrada.hora.trim() ? entrada.hora : undefined

// El freno al argumento viejo. `args.respuestas` ya no se acepta: ese texto se tecleaba a mano
// dentro de la llamada, y medido el 2026-08-05 eso rompio la reanudacion del workflow dos veces
// en la misma sesion -un salto de linea de diferencia entre lo tecleado y el archivo cambia el
// prompt y tira el cache de `resumeFromRunId`, obligando a rehacer cuarenta minutos de agentes.
// Ignorarlo en silencio haria que una llamada a la vieja usanza corriera como PRIMERA corrida:
// cuarenta minutos para acabar preguntando lo que el experto ya habia contestado. Por eso para
// aqui, antes de gastar un solo agente.
if (typeof entrada.respuestas === 'string' && entrada.respuestas.trim() && !rutaRespuestasPedida) {
  log('Llego `args.respuestas` con texto y no `rutaRespuestas`. Ese argumento ya no se acepta: manda la ruta del archivo con las respuestas.')
  return { estado: 'sin-respuestas', paso, motivo: 'llego `args.respuestas` en vez de `rutaRespuestas`' }
}

// --- Sacar -----------------------------------------------------------------

// Va al agente y no al propio script porque el script no tiene `fs` ni `process` para abrir un
// archivo o correr un comando; el agente si, con `Bash` y `Read`. Y corre el sacador que ya
// existe en vez de reimplementarlo: dos extractores divergen, y el que diverge en silencio es
// el que nadie mira.

phase('Sacar')

const sacado = await agent(promptParaSacar(rutaTranscriptPedida), {
  label: `sacar:${paso}`,
  phase: 'Sacar',
  agentType: 'auditor',
  schema: SACADO
})

if (!sacado) {
  log('El sacador no contesto. No hay material que moler.')
  return { estado: 'sin-medicion', paso }
}

const platica = sacado.platica ?? ''
const rutaTranscript = sacado.transcriptLeido || rutaTranscriptPedida

if (!platica.trim()) {
  log(`No se pudo sacar la platica: ${sacado.noSePudo || 'el sacador la devolvio vacia sin decir por que'}.`)
  return { estado: 'sin-material', paso, motivo: sacado.noSePudo || 'la platica llego vacia o no llego' }
}

// Las respuestas de una corrida anterior se leen aparte, ya que se sabe que hay platica: es la
// misma llamada de «Sacar», secuencial y con label propio, no otra fase -meta.phases no cambia.
// Solo corre si llego una ruta; sin ella no hay respuestas que leer y la corrida sigue siendo la
// primera.
let respuestas = ''
let rutaRespuestas = rutaRespuestasPedida

if (rutaRespuestasPedida) {
  const respuestasSacadas = await agent(promptParaSacarLasRespuestas(rutaRespuestasPedida), {
    label: `sacar-respuestas:${paso}`,
    phase: 'Sacar',
    agentType: 'auditor',
    schema: RESPUESTAS_SACADAS
  })

  rutaRespuestas = respuestasSacadas?.archivoLeido || rutaRespuestasPedida

  // Para aqui en vez de degradar a primera corrida: es la misma forma que ya usa `sin-material`
  // dos renglones arriba. Degradar en silencio haria que el molino le preguntara al experto lo
  // que ya habia contestado.
  if (!respuestasSacadas || !respuestasSacadas.respuestas.trim()) {
    log(`No se pudieron leer las respuestas: ${respuestasSacadas?.noSePudo || 'el lector las devolvio vacias sin decir por que'}.`)
    return {
      estado: 'sin-respuestas',
      paso,
      motivo: respuestasSacadas?.noSePudo || 'las respuestas llegaron vacias o no llegaron'
    }
  }

  respuestas = respuestasSacadas.respuestas
}

// Las respuestas de una corrida anterior son turno del experto igual que la platica, y valen
// igual como respaldo. Van juntas a todo lo que compara contra lo dicho, para que una pieza que
// sale de sus respuestas no parezca inventada.
const loQueDijoElExperto = respuestas ? `${platica}\n\n--- Lo que el experto contesto despues ---\n${respuestas}` : platica

// Con el texto que devolvio el lector, nunca con la ruta: una ruta cualquiera no basta para que
// la corrida salga `listo` sin que el experto haya contestado nada de verdad.
const segundaCorrida = Boolean(respuestas)

// --- Inventariar -----------------------------------------------------------

// Sin esto, cada paso vuelve a proponer lo mismo con otro numero y el registro se llena de la
// misma regla dicha cinco veces. El molino no puede leer disco -no tiene `fs`-, asi que el indice
// lo trae un agente, igual que la platica. Y es mecanico: aqui no se juzga nada, se lista.
//
// Si falla, la corrida sigue: construir a ciegas produce duplicados, que se pueden juntar despues;
// no construir no produce nada. Pero se dice, para que nadie lea el resultado creyendo que se
// compararon.

phase('Inventariar')

const inventario = await agent(promptParaInventariar(), {
  label: `inventariar:${paso}`,
  phase: 'Inventariar',
  agentType: 'auditor',
  schema: INVENTARIO
})

if (!inventario) {
  log('No se pudo inventariar lo ya escrito. Se construye a ciegas: puede salir repetido lo que ya existe.')
} else if (inventario.noSePudo) {
  log(`El inventario salio incompleto: ${inventario.noSePudo}. Lo que no se leyo puede salir repetido.`)
} else {
  log(`${inventario.piezas.length} pieza(s) ya escritas. Contra eso se compara lo que salga de esta platica.`)
}

// --- Levantar el examen ----------------------------------------------------

// Va antes de construir y no se puede mover. No hay archivo que pruebe despues que el examen se
// levanto primero -el examen no toca disco nunca-: **el orden de estas llamadas es la unica
// garantia.** Un examen escrito con el resultado enfrente pregunta lo que si esta, y el registro
// saca diez de diez sin que nadie haya medido nada.

phase('Levantar el examen')

const examen = await agent(promptParaElExamen(paso, platica), {
  label: `examen:${paso}`,
  phase: 'Levantar el examen',
  agentType: 'auditor',
  schema: EXAMEN
})

if (!examen) {
  log('Nadie levanto el examen. Sin el no hay con que medir lo que se construya.')
  return { estado: 'sin-medicion', paso }
}

if (examen.preguntas.length === 0) {
  log('La platica no dio ninguna pregunta que el registro tenga que contestar. No hay examen que aplicar.')
  return { estado: 'sin-examen', paso }
}

log(`${examen.preguntas.length} pregunta(s) levantadas. Contra eso se va a medir lo que se construya.`)

// --- Construir -------------------------------------------------------------

// Cuatro llamadas, en este orden, y no se pueden paralelizar: cada una cita lo que construyo la
// anterior -las capacidades citan las reglas, los modulos citan las capacidades, los dominios
// citan los modulos. Antes era una sola llamada con el registro completo -7806 caracteres
// serializados-, y el clasificador de seguridad la rechazo en una corrida real: medido el
// 2026-08-04, "Construir" murio con `output schema too large to classify safely`. La primera
// particion en tres dejaba modulos-y-dominios en 3841 caracteres -otra vez arriba del tope-, y se
// volvio a partir: modulos y dominios son dos llamadas, no una.

phase('Construir')

const construidoReglas = await agent(promptParaConstruirReglas(paso, loQueDijoElExperto, examen, segundaCorrida, inventario), {
  label: `construir:reglas:${paso}`,
  phase: 'Construir',
  agentType: 'auditor',
  schema: CONSTRUIR_REGLAS
})

if (!construidoReglas) {
  log('Nadie construyo las reglas. No hay nada que medir ni que escribir.')
  return { estado: 'sin-medicion', paso }
}

const construidoCapacidades = await agent(
  promptParaConstruirCapacidades(paso, loQueDijoElExperto, examen, segundaCorrida, inventario, construidoReglas.reglas),
  { label: `construir:capacidades:${paso}`, phase: 'Construir', agentType: 'auditor', schema: CONSTRUIR_CAPACIDADES }
)

if (!construidoCapacidades) {
  log('Nadie construyo las capacidades. No hay nada que medir ni que escribir.')
  return { estado: 'sin-medicion', paso }
}

// La regla no podia saber que capacidad la iba a citar cuando se construyo -no existia todavia-.
// Ahora que la capacidad SI declaro sus reglas, se invierte el enlace que a la regla le faltaba.
const reglasEnlazadas = conLasCapacidadesEnlazadas(construidoReglas.reglas, construidoCapacidades.capacidades)

const construidoModulos = await agent(
  promptParaConstruirModulos(
    paso, loQueDijoElExperto, examen, segundaCorrida, inventario, construidoCapacidades.capacidades, construidoReglas.reglas
  ),
  { label: `construir:modulos:${paso}`, phase: 'Construir', agentType: 'auditor', schema: CONSTRUIR_MODULOS }
)

if (!construidoModulos) {
  log('Nadie construyo los modulos. No hay nada que medir ni que escribir.')
  return { estado: 'sin-medicion', paso }
}

// La misma inversion un nivel arriba: la capacidad no podia saber que modulo la iba a contener.
const capacidadesEnlazadas = conElModuloEnlazado(construidoCapacidades.capacidades, construidoModulos.modulos)

const construidoDominios = await agent(
  promptParaConstruirDominios(
    paso, loQueDijoElExperto, examen, segundaCorrida, inventario,
    construidoModulos.modulos, construidoCapacidades.capacidades, construidoReglas.reglas
  ),
  { label: `construir:dominios:${paso}`, phase: 'Construir', agentType: 'auditor', schema: CONSTRUIR_DOMINIOS }
)

if (!construidoDominios) {
  log('Nadie construyo los dominios. No hay nada que medir ni que escribir.')
  return { estado: 'sin-medicion', paso }
}

// Y otra vez, un nivel mas arriba: el modulo no podia saber que dominio lo iba a contener.
const modulosEnlazados = conElDominioEnlazado(construidoModulos.modulos, construidoDominios.dominios)

const construido = {
  dominios: construidoDominios.dominios ?? [],
  modulos: modulosEnlazados,
  capacidades: capacidadesEnlazadas,
  reglas: reglasEnlazadas,
  // Solo reglas y capacidades proponen: ahi es donde puede nacer una duda o quedar algo sin
  // cerrar. Modulos y dominios solo agrupan lo que ya existe.
  dudas: (construidoReglas.dudas ?? []).concat(construidoCapacidades.dudas ?? []),
  senaladas: (construidoReglas.senaladas ?? []).concat(construidoCapacidades.senaladas ?? [])
}

// El andon para la linea una vez, no para siempre. Sin tope, cada corrida de respuestas destapa
// dudas nuevas y nunca se escribe nada. Un freno que no se levanta no es freno, es candado. En
// la segunda corrida el codigo ignora las dudas -y el prompt ya le dijo al agente que no las
// devuelva-, porque el agente ya demostro que siempre encuentra una mas.
if (construido.dudas.length > 0 && !segundaCorrida) {
  log(`${construido.dudas.length} duda(s) por cerrar con el experto. No se escribe todavia.`)
  return {
    estado: 'dudas-devueltas',
    paso,
    dudas: construido.dudas,
    registroEnEspera: construido
  }
}

if (todasLasPiezas(construido).length === 0) {
  log('El registro salio vacio: ninguna capacidad, ningun modulo y ninguna regla.')
  return { estado: 'sin-material', paso, motivo: 'el registro salio sin una sola pieza' }
}

let registro = construido

// --- Medir -----------------------------------------------------------------

// Las tres corren a la vez porque son independientes y miran cosas distintas: el que lee en frio
// no tiene con que comparar, el que coteja tiene la platica, y el que contesta el examen tiene
// las preguntas que se levantaron antes de que existiera una sola pieza. En fila tardarian la
// suma; juntas, lo que la mas lenta.
//
// Se usa `Promise.all` y no el `parallel()` del harness a proposito: asi el molino corre con
// solo los cuatro identificadores que el runtime inyecta -args, agent, log, phase- y se puede
// ejecutar entero desde una prueba sin montar el resto de la maquinaria.

phase('Medir')

const [primeraLectura, primerCotejo, primerExamen] = await Promise.all([
  agent(promptParaElLector(registro), { label: 'leer-en-frio:primera', phase: 'Medir', agentType: 'auditor', schema: LECTURA_EN_FRIO }),
  agent(promptParaElCotejador(registro, loQueDijoElExperto), { label: 'cotejar:primera', phase: 'Medir', agentType: 'auditor', schema: COTEJO }),
  agent(promptParaContestarElExamen(registro, examen), { label: 'contestar-examen:primera', phase: 'Medir', agentType: 'auditor', schema: EXAMEN_CONTESTADO })
])

let enFrio = primeraLectura
let cotejo = primerCotejo
let contestado = primerExamen

// --- Corregir --------------------------------------------------------------

// Dos vueltas y ya. **El tope lo impone el codigo, no el agente:** sin tope, cada revision
// encuentra algo mas y no se escribe nunca. Lo que siga marcado despues de la segunda se escribe
// con su marca -escrito no es lo mismo que listo, y para eso existe el campo `estado`.
//
// Cada vuelta ya no es una llamada: es hasta cuatro, una por tipo, y solo por los tipos que
// tengan algo marcado -antes una sola llamada mandaba el registro completo con su esquema
// `REGISTRO`. `piezasDelTipoMarcadas` separa por de que arreglo salio la pieza, no por el
// prefijo de su id.

const marcadasVuelta1 = idsSenalados([], primeraLectura, primerCotejo, primerExamen)

if (marcadasVuelta1.length > 0) {
  log(`${marcadasVuelta1.length} pieza(s) marcadas por las mediciones: una vuelta para corregirlas.`)

  phase('Corregir')

  let seCorrigioAlgoVuelta1 = false

  for (const { tipo, clave, schema } of TIPOS_DE_PIEZA) {
    const marcadasDelTipo = piezasDelTipoMarcadas(registro, tipo, marcadasVuelta1)
    if (marcadasDelTipo.length === 0) continue

    const corregido = await agent(
      promptParaCorregir(paso, loQueDijoElExperto, clave, marcadasDelTipo, primeraLectura, primerCotejo, primerExamen, false),
      { label: `corregir:vuelta-1:${clave}:${paso}`, phase: 'Corregir', agentType: 'auditor', schema }
    )

    if (corregido) {
      registro = conLaCorreccionAplicada(registro, corregido)
      seCorrigioAlgoVuelta1 = true
    }
  }

  if (seCorrigioAlgoVuelta1) {
    phase('Medir')

    const [segundaLectura, segundoCotejo, segundoExamen] = await Promise.all([
      agent(promptParaElLector(registro), { label: 'leer-en-frio:segunda', phase: 'Medir', agentType: 'auditor', schema: LECTURA_EN_FRIO }),
      agent(promptParaElCotejador(registro, loQueDijoElExperto), { label: 'cotejar:segunda', phase: 'Medir', agentType: 'auditor', schema: COTEJO }),
      agent(promptParaContestarElExamen(registro, examen), { label: 'contestar-examen:segunda', phase: 'Medir', agentType: 'auditor', schema: EXAMEN_CONTESTADO })
    ])

    enFrio = segundaLectura ?? enFrio
    cotejo = segundoCotejo ?? cotejo
    contestado = segundoExamen ?? contestado

    // La segunda vuelta va SOLO por lo que el cotejador siga marcando. Lo que no se entiende
    // solo y lo que el examen no contesta se registran como hueco y se cierran con el experto en
    // la sesion siguiente; una frase que nadie dijo, no: esa no se arregla preguntando despues,
    // y mientras siga escrita se lee como respaldada.
    const inventosVuelta2 = segundoCotejo ? segundoCotejo.inventos.map((i) => i.id) : []

    if (inventosVuelta2.length > 0) {
      log(`${inventosVuelta2.length} pieza(s) siguen con algo que nadie dijo: segunda y ultima vuelta.`)

      phase('Corregir')

      let seCorrigioAlgoVuelta2 = false

      for (const { tipo, clave, schema } of TIPOS_DE_PIEZA) {
        const marcadasDelTipo = piezasDelTipoMarcadas(registro, tipo, inventosVuelta2)
        if (marcadasDelTipo.length === 0) continue

        const recorregido = await agent(
          promptParaCorregir(paso, loQueDijoElExperto, clave, marcadasDelTipo, null, segundoCotejo, null, true),
          { label: `corregir:vuelta-2:${clave}:${paso}`, phase: 'Corregir', agentType: 'auditor', schema }
        )

        if (recorregido) {
          registro = conLaCorreccionAplicada(registro, recorregido)
          seCorrigioAlgoVuelta2 = true
        }
      }

      if (seCorrigioAlgoVuelta2) {
        phase('Medir')

        const tercerCotejo = await agent(promptParaElCotejador(registro, loQueDijoElExperto), {
          label: 'cotejar:tercera',
          phase: 'Medir',
          agentType: 'auditor',
          schema: COTEJO
        })

        cotejo = tercerCotejo ?? cotejo
      }
    }
  }
}

// --- Registrar -------------------------------------------------------------

const senaladas = idsSenalados(registro.senaladas, enFrio, cotejo, contestado)
const razones = razonesPorId(registro, enFrio, cotejo, contestado)
const sinPieza = contestado ? contestado.sinPieza : []

const registroEstampado = {
  dominios: (registro.dominios ?? []).map((p) => conElPasoYLaHora(p, paso, hora)),
  capacidades: registro.capacidades.map((p) => conElPasoYLaHora(p, paso, hora)),
  modulos: registro.modulos.map((p) => conElPasoYLaHora(p, paso, hora)),
  reglas: registro.reglas.map((p) => conElPasoYLaHora(p, paso, hora))
}

phase('Registrar')

const escritos = await agent(promptParaRegistrar(paso, registroEstampado, senaladas, razones, sinPieza, hora), {
  label: `registrar:${paso}`,
  phase: 'Registrar',
  agentType: 'escribano',
  schema: ESCRITOS
})

if (!escritos) {
  log('El escribano no reporto. No se sabe que quedo escrito ni que no.')
  return { estado: 'sin-registro', paso, registro: registroEstampado, senaladas }
}

// --- Auditar ---------------------------------------------------------------

phase('Auditar')

const dictamen = await agent(promptParaAuditar(paso, rutaTranscript, escritos, respuestas, rutaRespuestas), {
  label: `auditar:${paso}`,
  phase: 'Auditar',
  agentType: 'auditor',
  schema: DICTAMEN
})

// --- Marcar ----------------------------------------------------------------

// Aqui el dictamen llega al archivo. Sin esta fase se imprime y se pierde: el archivo se queda
// diciendo `completa` aunque el auditor haya probado que lo que dice nadie lo dijo. Es el defecto
// del 2026-07-31 -una medicion que no cuenta es una medicion que no se hizo- y el 2026-08-04 se
// volvio a cometer con el dictamen ya contado para el estado de salida, pero sin nadie que pudiera
// tocar los archivos.
//
// Solo corre si hay algo que marcar. Un dictamen limpio no manda a nadie a abrir treinta archivos.

const fallasQueMarcar = dictamen ? dictamen.inventado.concat(dictamen.perdido, dictamen.malMarcado) : []
let marcado = null

if (dictamen && (fallasQueMarcar.length > 0 || dictamen.sirve === false)) {
  phase('Marcar')

  marcado = await agent(promptParaMarcar(paso, dictamen, hora), {
    label: `marcar:${paso}`,
    phase: 'Marcar',
    agentType: 'escribano',
    schema: MARCADO
  })

  if (!marcado) {
    log('El dictamen encontro fallas y nadie las marco en los archivos. Lo escrito se lee como si estuviera bien.')
  }
}

// --- Armar lo que falta ----------------------------------------------------

phase('Armar lo que falta')

// Lo perdido que encontro el auditor tampoco tiene archivo donde marcarse -por eso se perdio-, asi
// que se junta aqui con las preguntas que ninguna pieza rozaba. Las dos se pierden si nadie las
// recoge en la lista que abre la sesion siguiente.
const sinDondeMarcarse = (escritos.senalesSinPieza ?? sinPieza).concat(marcado ? marcado.perdido : [])

const loQueFalta = await agent(promptParaArmarLoQueFalta(paso, escritos, sinDondeMarcarse), {
  label: `falta:${paso}`,
  phase: 'Armar lo que falta',
  agentType: 'auditor',
  schema: LO_QUE_FALTA
})

// --- Lo que se dice al cerrar ----------------------------------------------

// El «no sirve» es la cuarta falla del auditor y cuenta como las otras tres. Medido el
// 2026-07-31: el auditor ya contestaba la pregunta del final -si le alcanza a alguien que no
// estuvo- y la suma la ignoraba, asi que un dictamen «no sirve» salia impreso como «sin fallas»
// y el estado como «listo». Diecisiete de cincuenta y nueve items quedaron mal y nadie se
// entero. Una medicion que no cuenta es una medicion que no se hizo.

// El estado NO se deriva solo de lo que reporto el escribano. El molino ya sabe que piezas
// senalaron las mediciones, y si el reporte no las trae marcadas, la marca se perdio en el
// camino. Manda la medicion, no el reporte: es la misma leccion del 2026-07-31, cuando un
// dictamen «no sirve» salio impreso como «sin fallas» porque nadie lo sumo.
const conHuecos = escritos.archivos.filter((a) => a.estado === 'con-huecos')
const senaladasSinMarcar = senaladas.filter((id) => !escritos.archivos.some((a) => a.idDeTrabajo === id && a.estado === 'con-huecos'))
const fallasDelCrudo = dictamen ? dictamen.inventado.length + dictamen.perdido.length + dictamen.malMarcado.length : null
const noSirve = dictamen ? dictamen.sirve === false : false
const preguntasSinPieza = escritos.senalesSinPieza ?? sinPieza

// Los agentes que no contestan se nombran uno por uno. Un silencio no es una aprobacion, y cada
// uno de estos mide algo que ningun otro alcanza.
if (!enFrio) log('El lector en frio no contesto. Nadie leyo las piezas como el que no estuvo.')
if (!cotejo) log('El cotejador no contesto. Nadie coteja lo escuchado contra la platica.')
if (!contestado) log('Nadie contesto el examen. El registro queda sin medir contra lo que se levanto antes.')
if (!dictamen) log('El auditor no dictamino. Lo escrito queda sin medir contra el crudo.')
if (!loQueFalta) log('Nadie armo lo que falta preguntar. La sesion siguiente abre sin primera plana.')

log(`Paso "${paso}": ${escritos.archivos.length} pieza(s) escrita(s), ${conHuecos.length} con huecos.`)

if (fallasDelCrudo !== null && fallasDelCrudo > 0) {
  log(`El auditor encontro ${fallasDelCrudo} falla(s) contra el crudo.`)
}

if (noSirve) {
  log(`No le alcanza a quien no estuvo: ${dictamen.porque}`)
}

if (marcado) {
  log(`${marcado.marcados.length} archivo(s) quedaron marcados con lo que encontro la auditoria.`)
  if (marcado.perdido.length > 0) {
    log(`${marcado.perdido.length} cosa(s) se dijeron y no quedaron escritas. No tienen archivo que marcar: van a lo que falta preguntar.`)
  }
  if ((marcado.noSePudo ?? []).length > 0) {
    log(`${marcado.noSePudo.length} archivo(s) que el dictamen nombraba no se pudieron abrir:`)
    for (const n of marcado.noSePudo) log(`  ${n}`)
  }
}

for (const a of conHuecos) {
  log(`  ${a.ruta} — con huecos`)
}

if (escritos.noEscritos.length > 0) {
  log(`${escritos.noEscritos.length} pieza(s) no se pudieron escribir:`)
  for (const n of escritos.noEscritos) log(`  ${n}`)
}

if (preguntasSinPieza.length > 0) {
  log(`${preguntasSinPieza.length} pregunta(s) del examen no las rozaba ninguna pieza. Van a lo que falta preguntar.`)
}

if (senaladasSinMarcar.length > 0) {
  log(`${senaladasSinMarcar.length} pieza(s) las senalo una medicion y no quedaron marcadas en disco: ${senaladasSinMarcar.join(', ')}.`)
}

return {
  // Escrito no es lo mismo que listo. Si algo quedo marcado, el paso cierra con huecos, y de ese
  // estado no se deriva nada rio abajo hasta que se cierren. Cuenta lo que midieron las
  // mediciones aunque el reporte del escribano no lo traiga: una senal que no llego al archivo
  // sigue siendo una senal, y perderla aqui la perderia para siempre.
  estado: senaladas.length > 0 || conHuecos.length > 0 || noSirve || (fallasDelCrudo ?? 0) > 0 ? 'con-huecos' : 'listo',
  paso,
  archivos: escritos.archivos,
  noEscritos: escritos.noEscritos,
  conHuecos: conHuecos.map((a) => a.id),
  senaladasSinMarcar,
  loQueFalta,
  dictamen,
  marcado,
  enFrio,
  cotejo,
  contestado
}
