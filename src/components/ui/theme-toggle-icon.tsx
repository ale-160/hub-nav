'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

/**
 * 主题切换图标组件
 * 使用客户端渲染避免 Hydration 错误
 */
export function ThemeToggleIcon() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 确保只在客户端渲染（这是安全的初始化模式）
  useEffect(() => {
    setMounted(true);
  }, []);

  // 服务端渲染时不显示任何内容，避免 Hydration 不匹配
  if (!mounted) {
    return (
      <div className="relative w-5 h-5">
        <svg className="absolute inset-0 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative w-5 h-5">
      <svg className={`absolute inset-0 w-5 h-5 transition-opacity duration-200 ${theme.mode === 'light' ? 'opacity-100' : 'opacity-0'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
      <svg className={`absolute inset-0 w-5 h-5 transition-opacity duration-200 ${theme.mode === 'dark' ? 'opacity-100' : 'opacity-0'}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
      </svg>
    </div>
  );
}
