import React, { useState, useEffect } from 'react';
import { generateFaviconCandidates } from '@/utils/favicon-strategies';
import { preloadFavicons } from '@/utils/favicon-preloader';
import { extractDomain } from '@/utils/url';
import { ConfigManager } from '@/lib/configManager';
import { getStrings } from '@/data/i18n';

interface FaviconSelectorProps {
  websiteUrl: string;
  language?: 'zh' | 'en';
  onSelect: (selectedUrl: string) => void;
  onCancel: () => void;
}

/**
 * 单个 Favicon 选项组件
 * 处理加载失败时显示占位符，避免网格空洞
 */
function FaviconOption({
  url,
  index,
  onSelect
}: {
  url: string;
  index: number;
  onSelect: () => void;
}) {
  const [loadFailed, setLoadFailed] = useState(false);

  if (loadFailed) {
    // ✅ 加载失败时显示占位符，保持网格布局完整
    return (
      <button
        onClick={onSelect}
        className="aspect-square rounded-lg border-2 border-border/50 bg-muted/50 flex items-center justify-center cursor-not-allowed opacity-50"
        disabled
        title="图标加载失败"
      >
        <span className="text-2xl text-muted-foreground">❌</span>
      </button>
    );
  }

  return (
    <button
      onClick={onSelect}
      className="aspect-square rounded-lg border-2 border-border hover:border-primary transition-all p-2 flex items-center justify-center bg-background"
      data-testid="favicon-option"
    >
      <img
        src={url}
        alt={`Favicon option ${index + 1}`}
        className="w-full h-full object-contain"
        onError={() => setLoadFailed(true)}
      />
    </button>
  );
}

/**
 * Favicon 选择器组件
 *
 * 功能：
 * - 并行测试多个候选图标 URL
 * - 展示可用图标网格（最多 6 个）
 * - 用户点击选择心仪图标
 */
export function FaviconSelector({
  websiteUrl,
  language = 'zh',
  onSelect,
  onCancel
}: FaviconSelectorProps) {
  const STRINGS = getStrings(language);
  const [loading, setLoading] = useState(true);
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchIcons() {
      try {
        setLoading(true);
        setError(null);

        const domain = extractDomain(websiteUrl);
        if (!domain) {
          setError(getStrings(language).invalidDomain);
          setLoading(false);
          return;
        }

        // ✅ 移除缓存拦截：用户主动点击"发现更多"时应强制重新探测所有候选
        // 生成候选并预加载
        const candidates = generateFaviconCandidates(domain);
        const results = await preloadFavicons(candidates);

        if (cancelled) return;

        if (results.length === 0) {
          setError(getStrings(language).noFaviconFound);
        } else {
          // 最多展示 6 个图标，避免 UI 拥挤
          setAvailableIcons(results.slice(0, 6).map(r => r.url));
        }
      } catch (_err) {
        if (!cancelled) {
          setError(getStrings(language).fetchError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchIcons();

    return () => {
      cancelled = true;
    };
  }, [websiteUrl, language]);

  const handleSelect = (url: string) => {
    const domain = extractDomain(websiteUrl);
    if (domain) {
      ConfigManager.setIconCache(domain, url);
    }
    onSelect(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-muted-foreground">
          {STRINGS.searchingFavicons}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-destructive mb-4">{error}</p>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          {STRINGS.useDefaultIcon}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">
        {STRINGS.selectPreferredIcon}
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {availableIcons.map((url, index) => (
          <FaviconOption
            key={url}
            url={url}
            index={index}
            onSelect={() => handleSelect(url)}
          />
        ))}
      </div>

      <div className="flex justify-between items-center pt-2">
        <p className="text-xs text-muted-foreground">
          {STRINGS.faviconTip}
        </p>
        <button
          onClick={onCancel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {STRINGS.cancel}
        </button>
      </div>
    </div>
  );
}
