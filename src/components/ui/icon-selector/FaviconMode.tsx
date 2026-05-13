import React, { useState, useEffect } from 'react';
import { getStrings } from '@/data/i18n';
import { FaviconPreview } from './FaviconPreview';
import { FaviconSelector } from './FaviconSelector';
import { extractDomain, generateFaviconCandidates } from '@/utils/url';
import { testSingleUrl } from '@/utils/favicon-preloader';
import { ConfigManager } from '@/lib/configManager';

interface FaviconModeProps {
  websiteUrl?: string;
  language?: 'zh' | 'en';
  onFaviconSelect?: (url: string) => void; // ✅ 新增：用户选择图标回调
}

/**
 * 网站图标模式组件
 * 
 * ✅ 修复2：删除 URL 输入框，websiteUrl 完全由父组件传入
 * 职责：
 * - 展示当前图标预览
 * - 提供"发现更多图标"按钮
 * - 展开网格选择器
 */
export const FaviconMode = React.memo(function FaviconMode({
  websiteUrl,
  language = 'zh',
  onFaviconSelect
}: FaviconModeProps) {
  const STRINGS = getStrings(language);
  const [showSelector, setShowSelector] = useState(false);
  const [autoDetectedIcon, setAutoDetectedIcon] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false); // ✅ 新增：探测状态

  // ✅ 自动探测第一个成功的 favicon
  useEffect(() => {
    if (!websiteUrl || showSelector) {
      setAutoDetectedIcon(null);
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true); // 开始探测
    let cancelled = false;

    async function detectFirstIcon() {
      try {
        if (!websiteUrl) return;
        const domain = extractDomain(websiteUrl);
        if (!domain) return;

        const candidates = generateFaviconCandidates(domain);
        if (candidates.length === 0) {
          if (!cancelled) setIsDetecting(false);
          return;
        }

        // ✅ 逐个测试，找到第一个成功的就停止
        for (const url of candidates) {
          if (cancelled) return;

          const result = await testSingleUrl(url, 3000);

          if (result.success) {
            if (!cancelled) {
              setAutoDetectedIcon(result.url);
              setIsDetecting(false); // ✅ 探测完成
              // ✅ 立即写入缓存，确保 FaviconPreview 使用正确的 URL
              if (domain) {
                ConfigManager.setIconCache(domain, result.url);
              }
            }
            return; // ✅ 找到第一个就停止
          }
        }
        
        // 所有候选都失败
        if (!cancelled) {
          setIsDetecting(false);
        }
      } catch {
        if (!cancelled) setIsDetecting(false);
      }
    }

    void detectFirstIcon();

    return () => {
      cancelled = true;
    };
  }, [websiteUrl, showSelector]);

  // ✅ 只使用自动探测成功的结果，不使用未测试的候选
  const websiteIconPreview = autoDetectedIcon || '';

  // 处理用户选择图标
  const handleSelect = (url: string) => {
    setShowSelector(false);
    if (onFaviconSelect) {
      onFaviconSelect(url);
    }
  };

  // 处理取消选择
  const handleCancel = () => {
    setShowSelector(false);
  };

  // 如果正在选择图标，显示选择器
  if (showSelector && websiteUrl) {
    return (
      <FaviconSelector
        websiteUrl={websiteUrl}
        language={language}
        onSelect={handleSelect}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* 探测中状态 */}
      {websiteUrl && isDetecting && !autoDetectedIcon && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {STRINGS.faviconPreview}
            </p>
            <p className="text-xs text-muted-foreground">
              {STRINGS.searchingFavicons || '正在获取网站图标...'}
            </p>
          </div>
        </div>
      )}

      {/* 成功获取到图标 */}
      {websiteUrl && websiteIconPreview && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border">
            {/* ✅ 使用 key 强制组件完全重新渲染 */}
            <FaviconPreview
              key={websiteIconPreview}
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
          {/* ✅ 新增：发现更多图标按钮 */}
          <button
            onClick={() => setShowSelector(true)}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {STRINGS.discoverMore}
          </button>
        </div>
      )}

      {!websiteUrl && (
        <div className="text-center py-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {STRINGS.enterUrlHint}
          </p>
        </div>
      )}

      {/* 探测完成但没有成功获取到图标 */}
      {websiteUrl && !isDetecting && !websiteIconPreview && (
        <div className="text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
            {STRINGS.fetchFailed}
          </p>
          {/* ✅ 新增：即使默认路径失败，也可能有其他候选 */}
          <button
            onClick={() => setShowSelector(true)}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {STRINGS.tryDiscoverMore}
          </button>
        </div>
      )}
    </div>
  );
});
