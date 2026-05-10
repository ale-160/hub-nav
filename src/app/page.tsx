'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { ConfigManager, UserConfig, IconItem, FolderItem, ThemeSettings } from '@/lib/configManager';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/hooks/useTheme';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { IconSelector } from '@/components/ui/icon-selector';
import { SettingsModal } from '@/components/ui/settings-modal';
import { ThemeToggleIcon } from '@/components/ui/theme-toggle-icon';
import { OnboardingGuide } from '@/components/ui/onboarding-guide';
import { STRINGS, getStrings } from '@/lib/strings';
import { validateUrl } from '@/lib/urlUtils';

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
  // 配置状态管理
  const [config, setConfig] = useState<UserConfig>(ConfigManager.getDefaultConfig());

  // 根据当前语言获取字符串
  const S = getStrings(config.theme.language);

  // 客户端挂载后异步加载本地配置和清理缓存
  useEffect(() => {
    const saved = ConfigManager.loadConfig();
    if (saved) {
      setConfig(saved);
    }

    // 清理过期缓存
    ConfigManager.cleanExpiredCache();
  }, []);
  // 主题管理
  const { toggleMode, setTheme } = useTheme();

  // UI 状态
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // 跟踪当前活跃页面索引
  const [isMounted, setIsMounted] = useState(false); // 用于避免 hydration mismatch
  const [addForm, setAddForm] = useState<AddItemForm>({
    type: 'icon',
    name: '',
    url: ''
  });
  const [editItem, setEditItem] = useState<IconItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * 保存配置
   */
  const saveConfig = useCallback((newConfig: UserConfig) => {
    setConfig(newConfig);
    ConfigManager.saveConfig(newConfig);
  }, []);

  /**
   * 处理配置更新
   */
  const handleConfigUpdate = useCallback((partialConfig: Partial<UserConfig>) => {
    const newConfig = { ...config, ...partialConfig };
    saveConfig(newConfig);
    // 如果更新了主题配置，需要同步到 useTheme（但不要覆盖 mode）
    if (partialConfig.theme) {
      // 只同步非 mode 字段，避免覆盖当前的暗色/浅色模式
      const { mode: _mode, ...themeWithoutMode } = partialConfig.theme;
      setTheme(themeWithoutMode as Partial<ThemeSettings>);
    }
  }, [config, saveConfig, setTheme]);

  /**
   * 过滤图标和文件夹
   */
  const filteredIcons = config.icons.filter(icon =>
    icon.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    icon.url.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const filteredFolders = config.folders.filter(folder =>
    folder.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    // 如果文件夹内包含匹配的图标，也应该保留
    config.icons.some(icon =>
      icon.folderId === folder.id &&
      (icon.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
       icon.url.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    )
  );

  /**
   * 计算需要展开的文件夹ID（包含匹配的图标或文件夹）
   */
  const searchedFolderIds = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return [];
    }

    const matchingFolderIds = new Set<string>();

    // 查找包含匹配图标的文件夹
    config.icons.forEach(icon => {
      if (icon.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          icon.url.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
        if (icon.folderId) {
          matchingFolderIds.add(icon.folderId);
          // 同时展开所有父文件夹
          let currentFolderId: string | undefined = icon.folderId;
          while (currentFolderId) {
            const parentFolder = config.folders.find(f => f.id === currentFolderId);
            if (parentFolder) {
              matchingFolderIds.add(parentFolder.id);
              currentFolderId = parentFolder.parentId;
            } else {
              currentFolderId = undefined;
            }
          }
        }
      }
    });

    // 查找包含匹配子文件夹的父文件夹
    config.folders.forEach(folder => {
      if (folder.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
        matchingFolderIds.add(folder.id);
        // 如果文件夹本身匹配，需要展开其所有父文件夹
        let currentFolderId = folder.parentId;
        while (currentFolderId) {
          matchingFolderIds.add(currentFolderId);
          const parentFolder = config.folders.find(f => f.id === currentFolderId);
          currentFolderId = parentFolder?.parentId;
        }
      }
    });

    return Array.from(matchingFolderIds);
  }, [debouncedSearchQuery, config.icons, config.folders]);

  /**
   * 导出配置
   */
  const handleExportConfig = useCallback(() => {
    try {
      const configString = ConfigManager.exportConfig();
      const blob = new Blob([configString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hub-nav-config.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success(S.exportSuccess);
    } catch {
      toast.error(S.exportError);
    }
  }, [S.exportError, S.exportSuccess]);

  /**
   * 导入配置
   */
  const handleImportConfig = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            if (ConfigManager.importConfig(content)) {
              const loadedConfig = ConfigManager.loadConfig();
              if (loadedConfig) {
                saveConfig(loadedConfig);
                handleConfigUpdate(loadedConfig); // 立即更新配置状态
                toast.success(S.importSuccess);
              } else {
                toast.error(S.importError);
              }
            } else {
              toast.error(S.importError);
            }
          } catch {
            toast.error(S.importError);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [saveConfig, handleConfigUpdate, S.importError, S.importSuccess]);

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
   * 添加新项目
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

        // 添加新图标
        const newIcon: IconItem = {
          id: crypto.randomUUID(),
          name: addForm.name.trim(),
          url: addForm.url.trim(),
          folderId: addForm.folderId,
          order: config.icons.length,
          isHidden: false,
          iconType: addForm.iconType || 'favicon',
          builtinIcon: addForm.builtinIcon,
          customIconUrl: addForm.customIconUrl
        };
        
        let newPages = config.pages;
        
        // 如果是根级图标，添加到当前活跃页面的 iconIds
        if (!addForm.folderId) {
          const targetPageIndex = currentPageIndex >= 0 && currentPageIndex < config.pages.length ? currentPageIndex : 0;
          
          // 关键修复：先从所有页面移除新图标 ID（防止数据污染），再添加到目标页面
          newPages = config.pages.map((page, index) => {
            if (index === targetPageIndex) {
              return {
                ...page,
                iconIds: [...page.iconIds.filter(id => id !== newIcon.id), newIcon.id]
              };
            }
            // 从其他页面移除该 ID（如果存在）
            return {
              ...page,
              iconIds: page.iconIds.filter(id => id !== newIcon.id)
            };
          });
        }
        // 如果在文件夹内添加，不需要添加到任何页面的 iconIds（因为文件夹本身已在某个页面中）
        
        handleConfigUpdate({
          icons: [...config.icons, newIcon],
          pages: newPages
        });
      } else {
        // 添加新文件夹
        const newFolder: FolderItem = {
          id: crypto.randomUUID(),
          name: addForm.name.trim(),
          order: config.folders.length
        };
        
        // 添加到当前活跃页面的 iconIds
        const targetPageIndex = currentPageIndex >= 0 && currentPageIndex < config.pages.length ? currentPageIndex : 0;
        const newPages = config.pages.map((page, index) => {
          if (index === targetPageIndex) {
            return {
              ...page,
              iconIds: [...page.iconIds, newFolder.id]
            };
          }
          return page;
        });
        
        handleConfigUpdate({
          folders: [...config.folders, newFolder],
          pages: newPages
        });
      }

      closeAddModal();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('添加项目失败:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [addForm, config, currentPageIndex, handleConfigUpdate, closeAddModal]);

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
   * 处理搜索框输入
   */
  // const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // }, []);

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
   * 处理图标删除
   */
  const handleIconDelete = useCallback((iconId: string) => {
    const updatedIcons = config.icons.filter(icon => icon.id !== iconId);
    // 从所有页面的 iconIds 中移除
    const updatedPages = config.pages.map(page => ({
      ...page,
      iconIds: page.iconIds.filter(id => id !== iconId)
    }));
    handleConfigUpdate({ icons: updatedIcons, pages: updatedPages });
  }, [config.icons, config.pages, handleConfigUpdate]);

  /**
   * 处理图标隐藏/显示
   */
  const handleIconHide = useCallback((iconId: string) => {
    const updatedIcons = config.icons.map(icon =>
      icon.id === iconId ? { ...icon, isHidden: !icon.isHidden } : icon
    );
    handleConfigUpdate({ icons: updatedIcons });
  }, [config.icons, handleConfigUpdate]);

  /**
   * 处理文件夹重命名
   */
  const handleFolderRename = useCallback((folderId: string, name: string) => {
    const updatedFolders = config.folders.map(folder =>
      folder.id === folderId ? { ...folder, name } : folder
    );
    handleConfigUpdate({ folders: updatedFolders });
  }, [config.folders, handleConfigUpdate]);

  /**
   * 处理文件夹删除
   */
  const handleFolderDelete = useCallback((folderId: string, deleteApps: boolean = false) => {
    // 如果需要删除应用，则过滤掉该文件夹下的应用
    const updatedIcons = deleteApps
      ? config.icons.filter(icon => icon.folderId !== folderId)
      : config.icons.map(icon =>
          icon.folderId === folderId ? { ...icon, folderId: undefined } : icon
        );
    // 删除文件夹
    const updatedFolders = config.folders.filter(folder => folder.id !== folderId);
    // 从所有页面的 iconIds 中移除
    const updatedPages = config.pages.map(page => ({
      ...page,
      iconIds: page.iconIds.filter(id => id !== folderId)
    }));
    handleConfigUpdate({ icons: updatedIcons, folders: updatedFolders, pages: updatedPages });
  }, [config.icons, config.folders, config.pages, handleConfigUpdate]);

  /**
   * 处理添加应用到文件夹
   */
  const handleAddIconToFolder = useCallback((folderId: string) => {
    openAddModal('icon', folderId);
  }, [openAddModal]);

  /**
   * 处理删除文件夹内所有应用
   */
  const handleDeleteAllIconsInFolder = useCallback((folderId: string) => {
    const updatedIcons = config.icons.map(icon =>
      icon.folderId === folderId ? { ...icon, folderId: undefined } : icon
    );
    handleConfigUpdate({ icons: updatedIcons });
  }, [config.icons, handleConfigUpdate]);

  /**
   * 处理移动图标到文件夹
   */
  const handleMoveIconToFolder = useCallback((iconId: string, folderId: string) => {
    // 查找目标文件夹
    const targetFolder = config.folders.find(f => f.id === folderId);
    if (!targetFolder) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[handleMoveIconToFolder] 目标文件夹不存在:', folderId);
      }
      return;
    }

    // 查找要移动的图标
    const targetIcon = config.icons.find(icon => icon.id === iconId);
    if (!targetIcon) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[handleMoveIconToFolder] 目标图标不存在:', iconId);
      }
      return;
    }

    // 更新图标的 folderId
    const updatedIcons = config.icons.map(icon =>
      icon.id === iconId ? { ...icon, folderId } : icon
    );
    
    // 从所有页面的 iconIds 中移除该图标（因为现在它在文件夹内）
    const updatedPages = config.pages.map(page => ({
      ...page,
      iconIds: page.iconIds.filter(id => id !== iconId)
    }));
    
    handleConfigUpdate({ icons: updatedIcons, pages: updatedPages });
  }, [config.icons, config.folders, config.pages, handleConfigUpdate]);

  /**
   * 处理文件夹内图标重新排序
   */
  const handleReorderIconsInFolder = useCallback((folderId: string, orderedIconIds: string[]) => {
    // 获取当前文件夹内的所有图标
    const folderIcons = config.icons.filter(icon => icon.folderId === folderId);
    
    // 创建一个映射，将图标 ID 映射到图标对象
    const iconMap = new Map(folderIcons.map(icon => [icon.id, icon]));
    
    // 按照新的顺序重新排列图标
    const reorderedIcons = orderedIconIds
      .map(id => iconMap.get(id))
      .filter((icon): icon is IconItem => icon !== undefined);
    
    // 其他不在排序列表中的图标保持不变
    const otherIcons = config.icons.filter(icon => icon.folderId !== folderId);
    
    // 合并并更新
    const updatedIcons = [...otherIcons, ...reorderedIcons];
    
    handleConfigUpdate({ icons: updatedIcons });
  }, [config.icons, handleConfigUpdate]);

  /**
   * 处理将图标从文件夹移动到根级
   */
  const handleMoveToRoot = useCallback((iconId: string) => {
    // 查找该图标
    const targetIcon = config.icons.find(icon => icon.id === iconId);
    if (!targetIcon || !targetIcon.folderId) return;

    // 找到该文件夹所在的页面
    const targetFolder = config.folders.find(folder => folder.id === targetIcon.folderId);
    if (!targetFolder) return;

    // 查找包含该文件夹的页面
    const targetPage = config.pages.find(page => page.iconIds?.includes(targetFolder.id));
    if (!targetPage) return;

    // 1. 更新图标：清除 folderId
    const updatedIcons = config.icons.map(icon =>
      icon.id === iconId ? { ...icon, folderId: undefined } : icon
    );

    // 2. 从所有页面的 iconIds 中移除该图标（防御性操作）
    const updatedPages = config.pages.map(page => ({
      ...page,
      iconIds: (page.iconIds || []).filter(id => id !== iconId)
    }));

    // 3. 将该图标添加到目标页面的 iconIds 末尾
    const targetPageIndex = updatedPages.findIndex(page => page.id === targetPage.id);
    if (targetPageIndex !== -1) {
      updatedPages[targetPageIndex] = {
        ...updatedPages[targetPageIndex],
        iconIds: [...(updatedPages[targetPageIndex].iconIds || []), iconId]
      };
    }

    handleConfigUpdate({ icons: updatedIcons, pages: updatedPages });
  }, [config.icons, config.folders, config.pages, handleConfigUpdate]);

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
            <header className={`border-b border-gray-200 dark:border-border sticky top-0 z-40 ${config.theme.wallpaperUrl ? 'bg-background/80 backdrop-blur-sm' : 'bg-[var(--bg-secondary)]'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between h-16 gap-4">
            {/* 左侧：Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo-icon.png.ico" alt="Logo" className="w-8 h-8" />
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
            icons={filteredIcons}
            folders={filteredFolders}
            pages={config.pages}
            config={config}
            onUpdate={handleConfigUpdate}
            searchedFolderIds={searchedFolderIds}
            onIconEdit={handleIconEdit}
            onIconDelete={handleIconDelete}
            onIconHide={handleIconHide}
            onMoveIconToFolder={handleMoveIconToFolder}
            onReorderIconsInFolder={handleReorderIconsInFolder} // 新增：文件夹内图标排序
            onMoveToRoot={handleMoveToRoot} // 新增：移动到根级
            onFolderRename={handleFolderRename}
            onFolderDelete={handleFolderDelete}
            onAddIconToFolder={handleAddIconToFolder}
            onDeleteAllIconsInFolder={handleDeleteAllIconsInFolder}
            onAddIcon={() => openAddModal('icon')}
            onAddFolder={() => openAddModal('folder')}
            onRefresh={() => {
              const saved = ConfigManager.loadConfig();
              if (saved) setConfig(saved);
            }}
            onPageChange={setCurrentPageIndex} // 新增：跟踪当前页面索引
          />
        ) : (
          // 服务端渲染时显示占位符，避免 hydration mismatch
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-muted-foreground">{S.loading}</div>
          </div>
        )}
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
        onImport={handleImportConfig}
        onExport={handleExportConfig}
        language={config.theme.language}
      />

      {/* 新手引导 */}
      <OnboardingGuide />
    </div>
  );
}
