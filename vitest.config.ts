import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * 单元测试配置（Vitest）
 * 覆盖纯函数模块：src/utils、src/lib（不依赖浏览器 DOM）。
 * E2E 仍由 Playwright 负责（见 playwright.config.ts）。
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
