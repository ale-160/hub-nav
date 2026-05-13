/**
 * URL 工具函数 - 用于处理网站图标的获取和回退机制
 */

// ✅ 修复4：导出新的多策略函数
export { generateFaviconCandidates } from './favicon-strategies';

/**
 * 验证 URL 格式是否有效且安全
 * @param url - 待验证的 URL 字符串
 * @returns 验证结果，包含 isValid 和 errorMessage
 */
export function validateUrl(url: string): { isValid: boolean; errorMessage?: string } {
  if (!url || typeof url !== 'string') {
    return { isValid: false, errorMessage: 'URL 不能为空' };
  }

  const trimmedUrl = url.trim();

  // 检查长度限制（防止超长输入）
  if (trimmedUrl.length > 2048) {
    return { isValid: false, errorMessage: 'URL 长度不能超过 2048 个字符' };
  }

  // 检查是否包含危险协议
  const lowerUrl = trimmedUrl.toLowerCase();
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return { isValid: false, errorMessage: `不支持的协议类型: ${protocol.replace(':', '')}` };
    }
  }

  try {
    // 尝试解析 URL
    let urlString = trimmedUrl;
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = 'https://' + urlString;
    }

    const urlObj = new URL(urlString);

    // 验证协议
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { isValid: false, errorMessage: '只支持 http 或 https 协议' };
    }

    // 验证主机名
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return { isValid: false, errorMessage: '无效的域名' };
    }

    // 检查主机名是否包含可疑字符
    if (/[^a-zA-Z0-9.-]/.test(urlObj.hostname)) {
      return { isValid: false, errorMessage: '域名包含非法字符' };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, errorMessage: 'URL 格式不正确' };
  }
}

/**
 * 从用户输入的各种格式中提取纯净的域名
 * @param input - 用户输入的 URL 或域名
 * @returns 提取的纯净域名
 */
export function extractDomain(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  try {
    // 如果输入没有协议，自动补全 https://
    let urlString = input.trim();
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = 'https://' + urlString;
    }

    const url = new URL(urlString);
    return url.hostname;
  } catch {
    // 如果 URL 解析失败，尝试直接返回输入（去除路径部分）
    const cleaned = input.replace(/^https?:\/\//, '').split('/')[0];
    return cleaned || input;
  }
}

/**
 * 获取默认回退图标（首字母或默认 Emoji）
 * @param appName - 应用名称
 * @returns 回退图标内容
 */
export function getFallbackIcon(appName: string): string {
  if (!appName || appName.trim().length === 0) {
    return '🏠';
  }
  
  // 尝试使用应用名称的首字母
  const firstChar = appName.trim().charAt(0).toUpperCase();
  if (/[A-Z0-9]/.test(firstChar)) {
    return firstChar;
  }
  
  // 如果首字母不是字母或数字，使用默认 Emoji
  return '🏠';
}
