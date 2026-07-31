/**
 * La lista corta y explicita de mensajes con nombre.
 *
 * La pantalla no toca archivos ni procesos, nunca. Todo lo que la app puede hacer
 * pasa por aqui — por eso esta lista es la mejor pagina de revision de toda la app:
 * si algo no esta escrito aqui, la pantalla no lo puede pedir.
 *
 * Sin comportamiento: aqui solo va la forma. Si aparece un `if` o una cuenta, esta
 * en el archivo equivocado.
 */

import type { ClaveDeAviso } from '../nucleo/salud-del-repo'

export type Mensajes = {
  /** Version de la app. El mensaje mas barato que prueba que la pared funciona. */
  version: () => Promise<string>
  /**
   * Revisa la salud del repositorio elegido. Solo lee: no escribe nada.
   *
   * Devuelve **claves**, no palabras: por la pared viaja que aviso aplica, y quien lo
   * convierte en texto es la pantalla, con su modulo de textos.
   */
  revisarRepo: (ruta: string) => Promise<ClaveDeAviso[]>
}

export type NombreDeMensaje = keyof Mensajes

/**
 * El nombre del canal por el que viaja cada mensaje. Los dos lados de la pared lo toman
 * de aqui: escrito a mano en cada lado son dos cadenas que pueden divergir sin que nadie
 * lo note, porque ninguna de las dos mira a la otra.
 *
 * El canal se llama igual que el mensaje, y eso lo sostiene el tipo: una letra de mas en
 * el nombre o en el valor no compila.
 */
export const CANAL = {
  version: 'version',
  revisarRepo: 'revisarRepo'
} as const satisfies { [N in NombreDeMensaje]: N }
