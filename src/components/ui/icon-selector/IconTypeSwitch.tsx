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
          🌐 {labels.favicon}
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
          🎨 {labels.builtinIcon}
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
          🖼️ {labels.customImage}
        </button>
      </div>
    </div>
  );
});
