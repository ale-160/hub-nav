import React, { useState, useMemo } from 'react';
import { getStrings } from '@/data/i18n';
import { renderSolidIcon } from '@/utils/icon';
import { getCategorizedIcons, getSelectedBuiltinIcon, getIconName } from '@/utils/icon';
import { BuiltinIconPicker } from './BuiltinIconPicker';

interface BuiltinIconModeProps {
  builtinIcon?: string;
  appName?: string;
  language?: 'zh' | 'en';
  onIconChange: (iconId: string) => void;
  initialCustomColor?: string; // 初始自定义颜色
  onCustomColorChange?: (color: string) => void; // 自定义颜色变化回调
}

/**
 * 内置图标模式组件
 * 包含标签页切换、搜索、图标选择器、选中预览
 */
export const BuiltinIconMode = React.memo(function BuiltinIconMode({
  builtinIcon,
  appName,
  language = 'zh',
  onIconChange,
  initialCustomColor,
  onCustomColorChange
}: BuiltinIconModeProps) {
  const [activeTab, setActiveTab] = useState<'solid' | 'emoji'>('solid');
  // 如果 builtinIcon 是 solid-color-17，从 initialCustomColor 恢复颜色；否则从 initialCustomColor 初始化
  const initialColor = builtinIcon === 'solid-color-17' ? (initialCustomColor || '') : (initialCustomColor || '');
  const [customColor, setCustomColor] = useState<string>(initialColor);
  const [searchQuery, setSearchQuery] = useState('');
  
  const STRINGS = getStrings(language);
  
  // 工具函数调用（原内联逻辑抽离）
  const { emojiIcons, solidIcons } = useMemo(() => 
    getCategorizedIcons(customColor, language),
  [customColor, language]);
  
  const selectedIcon = useMemo(() => 
    getSelectedBuiltinIcon(builtinIcon, customColor, language),
  [builtinIcon, customColor, language]);
  
  // 搜索过滤
  const filteredSolidIcons = useMemo(() => 
    searchQuery 
      ? solidIcons.filter(icon => 
          getIconName(icon.id, language, customColor).toLowerCase().includes(searchQuery.toLowerCase())
        )
      : solidIcons,
  [solidIcons, searchQuery, language, customColor]);
  
  const filteredEmojiIcons = useMemo(() => 
    searchQuery
      ? emojiIcons.filter(icon => 
          getIconName(icon.id, language).toLowerCase().includes(searchQuery.toLowerCase()) ||
          icon.emoji?.includes(searchQuery) ||
          icon.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : emojiIcons,
  [emojiIcons, searchQuery, language]);

  return (
    <div className="space-y-3">
      {/* 标签页切换 */}
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
          onClick={() => setActiveTab('emoji')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeTab === 'emoji'
              ? 'bg-blue-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {STRINGS.emojiIcons}
        </button>
      </div>
      
      {/* 图标选择器 */}
      <BuiltinIconPicker
        activeTab={activeTab}
        solidIcons={filteredSolidIcons}
        emojiIcons={filteredEmojiIcons}
        selectedIconId={builtinIcon}
        customColor={customColor}
        onSelect={onIconChange}
        onCustomColorChange={(color) => {
          setCustomColor(color);
          onCustomColorChange?.(color);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        language={language}
        appName={appName}
      />
      
      {/* 选中预览 */}
      {selectedIcon && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
          <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border">
            {selectedIcon.type === 'solid' ? renderSolidIcon(selectedIcon) : (
              <span className="text-2xl">{selectedIcon.emoji}</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {selectedIcon.name}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {selectedIcon.type === 'solid' ? STRINGS.solidIcons : STRINGS.emojiIcons}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
