import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // Una app de escritorio: una sola instancia a la vez.
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: { trace: 'retain-on-failure' }
})
