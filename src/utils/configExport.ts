/**
 * 配置导出工具函数
 * 
 * 提供统一的配置导出功能，避免代码重复
 */

import { ConfigManager } from '@/lib/configManager';

/**
 * 执行配置导出
 * @returns 导出成功返回 true，失败返回 false
 */
export function performExport(): boolean {
  try {
    const json = ConfigManager.exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // 文件名包含日期，便于识别
    a.download = `hub-nav-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (_err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('导出配置失败:', _err);
    }
    return false;
  }
}
