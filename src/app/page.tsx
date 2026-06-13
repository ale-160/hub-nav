'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ConfigManager, UserConfig, IconItem, ThemeSettings } from '@/lib/configManager';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/useTheme';
import { useConfig } from '@/hooks/useConfig';
import { useSearch } from '@/hooks/useSearch';
import { useIconFolderManager } from '@/hooks/useIconFolderManager';
import { useImportExport } from '@/hooks/useImportExport';
import { SettingsModal } from '@/components/ui/settings-modal';
import { AddItemModal } from '@/components/ui/modals/AddItemModal';
import { EditItemModal } from '@/components/ui/modals/EditItemModal';
import { Button } from '@/components/ui/button';
import { ThemeToggleIcon } from '@/components/ui/theme-toggle-icon';
import { extractDomain, generateFaviconCandidates } from '@/utils/url';
import { OnboardingGuide } from '@/components/ui/onboarding-guide';
import { SetupGuide } from '@/components/ui/setup-guide';
import { getStrings } from '@/data/i18n';
import { getStructuredData } from '@/config/structuredData';
import { HelpCircle, Globe, Heart } from 'lucide-react';


export default function Home() {
  // 使用配置管理 Hook
  const {
    config,
    isMounted,
    needsSetup,
    completeSetup,
    updateConfig: updateConfigBase,
    addIconWithPage,
    addFolderWithPage,
  } = useConfig();

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
    theme: { mode: 'light', primaryColor: '#3b82f6', iconSize: 'medium', gridSpacing: 16, language: 'zh' },
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
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 跟踪当前活跃页面索引
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
      // 如果在文件夹内添加，验证文件夹是否存在
      if (formData.folderId) {
        const targetFolder = activeConfig.folders.find(f => f.id === formData.folderId);
        if (!targetFolder) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[handleAddItemSubmit] 目标文件夹不存在:', formData.folderId);
          }
          throw new Error('目标文件夹不存在');
        }
      }

      // 为 favicon 类型的图标设置 iconUrl，避免每次打开页面都重新获取
      const iconType = formData.iconType || 'favicon';
      let iconUrl = formData.iconUrl; // 优先使用 FaviconMode 探测到的 URL
      if (iconType === 'favicon' && !iconUrl) {
        const domain = extractDomain(formData.url.trim());
        if (domain) {
          const candidates = generateFaviconCandidates(domain);
          if (candidates.length > 0) {
            iconUrl = candidates[0];
          }
        }
      }

      // 使用高级方法，自动处理页面关联
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
      // 使用高级方法，自动处理页面关联
      addFolderWithPage(formData.name.trim(), currentPageIndex);
    }
  }, [activeConfig.folders, currentPageIndex, addIconWithPage, addFolderWithPage]);

  /**
   * 处理搜索框回车键
   */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // 如果配置了搜索引擎，则跳转搜索
      if (activeConfig.searchEngine) {
        const searchUrl = activeConfig.searchEngine + encodeURIComponent(searchQuery.trim());
        window.open(searchUrl, '_blank');
        setSearchQuery(''); // 清空搜索框
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
        className="min-h-screen"
        style={{
          background: activeConfig.theme.wallpaperUrl
            ? activeConfig.theme.wallpaperUrl.startsWith('linear-gradient')
              ? activeConfig.theme.wallpaperUrl
              : `url(${activeConfig.theme.wallpaperUrl}) center/cover fixed`
            : 'var(--bg-primary)'
        }}
      >
      {/* 顶部栏 */}
            <header className={`border-b border-gray-200 dark:border-border sticky top-0 z-40 ${activeConfig.theme.wallpaperUrl ? 'bg-background/80 backdrop-blur-sm' : 'bg-(--bg-secondary)'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between h-16 gap-4">
            {/* 左侧：Logo */}
            <a href="https://ale160.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="https://ale160.com/images/logo-icon.ico" alt="Logo" className="w-8 h-8 rounded" />
              <h1 className="text-xl font-bold text-foreground">
                {S.systemName}
                <span className="text-sm text-muted-foreground ml-2">
                  {S.appVersion}
                </span>
              </h1>
            </a>

            {/* 右侧：搜索和操作按钮 */}
            <div className="flex items-center gap-2 flex-1 md:flex-none">
              {/* 搜索框 */}
              <div className="flex-1 md:flex-none">
                <input
                type="text"
                placeholder={S.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              </div>

              {/* 帮助按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHelpModalOpen(true)}
                title={S.help}
                className="p-2"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>

              {/* 语言切换按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleLanguage}
                title={S.language}
                className="p-2"
              >
                <Globe className="w-5 h-5" />
              </Button>

              {/* 主题切换按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMode}
                title={S.themeToggle}
                className="p-2"
              >
                <ThemeToggleIcon />
              </Button>

              {/* 设置按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSettingsModalOpen(true)}
                title={S.settings}
                className="p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主体区域 */}
      <main className="flex-1">
        {isMounted ? (
          <PageContainer
              icons={activeConfig.icons}
              folders={activeConfig.folders}
              pages={activeConfig.pages.map((page, index) => ({
                ...page,
                // 仅在搜索时过滤当前页面的图标 ID
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
              onReorderIconsInFolder={handleReorderIconsInFolder} // 新增：文件夹内图标排序
              onMoveToRoot={handleMoveToRoot} // 新增：移动到根级
              onFolderRename={handleFolderRenameWrapper}
              onFolderDelete={handleFolderDelete}
              onAddIconToFolder={handleAddIconToFolder}
              onDeleteAllIconsInFolder={handleDeleteAllIconsInFolder}
              onAddIcon={openAddIconModal}
              onAddFolder={openAddFolderModal}
              onRefresh={() => {
                // 重新加载配置
                const loadedConfig = ConfigManager.loadConfig();
                if (loadedConfig) {
                  updateConfigBase(loadedConfig);
                }
              }}
              onPageChange={setCurrentPageIndex} // 新增：跟踪当前页面索引
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
        language={activeConfig.theme.language || 'zh'}
        initialType={addModalType}
        initialFolderId={addModalFolderId}
      />

      {/* 编辑项目模态框 */}
      <EditItemModal
        key={editItem?.id || 'new'} // 使用 key 确保每次打开时重置表单状态
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditItem(null);
        }}
        onSubmit={handleEditItemSubmit}
        item={editItem}
        language={activeConfig.theme.language || 'zh'}
      />

      {/* 页脚 */}
      <footer className="border-t border-gray-200 dark:border-border bg-background py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left gap-2">
            <p className="text-sm text-muted-foreground">
              {S.poweredBy} {S.systemName} · {S.openSourceEdition}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/ale-160/hub-nav"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {S.githubRepo}
              </a>
              <a
                href="https://ale160.com/sponsor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-pink-600 dark:text-pink-400 hover:underline"
              >
                <Heart className="w-4 h-4" />
                {S.sponsor}
              </a>
              <a
                href="https://ale160.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {S.ale160}
              </a>
            </div>
          </div>
        </div>
      </footer>

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
      </div>
    </>
  );
}
