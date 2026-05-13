import React from 'react';

interface PageNavigationProps {
  direction: 'left' | 'right';
  onClick: () => void;
  label: string;
}

/**
 * 页面导航按钮组件
 * 用于上一页/下一页切换
 */
export const PageNavigation = React.memo(function PageNavigation({
  direction,
  onClick,
  label
}: PageNavigationProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed ${direction === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-accent transition-all duration-200`}
      title={label}
      aria-label={label}
    >
      <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {direction === 'left' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
});
