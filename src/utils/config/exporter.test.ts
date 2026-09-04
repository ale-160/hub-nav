import { describe, expect, it } from 'vitest';

import { getDefaultConfig } from './defaults';
import { CURRENT_VERSION } from './version';
import { exportToJson, validateExportedFormat } from './exporter';

describe('exportToJson', () => {
  it('导出标准包装结构', () => {
    const parsed = JSON.parse(exportToJson(getDefaultConfig())) as Record<string, unknown>;
    expect(parsed._schema).toBe('hub-nav-config');
    expect(parsed._version).toBe(CURRENT_VERSION);
    expect(typeof parsed._meta).toBe('object');
    expect(typeof parsed.data).toBe('object');
    expect((parsed.data as Record<string, unknown>).version).toBe(CURRENT_VERSION);
  });

  it('为 favicon 图标补全 iconUrl', () => {
    const config = getDefaultConfig();
    config.icons = [
      {
        id: 'icon-1',
        name: 'GitHub',
        url: 'https://github.com',
        order: 0,
        isHidden: false,
        iconType: 'favicon',
      },
    ];
    const parsed = JSON.parse(exportToJson(config)) as {
      data: { icons: Array<{ iconUrl?: string }> };
    };
    expect(parsed.data.icons[0].iconUrl).toContain('github.com');
  });

  it('已有 iconUrl 的图标保持不变', () => {
    const config = getDefaultConfig();
    config.icons = [
      {
        id: 'icon-1',
        name: 'Custom',
        url: 'https://example.com',
        iconUrl: 'https://example.com/custom.png',
        order: 0,
        isHidden: false,
        iconType: 'favicon',
      },
    ];
    const parsed = JSON.parse(exportToJson(config)) as {
      data: { icons: Array<{ iconUrl?: string }> };
    };
    expect(parsed.data.icons[0].iconUrl).toBe('https://example.com/custom.png');
  });

  it('非 favicon 类型图标不补 iconUrl', () => {
    const config = getDefaultConfig();
    config.icons = [
      {
        id: 'icon-1',
        name: 'Builtin',
        url: 'https://example.com',
        order: 0,
        isHidden: false,
        iconType: 'builtin',
        builtinIcon: 'github',
      },
    ];
    const parsed = JSON.parse(exportToJson(config)) as {
      data: { icons: Array<{ iconUrl?: string }> };
    };
    expect(parsed.data.icons[0].iconUrl).toBeUndefined();
  });
});

describe('validateExportedFormat', () => {
  it('标准导出格式返回 true', () => {
    const parsed: unknown = JSON.parse(exportToJson(getDefaultConfig()));
    expect(validateExportedFormat(parsed)).toBe(true);
  });

  it('非法结构返回 false', () => {
    expect(validateExportedFormat(null)).toBe(false);
    expect(validateExportedFormat({})).toBe(false);
    expect(validateExportedFormat({ _schema: 'hub-nav-config' })).toBe(false);
    expect(validateExportedFormat({ _schema: 'other', _version: '1', _meta: {}, data: {} })).toBe(
      false,
    );
  });
});
