'use client';

import {useCallback, useEffect, useState} from 'react';
import {ConfigManager, FolderItem, IconItem, UserConfig} from '@/lib/configManager';
import {deleteIconFromConfig} from '@/utils/iconOperations';
import {getBrowserLanguage} from '@/data/i18n';

/**
 * 配置管理 Hook
 * 负责配置的加载、保存和更新
 */
export function useConfig() {
  const [config, setConfig] = useState<UserConfig>(ConfigManager.getDefaultConfig());
  const [isMounted, setIsMounted] = useState(false);

  // 客户端挂载后从 localStorage 加载配置
  useEffect(() => {
    const browserLang = getBrowserLanguage();
    const loadedConfig = ConfigManager.loadConfig();
    if (loadedConfig) {
      // 如果配置中没有语言设置，则检测浏览器语言
      if (!loadedConfig.theme.language) {
        loadedConfig.theme.language = browserLang;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConfig(loadedConfig);
    } else {
      // 没有配置时，使用默认配置并检测浏览器语言
      const defaultConfig = ConfigManager.getDefaultConfig(browserLang);
      setConfig(defaultConfig);
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
   * 从所有页面中移除指定的 ID
   */
  const removeIdsFromAllPages = useCallback((idsToRemove: string[]) => {
    return config.pages.map(page => ({
      ...page,
      iconIds: page.iconIds.filter(id => !idsToRemove.includes(id))
    }));
  }, [config.pages]);

  /**
   * 将 IDs 添加到指定页面的 iconIds
   */
  const addIdsToPage = useCallback((pageIndex: number, idsToAdd: string[]) => {
    // 如果没有页面，创建默认页面
    if (config.pages.length === 0) {
      return [{
        id: crypto.randomUUID(),
        name: '首页',
        iconIds: [...idsToAdd]
      }];
    }

    // 安全索引：确保 pageIndex 在有效范围内
    const safeIndex = Math.max(0, Math.min(pageIndex, config.pages.length - 1));

    return config.pages.map((page, index) => {
      if (index === safeIndex) {
        return {
          ...page,
          iconIds: [...new Set([...page.iconIds, ...idsToAdd])]
        };
      }
      return page;
    });
  }, [config.pages]);

  /**
   * 通用更新函数：根据 ID 更新数组中的项
   */
  const updateItemInArray = useCallback(<T extends { id: string }>(
    items: T[],
    itemId: string,
    updates: Partial<T>
  ): T[] => {
    return items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
  }, []);

  /**
   * 更新图标
   */
  const updateIcon = useCallback((iconId: string, updates: Partial<IconItem>) => {
    const newIcons = updateItemInArray(config.icons, iconId, updates);
    saveConfig({ ...config, icons: newIcons });
  }, [config, saveConfig, updateItemInArray]);

  /**
   * 删除图标
   */
  const deleteIcon = useCallback((iconId: string) => {
    const newConfig = deleteIconFromConfig(config, iconId);
    saveConfig(newConfig);
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
    const newFolders = updateItemInArray(config.folders, folderId, updates);
    saveConfig({ ...config, folders: newFolders });
  }, [config, saveConfig, updateItemInArray]);

  /**
   * 删除文件夹
   */
  const deleteFolder = useCallback((folderId: string, deleteApps: boolean = false) => {
    const newFolders = config.folders.filter(folder => folder.id !== folderId);

    // 获取文件夹内的所有图标 ID
    const folderIconIds = config.icons
      .filter(icon => icon.folderId === folderId)
      .map(icon => icon.id);

    let newIcons: IconItem[];
    let newPages = config.pages;

    if (deleteApps) {
      // 删除文件夹及其所有图标
      newIcons = config.icons.filter(icon => !folderIconIds.includes(icon.id));
      // 从所有页面移除这些图标 ID
      newPages = removeIdsFromAllPages(folderIconIds);
    } else {
      // 仅删除文件夹，将图标移到根级
      newIcons = config.icons.map(icon =>
        icon.folderId === folderId ? { ...icon, folderId: undefined } : icon
      );

      // 将这些图标添加到第一页
      if (folderIconIds.length > 0) {
        newPages = addIdsToPage(0, folderIconIds);
      }
    }

    saveConfig({
      ...config,
      folders: newFolders,
      icons: newIcons,
      pages: newPages
    });
  }, [config, saveConfig, removeIdsFromAllPages, addIdsToPage]);

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
    } catch (_err) {
      console.error('导入配置失败:', _err);
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
    importConfig
  };
}
