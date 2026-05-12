import React from 'react';
import { BuiltinIcon } from '@/data/icons';

/**
 * 提取应用名称的第一个字符
 * @param name - 应用名称
 * @returns 第一个字符（中文返回原字符，英文返回大写，其他返回 ?）
 */
export function getFirstChar(name: string): string {
  if (!name || name.trim().length === 0) return '?';

  const firstChar = name.trim().charAt(0);
  
  // 如果是中文，直接返回第一个汉字
  if (/[\u4e00-\u9fa5]/.test(firstChar)) {
    return firstChar;
  }
  
  // 如果是英文，返回大写字母
  if (/[a-zA-Z]/.test(firstChar)) {
    return firstChar.toUpperCase();
  }
  
  // 其他情况返回原字符或 ?
  return firstChar || '?';
}

/**
 * 渲染纯色图标（首字+背景色）
 * @param icon - 内置图标对象
 * @param appName - 应用名称（可选，如果不提供则使用图标名称）
 * @returns React 元素
 */
export function renderSolidIcon(icon: BuiltinIcon, appName?: string): React.JSX.Element {
  const displayChar = appName ? getFirstChar(appName) : getFirstChar(icon.name);

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
      style={{ backgroundColor: icon.color }}
    >
      {displayChar}
    </div>
  );
}
