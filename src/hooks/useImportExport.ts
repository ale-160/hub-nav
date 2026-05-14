/**
 * 配置导入导出 Hook
 * 
 * 职责：处理配置的导入和导出功能
 * - 导出配置为 JSON 文件（带元数据）
 * - 从 JSON 文件导入配置（支持版本迁移）
 * - 显示成功/失败提示及警告信息
 */

import { useCallback } from 'react';
import { toast } from 'sonner';
import { ConfigManager } from '@/lib/configManager';
import { performExport } from '@/utils/configExport';
import { getStrings } from '@/data/i18n';
import type { Language } from '@/data/i18n';

export interface UseImportExportOptions {
  language?: Language;
}

export interface ImportResultInfo {
  success: boolean;
  warnings?: string[];
  backupId?: string;
}

export function useImportExport(options: UseImportExportOptions = {}) {
  const S = getStrings(options.language || 'zh');

  /**
   * 导出配置
   */
  const exportConfig = useCallback(() => {
    const success = performExport();
    if (success) {
      toast.success(S.exportSuccess);
    } else {
      toast.error(S.exportError);
    }
    return success;
  }, [S.exportSuccess, S.exportError]);

  /**
   * 导入配置
   */
  const importConfig = useCallback((): Promise<ImportResultInfo> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve({ success: false });
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const success = ConfigManager.importConfig(content);
            
            if (success) {
              toast.success(S.importSuccess);
              // 刷新页面以加载新配置
              window.location.reload();
              resolve({ 
                success: true,
                warnings: []
              });
            } else {
              toast.error(S.importError);
              resolve({ success: false });
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('导入配置失败:', error);
            }
            toast.error(S.importError);
            resolve({ success: false });
          }
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    });
  }, [S.importSuccess, S.importError]);

  return {
    exportConfig,
    importConfig
  };
}
