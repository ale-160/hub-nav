'use client';

import React, { useState, useCallback } from 'react';
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
import { OnboardingGuide } from '@/components/ui/onboarding-guide';
import { getStrings } from '@/data/i18n';


export default function Home() {
  // 使用配置管理 Hook
  const {
    config,
    isMounted,
    updateConfig: updateConfigBase,
    addIconWithPage,
    addFolderWithPage,
  } = useConfig();

  const S = getStrings(config.theme.language);

  // 主题管理
  const { toggleMode, setTheme } = useTheme();

  // 使用导入导出 Hook
  const { exportConfig, importConfig } = useImportExport({ language: config.theme.language });

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
  } = useIconFolderManager({ config, saveConfig: handleConfigUpdate });

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
  } = useSearch({ config, currentPageIndex });

  /**
   * 处理添加项目提交（由 AddItemModal 调用）
   */
  const handleAddItemSubmit = useCallback(async (formData: {
    type: 'icon' | 'folder';
    name: string;
    url: string;
    folderId?: string;
    iconType?: 'favicon' | 'builtin' | 'custom';
    builtinIcon?: string;
    customIconUrl?: string;
    customColor?: string;
  }) => {
    if (formData.type === 'icon') {
      // 如果在文件夹内添加，验证文件夹是否存在
      if (formData.folderId) {
        const targetFolder = config.folders.find(f => f.id === formData.folderId);
        if (!targetFolder) {
          if (process.env.NODE_ENV === 'development') {
            console.error('[handleAddItemSubmit] 目标文件夹不存在:', formData.folderId);
          }
          throw new Error('目标文件夹不存在');
        }
      }

      // 使用高级方法，自动处理页面关联
      addIconWithPage({
        name: formData.name.trim(),
        url: formData.url.trim(),
        folderId: formData.folderId,
        iconType: formData.iconType || 'favicon',
        builtinIcon: formData.builtinIcon,
        customIconUrl: formData.customIconUrl,
        customColor: formData.customColor
      }, currentPageIndex);
    } else {
      // 使用高级方法，自动处理页面关联
      addFolderWithPage(formData.name.trim(), currentPageIndex);
    }
  }, [config.folders, currentPageIndex, addIconWithPage, addFolderWithPage]);

  /**
   * 处理搜索框回车键
   */
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // 如果配置了搜索引擎，则跳转搜索
      if (config.searchEngine) {
        const searchUrl = config.searchEngine + encodeURIComponent(searchQuery.trim());
        window.open(searchUrl, '_blank');
        setSearchQuery(''); // 清空搜索框
      }
    }
  }, [searchQuery, config.searchEngine, setSearchQuery]);

  /**
   * 处理图标编辑
   */
  const handleIconEdit = useCallback((iconId: string) => {
    const icon = config.icons.find(i => i.id === iconId);
    if (icon) {
      setEditItem(icon);
      setIsEditModalOpen(true);
    }
  }, [config.icons]);

  /**
   * 处理添加应用到文件夹
   */
  const handleAddIconToFolder = useCallback((folderId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[handleAddIconToFolder] 收到 folderId:', folderId);
    }
    setAddModalType('icon');
    setAddModalFolderId(folderId);
    setIsAddModalOpen(true);
  }, []);

  /**
   * 打开添加应用模态框
   */
  const openAddIconModal = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[openAddIconModal] 打开添加应用模态框');
    }
    setAddModalType('icon');
    setAddModalFolderId(undefined);
    setIsAddModalOpen(true);
  }, []);

  /**
   * 打开添加文件夹模态框
   */
  const openAddFolderModal = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[openAddFolderModal] 打开添加文件夹模态框');
    }
    setAddModalType('folder');
    setAddModalFolderId(undefined);
    setIsAddModalOpen(true);
  }, []);

  /**
   * 处理编辑项目提交（由 EditItemModal 调用）
   */
  const handleEditItemSubmit = useCallback(async (updatedItem: IconItem) => {
    const updatedIcons = config.icons.map(icon =>
      icon.id === updatedItem.id ? updatedItem : icon
    );
    handleConfigUpdate({ icons: updatedIcons });
  }, [config.icons, handleConfigUpdate]);

  /**
   * 包装文件夹重命名（适配 PageContainer 接口）
   */
  const handleFolderRenameWrapper = useCallback((folderId: string, name: string) => {
    handleFolderRename(folderId, { name });
  }, [handleFolderRename]);

  return (
    <div
      className="min-h-screen"
      style={{
        background: config.theme.wallpaperUrl
          ? config.theme.wallpaperUrl.startsWith('linear-gradient')
            ? config.theme.wallpaperUrl
            : `url(${config.theme.wallpaperUrl}) center/cover fixed`
          : 'var(--bg-primary)'
      }}
    >
      {/* 顶部栏 */}
            <header className={`border-b border-gray-200 dark:border-border sticky top-0 z-40 ${config.theme.wallpaperUrl ? 'bg-background/80 backdrop-blur-sm' : 'bg-(--bg-secondary)'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between h-16 gap-4">
            {/* 左侧：Logo */}
            <div className="flex items-center gap-3">
              <img src={process.env.NODE_ENV === 'production' ? '/hub-nav/logo-icon.ico' : '/logo-icon.ico'} alt="Logo" className="w-8 h-8" />
              <h1 className="text-xl font-bold text-foreground">
                {S.systemName}
                <span className="text-sm text-muted-foreground ml-2">
                  {S.appVersion}
                </span>
              </h1>
            </div>

            {/* 右侧：搜索和操作按钮 */}
            <div className="flex items-center gap-3 flex-1 md:flex-none">
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
              icons={config.icons}
              folders={config.folders}
              pages={config.pages.map((page, index) => ({
                ...page,
                // 仅在搜索时过滤当前页面的图标 ID
                iconIds: index === currentPageIndex && debouncedSearchQuery.trim()
                  ? filteredPageIconIds
                  : page.iconIds
              }))}
              config={config}
              onUpdate={handleConfigUpdate}
              searchedFolderIds={searchedFolderIds}
              onIconEdit={handleIconEdit}
              onIconDelete={deleteIcon}
              onIconHide={handleIconHide}
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
        language={config.theme.language || 'zh'}
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
        language={config.theme.language || 'zh'}
      />

      {/* 页脚 */}
      <footer className="border-t border-gray-200 dark:border-border bg-background py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              {S.poweredBy} {S.systemName} · {S.openSourceEdition}
            </p>
            <a
              href="https://github.com/Hub-Nav/hub-nav"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 md:mt-0"
            >
              {S.githubRepo}
            </a>
          </div>
        </div>
      </footer>

      {/* 设置面板 */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onConfigUpdate={handleConfigUpdate}
        onImport={importConfig}
        onExport={exportConfig}
        language={config.theme.language}
      />

      {/* 新手引导 */}
      <OnboardingGuide />
    </div>
  );
}
