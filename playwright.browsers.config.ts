import { defineConfig, devices } from '@playwright/test';

import basis from './playwright.config';

/**
 * Vor jedem Deploy von Hand: dieselben Tests in WebKit (Safaris Engine, im
 * iPhone-Profil) und Firefox. WebKit ist nicht iOS; ein echtes iPhone bleibt
 * Handarbeit. Aufruf: bun run test:e2e:browsers
 */
export default defineConfig({
  ...basis,
  projects: [
    {
      name: 'iphone-webkit',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'webkit', browserName: 'webkit' },
    },
    {
      name: 'firefox-desktop',
      use: {
        browserName: 'firefox',
        viewport: { width: 1280, height: 800 },
        launchOptions: { firefoxUserPrefs: { 'accessibility.tabfocus': 7 } },
      },
    },
  ],
});
