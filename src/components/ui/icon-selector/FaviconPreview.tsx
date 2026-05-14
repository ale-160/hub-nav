import React, { useState, useCallback, useMemo, useEffect } from 'react';
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

  // ✅ 新增：监听 src 和 cachedSrc 变化，重置加载状态
  useEffect(() => {
    if (src) {
      // ✅ 如果有缓存，说明之前已验证过，直接显示图片（跳过加载等待）
      if (cachedSrc) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false);
        setImageLoadFailed(false);
      } else {
        setIsLoading(true);
        setImageLoadFailed(false);
      }
    }
  }, [src, cachedSrc]);

  // 处理图片加载成功 - 写入缓存
  const handleImageLoad = useCallback(() => {
    setIsLoading(false); // ✅ 确认成功后才显示图片
    // 注意：缓存写入已移至 FaviconMode 的自动探测逻辑中
    // 这里不再重复写入，避免冲突
  }, []);

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
