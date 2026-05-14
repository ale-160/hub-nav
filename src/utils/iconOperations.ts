/**
 * 图标操作工具函数
 * 
 * 提供图标相关的纯函数操作，避免在多个 Hook 中重复实现
 */

import type { IconItem, Page, UserConfig } from './config/types';

/**
 * 从所有页面中移除指定的图标 ID
 * @param pages - 页面列表
 * @param iconId - 要移除的图标 ID
 * @returns 更新后的页面列表
 */
export function removeIconFromAllPages(pages: Page[], iconId: string): Page[] {
  return pages.map(page => ({
    ...page,
    iconIds: page.iconIds.filter(id => id !== iconId)
  }));
}

/**
 * 从图标列表中删除指定图标
 * @param icons - 图标列表
 * @param iconId - 要删除的图标 ID
 * @returns 更新后的图标列表
 */
export function removeIconFromList(icons: IconItem[], iconId: string): IconItem[] {
  return icons.filter(icon => icon.id !== iconId);
}

/**
 * 删除图标并清理所有页面引用
 * @param config - 当前配置
 * @param iconId - 要删除的图标 ID
 * @returns 更新后的配置
 */
export function deleteIconFromConfig(config: UserConfig, iconId: string): UserConfig {
  // 从所有页面中移除该图标 ID
  const newPages = removeIconFromAllPages(config.pages, iconId);
  
  // 从图标列表中移除
  const newIcons = removeIconFromList(config.icons, iconId);

  return {
    ...config,
    icons: newIcons,
    pages: newPages
  };
}
