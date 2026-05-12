import { useState, useCallback, useEffect, useMemo } from 'react';
import { BUILTIN_ICONS } from '@/lib/builtinIcons';
import { ConfigManager } from '@/lib/configManager';
import { extractDomain, getFaviconUrls, getFallbackIcon } from '@/lib/urlUtils';
import { renderSolidIcon } from '@/lib/iconUtils';
import { getStrings } from '@/lib/strings';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

/**
 * Favicon 预览组件 - 使用拼接方式
 */
interface FaviconPreviewProps {
  src: string;
  alt: string;
  className?: string;
  appName?: string;
}

function FaviconPreview({ src, alt, className = '', appName = '' }: FaviconPreviewProps) {
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

  // 处理图片加载成功 - 写入缓存
  const handleImageLoad = useCallback(() => {
    if (src && !cachedSrc) {
      try {
        const domain = extractDomain(src);
        ConfigManager.setIconCache(domain, src);
      } catch {
        // 忽略缓存写入错误
      }
    }
  }, [src, cachedSrc]);

  // 处理图片加载失败
  const handleImageError = useCallback(() => {
    setImageLoadFailed(true);
  }, []);

  // 如果图片加载失败，显示回退图标
  if (imageLoadFailed || !src) {
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

interface IconSelectorProps {
  iconType: 'favicon' | 'builtin' | 'custom';
  builtinIcon?: string;
  customIconUrl?: string;
  websiteUrl?: string;
  appName?: string; // 应用名称，用于纯色图标预览
  language?: 'zh' | 'en'; // 语言
  onIconTypeChange: (type: 'favicon' | 'builtin' | 'custom') => void;
  onBuiltinIconChange: (iconId: string) => void;
  onCustomIconUrlChange: (url: string) => void;
  onWebsiteUrlChange: (url: string) => void;
}

/**
 * 图标选择器组件
 */
export function IconSelector({
  iconType,
  builtinIcon,
  customIconUrl,
  websiteUrl,
  appName,
  language = 'zh',
  onIconTypeChange,
  onBuiltinIconChange,
  onCustomIconUrlChange
}: IconSelectorProps) {
  const STRINGS = getStrings(language);
  const [customIconError, setCustomIconError] = useState(false);
  const [websiteIconPreview, setWebsiteIconPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'solid' | 'emoji'>('solid');
  const [customColor, setCustomColor] = useState<string>(''); // 自定义颜色
  const [searchQuery, setSearchQuery] = useState(''); // 搜索关键词

  /**
   * 获取图标名称（根据语言）
   */
  const getIconName = useCallback((iconId: string): string => {
    // 处理纯色图标 (solid-color-X 格式)
    if (iconId.startsWith('solid-color-')) {
      const colorIndex = parseInt(iconId.replace('solid-color-', ''));
      if (colorIndex === 17) {
        return customColor ? STRINGS.customColor : '调色盘';
      }
      // 纯色图标没有映射，使用默认名称
      return language === 'en' ? `Color ${colorIndex + 1}` : `颜色${colorIndex + 1}`;
    }

    // 处理 solid- 前缀的图标
    if (iconId.startsWith('solid-')) {
      const baseId = iconId.replace('solid-', '');
      return STRINGS.iconNames[baseId as keyof typeof STRINGS.iconNames] || iconId;
    }

    // 处理普通图标
    return STRINGS.iconNames[iconId as keyof typeof STRINGS.iconNames] || iconId;
  }, [language, customColor, STRINGS]);

  // 初始化时根据 builtinIcon 设置选中状态
  // useEffect(() => {
  //   if (builtinIcon && builtinIcon.startsWith('solid-color-')) {
  //     setSelectedSolidIconId(builtinIcon);
  //   }
  // }, [builtinIcon]);

  /**
   * 获取分类后的图标
   */
  const getCategorizedIcons = useCallback(() => {
    const emojiIcons = BUILTIN_ICONS.filter(icon => icon.type === 'emoji');

    // 纯色图标：17个常用颜色 + 1个调色盘
    const solidColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
      '#f43f5e', '#eab308', '#0ea5e9', '#22c55e', '#6366f1',
      '#6b7280', '#000000', customColor || '#ffffff'
    ];

    const solidIcons = solidColors.map((color, index) => ({
      id: `solid-color-${index}`,
      name: index === 17 ? (customColor ? '自定义颜色' : '调色盘') : `颜色${index + 1}`,
      emoji: index === 17 && !customColor ? '' : '',
      type: 'solid' as const,
      color: color
    }));

    return { emojiIcons, solidIcons };
  }, [customColor]);

  /**
   * 处理自定义图标加载错误
   */
  const handleCustomIconError = useCallback(() => {
    setCustomIconError(true);
  }, []);

  /**
   * 处理自定义图标 URL 变化
   */
  const handleCustomUrlChange = useCallback((url: string) => {
    setCustomIconError(false);
    onCustomIconUrlChange(url);
  }, [onCustomIconUrlChange]);

  /**
   * 获取网站图标的预览 URL（拼接方式）
   */
  const getWebsiteIconPreviewUrl = useCallback((url: string) => {
    if (!url) return '';

    try {
      const domain = extractDomain(url);
      const faviconUrls = getFaviconUrls(domain);
      return faviconUrls[0] || '';
    } catch {
      return '';
    }
  }, []);

  /**
   * 更新网站图标预览
   */
  useEffect(() => {
    if (iconType === 'favicon' && websiteUrl) {
      const previewUrl = getWebsiteIconPreviewUrl(websiteUrl);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWebsiteIconPreview(previewUrl);
    } else if (iconType !== 'favicon') {
      setWebsiteIconPreview('');
    }
  }, [iconType, websiteUrl, getWebsiteIconPreviewUrl]);
  const getSelectedBuiltinIcon = useCallback(() => {
    if (!builtinIcon) return BUILTIN_ICONS[0];

    // 如果是纯色图标，构造对应的 BuiltinIcon 对象
    if (builtinIcon.startsWith('solid-color-')) {
      const colorIndex = parseInt(builtinIcon.replace('solid-color-', ''));
      const solidColors = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
        '#f43f5e', '#eab308', '#0ea5e9', '#22c55e', '#6366f1',
        '#6b7280', '#000000', customColor || '#ffffff'
      ];

      return {
        id: builtinIcon,
        name: getIconName(builtinIcon),
        emoji: '',
        type: 'solid' as const,
        color: solidColors[colorIndex] || '#ffffff'
      };
    }

    // 否则从 BUILTIN_ICONS 中查找并返回国际化名称
    const originalIcon = BUILTIN_ICONS.find(icon => icon.id === builtinIcon) || BUILTIN_ICONS[0];
    return {
      ...originalIcon,
      name: getIconName(builtinIcon)
    };
  }, [builtinIcon, customColor, getIconName]);

  const { emojiIcons, solidIcons } = getCategorizedIcons();

  // 根据搜索关键词过滤图标
  const filteredSolidIcons = searchQuery
    ? solidIcons.filter(icon => getIconName(icon.id).toLowerCase().includes(searchQuery.toLowerCase()))
    : solidIcons;

  const filteredEmojiIcons = searchQuery
    ? emojiIcons.filter(icon =>
        getIconName(icon.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        icon.emoji.includes(searchQuery)
      )
    : emojiIcons;

  return (
    <div className="space-y-4">
      {/* 图标来源选择器 */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {STRINGS.iconSource}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onIconTypeChange('favicon')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              iconType === 'favicon'
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            🌐 {STRINGS.favicon}
          </button>
          <button
            type="button"
            onClick={() => onIconTypeChange('builtin')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              iconType === 'builtin'
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            🎨 {STRINGS.builtinIcon}
          </button>
          <button
            type="button"
            onClick={() => onIconTypeChange('custom')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              iconType === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            🖼️ {STRINGS.customImage}
          </button>
        </div>
      </div>

      {/* 网站图标模式 */}
      {iconType === 'favicon' && (
        <div className="space-y-3">
          {websiteUrl && websiteIconPreview && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border">
                <FaviconPreview
                  src={websiteIconPreview}
                  alt="网站图标预览"
                  className="w-8 h-8"
                  appName="网站图标"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {STRINGS.faviconPreview}
                </p>
                <p className="text-xs text-muted-foreground">
                  {STRINGS.autoFetchFavicon}
                </p>
              </div>
            </div>
          )}

          {!websiteUrl && (
            <div className="text-center py-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {STRINGS.enterUrlHint}
              </p>
            </div>
          )}

          {websiteUrl && !websiteIconPreview && (
            <div className="text-center py-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {STRINGS.fetchFailed}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 内置图标模式 */}
      {iconType === 'builtin' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {STRINGS.selectIcon}
            </label>

            {/* 图标类型标签 */}
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

            {/* 搜索框 */}
            <Command className="border border-border rounded-lg mb-3">
              <CommandInput
                placeholder={language === 'zh' ? '搜索图标...' : 'Search icons...'}
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                <CommandEmpty>{language === 'zh' ? '未找到图标' : 'No icons found'}</CommandEmpty>
                <CommandGroup>
                  <div className={`grid gap-2 max-h-48 overflow-y-auto p-1 ${
                    activeTab === 'solid' ? 'grid-cols-6' : 'grid-cols-6'
                  }`}>
                    {(activeTab === 'solid' ? filteredSolidIcons : filteredEmojiIcons).map((icon) => {
                      const isPalette = icon.id.includes('color-17') && !customColor;
                      const isCustomColor = icon.id.includes('color-17') && customColor;

                      return (
                        <CommandItem
                          key={icon.id}
                          onSelect={() => {
                            if (isPalette) {
                              // 调色盘：触发隐藏的颜色选择器
                              const colorInput = document.getElementById('custom-color-picker') as HTMLInputElement;
                              if (colorInput) {
                                colorInput.click();
                              }
                            } else {
                              onBuiltinIconChange(icon.id);
      // 纯色图标和 Emoji 图标互斥：选中纯色时清除 Emoji 状态，选中 Emoji 时清除纯色状态
                              if (icon.type === 'solid') {
                                // setSelectedSolidIconId(icon.id); - removed unused variable
                              } else {
                                // setSelectedSolidIconId(''); - removed unused variable
                              }
                            }
                          }}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all cursor-pointer ${
                            builtinIcon === icon.id
                              ? 'bg-blue-600 text-white scale-110 ring-2 ring-blue-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-[#141b2d] dark:text-gray-300 dark:hover:bg-[#1c2541]'
                          }`}
                          title={isPalette ? STRINGS.customColor : isCustomColor ? STRINGS.customColor : icon.name}
                        >
                          {isPalette ? (
                            <span className="text-lg">🎨</span>
                          ) : icon.type === 'solid' ? (
                            renderSolidIcon(icon, appName || (isCustomColor ? '自' : '应用'))
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

            {/* 隐藏的颜色选择器 */}
            <input
              id="custom-color-picker"
              type="color"
              className="hidden"
              onChange={(e) => {
                const selectedColor = e.target.value;
                setCustomColor(selectedColor);
                // 选中自定义颜色
                onBuiltinIconChange('solid-color-17');
              }}
            />
          </div>

          {builtinIcon && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center border border-border">
                {(() => {
                  const icon = getSelectedBuiltinIcon();
                  return icon.type === 'solid' ? renderSolidIcon(icon) : (
                    <span className="text-2xl">{icon.emoji}</span>
                  );
                })()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {STRINGS.selected}: {getSelectedBuiltinIcon().name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getSelectedBuiltinIcon().type === 'solid' ? STRINGS.solidIcons : STRINGS.emojiIcons}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 自定义图标模式 */}
      {iconType === 'custom' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {STRINGS.imageUrl}
            </label>
            <input
              type="url"
              value={customIconUrl || ''}
              onChange={(e) => handleCustomUrlChange(e.target.value)}
              placeholder="https://example.com/icon.png"
              className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {customIconUrl && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 overflow-hidden">
                {customIconError ? (
                  <span className="text-sm text-red-500">{STRINGS.imageLoadFailed}</span>
                ) : (
                  <img
                    src={customIconUrl}
                    alt="自定义图标预览"
                    className="w-8 h-8 object-cover"
                    onError={handleCustomIconError}
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {STRINGS.customIconPreview}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {customIconError ? STRINGS.imageLoadFailed : STRINGS.customIconSuccess}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
