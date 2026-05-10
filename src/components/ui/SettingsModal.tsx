'use client';

import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { UserConfig, OperationModeSettings } from '../../lib/configManager';
import { Modal } from './modal';
import { Button } from './button';
import { Slider } from './slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { OperationModeSelector } from './OperationModeSelector';
import { getStrings } from '../../lib/strings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UserConfig;
  onConfigUpdate: (partial: Partial<UserConfig>) => void;
  onImport: () => void;
  onExport: () => void;
  language?: 'zh' | 'en';
}

/**
 * 预设壁纸列表
 */
const WALLPAPERS = [
  { id: 'none', name: '无壁纸', url: '' },
  { id: 'gradient1', name: '渐变蓝', url: 'linear-gradient(to bottom, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient2', name: '渐变紫', url: 'linear-gradient(to bottom, #a78bfa 0%, #7c3aed 100%)' },
  { id: 'gradient3', name: '渐变橙', url: 'linear-gradient(to bottom, #fbbf24 0%, #f59e0b 100%)' },
  { id: 'gradient4', name: '渐变绿', url: 'linear-gradient(to bottom, #10b981 0%, #059669 100%)' },
  { id: 'unsplash1', name: '自然风景', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800' },
  { id: 'unsplash2', name: '城市夜景', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800' },
  { id: 'unsplash3', name: '抽象艺术', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800' }
];

/**
 * 搜索引擎列表
 */
const SEARCH_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=' }
];

/**
 * 设置面板组件
 */
export function SettingsModal({ isOpen, onClose, config, onConfigUpdate, onImport, onExport, language }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'search' | 'data' | 'language' | 'operation'>('appearance');
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState('');
  const [customSearchEngine, setCustomSearchEngine] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [uploadedWallpaper, setUploadedWallpaper] = useState<string | null>(null);

  // 根据当前配置的语言获取文案（优先使用传入的 language，其次使用 config 中的）
  const currentLanguage = language || config.theme.language || 'zh';
  const STRINGS = getStrings(currentLanguage);

  /**
   * 计算存储信息
   */
  const storageInfo = useMemo(() => {
    if (typeof window === 'undefined') {
      return { totalSize: '0 B', iconCount: 0, folderCount: 0, pageCount: 0 };
    }

    // 计算 localStorage 总大小
    let totalSize = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length * 2; // UTF-16 编码，每个字符 2 字节
        }
      }
    }

    // 格式化大小
    let formattedSize: string;
    if (totalSize < 1024) {
      formattedSize = `${totalSize} B`;
    } else if (totalSize < 1024 * 1024) {
      formattedSize = `${(totalSize / 1024).toFixed(1)} KB`;
    } else {
      formattedSize = `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
    }

    return {
      totalSize: formattedSize,
      iconCount: config.icons.length,
      folderCount: config.folders.length,
      pageCount: config.pages.length,
    };
  }, [config]);

  /**
   * 处理壁纸选择
   */
  const handleWallpaperSelect = useCallback((wallpaperUrl: string) => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        wallpaperUrl: wallpaperUrl === '' ? undefined : wallpaperUrl
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 处理图标大小选择
   */
  const handleIconSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        iconSize: size
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 处理图标间距变化
   */
  const handleGridSpacingChange = useCallback((spacing: number) => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        gridSpacing: spacing
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 处理字体颜色变化
   */
  const handleFontColorChange = useCallback((fontColor: string) => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        fontColor: fontColor || undefined
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 处理搜索引擎选择
   */
  const handleSearchEngineChange = useCallback((engineUrl: string) => {
    onConfigUpdate({
      searchEngine: engineUrl
    });
  }, [onConfigUpdate]);

  /**
   * 处理自定义壁纸应用
   */
  const handleCustomWallpaperApply = useCallback(() => {
    if (customWallpaperUrl.trim()) {
      handleWallpaperSelect(customWallpaperUrl.trim());
      setCustomWallpaperUrl('');
    }
  }, [customWallpaperUrl, handleWallpaperSelect]);

  /**
   * 处理自定义搜索引擎应用
   */
  const handleCustomSearchEngineApply = useCallback(() => {
    if (customSearchEngine.trim()) {
      handleSearchEngineChange(customSearchEngine.trim());
      setCustomSearchEngine('');
    }
  }, [customSearchEngine, handleSearchEngineChange]);

  /**
   * 处理导入配置
   */
  const handleImportConfig = useCallback(() => {
    onImport();
    // 导入成功后，父组件会通过 onConfigUpdate 更新配置
  }, [onImport]);

  /**
   * 处理本地上传壁纸
   */
  const handleWallpaperUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件大小（限制2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast.error(STRINGS.imageTooLarge);
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error(STRINGS.pleaseSelectImage);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedWallpaper(dataUrl);
      handleWallpaperSelect(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [handleWallpaperSelect, STRINGS.imageTooLarge, STRINGS.pleaseSelectImage]);

  /**
   * 处理操作模式变化
   */
  const handleOperationModeChange = useCallback((operationMode: OperationModeSettings) => {
    onConfigUpdate({
      operationMode
    });
  }, [onConfigUpdate]);

  /**
   * 处理语言切换
   */
  const handleLanguageChange = useCallback((language: 'zh' | 'en') => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        language
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 重置所有数据
   */
  const handleResetAllData = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={STRINGS.settings} size="xl">
      <div className="flex max-h-[70vh] overflow-y-auto">
        {/* 左侧标签页导航 */}
        <div className="w-48 border-r border-gray-200 dark:border-border bg-background">
          <div className="flex flex-col p-2 space-y-1">
            <Button
              variant={activeTab === 'appearance' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('appearance')}
              className={`justify-start gap-3 ${activeTab === 'appearance' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <span className="text-lg">🎨</span>
              <span>{STRINGS.appearance}</span>
            </Button>
            <Button
              variant={activeTab === 'search' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('search')}
              className={`justify-start gap-3 ${activeTab === 'search' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <span className="text-lg">🔍</span>
              <span>{STRINGS.search}</span>
            </Button>
            <Button
              variant={activeTab === 'data' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('data')}
              className={`justify-start gap-3 ${activeTab === 'data' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <span className="text-lg">💾</span>
              <span>{STRINGS.data}</span>
            </Button>
            <Button
              variant={activeTab === 'language' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('language')}
              className={`justify-start gap-3 ${activeTab === 'language' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <span className="text-lg">🌐</span>
              <span>{STRINGS.language}</span>
            </Button>
            <Button
              variant={activeTab === 'operation' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('operation')}
              className={`justify-start gap-3 ${activeTab === 'operation' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <span className="text-lg">⚙️</span>
              <span>{STRINGS.operation}</span>
            </Button>
          </div>
        </div>

        {/* 右侧标签页内容 */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[70vh] min-w-[500px] bg-background">
          {/* 外观设置 */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* 壁纸设置 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.wallpaperSettings}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {WALLPAPERS.map(wallpaper => (
                    <Button
                      key={wallpaper.id}
                      variant={config.theme.wallpaperUrl === wallpaper.url ? 'default' : 'outline'}
                      onClick={() => handleWallpaperSelect(wallpaper.url)}
                      className="aspect-video p-0 overflow-hidden"
                      style={{
                        background: wallpaper.url.startsWith('linear-gradient')
                          ? wallpaper.url
                          : wallpaper.url
                          ? `url(${wallpaper.url}) center/cover`
                          : 'transparent'
                      }}
                      title={wallpaper.id === 'none' ? STRINGS.noWallpaper : 
                             wallpaper.id === 'gradient1' ? STRINGS.gradientBlue :
                             wallpaper.id === 'gradient2' ? STRINGS.gradientPurple :
                             wallpaper.id === 'gradient3' ? STRINGS.gradientOrange :
                             wallpaper.id === 'gradient4' ? STRINGS.gradientGreen :
                             wallpaper.id === 'unsplash1' ? STRINGS.naturalLandscape :
                             wallpaper.id === 'unsplash2' ? STRINGS.cityNight :
                             STRINGS.abstractArt}
                    >
                      {wallpaper.id === 'none' && (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          {STRINGS.noWallpaper}
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
                
                {/* 自定义壁纸 */}
                <div className="mt-4 space-y-3">
                  {/* 本地上传壁纸 */}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWallpaperUpload}
                      className="hidden"
                      id="wallpaper-upload"
                    />
                    <label
                      htmlFor="wallpaper-upload"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    >
                      📁 {STRINGS.uploadLocalImage}
                    </label>
                  </div>
                  
                  {/* 上传壁纸预览 */}
                  {uploadedWallpaper && (
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-16 h-10 rounded border border-gray-300 dark:border-border bg-cover bg-center"
                        style={{ backgroundImage: `url(${uploadedWallpaper})` }}
                      />
                      <span className="text-xs text-muted-foreground">{STRINGS.apply}</span>
                    </div>
                  )}
                  
                  {/* 自定义壁纸URL */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customWallpaperUrl}
                      onChange={(e) => setCustomWallpaperUrl(e.target.value)}
                      placeholder={STRINGS.customWallpaperUrl}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                    <Button
                      onClick={handleCustomWallpaperApply}
                      disabled={!customWallpaperUrl.trim()}
                      size="sm"
                    >
                      {STRINGS.apply}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 图标大小 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.iconSize}</h3>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <Button
                      key={size}
                      onClick={() => handleIconSizeChange(size as 'small' | 'medium' | 'large')}
                      variant={config.theme.iconSize === size ? 'default' : 'secondary'}
                      size="sm"
                    >
                      {size === 'small' ? STRINGS.small : size === 'medium' ? STRINGS.medium : STRINGS.large}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 图标间距 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  {STRINGS.gridSpacing}: {config.theme.gridSpacing}px
                </h3>
                <Slider
                  value={[config.theme.gridSpacing]}
                  onValueChange={(value) => handleGridSpacingChange(value[0])}
                  min={1}
                  max={32}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1px</span>
                  <span>32px</span>
                </div>
              </div>

              {/* 字体颜色设置 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.fontColor}</h3>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {/* 预设颜色块（11个） */}
                  {[
                    { color: '#000000', name: STRINGS.black },
                    { color: '#ffffff', name: STRINGS.white },
                    { color: '#374151', name: STRINGS.darkGray },
                    { color: '#9ca3af', name: STRINGS.lightGray },
                    { color: '#ef4444', name: STRINGS.red },
                    { color: '#f59e0b', name: STRINGS.orange },
                    { color: '#10b981', name: STRINGS.green },
                    { color: '#3b82f6', name: STRINGS.blue },
                    { color: '#8b5cf6', name: STRINGS.purple },
                    { color: '#ec4899', name: STRINGS.pink },
                    { color: '#06b6d4', name: STRINGS.cyan }
                  ].map(({ color, name }) => (
                    <Button
                      key={color}
                      variant={config.theme.fontColor === color ? 'default' : 'outline'}
                      onClick={() => handleFontColorChange(color)}
                      className="w-8 h-8 p-0"
                      style={{ backgroundColor: color }}
                      title={name}
                    />
                  ))}
                  
                  {/* 调色盘按钮 */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const colorInput = document.getElementById('font-color-picker') as HTMLInputElement;
                      if (colorInput) {
                        colorInput.click();
                      }
                    }}
                    className="w-8 h-8 p-0 bg-gradient-to-br from-red-400 via-purple-400 to-blue-400 flex items-center justify-center text-white text-sm"
                    title={STRINGS.customColor}
                  >
                    🎨
                  </Button>
                  
                  {/* 隐藏的颜色选择器 */}
                  <input
                    id="font-color-picker"
                    type="color"
                    className="hidden"
                    onChange={(e) => handleFontColorChange(e.target.value)}
                  />
                </div>
                
                {/* 自定义颜色输入 */}
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.theme.fontColor || '#000000'}
                    onChange={(e) => handleFontColorChange(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.theme.fontColor || ''}
                    onChange={(e) => handleFontColorChange(e.target.value)}
                    placeholder={STRINGS.hexColorPlaceholder}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                  />
                  <Button
                    onClick={() => handleFontColorChange('')}
                    variant="secondary"
                    size="sm"
                  >
                    {STRINGS.resetAllData.replace('所有数据', '颜色')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 搜索设置 */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.searchEngine}</h3>
                <Select
                  value={config.searchEngine}
                  onValueChange={handleSearchEngineChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={STRINGS.searchEngine} />
                  </SelectTrigger>
                  <SelectContent>
                    {SEARCH_ENGINES.map(engine => (
                      <SelectItem key={engine.id} value={engine.url}>
                        {engine.name === '百度' ? STRINGS.baidu : engine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* 自定义搜索引擎 */}
                <div className="pt-4 border-t border-gray-200 dark:border-border mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">{STRINGS.customSearchEngineUrl}</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSearchEngine}
                      onChange={(e) => setCustomSearchEngine(e.target.value)}
                      placeholder={STRINGS.customSearchEngineUrl}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                    <Button
                      onClick={handleCustomSearchEngineApply}
                      disabled={!customSearchEngine.trim()}
                      size="sm"
                    >
                      {STRINGS.apply}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 数据管理 */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* 存储信息区块 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.storageUsage}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{STRINGS.totalSize}</p>
                    <p className="text-lg font-semibold text-foreground">{storageInfo.totalSize}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{STRINGS.iconCount}</p>
                    <p className="text-lg font-semibold text-foreground">{storageInfo.iconCount}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{STRINGS.folderCount}</p>
                    <p className="text-lg font-semibold text-foreground">{storageInfo.folderCount}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{STRINGS.pageCount}</p>
                    <p className="text-lg font-semibold text-foreground">{storageInfo.pageCount}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.data}</h3>
                <div className="space-y-3">
                  <Button onClick={onExport} variant="secondary" className="w-full justify-center">
                    📤 {STRINGS.exportConfig}
                  </Button>
                  <Button onClick={handleImportConfig} variant="secondary" className="w-full justify-center">
                    📥 {STRINGS.importConfig}
                  </Button>
                  <Button 
                    onClick={() => setShowResetConfirm(true)}
                    variant="destructive" 
                    className="w-full justify-center"
                  >
                    {STRINGS.resetAllData}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 语言设置 */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.language}</h3>
                <div className="space-y-2">
                  <Button
                    variant={currentLanguage === 'zh' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('zh')}
                    className="w-full justify-between px-4 py-3 h-auto"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">中文</span>
                      <p className="text-xs opacity-70 mt-1">Chinese (Simplified)</p>
                    </div>
                    {currentLanguage === 'zh' && <span>✓</span>}
                  </Button>
                  
                  <Button
                    variant={currentLanguage === 'en' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('en')}
                    className="w-full justify-between px-4 py-3 h-auto"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">English</span>
                      <p className="text-xs opacity-70 mt-1">English</p>
                    </div>
                    {currentLanguage === 'en' && <span>✓</span>}
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    💡 提示：切换语言后，界面将立即更新。刷新页面后语言设置将保持。
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
                    💡 Tip: Interface will update immediately after switching language. Language settings will be preserved after page refresh.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 操作模式设置 */}
          {activeTab === 'operation' && (
            <div className="space-y-6">
              <OperationModeSelector
                operationMode={config.operationMode || {
                  mode: 'hybrid',
                  openMethod: 'click',
                  menuTrigger: 'both',
                  showAddButton: true
                }}
                onChange={handleOperationModeChange}
                language={currentLanguage}
              />
            </div>
          )}
        </div>
      </div>

      {/* 重置确认对话框 */}
      {showResetConfirm && (
        <Modal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          title={STRINGS.resetConfirmTitle}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {STRINGS.resetConfirmMessage}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="secondary"
                size="sm"
              >
                {STRINGS.cancel}
              </Button>
              <Button
                onClick={handleResetAllData}
                variant="destructive"
                size="sm"
              >
                {STRINGS.resetConfirmTitle}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
