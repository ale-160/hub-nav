import React, { useState, useCallback } from 'react';
import { getStrings } from '@/data/i18n';
import { CustomIconInput } from './CustomIconInput';

interface CustomIconModeProps {
  customIconUrl?: string;
  language?: 'zh' | 'en';
  onUrlChange: (url: string) => void;
}

/**
 * 自定义图标模式组件
 * URL 输入 + 预览展示
 */
export const CustomIconMode = React.memo(function CustomIconMode({
  customIconUrl,
  language = 'zh',
  onUrlChange
}: CustomIconModeProps) {
  const STRINGS = getStrings(language);
  const [customIconError, setCustomIconError] = useState(false);

  /**
   * 处理自定义图标加载错误
   */
  const handleCustomIconError = useCallback(() => {
    setCustomIconError(true);
  }, []);

  /**
   * 处理自定义图标 URL 变化
   */
  const handleCustomUrlChange = useCallback((url: string) => {
    setCustomIconError(false);
    onUrlChange(url);
  }, [onUrlChange]);

  return (
    <div className="space-y-3">
      {/* URL 输入 */}
      <CustomIconInput
        customIconUrl={customIconUrl}
        hasError={customIconError}
        onUrlChange={handleCustomUrlChange}
        labels={{
          imageUrl: STRINGS.imageUrl,
          previewLabel: STRINGS.customIconPreview,
          loadFailedLabel: STRINGS.imageLoadFailed,
          successLabel: STRINGS.customIconSuccess
        }}
      />

      {/* 预览 */}
      {customIconUrl && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 overflow-hidden">
            {customIconError ? (
              <span className="text-sm text-red-500">{STRINGS.imageLoadFailed}</span>
            ) : (
              <img
                src={customIconUrl}
                alt="自定义图标预览"
                className="w-8 h-8 object-cover"
                onError={handleCustomIconError}
              />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {STRINGS.customIconPreview}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {customIconError ? STRINGS.imageLoadFailed : STRINGS.customIconSuccess}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
