import { defineConfig } from '@playwright/test'

const PORT = 4173

export default defineConfig({
  testDir: 'tests',
  timeout: 120_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/React-Presentation/`,
    browserName: 'chromium',
  },
  projects: [
    { name: '1920x1080', use: { viewport: { width: 1920, height: 1080 } } },
    { name: '1280x800', use: { viewport: { width: 1280, height: 800 } } },
    { name: '1024x768', use: { viewport: { width: 1024, height: 768 } } },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/React-Presentation/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
