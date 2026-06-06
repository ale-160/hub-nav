/**
 * Favicon 策略引擎 - 生成候选图标 URL 列表
 *
 * 基于行业最佳实践，通过多路径枚举提高图标获取成功率
 */
/**
 * 常见的二级域名后缀，用于提取主域名
 */
const COMMON_TLDS = [
  '.com', '.cn', '.net', '.org', '.io', '.co', '.me', '.tv',
  '.com.cn', '.net.cn', '.org.cn', '.gov.cn', '.edu.cn',
  '.co.uk', '.co.jp', '.co.kr', '.co.fr', '.co.de'
];

/**
 * 从完整域名中提取主域名（e.g., member.bilibili.com -> bilibili.com）
 * @param domain - 完整域名
 * @returns 主域名
 */
function extractPrimaryDomain(domain: string): string {
  const parts = domain.split('.');

  // 如果只有两部分（如 bilibili.com），直接返回
  if (parts.length <= 2) {
    return domain;
  }

  // 先检查是否有双级后缀（如 .com.cn）
  for (const tld of COMMON_TLDS) {
    const tldParts = tld.split('.').filter(Boolean); // 过滤掉空字符串
    if (tldParts.length > 1 && domain.endsWith(tld)) {
      // 对于双级后缀，保留最后 n+1 部分（n 是 tld 部分数）
      return parts.slice(-(tldParts.length + 1)).join('.');
    }
  }

  // 对于普通单级后缀，保留最后 2 部分
  return parts.slice(-2).join('.');
}
/**
 * 执行所有策略，生成去重后的候选 URL 列表
 *
 * @param domain - 纯净域名（不含协议和路径）
 * @returns 候选图标 URL 数组（按策略优先级排序）
 */
export function generateFaviconCandidates(domain: string): string[] {
  if (!domain) return [];

  const candidates: string[] = [];
  const seen = new Set<string>();
  const primaryDomain = extractPrimaryDomain(domain);

  // 主域名（例如 bilibili.com）- 优先使用最重要的图标路径
  const primaryPaths = [
    '/favicon.ico',
    '/favicon.png',
    '/apple-touch-icon.png',
    '/favicon.svg',
    '/images/favicon.ico',
    '/static/favicon.ico',
  ];
  for (const path of primaryPaths) {
    const url = `https://${primaryDomain}${path}`;
    if (!seen.has(url)) {
      seen.add(url);
      candidates.push(url);
    }
  }

  // 主域名的 www 变体（例如 www.bilibili.com）
  let wwwPrimaryDomain: string;
  if (primaryDomain.startsWith('www.')) {
    wwwPrimaryDomain = primaryDomain.substring(4);
  } else {
    wwwPrimaryDomain = `www.${primaryDomain}`;
  }
  if (wwwPrimaryDomain !== primaryDomain) {
    for (const path of primaryPaths) {
      const url = `https://${wwwPrimaryDomain}${path}`;
      if (!seen.has(url)) {
        seen.add(url);
        candidates.push(url);
      }
    }
  }

  return candidates;
}
