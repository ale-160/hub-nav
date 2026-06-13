import React from 'react';

interface IconTypeSwitchProps {
  currentType: 'favicon' | 'builtin' | 'custom';
  onTypeChange: (type: 'favicon' | 'builtin' | 'custom') => void;
  labels: {
    iconSource: string;
    favicon: string;
    builtinIcon: string;
    customImage: string;
  };
}

/**
 * 图标来源选择器组件
 * 三种模式切换按钮：网站图标、内置图标、自定义图片
 */
export const IconTypeSwitch = React.memo(function IconTypeSwitch({
  currentType,
  onTypeChange,
  labels
}: IconTypeSwitchProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {labels.iconSource}
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onTypeChange('favicon')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            currentType === 'favicon'
              ? 'bg-blue-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          <svg className="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          {labels.favicon}
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('builtin')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            currentType === 'builtin'
              ? 'bg-blue-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          <svg className="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
          {labels.builtinIcon}
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('custom')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            currentType === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          <svg className="inline-block w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          {labels.customImage}
        </button>
      </div>
    </div>
  );
});
