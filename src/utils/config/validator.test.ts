import { describe, expect, it } from 'vitest';

import { getDefaultConfig } from './defaults';
import { validateConfig } from './validator';

describe('validateConfig', () => {
  it('默认配置可以通过验证', () => {
    const result = validateConfig(getDefaultConfig());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('最小合法结构可以通过验证', () => {
    const result = validateConfig({
      layout: {},
      theme: {},
      icons: [],
      folders: [],
      pages: [],
    });
    expect(result.valid).toBe(true);
  });

  it('非对象输入直接失败', () => {
    for (const input of [null, undefined, 'config', 42]) {
      const result = validateConfig(input);
      expect(result.valid).toBe(false);
      expect(result.errors[0].path).toBe('$');
    }
  });

  it('缺失 layout / theme 时报错', () => {
    const result = validateConfig({ icons: [], folders: [], pages: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.path)).toContain('layout');
    expect(result.errors.map((e) => e.path)).toContain('theme');
  });

  it('icons 非数组时报错', () => {
    const result = validateConfig({
      layout: {},
      theme: {},
      icons: 'not-an-array',
      folders: [],
      pages: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.path)).toContain('icons');
  });

  it('图标缺失 id 时报错', () => {
    const result = validateConfig({
      layout: {},
      theme: {},
      icons: [{ name: 'NoId' }],
      folders: [],
      pages: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.path)).toContain('icons[0].id');
  });

  it('主题 mode 非法时报错', () => {
    const result = validateConfig({
      layout: {},
      theme: { mode: 'sepia' },
      icons: [],
      folders: [],
      pages: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.path)).toContain('theme.mode');
  });

  it('未知顶层字段只产生警告不影响 valid', () => {
    const result = validateConfig({
      layout: {},
      theme: {},
      icons: [],
      folders: [],
      pages: [],
      someFutureField: 1,
    });
    expect(result.valid).toBe(true);
    expect(result.warnings.map((w) => w.path)).toContain('someFutureField');
  });

  it('version 非字符串时只产生警告', () => {
    const result = validateConfig({
      layout: {},
      theme: {},
      icons: [],
      folders: [],
      pages: [],
      version: 123,
    });
    expect(result.valid).toBe(true);
    expect(result.warnings.map((w) => w.path)).toContain('version');
  });
});
