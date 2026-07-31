import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    // Capas 1, 2 y 3. Abrir la app entera es cosa de Playwright, no de aqui.
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Por defecto sin pantalla: las pruebas de componente piden happy-dom con un
    // comentario al inicio del archivo, para que la capa 1 no pague ese costo.
    environment: 'node'
  }
})
