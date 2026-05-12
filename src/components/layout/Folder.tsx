'use client';

import { useState, useCallback, useRef } from 'react';
import { useSortable, SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { FolderItem, IconItem } from '@/lib/configManager';
import { Icon } from './Icon';
import { Modal } from '../ui/modal';
import { getStrings } from '@/lib/strings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FolderProps {
  folder: FolderItem;
  icons: IconItem[];
  folders: FolderItem[];
  onDrop?: (iconId: string, folderId: string | null) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string, deleteApps?: boolean) => void;
  onAddIcon: (folderId: string) => void;
  onNavigate: (folderId: string | null) => void;
  onDropOnFolder?: (iconId: string, folderId: string) => void;
  currentPath?: string[];
  isDragging?: boolean; // 全局拖拽状态
  isOver?: boolean; // 是否有元素悬停在上方
  isDropTarget?: boolean; // 当前是否被拖拽悬停（计时中）
  isReadyToDrop?: boolean; // 是否已超过阈值，准备好放入
  config?: {
    theme: {
      iconSize: 'small' | 'medium' | 'large';
      language?: 'zh' | 'en';
    };
    operationMode?: {
      mode: 'hybrid' | 'desktop' | 'mobile' | 'custom';
      openMethod?: 'click' | 'doubleClick';
      menuTrigger?: 'rightClick' | 'longPress' | 'both';
      showAddButton?: boolean;
    };
  };
  onDeleteAll?: (folderId: string) => void;
  onIconEdit?: (id: string) => void;
  onIconDelete?: (id: string) => void;
  onIconHide?: (id: string) => void;
  onReorderIcons?: (folderId: string, orderedIconIds: string[]) => void; // 新增：重新排序图标
  onMoveToRoot?: (iconId: string) => void; // 新增：移动到根级
  onMoveToFolder?: (iconId: string, folderId: string) => void; // 新增：移动到文件夹
}

/**
 * 文件夹组件 - 渲染文件夹及其内容
 * @param props - 组件属性
 */
