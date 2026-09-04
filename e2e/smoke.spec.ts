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

test('搜索框可输入并清空', async ({ page }) => {
  await page.goto('/');
  await dismissWelcome(page);

  const searchInput = page.getByPlaceholder(/search icons or urls/i);
  await searchInput.fill('github');
  await expect(searchInput).toHaveValue('github');

  await searchInput.clear();
  await expect(searchInput).toHaveValue('');
  // 清空后主导航区域仍正常渲染（无崩溃）
  await expect(page.getByRole('banner')).toBeVisible();
});

test('主题切换按钮可切换明暗模式', async ({ page }) => {
  await page.goto('/');
  await dismissWelcome(page);
  await expect(page.getByRole('banner')).toBeVisible();

  const htmlClass = () => page.evaluate(() => document.documentElement.className);
  const before = await htmlClass();

  await page.getByTitle(/toggle theme/i).click();
  // @wrksz/themes 以 class 形式挂载明暗模式，点击后 html class 应变化
  await expect.poll(htmlClass, { timeout: 5_000 }).not.toBe(before);
});

test('设置面板可打开', async ({ page }) => {
  await page.goto('/');
  await dismissWelcome(page);
  await expect(page.getByRole('banner')).toBeVisible();

  await page.getByTitle('Settings').click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('帮助面板可打开', async ({ page }) => {
  await page.goto('/');
  await dismissWelcome(page);
  await expect(page.getByRole('banner')).toBeVisible();

  await page.getByTitle('Help').click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
