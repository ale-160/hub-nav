/**
 * 迁移函数注册表
 * 
 * 注册所有版本间的迁移函数
 */

import { migrationManager } from './migrations';
import { CURRENT_VERSION } from './version';
import type { UserConfig } from './types';

/**
 * 注册从 0.1.0 到 0.1.8 的迁移
 * 
 * 主要变更：
 * - version 字段从 number 改为 string
 * - 添加 _meta 和 _ext 扩展字段
 * - layout 和 theme 结构优化为带 extensions 的对象
 */
migrationManager.registerMigration({
  fromVersion: '0.1.0',
  toVersion: '0.1.8',
  description: '初始版本迁移到 0.1.8（JSON导入导出优化）',
  migrate: (data: unknown) => {
    const config = data as Record<string, unknown>;

    // 处理 layout 字段（如果是简单对象，转换为新结构）
    let layout = config.layout;
    if (layout && typeof layout === 'object' && !Array.isArray(layout)) {
      const layoutObj = layout as Record<string, unknown>;
      if (!layoutObj.extensions) {
        layout = {
          ...layoutObj,
          extensions: undefined
        };
      }
    }

    // 处理 theme 字段
    let theme = config.theme;
    if (theme && typeof theme === 'object' && !Array.isArray(theme)) {
      const themeObj = theme as Record<string, unknown>;
      if (!themeObj.extensions) {
        theme = {
          ...themeObj,
          extensions: undefined
        };
      }
    }

    // 构建迁移后的配置
    const migratedConfig: UserConfig = {
      layout: layout as UserConfig['layout'],
      theme: theme as UserConfig['theme'],
      icons: Array.isArray(config.icons) ? config.icons : [],
      folders: Array.isArray(config.folders) ? config.folders : [],
      pages: Array.isArray(config.pages) ? config.pages : [],
      rootOrder: Array.isArray(config.rootOrder) ? config.rootOrder : [],
      version: CURRENT_VERSION,
      searchEngine: config.searchEngine as string | undefined,
      operationMode: config.operationMode as UserConfig['operationMode'],
      _meta: {
        exportedAt: new Date().toISOString(),
        appVersion: CURRENT_VERSION,
        schemaVersion: CURRENT_VERSION,
        previousVersion: (config.version as string) || '0.1.0',
        migratedAt: new Date().toISOString()
      },
      _ext: {}
    };

    return migratedConfig;
  }
});

// 未来版本迁移示例（预留）
/*
migrationManager.registerMigration({
  fromVersion: '0.1.8',
  toVersion: '0.1.9',
  description: '0.1.8 迁移到 0.1.9（示例）',
  migrate: (data: unknown) => {
    const config = data as UserConfig;
    
    return {
      ...config,
      version: '0.1.9',
      _meta: {
        ...config._meta,
        appVersion: '0.1.9',
        migratedAt: new Date().toISOString()
      },
      _ext: {
        ...config._ext,
        // 新增扩展字段
        autoBackup: true
      }
    };
  }
});
*/
