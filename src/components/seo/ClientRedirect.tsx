'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConfigManager } from '@/lib/configManager';

/**
 * 客户端智能重定向组件
 *
 * 当用户访问默认英文路由（/）时，检测其语言偏好：
 * 1. 如果用户已设置语言偏好为中文 → 跳转 /zh
 * 2. 如果没有设置过，且浏览器首选语言是中文 → 跳转 /zh
 * 3. 其他情况不跳转，保持英文页面
 *
 * 纯客户端组件，不渲染任何 HTML，不影响 SEO
 */
export default function ClientRedirect() {
  const router = useRouter();

  useEffect(() => {
    // 1. 检查用户是否已设置语言偏好
    const savedConfig = ConfigManager.loadConfig();
    if (savedConfig?.theme.language) {
      if (savedConfig.theme.language === 'zh') {
        router.replace('/zh');
      }
      return; // 用户已设定，尊重其选择
    }

    // 2. 如果没有设置过，且浏览器首选语言是中文，则自动跳转
    const browserLang = navigator.language || '';
    if (browserLang.toLowerCase().startsWith('zh')) {
      router.replace('/zh');
    }
  }, [router]);

  return null;
}
