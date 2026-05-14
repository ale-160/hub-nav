/**
 * 迁移函数注册表
 * 
 * 注册所有版本间的迁移函数
 * 
 * 注意：当前版本为 0.1.8，不再需要兼容更旧的数字版本号（如 version: 1）
 * 所有配置均使用字符串版本号（如 "0.1.8"）
 */

/**
 * 当前版本无需迁移
 * 
 * 如果导入的配置版本与当前版本一致，则直接使用该配置
 * 未来版本升级时，在此添加新的迁移函数
 */

// 未来版本迁移示例（预留）
/*
import { migrationManager } from './migrations';
import { CURRENT_VERSION } from './version';
import type { UserConfig } from './types';

migrationManager.registerMigration({
  fromVersion: '0.1.8',
  toVersion: '0.1.9',
  description: '0.1.8 迁移到 0.1.9（示例）',
  migrate: (data: unknown) => {
    const config = data as UserConfig;
    
    return {
      ...config,
      version: '0.1.9',
      // 仅处理 UserConfig 内部字段的变化
      // 不要添加 _meta 或 _ext，这些由 exporter.ts 在导出时添加
    };
  }
});
*/
