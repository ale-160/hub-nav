/**
 * 配置导出功能
 * 
 * 将用户配置导出为带有元数据的标准格式
 */

import type { UserConfig, ExportedConfig, ExportMeta } from './types';
import { CURRENT_VERSION } from './version';

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
  const exportData: ExportedConfig = {
    _schema: 'hub-nav-config',
    _version: CURRENT_VERSION,
    _meta: createExportMeta(config),
    data: {
      ...config,
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
