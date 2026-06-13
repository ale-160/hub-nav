import React from 'react';
import { BUILTIN_ICONS, BuiltinIcon, VECTOR_SVG_MAP } from '@/data/icons';
import { getStrings } from '@/data/i18n';

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
 * 渲染纯色图标（纯色圆形背景 + 首字）
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
 * 渲染矢量图标（Feather/Lucide 风格的线性 SVG）
 * @param icon - 内置图标对象，需要有 svgKey/svgColor
 * @param size - 尺寸，默认 24
 * @returns React 元素
 */
export function renderVectorIcon(icon: BuiltinIcon, size: number = 24): React.JSX.Element {
  const key = icon.svgKey || icon.id.replace('vector-', '');
  const entry = VECTOR_SVG_MAP[key as keyof typeof VECTOR_SVG_MAP];
  const color = icon.svgColor || icon.color || '#6b7280';

  const paths = entry?.paths || [
    `<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/>`
  ];

  // 安全地渲染 SVG 子内容：通过 dangerouslySetInnerHTML 注入预设的 SVG path 字符串
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color }}
      dangerouslySetInnerHTML={{ __html: paths.join('') }}
    />
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

  // 处理纯色颜色图标 (solid-color-X 格式)
  if (iconId.startsWith('solid-color-')) {
    const colorIndex = parseInt(iconId.replace('solid-color-', ''));
    if (colorIndex === 17) {
      return customColor ? STRINGS.customColor : (language === 'zh' ? '调色盘' : 'Color Palette');
    }
    return language === 'en' ? `Color ${colorIndex + 1}` : `颜色${colorIndex + 1}`;
  }

  // 处理 solid- 前缀的图标
  if (iconId.startsWith('solid-')) {
    const baseId = iconId.replace('solid-', '');
    return STRINGS.iconNames[baseId as keyof typeof STRINGS.iconNames] || iconId;
  }

  // 处理 vector- 前缀的矢量图标
  if (iconId.startsWith('vector-')) {
    const key = iconId.replace('vector-', '');
    const entry = VECTOR_SVG_MAP[key as keyof typeof VECTOR_SVG_MAP];
    return entry?.label || key;
  }

  return STRINGS.iconNames[iconId as keyof typeof STRINGS.iconNames] || iconId;
}

/**
 * ✅ 纯色图标颜色数组（17个常用颜色 + 1个调色盘）
 * 用于内置图标选择器和 Icon 组件渲染
 */
export const SOLID_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
  '#f43f5e', '#eab308', '#0ea5e9', '#22c55e', '#6366f1',
  '#6b7280', '#000000'
];

/**
 * 获取分类后的图标：矢量图标 / 纯色颜色图标
 */
export function getCategorizedIcons(customColor: string = '', language: 'zh' | 'en' = 'zh') {
  // 矢量图标：从 BUILTIN_ICONS 中取 type === 'vector' 的图标
  const vectorIcons = BUILTIN_ICONS.filter(icon => icon.type === 'vector');

  // ✅ 纯色颜色图标（颜色+首字）：使用共享常量，动态添加调色盘颜色
  const solidColors = [...SOLID_COLORS, customColor || '#ffffff'];
  const STRINGS = getStrings(language);
  const solidIcons = solidColors.map((color, index) => ({
    id: `solid-color-${index}`,
    name: index === 17
      ? (customColor ? STRINGS.customColor : (language === 'zh' ? '调色盘' : 'Color Palette'))
      : (language === 'en' ? `Color ${index + 1}` : `颜色${index + 1}`),
    emoji: '',
    type: 'solid' as const,
    color: color,
  }));

  return { vectorIcons, solidIcons };
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

  // 处理纯色颜色图标
  if (builtinIcon.startsWith('solid-color-')) {
    const colorIndex = parseInt(builtinIcon.replace('solid-color-', ''));
    const solidColors = [...SOLID_COLORS, customColor || '#ffffff'];
    const actualColor = solidColors[colorIndex];

    return {
      id: builtinIcon,
      name: getIconName(builtinIcon, language, customColor),
      emoji: '',
      type: 'solid' as const,
      color: actualColor,
    };
  }

  // 从 BUILTIN_ICONS 中查找（矢量或纯色），并返回国际化名称
  const originalIcon = BUILTIN_ICONS.find(icon => icon.id === builtinIcon) || BUILTIN_ICONS[0];
  return {
    ...originalIcon,
    name: getIconName(builtinIcon, language),
  };
}
