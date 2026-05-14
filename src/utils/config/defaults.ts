/**
 * 配置默认值填充工具
 * 
 * 为导入的配置数据自动补全缺失字段，确保数据结构完整性
 */

import type {
  IconItem,
  FolderItem,
  Page,
  UserConfig,
  ThemeSettings,
  LayoutSettings,
  OperationModeSettings
} from './types';
import { CURRENT_VERSION } from './version';

/**
 * 填充图标项的默认值
 * @param icon - 部分图标数据
 * @returns 完整的图标项
 */
export function fillIconDefaults(icon: Partial<IconItem>): IconItem {
  return {
    id: icon.id || `icon-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name: icon.name || '未命名',
    url: icon.url || '',
    iconUrl: icon.iconUrl,
    folderId: icon.folderId,
    order: icon.order ?? 0,
    isHidden: icon.isHidden ?? false,
    iconType: icon.iconType ?? 'favicon',
    builtinIcon: icon.builtinIcon,
    customIconUrl: icon.customIconUrl,
    customColor: icon.customColor,
    _ext: icon._ext
  };
}

/**
 * 填充文件夹项的默认值
 * @param folder - 部分文件夹数据
 * @returns 完整的文件夹项
 */
export function fillFolderDefaults(folder: Partial<FolderItem>): FolderItem {
  return {
    id: folder.id || `folder-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name: folder.name || '新文件夹',
    parentId: folder.parentId,
    order: folder.order ?? 0,
    _ext: folder._ext
  };
}

/**
 * 填充页面的默认值
 * @param page - 部分页面数据
 * @returns 完整的页面
 */
export function fillPageDefaults(page: Partial<Page>): Page {
  return {
    id: page.id || `page-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    name: page.name || '新页面',
    iconIds: page.iconIds ?? [],
    _ext: page._ext
  };
}

/**
 * 填充主题设置的默认值
 * @param theme - 部分主题设置
 * @returns 完整的主题设置
 */
export function fillThemeDefaults(theme: Partial<ThemeSettings>): ThemeSettings {
  return {
    mode: theme.mode ?? 'light',
    primaryColor: theme.primaryColor ?? '#3b82f6',
    wallpaperUrl: theme.wallpaperUrl,
    iconSize: theme.iconSize ?? 'medium',
    gridSpacing: theme.gridSpacing ?? 16,
    fontColor: theme.fontColor,
    language: theme.language ?? 'zh',
    extensions: theme.extensions
  };
}

/**
 * 填充布局设置的默认值
 * @param layout - 部分布局设置
 * @returns 完整的布局设置
 */
export function fillLayoutDefaults(layout: Partial<LayoutSettings>): LayoutSettings {
  return {
    columns: layout.columns ?? 5,
    rows: layout.rows ?? 4,
    extensions: layout.extensions
  };
}

/**
 * 填充操作模式设置的默认值
 * @param mode - 部分操作模式设置
 * @returns 完整的操作模式设置
 */
export function fillOperationModeDefaults(
  mode?: Partial<OperationModeSettings>
): OperationModeSettings {
  return {
    mode: mode?.mode ?? 'hybrid',
    openMethod: mode?.openMethod ?? 'click',
    menuTrigger: mode?.menuTrigger ?? 'rightClick',
    showAddButton: mode?.showAddButton ?? true,
    extensions: mode?.extensions
  };
}

/**
 * 获取默认配置
 * @returns 默认的用户配置对象
 */
export function getDefaultConfig(): UserConfig {
  return fillConfigDefaults({});
}

/**
 * 填充配置的默认值
 * @param config - 部分配置数据
 * @returns 完整的用户配置
 */
export function fillConfigDefaults(config: Partial<UserConfig>): UserConfig {
  return {
    layout: fillLayoutDefaults(config.layout ?? {}),
    theme: fillThemeDefaults(config.theme ?? {}),
    icons: (config.icons ?? []).map(fillIconDefaults),
    folders: (config.folders ?? []).map(fillFolderDefaults),
    pages: (config.pages ?? []).map(fillPageDefaults),
    rootOrder: config.rootOrder ?? [],
    version: config.version ?? CURRENT_VERSION,
    searchEngine: config.searchEngine ?? 'https://www.bing.com/search?q=',
    operationMode: fillOperationModeDefaults(config.operationMode),
    _meta: config._meta,
    _ext: config._ext
  };
}

/**
 * 应用默认值到配置数据
 * 如果数据无效，返回默认配置
 * @param data - 待处理的配置数据
 * @returns 完整的用户配置
 */
export function applyDefaults(data: unknown): UserConfig {
  if (!data || typeof data !== 'object') {
    return getDefaultConfig();
  }
  return fillConfigDefaults(data as Partial<UserConfig>);
}
