import { useCallback, useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { useLocalStorage } from './useLocalStorage';
import { ConfigManager, ThemeSettings } from '../lib/configManager';

/**
 * 自定义 Hook：用于管理主题设置（基于 next-themes）
 * @returns 包含主题状态和操作方法的对象
 */
export function useTheme() {
  // 从 ConfigManager 获取默认主题设置
  const defaultTheme = ConfigManager.getDefaultConfig().theme;

  // 使用 useLocalStorage Hook 管理主题配置（仅存储配置，不操作 DOM）
  const [theme, setTheme] = useLocalStorage<ThemeSettings>('hub-nav-theme', defaultTheme);

  // 使用 next-themes 管理实际的暗色/亮色模式
  const { setTheme: setResolvedTheme } = useNextTheme();

  /**
   * 切换亮暗模式（使用 next-themes）
   */
  const toggleMode = useCallback(() => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    
    // 更新本地存储的配置
    setTheme(prev => ({
      ...prev,
      mode: newMode
    }));
    
    // 使用 next-themes 切换实际的主题类
    setResolvedTheme(newMode);
  }, [theme.mode, setTheme, setResolvedTheme]);

  /**
   * 设置主题配置（不直接操作 DOM，由 next-themes 处理）
   * @param partial - 部分主题设置对象
   */
  const updateTheme = useCallback((partial: Partial<ThemeSettings>) => {
    setTheme(prev => ({
      ...prev,
      ...partial
    }));
    
    // 如果更新了 mode，同步到 next-themes
    if (partial.mode) {
      setResolvedTheme(partial.mode);
    }
  }, [setTheme, setResolvedTheme]);

  /**
   * 监听 fontColor 变化，实时应用到全局 CSS 变量
   * 
   * 注意：此处直接操作 DOM 是为了覆盖 Tailwind 文字类的 !important 优先级。
   * next-themes 仅管理暗色/亮色模式的 class 切换，不管理自定义 CSS 变量。
   * 因此必须在 next-themes 之外手动处理字体颜色注入，通过动态创建 <style> 标签
   * 并使用 !important 提升优先级，确保用户自定义字体颜色能够生效。
   */
  useEffect(() => {
    const styleId = 'hub-nav-font-color-override';
    
    if (theme.fontColor) {
      // 设置 CSS 变量
      document.documentElement.style.setProperty('--font-color', theme.fontColor);
      
      // 创建更高优先级的 style 标签覆盖 Tailwind 文字类
      let styleTag = document.getElementById(styleId) as HTMLStyleElement;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
      }
      
      // 暗色模式下使用 .dark 选择器提升优先级
      styleTag.textContent = `
        body,
        .text-gray-900,
        .text-gray-700,
        .text-gray-600,
        .text-gray-500,
        .text-gray-400,
        .text-gray-300,
        .text-gray-200,
        .text-gray-100,
        .text-white {
          color: ${theme.fontColor} !important;
        }
        .dark body,
        .dark .text-gray-900,
        .dark .text-gray-700,
        .dark .text-gray-600,
        .dark .text-gray-500,
        .dark .text-gray-400,
        .dark .text-gray-300,
        .dark .text-gray-200,
        .dark .text-gray-100,
        .dark .text-white {
          color: ${theme.fontColor} !important;
        }
      `;
    } else {
      // 移除 CSS 变量
      document.documentElement.style.removeProperty('--font-color');
      
      // 删除 style 标签
      const styleTag = document.getElementById(styleId);
      if (styleTag) {
        styleTag.remove();
      }
    }
  }, [theme.fontColor]);

  return {
    theme,
    toggleMode,
    setTheme: updateTheme,
    isDarkMode: theme.mode === 'dark',
    isLightMode: theme.mode === 'light'
  };
}
