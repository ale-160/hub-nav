import { test, expect, Page } from '@playwright/test';

/**
 * 首次访问会出现 "Welcome" 初始化弹窗，点击默认配置按钮跳过
 * 注意：SetupGuide 是动态导入的，弹窗可能晚于首屏渲染，必须先等待其出现，
 * 否则背景内容带有 aria-hidden，role 选择器（如 banner）无法命中。
 */
async function dismissWelcome(page: Page) {
  const welcome = page.getByRole('dialog', { name: /welcome|欢迎/i });
  try {
    await welcome.waitFor({ state: 'visible', timeout: 10_000 });
    await welcome.getByRole('button', { name: /default configuration|默认配置/i }).click();
  } catch {
    // 无引导弹窗时直接继续
  }
}

test('首页正常渲染核心元素', async ({ page }) => {
  await page.goto('/');
  await dismissWelcome(page);

  // 页面标题应包含 hub-nav
  await expect(page).toHaveTitle(/hub-nav/i);

  // 搜索框存在且可见，placeholder 正确
  const searchInput = page.getByPlaceholder(/search icons or urls/i);
  await expect(searchInput).toBeVisible();
});

test('中文路径可访问', async ({ page }) => {
  await page.goto('/zh');
  await dismissWelcome(page);

  // /zh 路由的 metadata 标题固定为中文，不随语言偏好变化
  await expect(page).toHaveTitle(/美观的浏览器主页|美观/);

  // 页面能正常渲染出主导航区域
  await expect(page.getByRole('banner')).toBeVisible();
});
