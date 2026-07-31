import type { ClaveDeAviso } from '../../nucleo/salud-del-repo'

/**
 * El modulo de textos: todo lo que la pantalla pone en palabras sale de aqui.
 *
 * `arquitectura-diseno.md` §3 punto 2 — ningun texto visible se escribe dentro de un
 * componente. Un texto tecleado dentro del JSX es una copia que nadie compara contra
 * nada, y ademas obliga a abrir los componentes uno por uno para revisar la voz.
 *
 * **Vive en la pantalla, y no es una tercera pieza compartida.** §2.4 concede dos y solo
 * dos: los contratos y el acceso al repo. Redactar es presentacion, y la presentacion es
 * el adaptador de interfaz — asi que este archivo es suyo, como lo son sus componentes.
 * El nucleo no lo importa ni lo necesita: devuelve claves y no sabe que palabras las
 * visten.
 *
 * La voz la gobierna `arquitectura-diseno.md` §2.D: la ayuda explica la consecuencia, el
 * error dice que paso y que hacer, y no entra jerga de la maquina.
 */

/** Un aviso ya vestido de palabras: lo que el titulo dice, y lo que el detalle explica. */
export type TextoDeAviso = {
  titulo: string
  detalle: string
}

/**
 * Las palabras de cada aviso de salud del repositorio.
 *
 * El nucleo decide **cual** aviso aplica; aqui se decide **como se dice**. Que no falte
 * ninguno lo sostiene el tipo —una clave nueva sin palabras no compila— y lo confirma
 * `textos.test.ts`, que ademas atrapa lo que el tipo no ve: un texto vacio.
 *
 * Ninguno promete arreglar nada: Nemawashi senala y quien decide es el dueno del
 * repositorio. Arreglarlo seria escribir en el repo del cliente, que es justo lo que la
 * cualidad «no invadir» prohibe.
 */
export const TEXTOS_DE_AVISO: Record<ClaveDeAviso, TextoDeAviso> = {
  'carpeta-sincronizada': {
    titulo: 'Este repositorio esta dentro de una carpeta que se sincroniza sola.',
    detalle:
      'La sincronizacion puede duplicar items, resucitar los borrados y danar el historial. ' +
      'Muevelo fuera antes de empezar una sesion.'
  },
  'unidad-de-red': {
    titulo: 'Este repositorio vive en una unidad de red.',
    detalle:
      'Trabajar sobre red hace lentas las lecturas y deja el historial a merced de la conexion.'
  },
  'ruta-larga': {
    titulo: 'La ruta de este repositorio es muy larga.',
    detalle:
      'Windows corta en 260 caracteres por defecto. Los archivos mas hondos van a fallar al escribirse.'
  },
  'sin-gitattributes': {
    titulo: 'Este repositorio no fija el fin de linea.',
    detalle:
      'Sin eso, un cambio de una palabra se ve como si hubiera cambiado el archivo entero, ' +
      'y el historial deja de servir como memoria del proyecto. ' +
      'Nemawashi no lo escribe por ti: el arreglo va en el repositorio, y es tuyo.'
  }
}

/**
 * Las palabras del andamio de la ventana.
 *
 * Se llama andamio y no pantalla porque eso es: existe para que la ventana abra y para
 * que haya algo que mirar. La pantalla de arranque se diseno en
 * `design/pantallas/elegir-repositorio.html` y todavia no se implementa — cuando llegue,
 * este bloque muere con el andamio.
 */
export const TEXTOS_DEL_ANDAMIO = {
  nombre: 'Nemawashi',
  cargando: 'cargando…',
  version: (numero: string) => `version ${numero}`
}
