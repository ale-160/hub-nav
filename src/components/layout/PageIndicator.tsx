import React from 'react';
import { Page } from '@/lib/configManager';
import { getStrings } from '@/data/i18n';

interface PageIndicatorProps {
  pages: Page[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
  language?: 'zh' | 'en';
}

/**
 * 页面指示器组件 - 显示当前页面位置并允许切换页面
 * @param props - 组件属性
 */
export function PageIndicator({ pages, currentPageIndex, onPageChange, language = 'zh' }: PageIndicatorProps) {
  const STRINGS = getStrings(language);
  
  if (pages.length <= 1) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 flex gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
      {pages.map((page, index) => (
        <button
          key={page.id}
          onClick={() => onPageChange(index)}
          className={`w-2 h-2 rounded-full transition-all duration-200 ${
            index === currentPageIndex
              ? 'bg-primary w-6'
              : 'bg-muted-foreground/50 hover:bg-muted-foreground'
          }`}
          title={`${STRINGS.pageIndicator} ${index + 1}`}
          aria-label={`${STRINGS.pageIndicator} ${index + 1}`}
        />
      ))}
    </div>
  );
}
