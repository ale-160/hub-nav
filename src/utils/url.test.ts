import { describe, expect, it } from 'vitest';

import { extractDomain, getFallbackIcon, validateUrl } from './url';

describe('validateUrl', () => {
  it('空输入无效', () => {
    expect(validateUrl('').isValid).toBe(false);
    expect(validateUrl('   ').isValid).toBe(false);
  });

  it('危险协议被拒绝', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,hi', 'vbscript:msg', 'file:///etc/passwd']) {
      const result = validateUrl(url);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBeDefined();
    }
  });

  it('合法 URL 通过（含自动补全协议）', () => {
    expect(validateUrl('https://github.com').isValid).toBe(true);
    expect(validateUrl('http://example.com/path?q=1').isValid).toBe(true);
    expect(validateUrl('github.com').isValid).toBe(true);
  });

  it('超长输入被拒绝', () => {
    expect(validateUrl(`https://example.com/${'a'.repeat(2100)}`).isValid).toBe(false);
  });

  it('非法格式被拒绝', () => {
    expect(validateUrl('https://').isValid).toBe(false);
  });
});

describe('extractDomain', () => {
  it('从完整 URL 提取域名', () => {
    expect(extractDomain('https://github.com/ale-160?tab=repositories')).toBe('github.com');
  });

  it('无协议输入自动补全后提取', () => {
    expect(extractDomain('github.com/ale-160')).toBe('github.com');
  });

  it('空输入返回空字符串', () => {
    expect(extractDomain('')).toBe('');
  });
});

describe('getFallbackIcon', () => {
  it('空名称返回默认 Emoji', () => {
    expect(getFallbackIcon('')).toBe('🏠');
    expect(getFallbackIcon('   ')).toBe('🏠');
  });

  it('字母数字名称返回首字母大写', () => {
    expect(getFallbackIcon('github')).toBe('G');
    expect(getFallbackIcon('123app')).toBe('1');
  });

  it('非字母数字首字返回默认 Emoji', () => {
    expect(getFallbackIcon('中文导航')).toBe('🏠');
  });
});
