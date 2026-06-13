import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { IconItem, FolderItem, UserConfig, Page } from '@/lib/configManager';
import { PageContent } from '../PageContent';

interface PageDroppableProps {
  page: Page;
  icons: IconItem[];
  folders: FolderItem[];
  config: UserConfig;
  searchedFolderIds: string[];
  overId?: string | null;
  activeId?: string | null;
  readyToDropFolderId?: string | null;
  pageSwitchDirection?: 'left' | 'right' | null; // ✅ 页面切换方向（用于边缘高亮）
  onIconEdit?: (id: string) => void;
  onIconDelete?: (id: string) => void;
  onIconHide?: (id: string) => void;
  onUpdateIcon?: (iconId: string, updates: Partial<IconItem>) => void;
  onMoveIconToFolder?: (iconId: string, folderId: string) => void;
  onReorderIconsInFolder?: (folderId: string, orderedIconIds: string[]) => void;
  onMoveToRoot?: (iconId: string) => void;
  onFolderRename?: (id: string, name: string) => void;
  onFolderDelete?: (id: string, deleteApps?: boolean) => void;
  onAddIconToFolder?: (folderId: string) => void;
  onDeleteAllIconsInFolder?: (folderId: string) => void;
  onAddIcon?: () => void;
  onAddFolder?: () => void;
  onRefresh?: () => void;
}

/**
 * 页面 Droppable 组件 - 每个页面作为一个独立的 droppable 区域
 *
 * ⚠️ 重要：此组件使用 useDroppable Hook，必须在 <DndContext> 内部调用
 * 因此它只能在 PageContainer 的 DndContext 内渲染，不能独立使用
 */
export function PageDroppable({
  page,
  icons,
  folders,
  config,
  searchedFolderIds,
  overId,
  activeId,
  readyToDropFolderId,
  pageSwitchDirection,
  onIconEdit,
  onIconDelete,
  onIconHide,
  onUpdateIcon,
  onMoveIconToFolder,
  onReorderIconsInFolder,
  onMoveToRoot,
  onFolderRename,
  onFolderDelete,
  onAddIconToFolder,
  onDeleteAllIconsInFolder,
  onAddIcon,
  onAddFolder,
  onRefresh,
}: PageDroppableProps) {
  const { setNodeRef } = useDroppable({
    id: page.id,
  });

  // 根据 page.iconIds 过滤出属于当前页面的根级文件夹
  const pageIconIds = page.iconIds || [];
  const pageFolders = folders.filter(folder => pageIconIds.includes(folder.id));

  // ✅ 性能优化：过滤出当前页面需要的图标
  // 包括：1) 根级图标（在 page.iconIds 中且 folderId 为空）
  //      2) 文件夹内的图标（folderId 指向当前页面的文件夹）
  const pageIcons = icons.filter(icon => {
    // 根级图标：在 page.iconIds 中
    if (pageIconIds.includes(icon.id) && !icon.folderId) {
      return true;
    }
    // 文件夹内图标：所属文件夹在当前页面中
    return !!(icon.folderId && pageIconIds.includes(icon.folderId));
  });

  return (
    <div
      ref={setNodeRef}
      className="shrink-0 w-screen snap-start p-4 md:p-6 relative"
    >
      {/* ✅ 边缘高亮效果 */}
      {pageSwitchDirection === 'left' && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-blue-500/50 animate-pulse pointer-events-none" />
      )}
      {pageSwitchDirection === 'right' && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-blue-500/50 animate-pulse pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto h-full">
        <PageContent
          page={page}
          icons={pageIcons}
          folders={pageFolders}
          config={config}
          searchedFolderIds={searchedFolderIds}
          overId={overId}
          activeId={activeId}
          readyToDropFolderId={readyToDropFolderId}
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
      </div>
    </div>
  );
}
