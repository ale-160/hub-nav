'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ConfigManager, UserConfig, IconItem, ThemeSettings } from '@/lib/configManager';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/useTheme';
import { useConfig } from '@/hooks/useConfig';
import { useSearch } from '@/hooks/useSearch';
import { useIconFolderManager } from '@/hooks/useIconFolderManager';
import { useImportExport } from '@/hooks/useImportExport';
import { Button } from '@/components/ui/button';
import { ThemeToggleIcon } from '@/components/ui/theme-toggle-icon';
import { extractDomain, generateFaviconCandidates } from '@/utils/url';
import { getStrings } from '@/data/i18n';
import { getStructuredData } from '@/config/structuredData';
import { HelpCircle, Globe, Heart } from 'lucide-react';

// 懒加载模态框组件（仅在需要时加载）
const SettingsModal = dynamic(
  () => import('@/components/ui/settings-modal').then(mod => ({ default: mod.SettingsModal })),
  { loading: () => null }
);

const AddItemModal = dynamic(
  () => import('@/components/ui/modals/AddItemModal').then(mod => ({ default: mod.AddItemModal })),
  { loading: () => null }
);

const EditItemModal = dynamic(
  () => import('@/components/ui/modals/EditItemModal').then(mod => ({ default: mod.EditItemModal })),
  { loading: () => null }
);

const OnboardingGuide = dynamic(
  () => import('@/components/ui/onboarding-guide').then(mod => ({ default: mod.OnboardingGuide })),
  { loading: () => null }
);

const SetupGuide = dynamic(
  () => import('@/components/ui/setup-guide').then(mod => ({ default: mod.SetupGuide })),
  { loading: () => null }
);

interface MainPageProps {
  lang: 'en' | 'zh';
}

