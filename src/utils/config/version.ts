/**
 * 版本管理工具函数
 * 
 * 提供语义化版本号比较、兼容性检查等功能
 */

import type { Version } from './types';

/**
 * 当前应用版本号
 */
export const CURRENT_VERSION: Version = '0.1.8';

/**
 * 版本历史记录
 */
export const VERSION_HISTORY: Record<Version, string> = {
  '0.1.0': '初始版本',
  '0.1.8': 'JSON导入导出优化版本'
};

type VersionPart = number;

/**
 * 解析版本号字符串为数字数组
 * @param version - 版本号字符串，如 "0.1.8"
 * @returns 版本号各部分的数字数组
 */
export function parseVersion(version: string): VersionPart[] {
  return version.split('.').map(part => {
    // 处理预发布版本标识（如 "1.0.0-beta.1"）
    const cleanPart = part.split('-')[0];
    const num = parseInt(cleanPart, 10);
    return isNaN(num) ? 0 : num;
  });
}

/**
 * 比较两个版本号
 * @param v1 - 第一个版本号
 * @param v2 - 第二个版本号
 * @returns -1 (v1 < v2), 0 (v1 === v2), 1 (v1 > v2)
 */
export function compareVersions(v1: string, v2: string): -1 | 0 | 1 {
  const parts1 = parseVersion(v1);
  const parts2 = parseVersion(v2);
  
  const maxLen = Math.max(parts1.length, parts2.length);
  
  for (let i = 0; i < maxLen; i++) {
    const p1 = parts1[i] ?? 0;
    const p2 = parts2[i] ?? 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

/**
 * 检查版本是否满足最低要求
 * @param current - 当前版本
 * @param minRequired - 最低要求版本
 * @returns 如果当前版本 >= 最低要求版本则返回 true
 */
export function isVersionCompatible(current: string, minRequired: string): boolean {
  return compareVersions(current, minRequired) >= 0;
}

/**
 * 获取下一个次要版本号
 * @param current - 当前版本号
 * @returns 下一个版本号（增加次版本号）
 */
export function getNextMinorVersion(current: string): string {
  const parts = parseVersion(current);
  if (parts.length >= 2) {
    parts[1] += 1;
    return parts.join('.');
  }
  return current;
}

/**
 * 获取下一个主要版本号
 * @param current - 当前版本号
 * @returns 下一个版本号（增加主版本号）
 */
export function getNextMajorVersion(current: string): string {
  const parts = parseVersion(current);
  if (parts.length >= 1) {
    parts[0] += 1;
    // 重置次要版本
    if (parts.length >= 2) {
      parts[1] = 0;
    }
    return parts.join('.');
  }
  return current;
}

/**
 * 检查两个版本号是否相等
 * @param v1 - 第一个版本号
 * @param v2 - 第二个版本号
 * @returns 如果相等返回 true
 */
export function versionsEqual(v1: string, v2: string): boolean {
  return compareVersions(v1, v2) === 0;
}

/**
 * 格式化版本号为可读字符串
 * @param version - 版本号
 * @returns 格式化的版本描述
 */
export function formatVersionDescription(version: string): string {
  const description = VERSION_HISTORY[version];
  if (description) {
    return `v${version} - ${description}`;
  }
  return `v${version}`;
}
