/**
 * 配置迁移管理器
 * 
 * 管理不同版本间的配置数据迁移，支持渐进式升级
 */

import type { UserConfig } from './types';
import { compareVersions, versionsEqual } from './version';

/**
 * 迁移函数接口
 */
export interface Migration {
  fromVersion: string;   // 起始版本
  toVersion: string;     // 目标版本
  description: string;   // 迁移描述
  migrate: (data: unknown) => UserConfig; // 迁移函数
}

/**
 * 迁移结果接口
 */
export interface MigrationResult {
  success: boolean;              // 是否成功
  data?: UserConfig;             // 迁移后的数据
  error?: string;                // 错误信息
  migrationsApplied: string[];   // 已应用的迁移步骤
}

/**
 * 配置迁移管理器类
 */
class ConfigMigrationManager {
  private migrations: Migration[] = [];

  /**
   * 注册迁移函数
   * @param migration - 迁移定义
   */
  registerMigration(migration: Migration): void {
    this.migrations.push(migration);
    
    // 按起始版本排序
    this.migrations.sort((a, b) => 
      compareVersions(a.fromVersion, b.fromVersion)
    );
  }

  /**
   * 获取从指定版本到目标版本的迁移路径
   * @param fromVersion - 起始版本
   * @param toVersion - 目标版本
   * @returns 迁移函数列表
   */
  getMigrationPath(fromVersion: string, toVersion: string): Migration[] {
    const path: Migration[] = [];
    let currentVersion = fromVersion;

    while (compareVersions(currentVersion, toVersion) < 0) {
      const migration = this.migrations.find(m => 
        versionsEqual(m.fromVersion, currentVersion)
      );

      if (!migration) {
        // 找不到下一步迁移，中断
        break;
      }

      path.push(migration);
      currentVersion = migration.toVersion;
    }

    return path;
  }

  /**
   * 将数据迁移到指定版本
   * @param data - 待迁移的数据
   * @param targetVersion - 目标版本
   * @returns 迁移结果
   */
  migrateToVersion(data: unknown, targetVersion: string): MigrationResult {
    const migrationsApplied: string[] = [];

    try {
      let currentData = data as UserConfig;
      const fromVersion = ((data as Record<string, unknown>).version as string) || '0.1.0';

      // 检查是否需要降级（不支持）
      if (compareVersions(fromVersion, targetVersion) > 0) {
        return {
          success: false,
          error: `无法降级：从 ${fromVersion} 到 ${targetVersion}`,
          migrationsApplied
        };
      }

      // 如果版本相同，无需迁移
      if (versionsEqual(fromVersion, targetVersion)) {
        return {
          success: true,
          data: currentData,
          migrationsApplied
        };
      }

      // 获取迁移路径
      const migrationPath = this.getMigrationPath(fromVersion, targetVersion);

      if (migrationPath.length === 0) {
        return {
          success: false,
          error: `找不到从 ${fromVersion} 到 ${targetVersion} 的迁移路径`,
          migrationsApplied
        };
      }

      // 依次执行迁移
      for (const migration of migrationPath) {
        currentData = migration.migrate(currentData);
        migrationsApplied.push(`${migration.fromVersion} → ${migration.toVersion}`);
      }

      return {
        success: true,
        data: currentData,
        migrationsApplied
      };
    } catch (error) {
      return {
        success: false,
        error: `迁移失败: ${error instanceof Error ? error.message : String(error)}`,
        migrationsApplied
      };
    }
  }
}

// 导出单例实例
export const migrationManager = new ConfigMigrationManager();
