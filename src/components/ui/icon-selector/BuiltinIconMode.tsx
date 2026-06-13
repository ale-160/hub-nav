import React, { useState, useMemo } from 'react';
import { getStrings } from '@/data/i18n';
import { renderSolidIcon, renderVectorIcon } from '@/utils/icon';
import { getCategorizedIcons, getSelectedBuiltinIcon } from '@/utils/icon';
import { BuiltinIconPicker } from './BuiltinIconPicker';

interface BuiltinIconModeProps {
  builtinIcon?: string;
  appName?: string;
  language?: 'zh' | 'en';
  onIconChange: (iconId: string) => void;
  initialCustomColor?: string;
  onCustomColorChange?: (color: string) => void;
}

/**
 * 内置图标模式组件
 * - 矢量图标（SVG线性图标）标签页
 * - 纯色图标（纯色圆形 + 首字）标签页
 */
export const BuiltinIconMode = React.memo(function BuiltinIconMode({
  builtinIcon,
  appName,
  language = 'zh',
  onIconChange,
  initialCustomColor,
  onCustomColorChange,
}: BuiltinIconModeProps) {
  // 默认激活标签页：纯色在前。若选中的是 vector-* 则切到矢量
  const defaultTab: 'vector' | 'solid' = builtinIcon?.startsWith('vector-') ? 'vector' : 'solid';
  const [activeTab, setActiveTab] = useState<'vector' | 'solid'>(defaultTab);

  const initialColor = builtinIcon === 'solid-color-17' ? (initialCustomColor || '') : (initialCustomColor || '');
  const [customColor, setCustomColor] = useState<string>(initialColor);

  const STRINGS = getStrings(language);

  const { vectorIcons, solidIcons } = useMemo(() =>
    getCategorizedIcons(customColor, language),
  [customColor, language]);

  const selectedIcon = useMemo(() =>
    getSelectedBuiltinIcon(builtinIcon, customColor, language),
  [builtinIcon, customColor, language]);

  return (
    <div className="space-y-3">
      {/* 标签页切换：纯色在前，矢量在后 */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('solid')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'solid'
              ? 'bg-blue-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {STRINGS.solidIcons}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vector')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'vector'
              ? 'bg-blue-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {language === 'en' ? 'Vector Icons' : '矢量图标'}
        </button>
      </div>

      <BuiltinIconPicker
        activeTab={activeTab}
        solidIcons={solidIcons}
        vectorIcons={vectorIcons}
        selectedIconId={builtinIcon}
        customColor={customColor}
        onSelect={(id) => {
          // 切换到对应标签页
          if (id.startsWith('vector-')) setActiveTab('vector');
          if (id.startsWith('solid-color-')) setActiveTab('solid');
          onIconChange(id);
        }}
        onCustomColorChange={(color) => {
          setCustomColor(color);
          onCustomColorChange?.(color);
        }}
        language={language}
        appName={appName}
      />

      {/* 选中预览 */}
      {selectedIcon && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border">
            {selectedIcon.type === 'vector' ? (
              renderVectorIcon(selectedIcon, 36)
            ) : (
              renderSolidIcon(selectedIcon, appName)
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {selectedIcon.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {selectedIcon.type === 'vector'
                ? (language === 'en' ? 'Vector Icon' : '矢量图标')
                : STRINGS.solidIcons}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
