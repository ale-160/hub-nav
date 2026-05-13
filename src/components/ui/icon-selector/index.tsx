import React from 'react';
import { IconTypeSwitch } from './IconTypeSwitch';
import { FaviconMode } from './FaviconMode';
import { BuiltinIconMode } from './BuiltinIconMode';
import { CustomIconMode } from './CustomIconMode';
import { getStrings } from '@/data/i18n';

interface IconSelectorProps {
  iconType: 'favicon' | 'builtin' | 'custom';
  builtinIcon?: string;
  customIconUrl?: string;
  websiteUrl?: string;
  appName?: string;
  language?: 'zh' | 'en';
  
  // 稳定的回调
  onIconTypeChange: (type: 'favicon' | 'builtin' | 'custom') => void;
  onBuiltinIconChange: (iconId: string) => void;
  onCustomIconUrlChange: (url: string) => void;
  onWebsiteUrlChange?: (url: string) => void;
  onCustomColorChange?: (color: string) => void; // 新增：自定义颜色变化回调
  onFaviconSelect?: (url: string) => void; // ✅ 新增：用户选择 favicon 回调
}

export type { IconSelectorProps };

/**
 * 图标选择器主入口组件
 * 
 * 职责：
 * - 管理 iconType, builtinIcon, customIconUrl 状态（由父组件控制）
 * - 协调三种模式组件的渲染
 * - 暴露统一的 onChange 回调
 * 
 * 注意：遵循 Buy 务实策略，状态由父组件管理以避免输入卡顿
 */
export const IconSelector = React.memo(function IconSelector({
  iconType,
  builtinIcon,
  customIconUrl,
  websiteUrl,
  appName,
  language = 'zh',
  onIconTypeChange,
  onBuiltinIconChange,
  onCustomIconUrlChange,
  onCustomColorChange,
  onFaviconSelect
}: IconSelectorProps) {
  const STRINGS = getStrings(language);
  
  return (
    <div className="space-y-4">
      {/* 图标来源切换 */}
      <IconTypeSwitch
        currentType={iconType}
        onTypeChange={onIconTypeChange}
        labels={{
          iconSource: STRINGS.iconSource,
          favicon: STRINGS.favicon,
          builtinIcon: STRINGS.builtinIcon,
          customImage: STRINGS.customImage,
        }}
      />
      
      {/* 分模式渲染 */}
      {iconType === 'favicon' && (
        <FaviconMode
          websiteUrl={websiteUrl}
          language={language}
          onFaviconSelect={onFaviconSelect}
        />
      )}
      
      {iconType === 'builtin' && (
        <BuiltinIconMode
          builtinIcon={builtinIcon}
          appName={appName}
          language={language}
          onIconChange={onBuiltinIconChange}
          initialCustomColor={customIconUrl} // 使用 customIconUrl 作为初始自定义颜色
          onCustomColorChange={onCustomColorChange} // 传递自定义颜色变化回调
        />
      )}
      
      {iconType === 'custom' && (
        <CustomIconMode
          customIconUrl={customIconUrl}
          language={language}
          onUrlChange={onCustomIconUrlChange}
        />
      )}
    </div>
  );
});
