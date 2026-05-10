import { useCallback } from 'react';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { IconItem, FolderItem, UserConfig, Page } from '@/lib/configManager';
import { Icon } from './Icon';
import { Folder } from './Folder';
import { getStrings } from '@/lib/strings';

interface PageContentProps {
  page: Page;
  icons: IconItem[];
  folders: FolderItem[];
  config: UserConfig;
  searchedFolderIds: string[];
  overId?: string | null; // 拖拽悬停目标
  readyToDropFolderId?: string | null; // 准备好放入的文件夹ID
  onIconEdit?: (id: string) => void;
  onIconDelete?: (id: string) => void;
  onIconHide?: (id: string) => void;
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
}

/**
 * 页面内容组件 - 渲染单个页面的图标和文件夹网格
 * @param props - 组件属性
 */
export function PageContent({
  page,
  icons,
  folders,
  config,
  searchedFolderIds,
  overId,
  readyToDropFolderId, // 新增
  onIconEdit,
  onIconDelete,
  onIconHide,
  onMoveIconToFolder,
  onReorderIconsInFolder, // 新增
  onMoveToRoot, // 新增
  onFolderRename,
  onFolderDelete,
  onAddIconToFolder,
  onDeleteAllIconsInFolder,
}: PageContentProps) {

  // 根据当前配置的语言获取文案
  const currentLanguage = config.theme.language || 'zh';
  const STRINGS = getStrings(currentLanguage);

  /**
   * 获取根级图标（不在文件夹中的图标）
   */
  const getRootIcons = useCallback(() => {
    return icons.filter(icon => !icon.folderId);
  }, [icons]);

  /**
   * 获取根级文件夹（没有父文件夹的文件夹）
   */
  const getRootFolders = useCallback(() => {
    return folders.filter(folder => !folder.parentId);
  }, [folders]);

  const rootIcons = getRootIcons();
  const rootFolders = getRootFolders();

  // 根据 page.iconIds 决定渲染顺序
  const iconIds = page.iconIds || [];
  
  // 构建有序的根级元素列表（严格按 page.iconIds 过滤）
  const orderedRootItems: Array<{ type: 'icon' | 'folder'; id: string }> = [];
  
  // 只渲染 page.iconIds 中的元素
  iconIds.forEach(id => {
    const icon = icons.find(i => i.id === id && !i.folderId);
    const folder = folders.find(f => f.id === id && !f.parentId);
    if (icon) {
      orderedRootItems.push({ type: 'icon', id });
    } else if (folder) {
      orderedRootItems.push({ type: 'folder', id });
    }
  });

  // 所有根级项目的 ID 数组，用于 SortableContext
  const allRootItemIds = orderedRootItems.map(item => item.id);

  return (
    <SortableContext items={allRootItemIds} strategy={rectSortingStrategy}>
      <div 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
        style={{ gap: `${config.theme.gridSpacing}px` }}
      >
        {/* 根据 iconIds 渲染根级元素 */}
        {orderedRootItems.map(item => {
          if (item.type === 'icon') {
            const icon = icons.find(i => i.id === item.id);
            if (!icon) return null;
            return (
              <div key={icon.id} className="flex justify-center w-full" style={{ padding: `${config.theme.gridSpacing}px` }}>
                <Icon
                  item={icon}
                  onEdit={onIconEdit || (() => {})}
                  onDelete={onIconDelete || (() => {})}
                  onHide={onIconHide || (() => {})}
                  onMoveToFolder={onMoveIconToFolder} // 新增
                  folders={folders.map(f => ({ id: f.id, name: f.name }))} // 新增：传递文件夹列表
                  config={config}
                  isDragging={false}
                />
              </div>
            );
          } else {
            const folder = folders.find(f => f.id === item.id);
            if (!folder) return null;
            return (
              <div key={folder.id} className="flex justify-center w-full" style={{ padding: `${config.theme.gridSpacing}px` }}>
                <Folder
                  folder={folder}
                  icons={icons}
                  folders={folders}
                  onRename={onFolderRename || (() => {})}
                  onDelete={onFolderDelete || (() => {})}
                  onAddIcon={onAddIconToFolder || (() => {})}
                  onNavigate={() => {}}
                  forceExpandIds={searchedFolderIds}
                  config={config}
                  onDeleteAll={onDeleteAllIconsInFolder}
                  onIconEdit={onIconEdit}
                  onIconDelete={onIconDelete}
                  onIconHide={onIconHide}
                  onReorderIcons={onReorderIconsInFolder} // 新增：传递文件夹内图标排序回调
                  onMoveToRoot={onMoveToRoot} // 新增：传递移动到根级回调
                  onMoveToFolder={onMoveIconToFolder} // 新增：传递移动到文件夹回调
                  isDragging={false}
                  isOver={overId === folder.id}
                  isDropTarget={readyToDropFolderId === folder.id} // 使用 readyToDropFolderId 判断是否准备好放入
                  isReadyToDrop={readyToDropFolderId === folder.id} // 使用 readyToDropFolderId 判断是否可松开放入
                />
              </div>
            );
          }
        })}

        {/* 空状态提示：仅当两者都为空时，在网格内占满一整行 */}
        {rootIcons.length === 0 && rootFolders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📱</span>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {STRINGS.emptyTitle}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {STRINGS.emptyDescription}
            </p>
          </div>
        )}
      </div>
    </SortableContext>
  );
}
