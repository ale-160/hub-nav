import { defineConfig, devices } from '@playwright/test';

/**
 * E2E 冒烟测试配置
 * 针对静态导出站点：先 `npm run build` 生成 out/，再用 serve 起本地服务测试
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    // 固定英文语言环境，避免 / 路由的 ClientRedirect 按浏览器语言跳转到 /zh
    locale: 'en-US',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npx serve out -l 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
