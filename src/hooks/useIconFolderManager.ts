/**
 * 图标和文件夹管理 Hook
 * 
 * 职责：封装图标和文件夹的业务逻辑（Service 层）
 * - 提供原子化的 CRUD 操作
 * - 自动处理页面关联
 * - 防止级联渲染
 */

import { useCallback } from 'react';
import { IconItem, FolderItem, UserConfig } from '@/utils/config/types';

export interface UseIconFolderManagerOptions {
  config: UserConfig;
  saveConfig: (config: UserConfig) => void;
}

export function useIconFolderManager({ config, saveConfig }: UseIconFolderManagerOptions) {
  
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
   * 删除图标（包含页面清理）
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
   * 隐藏/显示图标
   */
  const toggleIconVisibility = useCallback((iconId: string) => {
    const newIcons = config.icons.map(icon =>
      icon.id === iconId ? { ...icon, isHidden: !icon.isHidden } : icon
    );

    saveConfig({
      ...config,
      icons: newIcons
    });
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
   * 删除文件夹（包含图标处理）
   */
  const deleteFolder = useCallback((folderId: string, deleteApps: boolean = false) => {
    const newFolders = config.folders.filter(folder => folder.id !== folderId);
    let newIcons: IconItem[];
    let newPages = config.pages;

    if (deleteApps) {
      // 删除文件夹及其中的所有图标
      const folderIconIds = config.icons
        .filter(icon => icon.folderId === folderId)
        .map(icon => icon.id);

      newIcons = config.icons.filter(icon => !folderIconIds.includes(icon.id));

      // 从所有页面中移除这些图标 ID
      newPages = config.pages.map(page => ({
        ...page,
        iconIds: page.iconIds.filter(id => !folderIconIds.includes(id))
      }));
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
            return {
              ...page,
              iconIds: [...new Set([...page.iconIds, ...folderIconIds])]
            };
          }
          return page;
        });
      }
    }

    // 从所有页面的 iconIds 中移除文件夹 ID
    newPages = newPages.map(page => ({
      ...page,
      iconIds: page.iconIds.filter(id => id !== folderId)
    }));

    saveConfig({
      ...config,
      folders: newFolders,
      icons: newIcons,
      pages: newPages
    });
  }, [config, saveConfig]);

  /**
   * 移动图标到文件夹
   */
  const moveIconToFolder = useCallback((iconId: string, folderId: string) => {
    // 验证目标文件夹是否存在
    const targetFolder = config.folders.find(f => f.id === folderId);
    if (!targetFolder) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[moveIconToFolder] 目标文件夹不存在:', folderId);
      }
      return;
    }

    // 验证图标是否存在
    const targetIcon = config.icons.find(icon => icon.id === iconId);
    if (!targetIcon) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[moveIconToFolder] 目标图标不存在:', iconId);
      }
      return;
    }

    // 更新图标的 folderId
    const newIcons = config.icons.map(icon =>
      icon.id === iconId ? { ...icon, folderId } : icon
    );

    // 从所有页面的 iconIds 中移除该图标（因为现在它在文件夹内）
    const newPages = config.pages.map(page => ({
      ...page,
      iconIds: page.iconIds.filter(id => id !== iconId)
    }));

    saveConfig({
      ...config,
      icons: newIcons,
      pages: newPages
    });
  }, [config, saveConfig]);

  /**
   * 移动图标到根级（从文件夹移出）
   */
  const moveIconToRoot = useCallback((iconId: string) => {
    // 查找该图标
    const targetIcon = config.icons.find(icon => icon.id === iconId);
    if (!targetIcon || !targetIcon.folderId) return;

    // 找到该文件夹所在的页面
    const targetFolder = config.folders.find(folder => folder.id === targetIcon.folderId);
    if (!targetFolder) return;

    // 查找包含该文件夹的页面
    const sourcePage = config.pages.find(page => page.iconIds.includes(targetFolder.id));
    if (!sourcePage) return;

    // 更新图标的 folderId 为 undefined
    const newIcons = config.icons.map(icon =>
      icon.id === iconId ? { ...icon, folderId: undefined } : icon
    );

    // 将图标添加到源页面的 iconIds（在文件夹之后）
    const folderIndex = sourcePage.iconIds.indexOf(targetFolder.id);
    const newIconIds = [...sourcePage.iconIds];
    newIconIds.splice(folderIndex + 1, 0, iconId);

    const newPages = config.pages.map(page =>
      page.id === sourcePage.id ? { ...page, iconIds: newIconIds } : page
    );

    saveConfig({
      ...config,
      icons: newIcons,
      pages: newPages
    });
  }, [config, saveConfig]);

  /**
   * 重新排序文件夹内的图标
   */
  const reorderIconsInFolder = useCallback((folderId: string, orderedIconIds: string[]) => {
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
    const newIcons = [...otherIcons, ...reorderedIcons];

    saveConfig({
      ...config,
      icons: newIcons
    });
  }, [config, saveConfig]);

  /**
   * 清空文件夹内的所有图标（移到根级）
   */
  const clearFolderIcons = useCallback((folderId: string) => {
    const newIcons = config.icons.map(icon =>
      icon.folderId === folderId ? { ...icon, folderId: undefined } : icon
    );

    saveConfig({
      ...config,
      icons: newIcons
    });
  }, [config, saveConfig]);

  return {
    updateIcon,
    deleteIcon,
    toggleIconVisibility,
    updateFolder,
    deleteFolder,
    moveIconToFolder,
    moveIconToRoot,
    reorderIconsInFolder,
    clearFolderIcons
  };
}
