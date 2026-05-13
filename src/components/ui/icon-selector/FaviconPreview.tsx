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
    setImageLoadFailed(true);
  }, []);

  // 如果图片加载失败，显示回退图标
  if (imageLoadFailed || !src) {
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
