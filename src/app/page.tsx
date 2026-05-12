'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { ConfigManager, UserConfig, IconItem, FolderItem, ThemeSettings } from '@/lib/configManager';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/useTheme';
import { useConfig } from '@/hooks/useConfig';
import { useSearch } from '@/hooks/useSearch';
import { useIconFolderManager } from '@/hooks/useIconFolderManager';
import { useImportExport } from '@/hooks/useImportExport';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { IconSelector } from '@/components/ui/icon-selector';
import { SettingsModal } from '@/components/ui/settings-modal';
import { ThemeToggleIcon } from '@/components/ui/theme-toggle-icon';
import { OnboardingGuide } from '@/components/ui/onboarding-guide';
import { STRINGS, getStrings } from '@/data/i18n';
import { validateUrl } from '@/utils/url';

/**
 * 添加新项目类型
 */
type AddItemType = 'icon' | 'folder';

/**
 * 添加新项目表单数据
 */
interface AddItemForm {
  type: AddItemType;
  name: string;
  url: string;
  folderId?: string;
  iconType?: 'favicon' | 'builtin' | 'custom';
  builtinIcon?: string;
  customIconUrl?: string;
}

export default function Home() {
  // 使用配置管理 Hook
  const { 
    config, 
    isMounted,
    updateConfig: updateConfigBase,
    addIconWithPage,
    addFolderWithPage,
    saveConfig,
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
    updateIcon,
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 跟踪当前活跃页面索引

  // 使用搜索管理 Hook（必须在 currentPageIndex 声明之后）
  const {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    searchedFolderIds,
    filteredPageIconIds
  } = useSearch({ config, currentPageIndex });

  const [addForm, setAddForm] = useState<AddItemForm>({
    type: 'icon',
    name: '',
    url: ''
  });
  const [editItem, setEditItem] = useState<IconItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 重置添加表单
   */
  const resetAddForm = useCallback(() => {
    setAddForm({
      type: 'icon',
      name: '',
      url: '',
      folderId: undefined,
      iconType: 'favicon',
      builtinIcon: undefined,
      customIconUrl: undefined
    });
  }, []);

  /**
   * 打开添加模态框
   */
  const openAddModal = useCallback((type: AddItemType = 'icon', folderId?: string) => {
    setAddForm({
      type,
      name: '',
      url: '',
      iconType: 'favicon',
      builtinIcon: undefined,
      customIconUrl: undefined,
      folderId
    });
    setIsAddModalOpen(true);
  }, []);

  /**
   * 关闭添加模态框
   */
  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    resetAddForm();
  }, [resetAddForm]);

  /**
   * 添加新项目（精简版，逻辑在 Hook 中）
   */
  const handleAddItem = useCallback(() => {
    if (!addForm.name.trim()) {
      toast.error(STRINGS.nameRequired);
      return;
    }

    if (addForm.type === 'icon') {
      const urlToValidate = addForm.url.trim();

      if (!urlToValidate) {
        toast.error(STRINGS.urlRequired);
        return;
      }

      // URL 格式验证
      const validation = validateUrl(urlToValidate);
      if (!validation.isValid) {
        toast.error(`URL 验证失败: ${validation.errorMessage}`);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (addForm.type === 'icon') {
        // 如果在文件夹内添加，验证文件夹是否存在
        if (addForm.folderId) {
          const targetFolder = config.folders.find(f => f.id === addForm.folderId);
          if (!targetFolder) {
            if (process.env.NODE_ENV === 'development') {
              console.error('[handleAddItem] 目标文件夹不存在:', addForm.folderId);
            }
            toast.error('目标文件夹不存在');
            setIsLoading(false);
            return;
          }
        }

        // 使用高级方法，自动处理页面关联
        addIconWithPage({
          name: addForm.name.trim(),
          url: addForm.url.trim(),
          folderId: addForm.folderId,
          iconType: addForm.iconType || 'favicon',
          builtinIcon: addForm.builtinIcon,
          customIconUrl: addForm.customIconUrl
        }, currentPageIndex);
      } else {
        // 使用高级方法，自动处理页面关联
        addFolderWithPage(addForm.name.trim(), currentPageIndex);
      }

      closeAddModal();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('添加项目失败:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [addForm, config, currentPageIndex, addIconWithPage, addFolderWithPage, closeAddModal]);

  /**
   * 处理表单输入
   */
  const handleFormChange = useCallback((field: keyof AddItemForm, value: string) => {
    setAddForm(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * 处理图标类型变化
   */
  const handleIconTypeChange = useCallback((iconType: 'favicon' | 'builtin' | 'custom') => {
    setAddForm(prev => ({
      ...prev,
      iconType,
      builtinIcon: iconType === 'builtin' ? prev.builtinIcon || 'home' : undefined,
      customIconUrl: iconType === 'custom' ? prev.customIconUrl : undefined
    }));
  }, []);

  /**
   * 处理内置图标选择
   */
  const handleBuiltinIconChange = useCallback((iconId: string) => {
    setAddForm(prev => ({ ...prev, builtinIcon: iconId }));
  }, []);

  /**
   * 处理自定义图标 URL 变化
   */
  const handleCustomIconUrlChange = useCallback((url: string) => {
    setAddForm(prev => ({ ...prev, customIconUrl: url }));
  }, []);

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
  }, [searchQuery, config.searchEngine]);

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
    openAddModal('icon', folderId);
  }, [openAddModal]);

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
              onAddIcon={() => openAddModal('icon')}
              onAddFolder={() => openAddModal('folder')}
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
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        title={S.addNewItem}
        size="md"
      >
        <div className="space-y-4">
          {/* 类型选择 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {S.type}
            </label>
            <div className="flex gap-2">
              <Button
                variant={addForm.type === 'icon' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => handleFormChange('type', 'icon')}
              >
                {S.addApp}
              </Button>
              <Button
                variant={addForm.type === 'folder' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => handleFormChange('type', 'folder')}
              >
                {S.addFolder}
              </Button>
            </div>
          </div>

          {/* 名称输入 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              {addForm.type === 'icon' ? S.appName : S.folderName}
            </label>
            <input
              type="text"
              id="name"
              value={addForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder={addForm.type === 'icon' ? S.appNamePlaceholder : S.folderNamePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* 应用地址输入（仅应用类型） */}
          {addForm.type === 'icon' && (
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                {S.appUrl}
              </label>
              <input
                type="url"
                id="url"
                value={addForm.url}
                onChange={(e) => handleFormChange('url', e.target.value)}
                placeholder={S.appUrlPlaceholder}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          )}

          {/* 图标选择器（仅图标类型） */}
          {addForm.type === 'icon' && (
            <IconSelector
              iconType={addForm.iconType || 'favicon'}
              builtinIcon={addForm.builtinIcon}
              customIconUrl={addForm.customIconUrl}
              websiteUrl={addForm.url}
              appName={addForm.name}
              language={config.theme.language}
              onIconTypeChange={handleIconTypeChange}
              onBuiltinIconChange={handleBuiltinIconChange}
              onCustomIconUrlChange={handleCustomIconUrlChange}
              onWebsiteUrlChange={(url) => handleFormChange('url', url)}
            />
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={closeAddModal}
            >
              {S.cancel}
            </Button>
            <Button
              variant="default"
              onClick={handleAddItem}
              disabled={isLoading}
            >
              {isLoading ? '加载中...' : S.add}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 编辑项目模态框 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditItem(null);
        }}
        title={S.editApp}
        size="md"
      >
        {editItem && (
          <div className="space-y-4">
            {/* 名称输入 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {S.name}
              </label>
              <input
                type="text"
                value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* URL 输入 */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {S.url}
              </label>
              <input
                type="url"
                value={editItem.url}
                onChange={(e) => setEditItem({ ...editItem, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>

            {/* 图标选择器 */}
            <IconSelector
              iconType={editItem.iconType || 'favicon'}
              builtinIcon={editItem.builtinIcon}
              customIconUrl={editItem.customIconUrl}
              websiteUrl={editItem.url}
              appName={editItem.name}
              language={config.theme.language}
              onIconTypeChange={(iconType) => setEditItem({ ...editItem, iconType, builtinIcon: iconType === 'builtin' ? editItem.builtinIcon || 'home' : undefined, customIconUrl: iconType === 'custom' ? editItem.customIconUrl : undefined })}
              onBuiltinIconChange={(iconId) => setEditItem({ ...editItem, builtinIcon: iconId })}
              onCustomIconUrlChange={(url) => setEditItem({ ...editItem, customIconUrl: url })}
              onWebsiteUrlChange={(url) => setEditItem({ ...editItem, url })}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditItem(null);
                }}
              >
                {S.cancel}
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (editItem) {
                    const updatedIcons = config.icons.map(icon =>
                      icon.id === editItem.id ? editItem : icon
                    );
                    handleConfigUpdate({ icons: updatedIcons });
                    setIsEditModalOpen(false);
                    setEditItem(null);
                  }
                }}
              >
                {S.save}
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
