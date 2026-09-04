import { describe, expect, it } from 'vitest';

import type { UserConfig } from './types';
import { migrationManager } from './migrations';

/**
 * 注意：migrationManager 是单例。
 * 本文件使用 7.7.x / 8.8.x 这类测试专用版本号，避免与其他测试文件互相干扰。
 */
describe('migrationManager', () => {
  it('版本相同无需迁移，直接返回原数据', () => {
    const data = { version: '7.7.0', marker: 'same' };
    const result = migrationManager.migrateToVersion(data, '7.7.0');
    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
    expect(result.migrationsApplied).toEqual([]);
  });

  it('拒绝降级迁移', () => {
    const result = migrationManager.migrateToVersion({ version: '7.7.1' }, '7.7.0');
    expect(result.success).toBe(false);
    expect(result.error).toContain('降级');
    expect(result.migrationsApplied).toEqual([]);
  });

  it('找不到迁移路径时失败', () => {
    const result = migrationManager.migrateToVersion({ version: '8.8.0' }, '8.8.5');
    expect(result.success).toBe(false);
    expect(result.error).toContain('找不到');
  });

  it('按注册顺序执行多步迁移', () => {
    migrationManager.registerMigration({
      fromVersion: '7.7.0',
      toVersion: '7.7.1',
      description: '测试迁移 7.7.0 → 7.7.1',
      migrate: (data: unknown) => ({ ...(data as UserConfig), version: '7.7.1' }),
    });
    migrationManager.registerMigration({
      fromVersion: '7.7.1',
      toVersion: '7.7.2',
      description: '测试迁移 7.7.1 → 7.7.2',
      migrate: (data: unknown) => ({ ...(data as UserConfig), version: '7.7.2' }),
    });

    const path = migrationManager.getMigrationPath('7.7.0', '7.7.2');
    expect(path.map((m) => m.toVersion)).toEqual(['7.7.1', '7.7.2']);

    const result = migrationManager.migrateToVersion({ version: '7.7.0' }, '7.7.2');
    expect(result.success).toBe(true);
    expect(result.data?.version).toBe('7.7.2');
    expect(result.migrationsApplied).toEqual(['7.7.0 → 7.7.1', '7.7.1 → 7.7.2']);
  });

  it('迁移函数抛错时返回失败结果而非抛出', () => {
    migrationManager.registerMigration({
      fromVersion: '8.8.0',
      toVersion: '8.8.1',
      description: '必定失败的测试迁移',
      migrate: () => {
        throw new Error('boom');
      },
    });

    const result = migrationManager.migrateToVersion({ version: '8.8.0' }, '8.8.1');
    expect(result.success).toBe(false);
    expect(result.error).toContain('迁移失败');
  });
});
