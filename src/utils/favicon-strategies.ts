/**
 * Favicon 策略引擎 - 生成候选图标 URL 列表
 * 
 * 基于行业最佳实践，通过多路径枚举提高图标获取成功率
 */

/**
 * 所有可能的 favicon 路径，按优先级排序
 */
const FAVICON_PATHS = [
  // 最高频路径（覆盖 ~60% 网站）
  '/favicon.ico',
  '/favicon.png',
  '/favicon.svg',
  
  // 次高频路径（覆盖 ~20% 网站）
  '/assets/favicon.ico',
  '/assets/favicon.png',
  '/images/favicon.ico',
  '/images/favicon.png',
  '/static/favicon.ico',
  '/static/favicon.png',
  
  // Apple Touch Icon（iOS 设备常用，覆盖 ~15%）
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  
  // 现代框架默认路径（Next.js/Vite 等）
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/android-chrome-192x192.png',
];

/**
 * 为指定域名生成完整的 favicon 候选列表
 * 
 * @param domain - 纯净域名（不含协议和路径）
 * @returns 候选图标 URL 数组（按优先级排序）
 */
function generateForDomain(domain: string): string[] {
  return FAVICON_PATHS.map(path => `https://${domain}${path}`);
}

/**
 * 执行所有策略，生成去重后的候选 URL 列表
 * 
 * @param domain - 纯净域名（不含协议和路径）
 * @returns 候选图标 URL 数组（按策略优先级排序）
 */
export function generateFaviconCandidates(domain: string): string[] {
  if (!domain) return [];
  
  const candidates = new Set<string>();
  
  // 1. 首先添加原始域名的完整候选列表
  generateForDomain(domain).forEach(url => candidates.add(url));
  
  // 2. 添加 www 或非 www 变体的完整候选列表
  let variantDomain: string;
  if (domain.startsWith('www.')) {
    variantDomain = domain.substring(4); // 去掉 'www.'
  } else {
    variantDomain = `www.${domain}`;
  }
  
  generateForDomain(variantDomain).forEach(url => candidates.add(url));
  
  return Array.from(candidates);
}
