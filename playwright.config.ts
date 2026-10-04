import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', timeout: 30000, fullyParallel: false,
  use: { baseURL: 'http://localhost:3100', trace: 'off', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run build && PORT=3100 APP_ORIGIN=http://localhost:3100 NODE_ENV=test npm start', url: 'http://localhost:3100/healthz', reuseExistingServer: false },
  projects: [{ name: 'desktop', use: { viewport: { width: 1280, height: 900 } } }, { name: 'mobile', use: { viewport: { width: 390, height: 844 } } }],
});
