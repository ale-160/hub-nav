import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
} from '@dnd-kit/sortable';
import { IconItem, FolderItem, UserConfig, Page } from '@/lib/configManager';
import { PageIndicator } from './PageIndicator';
import { PageManager } from './PageManager';
import { Icon } from './Icon';
import { Folder } from './Folder';
import { getStrings } from '@/data/i18n';
import { PageNavigation } from './Page/PageNavigation';
import { BlankContextMenu } from './Page/BlankContextMenu';
import { PageDroppable } from './Page/PageDroppable';

interface PageContainerProps {
  icons: IconItem[];
  folders: FolderItem[];
  pages: Page[];
  config: UserConfig;
  onUpdate: (config: Partial<UserConfig>) => void;
  searchedFolderIds?: string[];
  onIconEdit?: (id: string) => void;
  onIconDelete?: (id: string) => void;
  onIconHide?: (id: string) => void;
  onUpdateIcon?: (iconId: string, updates: Partial<IconItem>) => void;
  onMoveIconToFolder?: (iconId: string, folderId: string) => void;
  onReorderIconsInFolder?: (folderId: string, orderedIconIds: string[]) => void; // 新增：文件夹内图标排序
  onMoveToRoot?: (iconId: string) => void; // 新增：移动到根级
  onFolderRename?: (id: string, name: string) => void;
  onFolderDelete?: (id: string, deleteApps?: boolean) => void;
  onAddIconToFolder?: (folderId: string) => void;
  onDeleteAllIconsInFolder?: (folderId: string) => void;
  onAddIcon?: () => void;
  onAddFolder?: () => void;
  onRefresh?: () => void;
  onPageChange?: (index: number) => void; // 新增：页面切换回调
}

/**
 * 页面容器组件 - 管理多页横向滚动和跨页拖拽
 * @param props - 组件属性
 */
