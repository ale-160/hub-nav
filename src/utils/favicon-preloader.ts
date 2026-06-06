/**
 * Favicon 预加载器 - 并行测试候选图标可用性
 *
 * 使用 Image 对象探测图标是否可加载，避免阻塞 UI
 */

export interface FaviconTestResult {
  url: string;
  success: boolean;
  loadTime?: number; // 毫秒，用于排序优选
}

/**
 * 测试单个图标 URL 是否可用
 * @param url - 图标 URL
 * @param timeout - 超时时间（毫秒），默认 3000ms
 */
export function testSingleUrl(url: string, timeout = 3000): Promise<FaviconTestResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const startTime = performance.now();

    let resolved = false;

    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
      img.src = '';
    };

    img.onload = () => {
      if (resolved) return;
      resolved = true;
      cleanup();

      const loadTime = performance.now() - startTime;
      resolve({
        url,
        success: true,
        loadTime
      });
    };

    img.onerror = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve({
        url,
        success: false
      });
    };

    // 设置超时
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve({
          url,
          success: false
        });
      }
    }, timeout);

    // 触发加载，不使用 crossOrigin 避免 CORS 错误
    img.src = url;
  });
}

/**
 * 并行测试所有候选图标，返回成功的列表（按加载速度排序）
 * @param candidates - 候选 URL 列表
 * @param maxConcurrent - 最大并发数，默认 5（避免浏览器限制）
 */
export async function preloadFavicons(
  candidates: string[],
  maxConcurrent = 5
): Promise<FaviconTestResult[]> {
  if (candidates.length === 0) return [];

  const results: FaviconTestResult[] = [];

  // 分批并发测试
  for (let i = 0; i < candidates.length; i += maxConcurrent) {
    const batch = candidates.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(url => testSingleUrl(url))
    );
    results.push(...batchResults);
  }

  // 过滤成功的结果，并按加载速度排序（快的优先）
  return results
    .filter(r => r.success)
    .sort((a, b) => (a.loadTime || Infinity) - (b.loadTime || Infinity));
}
