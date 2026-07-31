import { join } from 'node:path'
import { access } from 'node:fs/promises'
import { app, BrowserWindow, ipcMain } from 'electron'
import { CANAL } from '../contratos/mensajes'
import { revisarRepo } from '../nucleo/salud-del-repo'

/**
 * El mundo que si puede abrir archivos y lanzar procesos.
 * La pantalla nunca llega hasta aqui sin pasar por un mensaje con nombre.
 */

function crearVentana(): void {
  const ventana = new BrowserWindow({
    width: 1180,
    height: 800,
    show: false,
    title: 'Nemawashi',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  ventana.on('ready-to-show', () => ventana.show())

  const enDesarrollo = process.env['ELECTRON_RENDERER_URL']
  if (enDesarrollo) {
    void ventana.loadURL(enDesarrollo)
  } else {
    void ventana.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/** El adaptador: aqui se mide el disco, y el nucleo decide que significa. */
async function tieneGitattributes(ruta: string): Promise<boolean> {
  try {
    await access(join(ruta, '.gitattributes'))
    return true
  } catch {
    return false
  }
}

app.whenReady().then(() => {
  ipcMain.handle(CANAL.version, () => app.getVersion())

  ipcMain.handle(CANAL.revisarRepo, async (_evento, ruta: string) =>
    revisarRepo({ ruta, tieneGitattributes: await tieneGitattributes(ruta) })
  )

  crearVentana()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
