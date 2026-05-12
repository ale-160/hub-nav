/**
 * UI 工具函数
 * 
 * 职责：提供通用的 UI 相关纯函数
 */

/**
 * 根据配置获取图标尺寸类名
 * @param config - 用户配置（可以是部分配置）
 * @returns Tailwind CSS 类名
 */
export function getIconSizeClass(config?: {
  theme?: {
    iconSize?: 'small' | 'medium' | 'large';
  };
}): string {
  const defaultSize = 'w-12 h-12';
  if (!config?.theme?.iconSize) return defaultSize;

  switch (config.theme.iconSize) {
    case 'small':
      return 'w-10 h-10';
    case 'medium':
      return 'w-12 h-12';
    case 'large':
      return 'w-16 h-16';
    default:
      return defaultSize;
  }
}

/**
 * 计算菜单位置（带边界检测）
 * @param x - 原始 X 坐标
 * @param y - 原始 Y 坐标
 * @param menuWidth - 菜单宽度（默认 180）
 * @param menuHeight - 菜单高度（默认 150）
 * @returns 安全的位置坐标
 */
export function calculateMenuPosition(
  x: number,
  y: number,
  menuWidth: number = 180,
  menuHeight: number = 150
): { x: number; y: number } {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  return {
    x: Math.min(x, viewportWidth - menuWidth),
    y: Math.min(y, viewportHeight - menuHeight)
  };
}
