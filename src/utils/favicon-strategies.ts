/**
 * Favicon 策略引擎 - 生成候选图标 URL 列表
 * 
 * 基于行业最佳实践，通过多路径枚举提高图标获取成功率
 */

/**
 * 图标候选策略配置
 */
interface FaviconStrategy {
  name: string;
  generateUrls: (domain: string) => string[];
  priority: number; // 1-10，数字越小优先级越高
}

/**
 * 策略 1：标准路径枚举（核心策略）
 * 覆盖 Top 1000 网站中最常见的 favicon 路径
 */
const standardPathStrategy: FaviconStrategy = {
  name: 'standard-paths',
  priority: 1,
  generateUrls: (domain: string) => {
    const paths = [
      // ✅ 最高频路径（覆盖 ~60% 网站）
      '/favicon.ico',
      '/favicon.png',
      '/favicon.svg',
      
      // ✅ 次高频路径（覆盖 ~20% 网站）
      '/assets/favicon.ico',
      '/assets/favicon.png',
      '/images/favicon.ico',
      '/images/favicon.png',
      '/static/favicon.ico',
      '/static/favicon.png',
      
      // ✅ Apple Touch Icon（iOS 设备常用，覆盖 ~15%）
      '/apple-touch-icon.png',
      '/apple-touch-icon-precomposed.png',
      
      // ✅ 现代框架默认路径（Next.js/Vite 等）
      '/favicon-32x32.png',
      '/favicon-16x16.png',
      '/android-chrome-192x192.png',
    ];
    
    return paths.map(path => `https://${domain}${path}`);
  }
};

/**
 * 策略 2：www 子域名变体
 * 某些网站仅在 www 子域名下提供 favicon
 */
const wwwVariantStrategy: FaviconStrategy = {
  name: 'www-variant',
  priority: 2,
  generateUrls: (domain: string) => {
    // 如果域名已包含 www，则跳过
    if (domain.startsWith('www.')) {
      return [];
    }
    return [`https://www.${domain}/favicon.ico`];
  }
};

/**
 * 执行所有策略，生成去重后的候选 URL 列表
 * 
 * @param domain - 纯净域名（不含协议和路径）
 * @returns 候选图标 URL 数组（按策略优先级排序）
 */
export function generateFaviconCandidates(domain: string): string[] {
  if (!domain) return [];
  
  const strategies = [
    standardPathStrategy,
    wwwVariantStrategy,
  ].sort((a, b) => a.priority - b.priority);
  
  const candidates = new Set<string>();
  
  for (const strategy of strategies) {
    const urls = strategy.generateUrls(domain);
    urls.forEach(url => candidates.add(url));
  }
  
  return Array.from(candidates);
}
