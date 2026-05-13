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
  onIconEdit?: (id: string) => void;
  onIconDelete?: (id: string) => void;
  onIconHide?: (id: string) => void;
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
  onIconEdit,
  onIconDelete,
  onIconHide,
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

  return (
    <div
      ref={setNodeRef}
      className="shrink-0 w-screen snap-start p-4 md:p-6"
    >
      <div className="max-w-7xl mx-auto h-full">
        <PageContent
          page={page}
          icons={icons}
          folders={pageFolders}
          config={config}
          searchedFolderIds={searchedFolderIds}
          overId={overId}
          activeId={activeId}
          readyToDropFolderId={readyToDropFolderId}
          onIconEdit={onIconEdit}
          onIconDelete={onIconDelete}
          onIconHide={onIconHide}
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