export function PageContainer({
  icons,
  folders,
  pages,
  config,
  onUpdate,
  searchedFolderIds = [],
  onIconEdit,
  onIconDelete,
  onIconHide,
  onUpdateIcon,
  onMoveIconToFolder,
  onReorderIconsInFolder, // 新增
  onMoveToRoot, // 新增
  onFolderRename,
  onFolderDelete,
  onAddIconToFolder,
  onDeleteAllIconsInFolder,
  onAddIcon,
  onAddFolder,
  onRefresh,
  onPageChange, // 新增
}: PageContainerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'icon' | 'folder' | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [overId, setOverId] = useState<string | null>(null); // 拖拽悬停目标
  const [readyToDropFolderId, setReadyToDropFolderId] = useState<string | null>(null); // 准备好放入的文件夹ID
  const [pageSwitchDirection, setPageSwitchDirection] = useState<'left' | 'right' | null>(null); // 页面切换方向（用于边缘高亮）
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isBlankMenuOpen, setIsBlankMenuOpen] = useState(false);
  const [blankMenuPosition, setBlankMenuPosition] = useState({ x: 0, y: 0 });
  const folderHoverTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map()); // 文件夹悬停计时器
  const pageSwitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 页面切换计时器
  const lastSwitchedPageRef = useRef<number | null>(null); // 记录上次切换的页面索引

  // ✅ 配置传感器：PointerSensor 已统一处理鼠标、触摸和触控笔
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8, // 移动超过 8px 才开始拖拽
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // 按住 250ms 才开始拖拽
      tolerance: 5, // 或移动 5px
    },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // 根据当前配置的语言获取文案
  const currentLanguage = config.theme.language || 'zh';
  const STRINGS = getStrings(currentLanguage);

  /**
   * 辅助函数：通过任意元素 ID 查找所在页面
   * @param itemId - 图标或文件夹的 ID
   * @returns 页面对象和索引，如果未找到则返回 null
   */
  const findPageByItemId = useCallback((itemId: string): { page: Page; index: number } | null => {
    // 1. 首先检查是否是根级元素（在某个页面的 iconIds 中）
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].iconIds.includes(itemId)) {
        return { page: pages[i], index: i };
      }
    }

    // 2. 如果不是根级元素，检查是否是文件夹内的图标
    const icon = icons.find(i => i.id === itemId);
    if (icon && icon.folderId) {
      // 找到图标所在的文件夹
      const folder = folders.find(f => f.id === icon.folderId);
      if (folder) {
        // 查找文件夹所在的页面
        for (let i = 0; i < pages.length; i++) {
          if (pages[i].iconIds.includes(folder.id)) {
            return { page: pages[i], index: i };
          }
        }
      }
    }

    // 3. 检查是否是文件夹本身（但不在任何页面的 iconIds 中，理论上不应该发生）
    const folder = folders.find(f => f.id === itemId);
    if (folder && folder.parentId) {
      // 嵌套文件夹，查找父文件夹所在页面
      const parentFolder = folders.find(f => f.id === folder.parentId);
      if (parentFolder) {
        for (let i = 0; i < pages.length; i++) {
          if (pages[i].iconIds.includes(parentFolder.id)) {
            return { page: pages[i], index: i };
          }
        }
      }
    }

    return null;
  }, [pages, icons, folders]);

  /**
   * 监听滚动事件，更新当前页面索引
   */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const pageWidth = container.clientWidth;
      const newIndex = Math.round(scrollLeft / pageWidth);

      if (newIndex !== currentPageIndex && newIndex >= 0 && newIndex < pages.length) {
        setCurrentPageIndex(newIndex);

        // 通知父组件页面切换
        if (onPageChange) {
          onPageChange(newIndex);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentPageIndex, pages.length, onPageChange]);

  /**
   * 组件卸载时清理所有计时器，防止内存泄漏
   */
  useEffect(() => {
    return () => {
      // 在 cleanup 函数中捕获当前的 ref 值
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const currentFolderTimers = folderHoverTimersRef.current;
      const currentPageTimer = pageSwitchTimerRef.current;

      // 清理文件夹悬停计时器（Map 类型）
      currentFolderTimers.forEach((timer) => clearTimeout(timer));
      currentFolderTimers.clear();

      // 清理页面切换计时器（单个计时器）
      if (currentPageTimer) {
        clearTimeout(currentPageTimer);
      }
    };
  }, []);

  /**
   * 处理页面切换
   */
  const handlePageChange = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const pageWidth = container.clientWidth;
    container.scrollTo({
      left: pageWidth * index,
      behavior: 'smooth'
    });
    setCurrentPageIndex(index);

    // 通知父组件页面切换
    if (onPageChange) {
      onPageChange(index);
    }
  }, [onPageChange]);

  /**
   * 处理切换到上一页
   */
  const handlePreviousPage = useCallback(() => {
    if (currentPageIndex > 0) {
      handlePageChange(currentPageIndex - 1);
    }
  }, [currentPageIndex, handlePageChange]);

  /**
   * 处理切换到下一页
   */
  const handleNextPage = useCallback(() => {
    if (currentPageIndex < pages.length - 1) {
      handlePageChange(currentPageIndex + 1);
    }
  }, [currentPageIndex, pages.length, handlePageChange]);

  /**
   * 将图标移动到目标页面（清理所有页面中的旧位置，添加到目标页面末尾）
   */
  const moveIconToPage = useCallback((
    activeId: string,
    targetPage: Page,
    updatedIcons: IconItem[]
  ) => {
    // 从所有页面清理图标 ID，并添加到目标页面末尾
    const finalPages = pages.map(page => {
      if (page.id === targetPage.id) {
        return {
          ...page,
          iconIds: [...page.iconIds.filter(id => id !== activeId), activeId]
        };
      }
      // 其他页面移除该图标 ID
      return {
        ...page,
        iconIds: page.iconIds.filter(id => id !== activeId)
      };
    });

    onUpdate({ pages: finalPages, icons: updatedIcons });
  }, [pages, onUpdate]);

  /**
   * 处理桌面空白处右键
   */
  const handleBlankContextMenu = useCallback((e: React.MouseEvent) => {
    // 检查点击的是否是图标或文件夹
    const target = e.target as HTMLElement;
    if (target.closest('[data-icon-item]') || target.closest('[data-folder-item]')) {
      return; // 让子组件处理
    }

    // 阻止浏览器默认菜单
    e.preventDefault();
    setBlankMenuPosition({ x: e.clientX, y: e.clientY });
    setIsBlankMenuOpen(true);
  }, []);

  /**
   * 处理拖拽开始
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);

    // 判断拖拽元素类型
    const isIcon = icons.some(icon => icon.id === event.active.id);
    const isFolder = folders.some(folder => folder.id === event.active.id);
    setActiveType(isIcon ? 'icon' : isFolder ? 'folder' : null);
  }, [icons, folders]);

  /**
   * 处理拖拽悬停 - 更新 overId 以提供视觉反馈
   */
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over, active } = event;

    if (over) {
      const newOverId = over.id as string;
      setOverId(newOverId);

      // 检查是否悬停在文件夹上
      const targetFolder = folders.find(folder => folder.id === newOverId);

      if (targetFolder) {
        // 清除该文件夹之前的计时器
        const existingTimer = folderHoverTimersRef.current.get(newOverId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // 启动新的 600ms 计时器
        const timer = setTimeout(() => {
          setReadyToDropFolderId(newOverId);
        }, 600);

        folderHoverTimersRef.current.set(newOverId, timer);
      } else {
        // 如果悬停的不是文件夹，清除所有计时器并重置 readyToDropFolderId
        folderHoverTimersRef.current.forEach((timer) => clearTimeout(timer));
        folderHoverTimersRef.current.clear();
        setReadyToDropFolderId(null);
      }

      // 检测是否悬停在页面边缘，触发自动滚动
      if (active && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();

        // ✅ 空值保护：获取鼠标位置（从 active 节点的 rect）
        // 在快速移动或触摸设备上，active.rect.current.translated 可能为 null
        const activeRect = active.rect.current.translated;
        if (!activeRect) {
          // 如果无法获取拖拽元素的位置，跳过边缘检测
          return;
        }

        const mouseX = activeRect.left + activeRect.width / 2;

        // 计算相对于容器的位置
        const relativeX = mouseX - containerRect.left;
        const edgeThreshold = 200; // ✅ 边缘检测阈值扩大一倍：100px → 200px

        // 检测是否在左边缘或右边缘
        const isLeftEdge = relativeX < edgeThreshold;
        const isRightEdge = relativeX > containerRect.width - edgeThreshold;

        // 确定目标页面索引
        let targetPageIndex: number | null = null;
        let switchDirection: 'left' | 'right' | null = null;

        if (isLeftEdge && currentPageIndex > 0) {
          // 左边缘：切换到上一页
          targetPageIndex = currentPageIndex - 1;
          switchDirection = 'left';
        } else if (isRightEdge && currentPageIndex < pages.length - 1) {
          // 右边缘：切换到下一页
          targetPageIndex = currentPageIndex + 1;
          switchDirection = 'right';
        }

        // ✅ 设置边缘高亮状态
        setPageSwitchDirection(switchDirection);

        // 如果有目标页面且与上次切换的页面不同，启动计时器
        if (targetPageIndex !== null && targetPageIndex !== lastSwitchedPageRef.current) {
          // 清除之前的计时器
          if (pageSwitchTimerRef.current) {
            clearTimeout(pageSwitchTimerRef.current);
          }

          // 设置新的 600ms 计时器
          pageSwitchTimerRef.current = setTimeout(() => {
            const pageWidth = container.clientWidth;
            container.scrollTo({
              left: pageWidth * targetPageIndex!,
              behavior: 'smooth'
            });
            setCurrentPageIndex(targetPageIndex!);
            lastSwitchedPageRef.current = targetPageIndex!;
            
            // ✅ 清除边缘高亮
            setPageSwitchDirection(null);

            // 通知父组件页面切换
            if (onPageChange) {
              onPageChange(targetPageIndex!);
            }
          }, 600);
        }
      }
    } else {
      setOverId(null);
      // 清除所有计时器
      folderHoverTimersRef.current.forEach((timer) => clearTimeout(timer));
      folderHoverTimersRef.current.clear();
      setReadyToDropFolderId(null);

      // 清除页面切换计时器
      if (pageSwitchTimerRef.current) {
        clearTimeout(pageSwitchTimerRef.current);
        pageSwitchTimerRef.current = null;
      }
    }
  }, [folders, pages, currentPageIndex, onPageChange]);

  /**
   * 处理拖拽结束 - 支持跨页拖拽和拖入文件夹
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setActiveType(null);
    setOverId(null); // 清除悬停状态
    setPageSwitchDirection(null); // ✅ 清除页面切换高亮

    // 清除所有计时器
    folderHoverTimersRef.current.forEach((timer) => clearTimeout(timer));
    folderHoverTimersRef.current.clear();
    setReadyToDropFolderId(null);

    // 清除页面切换计时器并重置上次切换的页面
    if (pageSwitchTimerRef.current) {
      clearTimeout(pageSwitchTimerRef.current);
      pageSwitchTimerRef.current = null;
    }
    lastSwitchedPageRef.current = null;

    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 如果拖拽到自身，不做任何操作
    if (activeId === overId) return;

    // 查找被拖拽的图标或文件夹
    const draggedIcon = icons.find(icon => icon.id === activeId);
    const draggedFolder = folders.find(folder => folder.id === activeId);

    // 检查 over 是否是文件夹（拖入文件夹）
    // 关键：仅当 readyToDropFolderId 有效且与目标文件夹匹配时，才执行移入逻辑
    const targetFolder = folders.find(folder => folder.id === overId);

    if (targetFolder && draggedIcon && readyToDropFolderId === targetFolder.id) {
      // 拖拽图标到文件夹上：将图标移入文件夹
      const updatedIcons = icons.map(icon =>
        icon.id === activeId ? { ...icon, folderId: targetFolder.id } : icon
      );

      // 关键修复：从所有页面的 iconIds 中移除该图标（防止数据污染）
      const updatedPages = pages.map(page => ({
        ...page,
        iconIds: page.iconIds.filter(id => id !== activeId)
      }));

      onUpdate({ icons: updatedIcons, pages: updatedPages });
      return;
    }

    // 检查 over 是否是页面 droppable 区域（页面 ID 格式为 page-*）
    const isOverPage = overId.startsWith('page-');

    if (isOverPage && (draggedIcon || draggedFolder)) {
      // 找到目标页面
      const targetPage = pages.find(page => page.id === overId);

      if (!targetPage) return;

      // 使用辅助函数查找源页面
      const sourcePageInfo = findPageByItemId(activeId);

      if (!sourcePageInfo) {
        if (process.env.NODE_ENV === 'development') {
          console.error('[handleDragEnd] 未找到拖拽元素所在的页面:', activeId);
        }
        return;
      }

      const { page: sourcePage } = sourcePageInfo;

      // 如果找到了源页面且目标页面不同，执行跨页移动
      if (sourcePage.id !== targetPage.id) {
        let updatedIcons = icons;

        // 如果是文件夹内的图标，先移出文件夹
        if (draggedIcon && draggedIcon.folderId) {
          updatedIcons = icons.map(icon =>
            icon.id === activeId ? { ...icon, folderId: undefined } : icon
          );
        }

        // 移动到目标页面
        moveIconToPage(activeId, targetPage, updatedIcons);
        return;
      }

      // 如果是文件夹内的图标，拖到同一页面的根级
      if (draggedIcon && draggedIcon.folderId) {
        // 将图标移出文件夹
        const updatedIcons = icons.map(icon =>
          icon.id === activeId ? { ...icon, folderId: undefined } : icon
        );

        // 移动到目标页面（同一页面）
        moveIconToPage(activeId, targetPage, updatedIcons);
        return;
      }
    }

    // 页面内拖拽排序：查找 active 和 over 所在的页面
    const sourcePageInfo = findPageByItemId(activeId);

    if (!sourcePageInfo) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[handleDragEnd] 未找到拖拽元素所在的页面:', activeId);
      }
      return;
    }

    const { page: sourcePage, index: sourcePageIndex } = sourcePageInfo;

    // 检查 over 是否在同一页面的 iconIds 中（仅根级元素支持排序）
    const overIndex = sourcePage.iconIds.indexOf(overId);
    const activeIndex = sourcePage.iconIds.indexOf(activeId);

    if (overIndex !== -1 && activeIndex !== -1 && activeIndex !== overIndex) {
      // 执行页面内重排序
      const newIconIds = arrayMove(sourcePage.iconIds, activeIndex, overIndex);

      const updatedPages = pages.map((page, index) => {
        if (index === sourcePageIndex) {
          return {
            ...page,
            iconIds: newIconIds
          };
        }
        return page;
      });

      onUpdate({ pages: updatedPages });
      return;
    }
  }, [icons, folders, pages, onUpdate, readyToDropFolderId, findPageByItemId, moveIconToPage]);

  /**
   * 获取正在拖拽的元素用于 DragOverlay
   */
  const getDragOverlayContent = () => {
    if (!activeId || !activeType) return null;

    if (activeType === 'icon') {
      const icon = icons.find(i => i.id === activeId);
      if (!icon) return null;

      return (
        <Icon
          item={icon}
          onEdit={() => {}}
          onDelete={() => {}}
          onHide={() => {}}
          config={config}
          isDragging={true}
        />
      );
    }

    if (activeType === 'folder') {
      const folder = folders.find(f => f.id === activeId);
      if (!folder) return null;

      return (
        <Folder
          folder={folder}
          icons={icons}
          folders={folders}
          onRename={() => {}}
          onDelete={() => {}}
          onAddIcon={() => {}}
          onNavigate={() => {}}
          config={config}
          onDeleteAll={() => {}}
          onIconEdit={() => {}}
          onIconDelete={() => {}}
          onIconHide={() => {}}
          onUpdateIcon={() => {}}
          isDragging={true}
          isOver={false}
        />
      );
    }

    return null;
  };

  return (
    <DndContext
      id="page-container-dnd"
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      autoScroll={false}
    >
      {/* 页面切换按钮 - 左侧 */}
      {currentPageIndex > 0 && (
        <PageNavigation
          direction="left"
          onClick={handlePreviousPage}
          label={STRINGS.previousPage}
        />
      )}

      {/* 横向滚动容器 - 隐藏滚动条 */}
      <div
        ref={scrollContainerRef}
        data-scroll-container
        className="flex overflow-x-auto snap-x snap-mandatory min-h-screen"
        style={{
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
        }}
        onContextMenu={handleBlankContextMenu}
      >
        {/* 通过 CSS 隐藏 Webkit 滚动条 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            [data-scroll-container]::-webkit-scrollbar {
              display: none;
            }
          `
        }} />
        {pages.map((page) => (
          <PageDroppable
            key={page.id}
            page={page}
            icons={icons}
            folders={folders}
            config={config}
            searchedFolderIds={searchedFolderIds}
            overId={overId}
            activeId={activeId}
            readyToDropFolderId={readyToDropFolderId}
            pageSwitchDirection={pageSwitchDirection}
            onIconEdit={onIconEdit}
            onIconDelete={onIconDelete}
            onIconHide={onIconHide}
            onUpdateIcon={onUpdateIcon}
            onMoveIconToFolder={onMoveIconToFolder}
            onReorderIconsInFolder={onReorderIconsInFolder}
            onMoveToRoot={onMoveToRoot}
            onFolderRename={onFolderRename}
            onFolderDelete={onFolderDelete}
            onAddIconToFolder={onAddIconToFolder}
            onDeleteAllIconsInFolder={onDeleteAllIconsInFolder}
            onAddIcon={onAddIcon}
            onAddFolder={onAddFolder}
            onRefresh={onRefresh}
          />
        ))}
      </div>

      {/* 页面切换按钮 - 右侧 */}
      {currentPageIndex < pages.length - 1 && (
        <PageNavigation
          direction="right"
          onClick={handleNextPage}
          label={STRINGS.nextPage}
        />
      )}

      {/* 页面指示器和页面管理按钮 */}
      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 flex items-center gap-3">
        <PageIndicator
          pages={pages}
          currentPageIndex={currentPageIndex}
          onPageChange={handlePageChange}
          language={currentLanguage}
        />

        {/* 页面管理器 */}
        <PageManager
          pages={pages}
          currentPageIndex={currentPageIndex}
          config={config}
          onUpdate={onUpdate}
          onPageChange={handlePageChange}
          language={currentLanguage}
        />
      </div>

      {/* 右下角添加按钮 */}
      {(config.operationMode?.showAddButton ?? true) && onAddIcon && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={onAddIcon}
            className="w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            title={STRINGS.addApp}
            aria-label={STRINGS.addApp}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}

      {/* 拖拽覆盖层 */}
      <DragOverlay>
        {getDragOverlayContent()}
      </DragOverlay>

      {/* 空白处右键菜单 */}
      <BlankContextMenu
        isOpen={isBlankMenuOpen}
        position={blankMenuPosition}
        onClose={() => setIsBlankMenuOpen(false)}
        onAddIcon={onAddIcon}
        onAddFolder={onAddFolder}
        onRefresh={onRefresh}
        labels={{
          addApp: STRINGS.addApp,
          addFolder: STRINGS.addFolder,
          refresh: STRINGS.refresh
        }}
      />
    </DndContext>
  );
}
