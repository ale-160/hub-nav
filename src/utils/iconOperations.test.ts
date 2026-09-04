import { describe, expect, it } from 'vitest';

import type { IconItem, Page, UserConfig } from './config/types';
import { getDefaultConfig } from './config/defaults';
import {
  deleteIconFromConfig,
  removeIconFromAllPages,
  removeIconFromList,
} from './iconOperations';

function makeIcon(id: string): IconItem {
  return { id, name: id, url: `https://${id}.example.com`, order: 0, isHidden: false };
}

function makePage(id: string, iconIds: string[]): Page {
  return { id, name: id, iconIds };
}

describe('removeIconFromAllPages', () => {
  it('从所有页面移除指定图标并保持其他引用', () => {
    const pages = [makePage('p1', ['a', 'b']), makePage('p2', ['b', 'c'])];
    const result = removeIconFromAllPages(pages, 'b');
    expect(result).toEqual([makePage('p1', ['a']), makePage('p2', ['c'])]);
    // 不修改原数组
    expect(pages[0].iconIds).toEqual(['a', 'b']);
  });

  it('不存在的图标 ID 不改变页面', () => {
    const pages = [makePage('p1', ['a'])];
    expect(removeIconFromAllPages(pages, 'missing')).toEqual(pages);
  });
});

describe('removeIconFromList', () => {
  it('按 ID 删除图标', () => {
    expect(removeIconFromList([makeIcon('a'), makeIcon('b')], 'a')).toEqual([makeIcon('b')]);
  });
});

describe('deleteIconFromConfig', () => {
  it('同时清理图标列表与页面引用', () => {
    const config: UserConfig = {
      ...getDefaultConfig(),
      icons: [makeIcon('a'), makeIcon('b')],
      pages: [makePage('p1', ['a', 'b'])],
    };
    const result = deleteIconFromConfig(config, 'a');
    expect(result.icons.map((i) => i.id)).toEqual(['b']);
    expect(result.pages[0].iconIds).toEqual(['b']);
    // 原配置不受影响
    expect(config.icons).toHaveLength(2);
  });
});
