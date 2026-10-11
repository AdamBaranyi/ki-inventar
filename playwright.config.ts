import { defineConfig } from '@playwright/test';

const PORT = 4300;
const IN_CI = Boolean(process.env['CI']);

/**
 * Prüft den gebauten Stand (bun run build) hinter einem Server, der sich wie
 * GitHub Pages verhält. Drei Breiten: kleines iPhone, iPhone mit eingeblendeten
 * Leisten von Safari (sichtbar rund 660 px hoch) und Desktop.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: IN_CI,
  retries: IN_CI ? 1 : 0,
  workers: IN_CI ? 2 : undefined,
  reporter: IN_CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}/ki-inventar/`,
    locale: 'de-CH',
    timezoneId: 'Europe/Zurich',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'handy-375',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'handy-390',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 660 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
    {
      name: 'desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: `node scripts/server.mjs ${PORT}`,
    url: `http://localhost:${PORT}/ki-inventar/`,
    reuseExistingServer: !IN_CI,
  },
});
