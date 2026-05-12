/**
 * 配置导入导出 Hook
 * 
 * 职责：处理配置的导入和导出功能
 * - 导出配置为 JSON 文件
 * - 从 JSON 文件导入配置
 * - 显示成功/失败提示
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { ConfigManager } from '@/lib/configManager';
import { getStrings } from '@/data/i18n';
import type { Language } from '@/data/i18n';

export interface UseImportExportOptions {
  language?: Language;
}

export function useImportExport(options: UseImportExportOptions = {}) {
  const S = getStrings(options.language || 'zh');

  /**
   * 导出配置
   */
  const exportConfig = useCallback(() => {
    try {
      const json = ConfigManager.exportConfig();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hub-nav-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(S.exportSuccess);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('导出配置失败:', error);
      }
      toast.error(S.exportError);
      return false;
    }
  }, [S.exportSuccess, S.exportError]);

  /**
   * 导入配置
   */
  const importConfig = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const success = ConfigManager.importConfig(content);
          
          if (success) {
            toast.success(S.importSuccess);
            // 刷新页面以加载新配置
            window.location.reload();
          } else {
            toast.error(S.importError);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('导入配置失败:', error);
          }
          toast.error(S.importError);
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  }, [S.importSuccess, S.importError]);

  return {
    exportConfig,
    importConfig
  };
}
