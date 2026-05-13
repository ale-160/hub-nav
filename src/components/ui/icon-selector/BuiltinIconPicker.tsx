import React, { useRef } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { renderSolidIcon } from '@/utils/icon';
import { getStrings } from '@/data/i18n';

interface IconItem {
  id: string;
  name: string;
  emoji?: string;
  type: 'solid' | 'emoji';
  color?: string;
}

interface BuiltinIconPickerProps {
  activeTab: 'solid' | 'emoji';
  solidIcons: IconItem[];
  emojiIcons: IconItem[];
  selectedIconId?: string;
  customColor: string;
  onSelect: (iconId: string) => void;
  onCustomColorChange: (color: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  language: 'zh' | 'en';
  appName?: string;
}

/**
 * 内置图标选择器组件
 * 包含搜索框、标签页、图标网格
 */
export const BuiltinIconPicker = React.memo(function BuiltinIconPicker({
  activeTab,
  solidIcons,
  emojiIcons,
  selectedIconId,
  customColor,
  onSelect,
  onCustomColorChange,
  searchQuery,
  onSearchChange,
  language,
  appName
}: BuiltinIconPickerProps) {
  const STRINGS = getStrings(language);

  // ✅ 使用 ref 获取颜色选择器 DOM 引用
  const colorPickerRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {/* 搜索框 */}
      <Command className="border border-border rounded-lg mb-3">
        <CommandInput
          placeholder={language === 'zh' ? '搜索图标...' : 'Search icons...'}
          value={searchQuery}
          onValueChange={onSearchChange}
        />
        <CommandList>
          <CommandEmpty>{language === 'zh' ? '未找到图标' : 'No icons found'}</CommandEmpty>
          <CommandGroup>
            <div className={`grid gap-2 max-h-48 overflow-y-auto p-1 ${
              activeTab === 'solid' ? 'grid-cols-6' : 'grid-cols-6'
            }`}>
              {(activeTab === 'solid' ? solidIcons : emojiIcons).map((icon) => {
                const isPalette = icon.id.includes('color-17') && !customColor;
                const isCustomColor = icon.id.includes('color-17') && customColor;

                return (
                  <CommandItem
                    key={icon.id}
                    onSelect={() => {
                      if (isPalette) {
                        // ✅ 调色盘：通过 ref 触发隐藏的颜色选择器
                        if (colorPickerRef.current) {
                          colorPickerRef.current.click();
                        }
                      } else {
                        onSelect(icon.id);
                      }
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all cursor-pointer p-0! ${
                      selectedIconId === icon.id
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#141b2d] dark:text-gray-300 dark:hover:bg-[#1c2541]'
                    }`}
                    title={isCustomColor ? STRINGS.customColor : (isPalette ? (language === 'zh' ? '调色盘' : 'Color Palette') : icon.name)}
                  >
                    {isPalette ? (
                      <span className="text-lg">🎨</span>
                    ) : icon.type === 'solid' ? (
                      renderSolidIcon({ ...icon, emoji: icon.emoji || '' }, appName || (isCustomColor ? '自' : '应用'))
                    ) : (
                      icon.emoji
                    )}
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>

      {/* ✅ 隐藏的颜色选择器 - 使用 ref 绑定 */}
      <input
        ref={colorPickerRef}
        type="color"
        className="hidden"
        onChange={(e) => {
          const selectedColor = e.target.value;
          onCustomColorChange(selectedColor);
          // 选中自定义颜色
          onSelect('solid-color-17');
        }}
      />
    </div>
  );
});
