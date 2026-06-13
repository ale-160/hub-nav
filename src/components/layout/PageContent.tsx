import React from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { IconItem, FolderItem, UserConfig, Page } from '@/lib/configManager';
import { Icon } from './Icon';
import { Folder } from './Folder';

interface PageContentProps {
  page: Page;
  icons: IconItem[];
  folders: FolderItem[];
  config: UserConfig;
  searchedFolderIds?: string[];
  overId?: string | null;
  activeId?: string | null;
  readyToDropFolderId?: string | null;
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

export function PageContent({
  page,
  icons,
  folders,
  config,
  searchedFolderIds = [],
  overId,
  activeId,
  readyToDropFolderId,
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
  onAddIcon: _onAddIcon,
  onAddFolder: _onAddFolder,
  onRefresh: _onRefresh,
}: PageContentProps) {
  // 按 page.iconIds 顺序排列根级元素（图标和文件夹）
  const orderedRootItems = (page.iconIds || []).map(id => {
    const icon = icons.find(i => i.id === id && !i.folderId);
    if (icon) return { type: 'icon' as const, id };
    const folder = folders.find(f => f.id === id);
    if (folder) return { type: 'folder' as const, id };
    return null;
  }).filter((item): item is { type: 'icon' | 'folder'; id: string } => item !== null);

  const allRootItemIds = orderedRootItems.map(item => item.id);

  const colPadding = config.theme.gridColumnSpacing / 2;
  const rowPadding = config.theme.gridSpacing / 2;
  const itemSpacingStyle = {
    paddingLeft: `${colPadding}px`,
    paddingRight: `${colPadding}px`,
    paddingTop: `${rowPadding}px`,
    paddingBottom: `${rowPadding}px`,
  };

  return (
    <SortableContext items={allRootItemIds} strategy={rectSortingStrategy}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {orderedRootItems.map(item => {
          if (item.type === 'icon') {
            const icon = icons.find(i => i.id === item.id);
            if (!icon) return null;
            return (
              <div key={icon.id} className="flex justify-center w-full" style={itemSpacingStyle}>
                <Icon
                  item={icon}
                  onEdit={onIconEdit || (() => {})}
                  onDelete={onIconDelete || (() => {})}
                  onHide={onIconHide || (() => {})}
                  onUpdateIcon={onUpdateIcon}
                  onMoveToFolder={onMoveIconToFolder}
                  folders={folders.map(f => ({ id: f.id, name: f.name }))}
                  config={config}
                  isDragging={icon.id === activeId}
                />
              </div>
            );
          } else {
            const folder = folders.find(f => f.id === item.id);
            if (!folder) return null;
            return (
              <div key={folder.id} className="flex justify-center w-full" style={itemSpacingStyle}>
                <Folder
                  folder={folder}
                  icons={icons}
                  folders={folders}
                  onRename={onFolderRename || (() => {})}
                  onDelete={onFolderDelete || (() => {})}
                  onAddIcon={onAddIconToFolder || (() => {})}
                  onNavigate={() => {}}
                  config={config}
                  onDeleteAll={onDeleteAllIconsInFolder}
                  onIconEdit={onIconEdit}
                  onIconDelete={onIconDelete}
                  onIconHide={onIconHide}
                  onReorderIcons={onReorderIconsInFolder}
                  onMoveToRoot={onMoveToRoot}
                  onMoveToFolder={onMoveIconToFolder}
                  onUpdateIcon={onUpdateIcon}
                  isDragging={folder.id === activeId}
                  isOver={overId === folder.id}
                  isDropTarget={readyToDropFolderId === folder.id}
                  isReadyToDrop={readyToDropFolderId === folder.id}
                  searchedFolderIds={searchedFolderIds}
                />
              </div>
            );
          }
        })}
      </div>
    </SortableContext>
  );
}