export function Folder({
  folder,
  icons,
  folders,
  onRename,
  onDelete,
  onAddIcon,
  isDragging: isDraggingProp,
  isOver = false,
  isDropTarget = false,
  isReadyToDrop = false,
  config,
  onIconEdit,
  onIconDelete,
  onIconHide,
  onReorderIcons,
  onMoveToRoot,
  onMoveToFolder
}: FolderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: folder.id,
  });

  // 为文件夹内的 DndContext 配置传感器
  const mouseSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  // 根据当前配置的语言获取文案
  const currentLanguage = config?.theme?.language || 'zh';
  const STRINGS = getStrings(currentLanguage);

  // 拖拽样式（优先使用全局状态）
  const shouldDisableMenu = isDraggingProp || isDragging;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: (isDraggingProp || isDragging) ? 0.5 : 1,
  };

  // 处理文件夹删除的三种情况
  const handleDeleteAction = (type: 'cancel' | 'folderOnly' | 'all') => {
    setShowDeleteConfirm(false);
    if (type === 'folderOnly') {
      // 仅删除文件夹，保留应用到根级
      onDelete(folder.id, false);
    } else if (type === 'all') {
      // 全部删除（应用和文件夹）
      onDelete(folder.id, true);
    }
  };

  /**
   * 获取当前文件夹下的图标
   */
  const getFolderIcons = useCallback(() => {
    return icons.filter(icon => icon.folderId === folder.id);
  }, [icons, folder.id]);

  /**
   * 处理文件夹内图标拖拽结束
   */
  const handleFolderIconDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const folderIcons = getFolderIcons();
    const oldIndex = folderIcons.findIndex(icon => icon.id === active.id);
    const newIndex = folderIcons.findIndex(icon => icon.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // 重新排序
    const reorderedIcons = arrayMove(folderIcons, oldIndex, newIndex);
    const orderedIconIds = reorderedIcons.map(icon => icon.id);

    // 调用回调函数更新父组件
    if (onReorderIcons) {
      onReorderIcons(folder.id, orderedIconIds);
    }
  }, [getFolderIcons, folder.id, onReorderIcons]);

  /**
   * 获取当前文件夹下的子文件夹
   */
  const getSubfolders = useCallback(() => {
    return folders.filter(subfolder => subfolder.parentId === folder.id);
  }, [folders, folder.id]);

  /**
   * 处理指针按下捕获 - 长按触发菜单（仅触摸）
   */
  const handlePointerDownCapture = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'pen') return;

    const startX = e.clientX;
    const startY = e.clientY;

    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setMenuPosition({ x: startX, y: startY });
      setIsMenuOpen(true);
    }, 500);

    const handleMove = (moveE: PointerEvent) => {
      if (Math.abs(moveE.clientX - startX) > 5 || Math.abs(moveE.clientY - startY) > 5) {
        clearTimeout(longPressTimerRef.current!);
        longPressTriggeredRef.current = false;
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
      }
    };

    const handleUp = () => {
      clearTimeout(longPressTimerRef.current!);
      longPressTriggeredRef.current = false;
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, []);

  /**
   * 处理单击事件
   */
  const handleClick = useCallback(() => {
    // 如果刚刚触发了长按，跳过点击逻辑
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    // 如果菜单已打开，先关闭菜单
    if (isMenuOpen) {
      setIsMenuOpen(false);
      return;
    }

    const operationMode = config?.operationMode || {
      mode: 'hybrid' as const,
      openMethod: 'click' as const,
      menuTrigger: 'both' as const,
      showAddButton: true
    };

    // 只有在点击打开方式为单击时，才打开文件夹
    if (operationMode.openMethod === 'click') {
      setIsModalOpen(true);
    }
  }, [config?.operationMode, isMenuOpen]);

  /**
   * 处理双击事件
   */
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const operationMode = config?.operationMode || {
      mode: 'hybrid' as const,
      openMethod: 'click' as const,
      menuTrigger: 'both' as const,
      showAddButton: true
    };

    // 只有在双击打开方式为双击时，才打开文件夹
    if (operationMode.openMethod === 'doubleClick') {
      setIsModalOpen(true);
    }
  }, [config?.operationMode]);

  const folderIcons = getFolderIcons();
  const subfolders = getSubfolders();
  const hasContent = folderIcons.length > 0 || subfolders.length > 0;

  /**
   * 获取图标大小类名
   */
  const getIconSizeClass = useCallback(() => {
    const defaultSize = 'w-12 h-12';
    if (!config?.theme?.iconSize) return defaultSize;

    switch (config.theme.iconSize) {
      case 'small':
        return 'w-10 h-10';
      case 'medium':
        return 'w-12 h-12';
      case 'large':
        return 'w-16 h-16';
      default:
        return defaultSize;
    }
  }, [config]);

  // 计算文件夹的视觉样式
  let folderClassName = 'group relative flex flex-col items-center p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-accent/50 hover:shadow-md';

  if (isReadyToDrop) {
    // 准备放入状态（悬停超过600ms）：深蓝色边框 + 105%缩放 + 蓝色阴影
    folderClassName += ' scale-105 ring-4 ring-blue-600 bg-blue-100 dark:bg-blue-900/50 shadow-lg shadow-blue-500/50';
  } else if (isDropTarget) {
    // 悬停计时中（未满600ms）：浅蓝色边框 + 轻微缩放
    folderClassName += ' scale-105 ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/30';
  } else if (isOver) {
    // 简单悬停状态：轻微高亮
    folderClassName += ' ring-2 ring-blue-300 bg-blue-50/50 dark:bg-blue-900/20';
  }

  return (
    <div
      className={folderClassName}
      data-folder-item
      data-id={folder.id}
    >
      {/* 文件夹头部 - 可拖拽区域 */}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex flex-col items-center"
        onPointerDownCapture={handlePointerDownCapture}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!shouldDisableMenu) {
            setMenuPosition({ x: e.clientX, y: e.clientY });
            setIsMenuOpen(true);
          }
        }}
        draggable="false"
      >
        {/* 文件夹图标 */}
        <div className={`${getIconSizeClass()} mb-2 rounded-lg overflow-hidden bg-transparent flex items-center justify-center`}>
          <svg
            className="w-2/3 h-2/3 transition-transform duration-200 text-yellow-500 dark:text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </div>

        {/* 文件夹名称 */}
        <div className="w-full text-center">
          <span className="text-xs text-center text-muted-foreground font-medium truncate max-w-full px-1">
            {folder.name}
          </span>
        </div>
      </div>

      {/* 右键菜单 - 通过 onContextMenu 触发 */}
      <DropdownMenu
        open={shouldDisableMenu ? false : isMenuOpen}
        onOpenChange={setIsMenuOpen}
      >
        <DropdownMenuTrigger asChild id={`folder-menu-${folder.id}`}>
          <span className="hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          style={{
            position: 'fixed',
            left: Math.min(menuPosition.x, typeof window !== 'undefined' ? window.innerWidth - 180 : menuPosition.x),
            top: Math.min(menuPosition.y, typeof window !== 'undefined' ? window.innerHeight - 150 : menuPosition.y),
          }}
        >
          <DropdownMenuItem onClick={() => {
            onAddIcon(folder.id);
            setIsMenuOpen(false);
          }}>
            {STRINGS.addApp}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            // 触发重命名逻辑
            const newName = prompt(STRINGS.renameFolder, folder.name);
            if (newName && newName.trim()) {
              onRename(folder.id, newName.trim());
            }
            setIsMenuOpen(false);
          }}>
            {STRINGS.modify}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setShowDeleteConfirm(true);
            setIsMenuOpen(false);
          }} className="text-red-600 dark:text-red-400">
            {STRINGS.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              {STRINGS.confirmDelete}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {STRINGS.confirmDeleteFolder.replace('{name}', folder.name)}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {STRINGS.cancel}
              </button>
              <button
                onClick={() => handleDeleteAction('folderOnly')}
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {STRINGS.onlyDeleteFolder}
              </button>
              <button
                onClick={() => handleDeleteAction('all')}
                className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors"
              >
                {STRINGS.deleteAll}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文件夹内容模态框 */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={folder.name}
        description={`包含 ${folderIcons.length} 个应用`}
        size="xl"
      >
        <div
          className="space-y-4 min-h-50" // 添加最小高度确保始终有可点击区域
          onContextMenu={(e) => {
            // 阻止浏览器默认菜单
            e.preventDefault();
            // 阻止事件冒泡到父容器，避免触发桌面空白处菜单
            e.stopPropagation();
          }}
        >
          {/* 渲染子文件夹 */}
          {subfolders.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{STRINGS.subfolders}</h4>
              <div className="grid grid-cols-3 gap-3">
                {subfolders.map(subfolder => (
                  <div
                    key={subfolder.id}
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => {
                      // 可以导航到子文件夹
                    }}
                  >
                    <svg
                      className="w-8 h-8 text-yellow-500 dark:text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <span className="text-xs text-muted-foreground mt-1">{subfolder.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 渲染图标网格 */}
          {folderIcons.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">{STRINGS.apps}</h4>
              <DndContext
                id={`folder-dnd-${folder.id}`}
                sensors={sensors}
                onDragEnd={handleFolderIconDragEnd}
              >
                <SortableContext items={folderIcons.map(icon => icon.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-4 gap-3">
                    {folderIcons.map(icon => (
                      <Icon
                        key={icon.id}
                        item={icon}
                        onEdit={(id) => {
                          if (onIconEdit) onIconEdit(id);
                        }}
                        onDelete={(id) => {
                          // 删除文件夹内的图标
                          if (onIconDelete) {
                            onIconDelete(id);
                          }
                        }}
                        onHide={(id) => {
                          // 隐藏/显示文件夹内的图标
                          if (onIconHide) {
                            onIconHide(id);
                          }
                        }}
                        onMoveToFolder={(iconId, folderId) => {
                          // 移动到另一个文件夹
                          if (onMoveToFolder) {
                            onMoveToFolder(iconId, folderId);
                          }
                        }}
                        onMoveToRoot={(iconId) => {
                          // 移动到根级
                          if (onMoveToRoot) {
                            onMoveToRoot(iconId);
                          }
                        }}
                        folders={folders.filter(f => f.id !== folder.id).map(f => ({ id: f.id, name: f.name }))}
                        config={config}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* 空文件夹提示 */}
          {!hasContent && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">{STRINGS.emptyFolder}</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
