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
  const orderedRootItems = (page.iconIds || []).map(id => {
    const icon = icons.find(i => i.id === id && !i.folderId);
    if (icon) return { type: 'icon' as const, id };
    const folder = folders.find(f => f.id === id);
    if (folder) return { type: 'folder' as const, id };
    return null;
  }).filter((item): item is { type: 'icon' | 'folder'; id: string } => item !== null);

  const allRootItemIds = orderedRootItems.map(item => item.id);

  const colGap = config.theme.gridColumnSpacing ?? 16;
  const rowGap = config.theme.gridSpacing ?? 16;

  // 图标最小列宽：确保图标在列内不会被压缩，
  // 让 columnGap 真正影响“图标之间的距离”而不是压缩列。
  const iconSizeKey = config.theme.iconSize || 'medium';
  const minColWidth =
    iconSizeKey === 'large' ? 120 :
    iconSizeKey === 'small' ? 88 : 104;

  return (
    <SortableContext items={allRootItemIds} strategy={rectSortingStrategy}>
      {/* 外层：宽度占满内容区，内部 grid 占满外层；
          每列使用 minmax(minColWidth, 1fr)，让列在大容器中均匀扩张，
          同时在小容器中保持最小宽度；justifyItems:center 使图标在列内居中。
          columnGap/rowGap 作为用户可调整的间距（影响列与列的实际距离）。*/}
      <div className="w-full flex justify-center px-2">
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(2, minmax(${minColWidth}px, 1fr))`,
            columnGap: `${colGap}px`,
            rowGap: `${rowGap}px`,
            justifyItems: 'center',
            alignItems: 'start',
          }}
          data-grid-cols="2-4-5"
        >
          <style>{`
            @media (min-width: 768px) {
              div[data-grid-cols="2-4-5"] {
                grid-template-columns: repeat(4, minmax(${minColWidth}px, 1fr)) !important;
              }
            }
            @media (min-width: 1024px) {
              div[data-grid-cols="2-4-5"] {
                grid-template-columns: repeat(5, minmax(${minColWidth}px, 1fr)) !important;
              }
            }
          `}</style>
          {orderedRootItems.map(item => {
            if (item.type === 'icon') {
              const icon = icons.find(i => i.id === item.id);
              if (!icon) return null;
              return (
                <Icon
                  key={icon.id}
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
              );
            } else {
              const folder = folders.find(f => f.id === item.id);
              if (!folder) return null;
              return (
                <Folder
                  key={folder.id}
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
              );
            }
          })}
        </div>
      </div>
    </SortableContext>
  );
}
