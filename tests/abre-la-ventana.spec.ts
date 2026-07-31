import { test, expect, _electron as electron } from '@playwright/test'

/**
 * La prueba de que la app arranca de verdad y de que la pared deja pasar lo que debe.
 *
 * Busca por lo que un lector de pantalla anunciaria —el nombre, no la posicion en el
 * codigo— para que la prueba quede atada a lo que si existe para una persona.
 *
 * Que la pared *no* deje pasar lo que no debe se mide en capa 2, en
 * `src/contratos/la-pared-entre-los-dos-mundos.test.ts`: es un hecho escrito en la
 * configuracion de la ventana, y desde aqui solo se podia comprobar que un simbolo
 * concreto no existiera — cosa que sigue siendo cierta aunque la pared se caiga entera.
 */

test('la app abre una ventana y la pantalla puede pedir la version', async () => {
  const app = await electron.launch({ args: ['.'] })
  const ventana = await app.firstWindow()

  await expect(ventana.getByRole('heading', { name: 'Nemawashi' })).toBeVisible()
  await expect(ventana.getByText(/^version /)).toBeVisible()

  await app.close()
})
