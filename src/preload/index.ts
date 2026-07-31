import { contextBridge, ipcRenderer } from 'electron'
import { CANAL, type Mensajes } from '../contratos/mensajes'

/**
 * La pared. Lo unico que la pantalla alcanza del otro mundo es lo que se cuelga aqui,
 * y lo que se cuelga aqui es exactamente la lista de `contratos/mensajes`.
 *
 * El nombre del canal tambien sale de esa lista: escrito a mano aqui seria una cadena
 * que nadie compara con la del otro lado.
 */

const nemawashi: Mensajes = {
  version: () => ipcRenderer.invoke(CANAL.version),
  revisarRepo: (ruta) => ipcRenderer.invoke(CANAL.revisarRepo, ruta)
}

contextBridge.exposeInMainWorld('nemawashi', nemawashi)
