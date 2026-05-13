import React, { useEffect, useState } from 'react';
import { getStrings } from '@/data/i18n';
import { FaviconPreview } from './FaviconPreview';
import { getWebsiteIconPreviewUrl } from '@/utils/icon';

interface FaviconModeProps {
  websiteUrl?: string;
  language?: 'zh' | 'en';
  onWebsiteUrlChange?: (url: string) => void;
}

/**
 * 网站图标模式组件
 * 显示网站图标预览状态（成功、失败、无 URL）
 */
export const FaviconMode = React.memo(function FaviconMode({
  websiteUrl,
  language = 'zh'
}: FaviconModeProps) {
  const STRINGS = getStrings(language);
  const [websiteIconPreview, setWebsiteIconPreview] = useState<string>('');

  /**
   * 更新网站图标预览
   */
  useEffect(() => {
    if (websiteUrl) {
      const previewUrl = getWebsiteIconPreviewUrl(websiteUrl);
      setWebsiteIconPreview(previewUrl);
    } else {
      setWebsiteIconPreview('');
    }
  }, [websiteUrl]);

  return (
    <div className="space-y-3">
      {websiteUrl && websiteIconPreview && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border">
            <FaviconPreview
              src={websiteIconPreview}
              alt="网站图标预览"
              className="w-8 h-8"
              appName="网站图标"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {STRINGS.faviconPreview}
            </p>
            <p className="text-xs text-muted-foreground">
              {STRINGS.autoFetchFavicon}
            </p>
          </div>
        </div>
      )}

      {!websiteUrl && (
        <div className="text-center py-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {STRINGS.enterUrlHint}
          </p>
        </div>
      )}

      {websiteUrl && !websiteIconPreview && (
        <div className="text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {STRINGS.fetchFailed}
          </p>
        </div>
      )}
    </div>
  );
});
