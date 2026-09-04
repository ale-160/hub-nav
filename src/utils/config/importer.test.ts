import { describe, expect, it } from 'vitest';

import { getDefaultConfig } from './defaults';
import { exportToJson } from './exporter';
import { CURRENT_VERSION } from './version';
import { importFromJson } from './importer';

describe('importFromJson', () => {
  it('非法 JSON 返回 INVALID_FORMAT', () => {
    const result = importFromJson('not json{{{');
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('INVALID_FORMAT');
  });

  it('标准导出格式（同版本）可成功导入', () => {
    const result = importFromJson(exportToJson(getDefaultConfig()));
    expect(result.success).toBe(true);
    expect(result.data?.version).toBe(CURRENT_VERSION);
    expect(result.migration?.toVersion).toBe(CURRENT_VERSION);
  });

  it('裸 UserConfig 可成功导入并补全默认值', () => {
    const raw = {
      layout: { columns: 6, rows: 4 },
      theme: { mode: 'dark' },
      icons: [],
      folders: [],
      pages: [],
      rootOrder: [],
      version: CURRENT_VERSION,
    };
    const result = importFromJson(JSON.stringify(raw));
    expect(result.success).toBe(true);
    expect(result.data?.layout.columns).toBe(6);
    expect(result.data?.theme.mode).toBe('dark');
    // 缺失字段被默认值补全
    expect(result.data?.theme.iconSize).toBe('medium');
  });

  it('旧版本且无迁移路径时返回 MIGRATION_FAILED', () => {
    const old = { ...getDefaultConfig(), version: '0.0.1' };
    const result = importFromJson(JSON.stringify(old));
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('MIGRATION_FAILED');
  });

  it('图标缺失 id 时返回 VALIDATION_FAILED', () => {
    const bad = {
      ...getDefaultConfig(),
      icons: [{ id: 123, name: 'Bad', url: 'https://example.com' }],
    };
    const result = importFromJson(JSON.stringify(bad));
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION_FAILED');
  });

  it('未知顶层字段被忽略且不阻断导入', () => {
    const raw = {
      ...getDefaultConfig(),
      someFutureField: 'hello',
    };
    const result = importFromJson(JSON.stringify(raw));
    expect(result.success).toBe(true);
    // 默认值填充阶段只保留已知字段，未知字段被丢弃
    expect(result.data).not.toHaveProperty('someFutureField');
  });
});
