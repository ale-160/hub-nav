import React from 'react';
import { BUILTIN_ICONS, BuiltinIcon } from '@/data/icons';
import { getStrings } from '@/data/i18n';
import { extractDomain, getFaviconUrls } from './url';

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

/**
 * 获取图标名称（根据语言）
 */
export function getIconName(
  iconId: string,
  language: 'zh' | 'en' = 'zh',
  customColor?: string
): string {
  const STRINGS = getStrings(language);

  // 处理纯色图标 (solid-color-X 格式)
  if (iconId.startsWith('solid-color-')) {
    const colorIndex = parseInt(iconId.replace('solid-color-', ''));
    if (colorIndex === 17) {
      return customColor ? STRINGS.customColor : (language === 'zh' ? '调色盘' : 'Color Palette');
    }
    // 纯色图标没有映射，使用默认名称
    return language === 'en' ? `Color ${colorIndex + 1}` : `颜色${colorIndex + 1}`;
  }

  // 处理 solid- 前缀的图标
  if (iconId.startsWith('solid-')) {
    const baseId = iconId.replace('solid-', '');
    return STRINGS.iconNames[baseId as keyof typeof STRINGS.iconNames] || iconId;
  }

  // 处理普通图标
  return STRINGS.iconNames[iconId as keyof typeof STRINGS.iconNames] || iconId;
}

/**
 * 获取分类后的图标
 */
export function getCategorizedIcons(customColor: string = '', language: 'zh' | 'en' = 'zh') {
  const emojiIcons = BUILTIN_ICONS.filter(icon => icon.type === 'emoji');

  // 纯色图标：17个常用颜色 + 1个调色盘
  const solidColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
    '#f43f5e', '#eab308', '#0ea5e9', '#22c55e', '#6366f1',
    '#6b7280', '#000000', customColor || '#ffffff'
  ];

  const STRINGS = getStrings(language);
  const solidIcons = solidColors.map((color, index) => ({
    id: `solid-color-${index}`,
    name: index === 17 ? (customColor ? STRINGS.customColor : (language === 'zh' ? '调色盘' : 'Color Palette')) : (language === 'en' ? `Color ${index + 1}` : `颜色${index + 1}`),
    emoji: index === 17 && !customColor ? '' : '',
    type: 'solid' as const,
    color: color
  }));

  return { emojiIcons, solidIcons };
}

/**
 * 获取选中的内置图标对象
 */
export function getSelectedBuiltinIcon(
  builtinIcon: string | undefined,
  customColor: string,
  language: 'zh' | 'en'
) {
  if (!builtinIcon) return BUILTIN_ICONS[0];

  // 如果是纯色图标，构造对应的 BuiltinIcon 对象
  if (builtinIcon.startsWith('solid-color-')) {
    const colorIndex = parseInt(builtinIcon.replace('solid-color-', ''));
    const solidColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
      '#f43f5e', '#eab308', '#0ea5e9', '#22c55e', '#6366f1',
      '#6b7280', '#000000', customColor || '#ffffff'
    ];

    // 关键修复：使用实际的颜色值，而不是默认白色
    const actualColor = solidColors[colorIndex];

    return {
      id: builtinIcon,
      name: getIconName(builtinIcon, language, customColor),
      emoji: '',
      type: 'solid' as const,
      color: actualColor
    };
  }

  // 否则从 BUILTIN_ICONS 中查找并返回国际化名称
  const originalIcon = BUILTIN_ICONS.find(icon => icon.id === builtinIcon) || BUILTIN_ICONS[0];
  return {
    ...originalIcon,
    name: getIconName(builtinIcon, language)
  };
}

/**
 * 获取网站图标的预览 URL（拼接方式）
 */
export function getWebsiteIconPreviewUrl(url: string): string {
  if (!url) return '';

  try {
    const domain = extractDomain(url);
    const faviconUrls = getFaviconUrls(domain);
    return faviconUrls[0] || '';
  } catch {
    return '';
  }
}
