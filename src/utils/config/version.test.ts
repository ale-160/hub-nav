import { describe, expect, it } from 'vitest';

import {
  compareVersions,
  formatVersionDescription,
  getNextMajorVersion,
  getNextMinorVersion,
  isVersionCompatible,
  parseVersion,
  versionsEqual,
} from './version';

describe('parseVersion', () => {
  it('解析标准三段版本号', () => {
    expect(parseVersion('0.1.8')).toEqual([0, 1, 8]);
  });

  it('忽略预发布标识', () => {
    expect(parseVersion('1.0.0-beta.1')).toEqual([1, 0, 0, 1]);
  });

  it('非数字段按 0 处理', () => {
    expect(parseVersion('x.y.z')).toEqual([0, 0, 0]);
  });
});

describe('compareVersions', () => {
  it('相等版本返回 0', () => {
    expect(compareVersions('0.1.8', '0.1.8')).toBe(0);
  });

  it('低版本比较返回 -1', () => {
    expect(compareVersions('0.1.7', '0.1.8')).toBe(-1);
  });

  it('高版本比较返回 1', () => {
    expect(compareVersions('0.2.0', '0.1.8')).toBe(1);
  });

  it('缺失的段按 0 补齐', () => {
    expect(compareVersions('0.1', '0.1.0')).toBe(0);
  });
});

describe('isVersionCompatible', () => {
  it('当前版本满足最低要求时返回 true', () => {
    expect(isVersionCompatible('0.1.8', '0.1.0')).toBe(true);
    expect(isVersionCompatible('0.1.8', '0.1.8')).toBe(true);
  });

  it('当前版本低于最低要求时返回 false', () => {
    expect(isVersionCompatible('0.1.0', '0.1.8')).toBe(false);
  });
});

describe('getNextMinorVersion / getNextMajorVersion', () => {
  it('次版本号递增', () => {
    expect(getNextMinorVersion('0.1.8')).toBe('0.2.8');
  });

  it('主版本号递增并重置次版本号', () => {
    expect(getNextMajorVersion('0.1.8')).toBe('1.0.8');
  });
});

describe('versionsEqual', () => {
  it('语义相等的版本视为相等', () => {
    expect(versionsEqual('0.1', '0.1.0')).toBe(true);
    expect(versionsEqual('0.1.8', '0.1.9')).toBe(false);
  });
});

describe('formatVersionDescription', () => {
  it('已知版本附带描述', () => {
    expect(formatVersionDescription('0.1.8')).toBe('v0.1.8 - JSON导入导出优化版本');
  });

  it('未知版本仅显示版本号', () => {
    expect(formatVersionDescription('9.9.9')).toBe('v9.9.9');
  });
});
