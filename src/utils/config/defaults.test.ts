import { describe, expect, it } from 'vitest';

import { CURRENT_VERSION } from './version';
import {
  applyDefaults,
  fillConfigDefaults,
  fillFolderDefaults,
  fillIconDefaults,
  fillLayoutDefaults,
  fillOperationModeDefaults,
  fillPageDefaults,
  fillThemeDefaults,
  getDefaultConfig,
} from './defaults';

describe('fillIconDefaults', () => {
  it('为空图标填充默认值', () => {
    const icon = fillIconDefaults({});
    expect(icon.id.startsWith('icon-')).toBe(true);
    expect(icon.name).toBe('未命名');
    expect(icon.url).toBe('');
    expect(icon.order).toBe(0);
    expect(icon.isHidden).toBe(false);
    expect(icon.iconType).toBe('favicon');
  });

  it('保留已有字段', () => {
    const icon = fillIconDefaults({ id: 'a', name: 'GitHub', url: 'https://github.com', order: 3 });
    expect(icon.id).toBe('a');
    expect(icon.name).toBe('GitHub');
    expect(icon.order).toBe(3);
  });
});

describe('fillFolderDefaults / fillPageDefaults', () => {
  it('为空文件夹填充默认值', () => {
    const folder = fillFolderDefaults({});
    expect(folder.id.startsWith('folder-')).toBe(true);
    expect(folder.name).toBe('新文件夹');
    expect(folder.order).toBe(0);
  });

  it('为空页面填充默认值', () => {
    const page = fillPageDefaults({});
    expect(page.id.startsWith('page-')).toBe(true);
    expect(page.name).toBe('新页面');
    expect(page.iconIds).toEqual([]);
  });
});

describe('fillThemeDefaults / fillLayoutDefaults / fillOperationModeDefaults', () => {
  it('为空主题填充默认值', () => {
    expect(fillThemeDefaults({})).toMatchObject({
      mode: 'light',
      primaryColor: '#3b82f6',
      iconSize: 'medium',
      gridSpacing: 16,
      gridColumnSpacing: 16,
      language: 'zh',
    });
  });

  it('为空布局填充默认值', () => {
    expect(fillLayoutDefaults({})).toMatchObject({ columns: 5, rows: 4 });
  });

  it('操作模式缺省时填充默认值', () => {
    expect(fillOperationModeDefaults(undefined)).toMatchObject({
      mode: 'hybrid',
      openMethod: 'click',
      menuTrigger: 'rightClick',
      showAddButton: true,
    });
  });
});

describe('getDefaultConfig / fillConfigDefaults / applyDefaults', () => {
  it('默认配置版本号与搜索引擎正确', () => {
    const config = getDefaultConfig();
    expect(config.version).toBe(CURRENT_VERSION);
    expect(config.searchEngine).toBe('https://www.bing.com/search?q=');
    expect(config.icons).toEqual([]);
  });

  it('部分配置会被补全且保留已有值', () => {
    const config = fillConfigDefaults({
      theme: { ...getDefaultConfig().theme, mode: 'dark' },
    });
    expect(config.theme.mode).toBe('dark');
    expect(config.theme.iconSize).toBe('medium');
    expect(config.layout.columns).toBe(5);
  });

  it('非法输入回退到默认配置', () => {
    expect(applyDefaults(null).version).toBe(CURRENT_VERSION);
    expect(applyDefaults('oops').icons).toEqual([]);
  });
});
