'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConfigManager, UserConfig, IconItem, FolderItem } from '@/lib/configManager';

/**
 * 配置管理 Hook
 * 负责配置的加载、保存和更新
 */
export function useConfig() {
  const [config, setConfig] = useState<UserConfig>(ConfigManager.getDefaultConfig());
  const [isMounted, setIsMounted] = useState(false);

  // 客户端挂载后从 localStorage 加载配置
  useEffect(() => {
    const loadedConfig = ConfigManager.loadConfig();
    if (loadedConfig) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig(loadedConfig);
    }
    setIsMounted(true);
  }, []);

  // 清理过期缓存
  useEffect(() => {
    ConfigManager.cleanExpiredCache();
  }, []);

  /**
   * 保存配置
   */
  const saveConfig = useCallback((newConfig: UserConfig) => {
    setConfig(newConfig);
    ConfigManager.saveConfig(newConfig);
  }, []);

  /**
   * 处理配置更新（部分更新）
   */
  const updateConfig = useCallback((partialConfig: Partial<UserConfig>) => {
    const newConfig = { ...config, ...partialConfig };
    saveConfig(newConfig);
  }, [config, saveConfig]);

  /**
   * 添加图标（基础版，不包含页面关联）
   */
  const addIcon = useCallback((icon: Omit<IconItem, 'id' | 'order'> & { folderId?: string }) => {
    const newIcon: IconItem = {
      ...icon,
      id: crypto.randomUUID(),
      order: config.icons.length,
      isHidden: false
    };

    saveConfig({
      ...config,
      icons: [...config.icons, newIcon]
    });

    return newIcon;
  }, [config, saveConfig]);

  /**
   * 添加图标（包含页面关联逻辑）
   */
  const addIconWithPage = useCallback((
    iconData: Omit<IconItem, 'id' | 'order' | 'isHidden'> & { folderId?: string },
    currentPageIndex: number
  ) => {
    const newIcon: IconItem = {
      ...iconData,
      id: crypto.randomUUID(),
      order: config.icons.length,
      isHidden: false
    };

    let newPages = config.pages;

    // 如果是根级图标，添加到当前活跃页面的 iconIds
    if (!iconData.folderId) {
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

    saveConfig({
      ...config,
      icons: [...config.icons, newIcon],
      pages: newPages
    });

    return newIcon;
  }, [config, saveConfig]);

  /**
   * 添加文件夹（包含页面关联逻辑）
   */
  const addFolderWithPage = useCallback((
    name: string,
    currentPageIndex: number
  ) => {
    const newFolder: FolderItem = {
      id: crypto.randomUUID(),
      name,
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

    saveConfig({
      ...config,
      folders: [...config.folders, newFolder],
      pages: newPages
    });

    return newFolder;
  }, [config, saveConfig]);

  /**
   * 更新图标
   */
  const updateIcon = useCallback((iconId: string, updates: Partial<IconItem>) => {
    const newIcons = config.icons.map(icon =>
      icon.id === iconId ? { ...icon, ...updates } : icon
    );

    saveConfig({
      ...config,
      icons: newIcons
    });
  }, [config, saveConfig]);

  /**
   * 删除图标
   */
  const deleteIcon = useCallback((iconId: string) => {
    // 从所有页面中移除该图标 ID
    const newPages = config.pages.map(page => ({
      ...page,
      iconIds: page.iconIds.filter(id => id !== iconId)
    }));

    // 从图标列表中移除
    const newIcons = config.icons.filter(icon => icon.id !== iconId);

    saveConfig({
      ...config,
      icons: newIcons,
      pages: newPages
    });
  }, [config, saveConfig]);

  /**
   * 添加文件夹
   */
  const addFolder = useCallback((name: string) => {
    const newFolder: FolderItem = {
      id: crypto.randomUUID(),
      name,
      order: config.folders.length
    };

    saveConfig({
      ...config,
      folders: [...config.folders, newFolder]
    });

    return newFolder;
  }, [config, saveConfig]);

  /**
   * 更新文件夹
   */
  const updateFolder = useCallback((folderId: string, updates: Partial<FolderItem>) => {
    const newFolders = config.folders.map(folder =>
      folder.id === folderId ? { ...folder, ...updates } : folder
    );

    saveConfig({
      ...config,
      folders: newFolders
    });
  }, [config, saveConfig]);

  /**
   * 删除文件夹
   */
  const deleteFolder = useCallback((folderId: string, deleteApps: boolean = false) => {
    const newFolders = config.folders.filter(folder => folder.id !== folderId);
    let newIcons: IconItem[];
    let newPages = config.pages;

    // 如果选择同时删除应用，则删除该文件夹内的所有图标
    if (deleteApps) {
      const folderIconIds = config.icons
        .filter(icon => icon.folderId === folderId)
        .map(icon => icon.id);

      newIcons = config.icons.filter(icon => !folderIconIds.includes(icon.id));

      // 从所有页面中移除这些图标 ID
      newPages = config.pages.map(page => ({
        ...page,
        iconIds: page.iconIds.filter(id => !folderIconIds.includes(id))
      }));

      saveConfig({
        ...config,
        folders: newFolders,
        icons: newIcons,
        pages: newPages
      });
    } else {
      // 仅删除文件夹，将图标移到根级并添加到第一页
      const folderIcons = config.icons.filter(icon => icon.folderId === folderId);
      const folderIconIds = folderIcons.map(icon => icon.id);
      
      // 将图标的 folderId 设为 undefined
      newIcons = config.icons.map(icon =>
        icon.folderId === folderId ? { ...icon, folderId: undefined } : icon
      );

      // 将这些图标添加到第一页的 iconIds（如果第一页存在）
      if (config.pages.length > 0 && folderIconIds.length > 0) {
        newPages = config.pages.map((page, index) => {
          if (index === 0) {
            // 添加到第一页末尾，去重
            return {
              ...page,
              iconIds: [...new Set([...page.iconIds, ...folderIconIds])]
            };
          }
          return page;
        });
      }

      saveConfig({
        ...config,
        folders: newFolders,
        icons: newIcons,
        pages: newPages
      });
    }
  }, [config, saveConfig]);

  /**
   * 导出配置
   */
  const exportConfig = useCallback(() => {
    try {
      const json = ConfigManager.exportConfig();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hub-nav-config-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('导出配置失败:', error);
      return false;
    }
  }, []);

  /**
   * 导入配置
   */
  const importConfig = useCallback((json: string): boolean => {
    try {
      const success = ConfigManager.importConfig(json);
      if (success) {
        const loadedConfig = ConfigManager.loadConfig();
        if (loadedConfig) {
          setConfig(loadedConfig);
        }
      }
      return success;
    } catch (error) {
      console.error('导入配置失败:', error);
      return false;
    }
  }, []);

  return {
    config,
    isMounted,
    updateConfig,
    saveConfig,
    // 基础操作（不包含页面关联）
    addIcon,
    updateIcon,
    deleteIcon,
    addFolder,
    updateFolder,
    deleteFolder,
    // 高级操作（包含页面关联，推荐使用）
    addIconWithPage,
    addFolderWithPage,
    exportConfig,
    importConfig
  };
}
