/**
 * 配置导出功能
 * 
 * 将用户配置导出为带有元数据的标准格式
 */

import type { UserConfig, ExportedConfig, ExportMeta, IconItem } from './types';
import { CURRENT_VERSION } from './version';
import { extractDomain } from '@/utils/url';
import { generateFaviconCandidates } from '@/utils/favicon-strategies';
import { ConfigManager } from '@/lib/configManager';

/**
 * 创建导出元数据
 * @param config - 用户配置
 * @returns 导出元数据
 */
function createExportMeta(config: UserConfig): ExportMeta {
  return {
    exportedAt: new Date().toISOString(),
    appVersion: CURRENT_VERSION,
    schemaVersion: CURRENT_VERSION,
    previousVersion: config.version,
    migratedAt: undefined
  };
}

/**
 * 为 favicon 类型的图标填充 iconUrl
 * 
 * 导出时，即使是 favicon 模式的图标也存储实际使用的图标 URL，
 * 这样导入后不需要重新动态获取，避免大量网络请求
 */
function enrichIconsForExport(icons: IconItem[]): IconItem[] {
  return icons.map(icon => {
    // 只处理 favicon 类型且没有 iconUrl 的图标
    const iconType = icon.iconType || 'favicon';
    if (iconType !== 'favicon' || icon.iconUrl) {
      return icon;
    }

    const domain = extractDomain(icon.url);
    if (!domain) return icon;

    // 优先从缓存获取
    const cachedIcon = ConfigManager.getCachedIcon(domain);
    if (cachedIcon) {
      return { ...icon, iconUrl: cachedIcon };
    }

    // 无缓存时，使用第一个候选 URL
    const candidates = generateFaviconCandidates(domain);
    if (candidates.length > 0) {
      return { ...icon, iconUrl: candidates[0] };
    }

    return icon;
  });
}

/**
 * 导出配置为 JSON 字符串
 * 
 * 导出的格式包含：
 * - _schema: 标识这是 hub-nav 配置文件
 * - _version: 配置版本号
 * - _meta: 导出元数据
 * - data: 实际配置数据
 * 
 * @param config - 用户配置
 * @returns 格式化的 JSON 字符串
 */
export function exportToJson(config: UserConfig): string {
  // 为 favicon 类型的图标填充 iconUrl
  const enrichedIcons = enrichIconsForExport(config.icons);

  const exportData: ExportedConfig = {
    _schema: 'hub-nav-config',
    _version: CURRENT_VERSION,
    _meta: createExportMeta(config),
    data: {
      ...config,
      icons: enrichedIcons,
      version: CURRENT_VERSION
    }
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 验证是否为标准的导出格式
 * @param data - 待验证的数据
 * @returns 是否为有效的导出格式
 */
export function validateExportedFormat(data: unknown): data is ExportedConfig {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  return (
    obj._schema === 'hub-nav-config' &&
    typeof obj._version === 'string' &&
    typeof obj._meta === 'object' &&
    typeof obj.data === 'object'
  );
}