export default function MainPage({ lang }: MainPageProps) {
  // 动态设置 <html lang> 属性
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  // 使用配置管理 Hook，传入路由默认语言
  const {
    config,
    isMounted,
    needsSetup,
    completeSetup,
    updateConfig: updateConfigBase,
    addIconWithPage,
    addFolderWithPage,
  } = useConfig(lang);

  // 在首次使用引导期间，使用默认配置
  const [defaultConfig, setDefaultConfig] = useState<UserConfig | null>(null);

  useEffect(() => {
    if (!config) {
      ConfigManager.getDefaultConfig().then(setDefaultConfig);
    }
  }, [config]);

  // 当 config 存在时直接使用，否则用 defaultConfig，如果都为空则使用硬编码的最小默认配置
  const SAFE_DEFAULT_CONFIG: UserConfig = {
    layout: { columns: 5, rows: 4 },
    theme: { mode: 'light', primaryColor: '#3b82f6', iconSize: 'medium', gridSpacing: 16, gridColumnSpacing: 16, language: lang },
    icons: [],
    folders: [],
    pages: [{ id: 'page-1', name: '首页', iconIds: [] }],
    rootOrder: [],
    version: '0.1.0',
    searchEngine: 'https://www.bing.com/search?q=',
    operationMode: { mode: 'hybrid', openMethod: 'click', menuTrigger: 'rightClick', showAddButton: true }
  };

  const activeConfig = config || defaultConfig || SAFE_DEFAULT_CONFIG;
  const S = getStrings(activeConfig.theme.language);

  // 获取结构化数据
  const structuredDataList = getStructuredData(activeConfig.theme.language);

  // UI 状态
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 主题管理
  const { toggleMode, setTheme } = useTheme();

  // 使用导入导出 Hook
  const { exportConfig, importConfig } = useImportExport({ language: activeConfig.theme.language });

  /**
   * 处理配置更新（包含主题同步）
   */
  const handleConfigUpdate = useCallback((partialConfig: Partial<UserConfig>) => {
    updateConfigBase(partialConfig);
    // 如果更新了主题配置，需要同步到 useTheme（但不要覆盖 mode）
    if (partialConfig.theme) {
      // 只同步非 mode 字段，避免覆盖当前的暗色/浅色模式
      const { mode: _mode, ...themeWithoutMode } = partialConfig.theme;
      setTheme(themeWithoutMode as Partial<ThemeSettings>);
    }
  }, [updateConfigBase, setTheme]);

  /**
   * 切换语言
   */
  const handleToggleLanguage = useCallback(() => {
    const newLanguage = activeConfig.theme.language === 'zh' ? 'en' : 'zh';
    handleConfigUpdate({
      theme: {
        ...activeConfig.theme,
        language: newLanguage
      }
    });
  }, [activeConfig.theme, handleConfigUpdate]);

  // 使用图标和文件夹管理 Hook（Service 层）
  const {
    deleteIcon,
    toggleIconVisibility: handleIconHide,
    updateFolder: handleFolderRename,
    deleteFolder: handleFolderDelete,
    moveIconToFolder: handleMoveIconToFolder,
    moveIconToRoot: handleMoveToRoot,
    reorderIconsInFolder: handleReorderIconsInFolder,
    clearFolderIcons: handleDeleteAllIconsInFolder
  } = useIconFolderManager({ config: activeConfig, saveConfig: handleConfigUpdate });

  // UI 状态
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState<'icon' | 'folder'>('icon');
  const [addModalFolderId, setAddModalFolderId] = useState<string | undefined>(undefined);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [editItem, setEditItem] = useState<IconItem | null>(null);

  // 使用搜索管理 Hook（必须在 currentPageIndex 声明之后）
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    searchedFolderIds,
    filteredPageIconIds
  } = useSearch({ config: activeConfig, currentPageIndex });

  /**
   * 处理添加项目提交（由 AddItemModal 调用）
   */
  const handleAddItemSubmit = useCallback(async (formData: {
    type: 'icon' | 'folder';
    name: string;
    url: string;
    folderId?: string;
    iconType?: 'favicon' | 'builtin' | 'custom';
    iconUrl?: string;
    builtinIcon?: string;
    customIconUrl?: string;
    customColor?: string;
  }) => {
    if (formData.type === 'icon') {
      if (formData.folderId) {
        const targetFolder = activeConfig.folders.find(f => f.id === formData.folderId);
        if (!targetFolder) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[handleAddItemSubmit] 目标文件夹不存在:', formData.folderId);
          }
          throw new Error('目标文件夹不存在');
        }
      }

      const iconType = formData.iconType || 'favicon';
      let iconUrl = formData.iconUrl;
      if (iconType === 'favicon' && !iconUrl) {
        const domain = extractDomain(formData.url.trim());
        if (domain) {
          const candidates = generateFaviconCandidates(domain);
          if (candidates.length > 0) {
            iconUrl = candidates[0];
          }
        }
      }

      addIconWithPage({
        name: formData.name.trim(),
        url: formData.url.trim(),
        folderId: formData.folderId,
        iconType,
        builtinIcon: formData.builtinIcon,
        customIconUrl: formData.customIconUrl,
        customColor: formData.customColor,
        iconUrl
      }, currentPageIndex);
    } else {
      addFolderWithPage(formData.name.trim(), currentPageIndex);
    }
  }, [activeConfig.folders, currentPageIndex, addIconWithPage, addFolderWithPage]);

  /**
   * 处理搜索框回车键
   */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (activeConfig.searchEngine) {
        const searchUrl = activeConfig.searchEngine + encodeURIComponent(searchQuery.trim());
        window.open(searchUrl, '_blank');
        setSearchQuery('');
      }
    }
  }, [searchQuery, activeConfig.searchEngine, setSearchQuery]);

  /**
   * 处理图标编辑
   */
  const handleIconEdit = (iconId: string) => {
    const icon = activeConfig.icons.find(i => i.id === iconId);
    if (icon) {
      setEditItem(icon);
      setIsEditModalOpen(true);
    }
  };

  /**
   * 处理添加应用到文件夹
   */
  const handleAddIconToFolder = (folderId: string) => {
    setAddModalType('icon');
    setAddModalFolderId(folderId);
    setIsAddModalOpen(true);
  };

  /**
   * 打开添加应用模态框
   */
  const openAddIconModal = () => {
    setAddModalType('icon');
    setAddModalFolderId(undefined);
    setIsAddModalOpen(true);
  };

  /**
   * 处理图标字段更新（如回写 iconUrl）
   */
  const handleUpdateIcon = useCallback((iconId: string, updates: Partial<IconItem>) => {
    const updatedIcons = activeConfig.icons.map(icon =>
      icon.id === iconId ? { ...icon, ...updates } : icon
    );
    handleConfigUpdate({ icons: updatedIcons });
  }, [activeConfig.icons, handleConfigUpdate]);

  /**
   * 打开添加文件夹模态框
   */
  const openAddFolderModal = () => {
    setAddModalType('folder');
    setAddModalFolderId(undefined);
    setIsAddModalOpen(true);
  };

  /**
   * 处理编辑项目提交（由 EditItemModal 调用）
   */
  const handleEditItemSubmit = useCallback(async (updatedItem: IconItem) => {
    const updatedIcons = activeConfig.icons.map(icon =>
      icon.id === updatedItem.id ? updatedItem : icon
    );
    handleConfigUpdate({ icons: updatedIcons });
  }, [activeConfig.icons, handleConfigUpdate]);

  /**
   * 包装文件夹重命名（适配 PageContainer 接口）
   */
  const handleFolderRenameWrapper = useCallback((folderId: string, name: string) => {
    handleFolderRename(folderId, { name });
  }, [handleFolderRename]);

  return (
    <>
      {/* 首次使用引导 */}
      {needsSetup && (
        <SetupGuide
          isOpen={needsSetup}
          onComplete={completeSetup}
        />
      )}

      {/* 结构化数据 */}
      {structuredDataList.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <div
        className="h-screen overflow-hidden flex flex-col"
        style={{
          background: activeConfig.theme.wallpaperUrl
            ? activeConfig.theme.wallpaperUrl.startsWith('linear-gradient')
              ? activeConfig.theme.wallpaperUrl
              : `url(${activeConfig.theme.wallpaperUrl}) center/cover fixed`
            : 'var(--bg-primary)'
        }}
      >
      {/* 顶部栏 */}
            <header className={`border-b border-gray-200 dark:border-border sticky top-0 z-40 shrink-0 ${activeConfig.theme.wallpaperUrl ? 'bg-background/80 backdrop-blur-sm' : 'bg-(--bg-secondary)'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-2 md:gap-4">
            {/* 左侧：Logo */}
            <a href="https://ale160.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <img src="https://ale160.com/images/logo-icon.png" alt="Logo" className="w-8 h-8 rounded" />
              <h1 className="text-xl font-bold text-foreground hidden sm:block">
                {S.systemName}
                <span className="text-sm text-muted-foreground ml-2">
                  {S.appVersion}
                </span>
              </h1>
            </a>

            {/* 右侧：搜索和操作按钮 */}
            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              {/* 搜索框 */}
              <div className="min-w-0 flex-1 max-w-md">
                <input
                type="text"
                placeholder={S.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              </div>

              {/* 帮助按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsHelpModalOpen(true)}
                title={S.help}
                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9"
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              {/* 语言切换按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleLanguage}
                title={S.language}
                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9"
              >
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>

              {/* 主题切换按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMode}
                title={S.themeToggle}
                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9"
              >
                <ThemeToggleIcon />
              </Button>

              {/* 设置按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsModalOpen(true)}
                title={S.settings}
                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主体区域 - 内部滚动 */}
      <main className="flex-1 overflow-y-auto">
        {isMounted ? (
          <PageContainer
              icons={activeConfig.icons}
              folders={activeConfig.folders}
              pages={activeConfig.pages.map((page, index) => ({
                ...page,
                iconIds: index === currentPageIndex && debouncedSearchQuery.trim()
                  ? filteredPageIconIds
                  : page.iconIds
              }))}
              config={activeConfig}
              onUpdate={handleConfigUpdate}
              searchedFolderIds={searchedFolderIds}
              onIconEdit={handleIconEdit}
              onIconDelete={deleteIcon}
              onIconHide={handleIconHide}
              onUpdateIcon={handleUpdateIcon}
              onMoveIconToFolder={handleMoveIconToFolder}
              onReorderIconsInFolder={handleReorderIconsInFolder}
              onMoveToRoot={handleMoveToRoot}
              onFolderRename={handleFolderRenameWrapper}
              onFolderDelete={handleFolderDelete}
              onAddIconToFolder={handleAddIconToFolder}
              onDeleteAllIconsInFolder={handleDeleteAllIconsInFolder}
              onAddIcon={openAddIconModal}
              onAddFolder={openAddFolderModal}
              onRefresh={() => {
                const loadedConfig = ConfigManager.loadConfig();
                if (loadedConfig) {
                  updateConfigBase(loadedConfig);
                }
              }}
              onPageChange={setCurrentPageIndex}
            />
        ) : null}
      </main>

      {/* 添加项目模态框 */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddModalType('icon');
          setAddModalFolderId(undefined);
        }}
        onSubmit={handleAddItemSubmit}
        language={activeConfig.theme.language || lang}
        initialType={addModalType}
        initialFolderId={addModalFolderId}
      />

      {/* 编辑项目模态框 */}
      <EditItemModal
        key={editItem?.id || 'new'}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleEditItemSubmit}
        item={editItem}
        language={activeConfig.theme.language || lang}
      />

      {/* 设置面板 */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={activeConfig}
        onConfigUpdate={handleConfigUpdate}
        onImport={importConfig}
        onExport={exportConfig}
        language={activeConfig.theme.language}
      />

      {/* 帮助模态框 */}
      <OnboardingGuide
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        language={activeConfig.theme.language}
      />

      {/* 页脚 */}
      <footer className="shrink-0 flex items-center justify-center gap-4 px-4 py-2 border-t border-gray-200 dark:border-border bg-background/50 text-xs text-muted-foreground">
        <a
          href="https://github.com/ale-160/hub-nav"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>{S.githubRepo}</span>
        </a>
        <span className="text-border">|</span>
        <a
          href="https://ale160.com/sponsor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors text-pink-600 dark:text-pink-400"
        >
          <Heart className="w-3.5 h-3.5" />
          <span>{S.sponsor}</span>
        </a>
        <span className="text-border">|</span>
        <a
          href="https://ale160.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <img src="https://ale160.com/images/Avatar-SVG.png" alt="" className="w-3.5 h-3.5" />
          <span>{S.ale160}</span>
        </a>
      </footer>
      </div>
    </>
  );
}
