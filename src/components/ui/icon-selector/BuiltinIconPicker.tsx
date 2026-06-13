import React, { useRef } from 'react';
import { renderSolidIcon, renderVectorIcon } from '@/utils/icon';
import { getStrings } from '@/data/i18n';
import { BuiltinIcon } from '@/data/icons';

interface BuiltinIconPickerProps {
  activeTab: 'vector' | 'solid';
  solidIcons: BuiltinIcon[];
  vectorIcons: BuiltinIcon[];
  selectedIconId?: string;
  customColor: string;
  onSelect: (iconId: string) => void;
  onCustomColorChange: (color: string) => void;
  language: 'zh' | 'en';
  appName?: string;
}

/**
 * 内置图标选择器组件
 * - 矢量图标标签页：线性 SVG 图标
 * - 纯色图标标签页：纯色圆形 + 首字
 */
export const BuiltinIconPicker = React.memo(function BuiltinIconPicker({
  activeTab,
  solidIcons,
  vectorIcons,
  selectedIconId,
  customColor,
  onSelect,
  onCustomColorChange,
  language,
  appName,
}: BuiltinIconPickerProps) {
  const STRINGS = getStrings(language);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  const icons = activeTab === 'vector' ? vectorIcons : solidIcons;

  return (
    <div>
      <div className={`grid gap-2 max-h-48 overflow-y-auto p-1 ${
      activeTab === 'vector' ? 'grid-cols-6' : 'grid-cols-6'
    }`}>
      {icons.map((icon) => {
      const isPalette = activeTab === 'solid' && icon.id.includes('color-17') && !customColor;
      const isCustomColor = activeTab === 'solid' && icon.id.includes('color-17') && customColor;

      return (
        <button
          key={icon.id}
          onClick={() => {
            if (isPalette) {
              if (colorPickerRef.current) {
                colorPickerRef.current.click();
              }
            } else {
              onSelect(icon.id);
            }
          }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all cursor-pointer ${
            selectedIconId === icon.id
              ? 'ring-2 ring-blue-500 bg-gray-100 dark:bg-[#1c2541]'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-[#141b2d] dark:hover:bg-[#1c2541]'
          }`}
          title={
            isCustomColor
              ? STRINGS.customColor
              : isPalette
              ? language === 'zh' ? '调色盘' : 'Color Palette'
              : icon.name
          }
        >
          {isPalette ? (
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <circle cx="11" cy="11" r="2" />
            </svg>
          ) : activeTab === 'vector' ? (
            renderVectorIcon(icon, 28)
          ) : (
            renderSolidIcon(icon, appName || (isCustomColor ? '自' : '应用'))
          )}
        </button>
      );
    })}
    </div>

      <input
        ref={colorPickerRef}
        type="color"
        className="hidden"
        onChange={(e) => {
          const selectedColor = e.target.value;
          onCustomColorChange(selectedColor);
          onSelect('solid-color-17');
        }}
      />
    </div>
  );
});
