'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { UserConfig, IconItem } from '@/lib/configManager';

interface UseSearchOptions {
  config: UserConfig;
  currentPageIndex: number;
}

/**
 * 搜索管理 Hook
 * 负责搜索查询、防抖和搜索结果计算
 */
export function useSearch({ config, currentPageIndex }: UseSearchOptions) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // 搜索防抖（300ms）
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * 检查图标是否匹配搜索关键词
   * 注意：仅匹配应用名称，不匹配 URL
   */
  const isIconMatch = useCallback((icon: IconItem, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    return icon.name.toLowerCase().includes(lowerQuery);
  }, []);

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
      if (isIconMatch(icon, debouncedSearchQuery)) {
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
  }, [debouncedSearchQuery, config.icons, config.folders, isIconMatch]);

  /**
   * 过滤当前页面的图标和文件夹 ID（基于搜索查询）
   * 注意：只搜索根级元素，文件夹内匹配时显示文件夹
   */
  const filteredPageIconIds = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return config.pages[currentPageIndex]?.iconIds || [];
    }

    const currentPage = config.pages[currentPageIndex];
    if (!currentPage) return [];

    // 收集所有匹配的 ID
    const matchingIds = new Set<string>();

    // 遍历当前页面的所有根级元素 ID
    currentPage.iconIds.forEach(id => {
      // 检查是否是根级图标（folderId 为 undefined）
      const rootIcon = config.icons.find(i => i.id === id && !i.folderId);
      if (rootIcon) {
        if (isIconMatch(rootIcon, debouncedSearchQuery)) {
          matchingIds.add(id);
        }
        return; // 已处理，跳过后续检查
      }

      // 检查是否是根级文件夹（parentId 为 undefined）
      const rootFolder = config.folders.find(f => f.id === id && !f.parentId);
      if (rootFolder) {
        let shouldInclude = false;

        // 1. 文件夹名称匹配
        if (rootFolder.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) {
          shouldInclude = true;
        }

        // 2. 文件夹内包含匹配的图标
        if (!shouldInclude) {
          const hasMatchingIcon = config.icons.some(icon =>
            icon.folderId === rootFolder.id &&
            isIconMatch(icon, debouncedSearchQuery)
          );
          if (hasMatchingIcon) {
            shouldInclude = true;
          }
        }

        if (shouldInclude) {
          matchingIds.add(id);
        }
      }
    });

    return Array.from(matchingIds);
  }, [debouncedSearchQuery, config.pages, currentPageIndex, config.icons, config.folders, isIconMatch]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    searchedFolderIds,
    filteredPageIconIds
  };
}
