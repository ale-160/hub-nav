import React, { useState, useEffect, useRef } from 'react';
import { generateFaviconCandidates } from '@/utils/favicon-strategies';
import { testSingleUrl } from '@/utils/favicon-preloader';
import { extractDomain } from '@/utils/url';
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
        <svg className="text-muted-foreground w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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

  // ✅ 流式渲染：维护并发池状态
  const runningRef = useRef(0); // 当前正在运行的请求数
  const indexRef = useRef(0); // 下一个要测试的候选索引
  const candidatesRef = useRef<string[]>([]); // 候选 URL 列表
  const resultsMapRef = useRef<Map<string, boolean>>(new Map()); // 已成功的图标 Map（用于保持优先级）
  const maxConcurrent = 5; // 最大并发数
  const maxResults = 6; // 最多展示 6 个图标

  useEffect(() => {
    let cancelled = false;

    async function fetchIcons() {
      try {
        setLoading(true);
        setError(null);
        setAvailableIcons([]); // 清空之前的结果

        const domain = extractDomain(websiteUrl);
        if (!domain) {
          setError(getStrings(language).invalidDomain);
          setLoading(false);
          return;
        }

        // 生成候选列表
        const candidates = generateFaviconCandidates(domain);
        if (candidates.length === 0) {
          setError(getStrings(language).noFaviconFound);
          setLoading(false);
          return;
        }

        // ✅ 初始化并发池状态
        candidatesRef.current = candidates;
        indexRef.current = 0;
        runningRef.current = 0;
        resultsMapRef.current = new Map(); // 清空结果缓存

        // ✅ 更新显示图标的函数：按原始优先级排序
        const updateAvailableIcons = () => {
          const sortedIcons = candidates.filter(url => resultsMapRef.current.get(url)).slice(0, maxResults);
          setAvailableIcons(sortedIcons);
        };

        // ✅ 启动并发池
        const runNext = async () => {
          if (cancelled) return;

          // 如果已经找到足够的图标，停止派发新请求
          if (resultsMapRef.current.size >= maxResults) {
            setLoading(false);
            return;
          }

          // 如果所有候选都已派发，等待运行中的请求完成
          if (indexRef.current >= candidates.length) {
            if (runningRef.current === 0) {
              // 所有请求都完成了
              setLoading(false);
              if (resultsMapRef.current.size === 0) {
                setError(getStrings(language).noFaviconFound);
              }
            }
            return;
          }

          // 如果未达到最大并发数，派发新请求
          while (runningRef.current < maxConcurrent && indexRef.current < candidates.length) {
            const currentIndex = indexRef.current++;
            const url = candidates[currentIndex];
            runningRef.current++;

            // 异步测试单个 URL
            void testSingleUrl(url, 3000).then((result) => {
              if (cancelled) return;

              runningRef.current--;

              if (result.success) {
                // ✅ 记录成功的图标
                resultsMapRef.current.set(url, true);
                updateAvailableIcons();

                // 如果已达到最大值，停止后续请求
                if (resultsMapRef.current.size >= maxResults) {
                  setLoading(false);
                  return;
                }
              }

              // 继续派发下一个请求
              runNext();
            });
          }
        };

        // 启动并发池
        void runNext();
      } catch (_err) {
        if (!cancelled) {
          setError(getStrings(language).fetchError);
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
