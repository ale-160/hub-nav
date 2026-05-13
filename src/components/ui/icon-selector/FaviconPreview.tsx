import React, { useState, useCallback, useMemo } from 'react';
import { ConfigManager } from '@/lib/configManager';
import { extractDomain } from '@/utils/url';
import { getFallbackIcon } from '@/utils/url';

/**
 * Favicon 预览组件 - 使用拼接方式
 */
interface FaviconPreviewProps {
  src: string;
  alt: string;
  className?: string;
  appName?: string;
}

export function FaviconPreview({ src, alt, className = '', appName = '' }: FaviconPreviewProps) {
  // ✅ 修复1：使用 isLoading 状态，在图片加载成功前保持 fallback
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  // 直接从缓存读取（派生状态，无需 useEffect + setState）
  const cachedSrc = useMemo(() => {
    if (!src) return null;
    try {
      const domain = extractDomain(src);
      return ConfigManager.getCachedIcon(domain);
    } catch {
      return null;
    }
  }, [src]);

  // 处理图片加载成功 - 写入缓存
  const handleImageLoad = useCallback(() => {
    setIsLoading(false); // ✅ 确认成功后才显示图片
    if (src && !cachedSrc) {
      try {
        const domain = extractDomain(src);
        ConfigManager.setIconCache(domain, src);
      } catch {
        // 忽略缓存写入错误
      }
    }
  }, [src, cachedSrc]);

  // 处理图片加载失败
  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setImageLoadFailed(true);
  }, []);

  // ✅ 修复1：加载中或加载失败时，始终显示 fallback
  if (isLoading || imageLoadFailed || !src) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <span className="text-2xl">{getFallbackIcon(appName)}</span>
      </div>
    );
  }

  // 显示图片（优先使用缓存）
  return (
    <img
      src={cachedSrc || src}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
}
