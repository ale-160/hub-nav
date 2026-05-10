'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  rectIntersection,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { IconItem, FolderItem, UserConfig } from '../../lib/configManager';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from './Icon';
import { Folder } from './Folder';
import { getStrings } from '../../lib/strings';

interface AppGridProps {
  icons: IconItem[];
  folders: FolderItem[];
  onUpdate: (config: Partial<UserConfig>) => void;
  config: UserConfig;
  searchedFolderIds?: string[]; // 搜索时需要展开的文件夹ID列表
  allIcons?: IconItem[]; // 完整的图标列表，用于文件夹内部显示
  onIconEdit?: (id: string) => void;
  onIconDelete?: (id: string) => void;
  onIconHide?: (id: string) => void;
  onFolderRename?: (id: string, name: string) => void;
  onFolderDelete?: (id: string, deleteApps?: boolean) => void;
  onAddIconToFolder?: (folderId: string) => void;
  onFolderNavigate?: (folderId: string | null) => void;
  onDeleteAllIconsInFolder?: (folderId: string) => void;
  onAddIcon?: () => void;
  onAddFolder?: () => void;
  onRefresh?: () => void;
}

/**
 * 应用网格布局组件 - 主网格布局，管理图标和文件夹的显示
 * @param props - 组件属性
 */
export function AppGrid({ 
  icons, 
  folders, 
  onUpdate, 
  config, 
  searchedFolderIds = [], 
  allIcons = [],
  onIconEdit,
  onIconDelete,
  onIconHide,
  onFolderRename,
  onFolderDelete,
  onAddIconToFolder,
  onFolderNavigate,
  onDeleteAllIconsInFolder,
  onAddIcon,
  onAddFolder,
  onRefresh
}: AppGridProps) {
  const { theme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [hoverFolderId, setHoverFolderId] = useState<string | null>(null);
  const [isReadyToDrop, setIsReadyToDrop] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isBlankMenuOpen, setIsBlankMenuOpen] = useState(false);
  const [blankMenuPosition, setBlankMenuPosition] = useState({ x: 0, y: 0 });
  const longPressTriggeredRef = useRef(false);

  /**
   * 处理桌面空白处指针按下捕获 - 长按触发菜单
   */
  const handleDesktopPointerDownCapture = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'pen') return;

    // 问题一：如果点击的是图标或文件夹，不触发桌面长按菜单
    const target = e.target as HTMLElement;
    if (target.closest('[data-icon-item]') || target.closest('[data-folder-item]')) {
      return;
    }

    const startX = e.clientX;
    const startY = e.clientY;

    const timer = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setBlankMenuPosition({ x: startX, y: startY });
      setIsBlankMenuOpen(true);
    }, 500);

    const handleMove = (moveE: PointerEvent) => {
      if (Math.abs(moveE.clientX - startX) > 5 || Math.abs(moveE.clientY - startY) > 5) {
        clearTimeout(timer);
        longPressTriggeredRef.current = false;
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
      }
    };

    const handleUp = () => {
      clearTimeout(timer);
      longPressTriggeredRef.current = false;
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, []);

  // 配置传感器：避免点击与拖拽冲突
  const mouseSensor = useSensor(MouseSensor, {
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
  const sensors = useSensors(mouseSensor, touchSensor);

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

  /**
   * 处理拖拽开始
   */
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true);
    setActiveId(event.active.id as string);
  }, []);

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as string | null;
    setOverId(overId);

    // 清除之前的计时器
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    // 如果悬停在文件夹上且拖拽的是图标
    if (overId && activeId) {
      const activeIsIcon = icons.some(icon => icon.id === activeId);
      const overIsFolder = folders.some(folder => folder.id === overId);

      if (activeIsIcon && overIsFolder) {
        // 设置悬停的文件夹ID，但还未准备好放入
        setHoverFolderId(overId);
        setIsReadyToDrop(false);

        // 启动计时器，600ms后标记为准备放入
        hoverTimerRef.current = setTimeout(() => {
          setIsReadyToDrop(true);
        }, 600);
      } else {
        // 不是图标拖到文件夹，清除状态
        setHoverFolderId(null);
        setIsReadyToDrop(false);
      }
    } else {
      // 没有悬停在任何元素上，清除状态
      setHoverFolderId(null);
      setIsReadyToDrop(false);
    }
  }, [activeId, icons, folders]);

  /**
   * 处理拖拽结束 - 使用 @dnd-kit
   */
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    // 清除计时器
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    setIsDragging(false);
    setActiveId(null);
    setOverId(null);
    setHoverFolderId(null);
    setIsReadyToDrop(false);
    
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 如果拖拽到自身，不做任何操作
    if (activeId === overId) return;

    // 查找被拖拽的图标
    const draggedIcon = icons.find(icon => icon.id === activeId);
    
    // 检查拖拽元素和目标元素的类型
    const activeIsIcon = !!draggedIcon;
    const overIsFolder = folders.some(folder => folder.id === overId);

    // 只有当悬停超过600ms且准备好放入时，才执行放入逻辑
    if (activeIsIcon && overIsFolder && isReadyToDrop && hoverFolderId === overId) {
      const updatedIcons = icons.map(icon => 
        icon.id === activeId ? { ...icon, folderId: overId } : icon
      );
      // 从 rootOrder 中移除该图标ID
      const updatedRootOrder = config.rootOrder.filter(id => id !== activeId);
      onUpdate({ icons: updatedIcons, rootOrder: updatedRootOrder });
      return;
    }

    // 处理从文件夹拖出到根级的情况
    if (activeIsIcon && draggedIcon?.folderId) {
      // 检查是否拖到了根级区域（over 是根级元素或空白处）
      const rootOrder = config.rootOrder || [];
      const isOverRootItem = rootOrder.includes(overId);
      
      if (isOverRootItem || !overIsFolder) {
        // 将图标移出文件夹
        const updatedIcons = icons.map(icon => 
          icon.id === activeId ? { ...icon, folderId: undefined } : icon
        );
        
        // 确保图标在 rootOrder 中
        let newRootOrder = [...rootOrder];
        if (!newRootOrder.includes(activeId)) {
          // 如果不在 rootOrder 中，根据 overId 决定插入位置
          if (isOverRootItem) {
            // 拖到根级元素上，插入到该元素的位置
            const overIndex = newRootOrder.indexOf(overId);
            if (overIndex !== -1) {
              newRootOrder.splice(overIndex, 0, activeId);
            } else {
              // 如果 overId 不在 rootOrder 中，追加到末尾
              newRootOrder.push(activeId);
            }
          } else {
            // 拖到空白处，追加到末尾
            newRootOrder.push(activeId);
          }
        }
        
        onUpdate({ icons: updatedIcons, rootOrder: newRootOrder });
        return;
      }
    }

    // 否则走排序逻辑（使用 rootOrder）
    const rootOrder = config.rootOrder || [];
    
    if (rootOrder.includes(activeId) && rootOrder.includes(overId)) {
      // 重新排序：根据 over 的位置插入
      const oldIndex = rootOrder.indexOf(activeId);
      const newIndex = rootOrder.indexOf(overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newRootOrder = [...rootOrder];
        const [removed] = newRootOrder.splice(oldIndex, 1);
        newRootOrder.splice(newIndex, 0, removed);

        onUpdate({ rootOrder: newRootOrder });
      }
    }
  }, [icons, folders, config.rootOrder, onUpdate, isReadyToDrop, hoverFolderId]);

  /**
   * 处理图标编辑
   */
  const handleIconEdit = useCallback((iconId: string) => {
    if (onIconEdit) {
      onIconEdit(iconId);
    }
  }, [onIconEdit]);

  /**
   * 处理图标删除
   */
  const handleIconDelete = useCallback((iconId: string) => {
    if (onIconDelete) {
      onIconDelete(iconId);
    } else {
      const updatedIcons = icons.filter(icon => icon.id !== iconId);
      onUpdate({ icons: updatedIcons });
    }
  }, [icons, onUpdate, onIconDelete]);

  /**
   * 处理图标隐藏/显示
   */
  const handleIconHide = useCallback((iconId: string) => {
    if (onIconHide) {
      onIconHide(iconId);
    } else {
      const updatedIcons = icons.map(icon => 
        icon.id === iconId ? { ...icon, isHidden: !icon.isHidden } : icon
      );
      onUpdate({ icons: updatedIcons });
    }
  }, [icons, onUpdate, onIconHide]);

  /**
   * 处理文件夹重命名
   */
  const handleFolderRename = useCallback((folderId: string, name: string) => {
    if (onFolderRename) {
      onFolderRename(folderId, name);
    } else {
      const updatedFolders = folders.map(folder => 
        folder.id === folderId ? { ...folder, name } : folder
      );
      onUpdate({ folders: updatedFolders });
    }
  }, [folders, onUpdate, onFolderRename]);

  /**
   * 处理文件夹导航
   */
  const handleFolderNavigate = useCallback((folderId: string | null) => {
    if (onFolderNavigate) {
      onFolderNavigate(folderId);
    }
  }, [onFolderNavigate]);

  /**
   * 处理文件夹删除
   */
  const handleFolderDelete = useCallback((folderId: string, deleteApps: boolean = false) => {
    if (onFolderDelete) {
      onFolderDelete(folderId, deleteApps);
    } else {
      const updatedIcons = deleteApps
        ? icons.filter(icon => icon.folderId !== folderId)
        : icons.map(icon => 
            icon.folderId === folderId ? { ...icon, folderId: undefined } : icon
          );
      const updatedFolders = folders.filter(folder => folder.id !== folderId);
      onUpdate({ icons: updatedIcons, folders: updatedFolders });
    }
  }, [icons, folders, onUpdate, onFolderDelete]);

  /**
   * 处理添加应用到文件夹
   */
  const handleAddIconToFolder = useCallback((folderId: string) => {
    if (onAddIconToFolder) {
      onAddIconToFolder(folderId);
    }
  }, [onAddIconToFolder]);



  /**
   * 获取图标大小类名
   */
  const getIconSizeClass = useCallback(() => {
    switch (theme.iconSize) {
      case 'small':
        return 'w-10 h-10';
      case 'medium':
        return 'w-12 h-12';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-12 h-12';
    }
  }, [theme.iconSize]);



  const rootIcons = getRootIcons();
  const rootFolders = getRootFolders();

  // 根据 rootOrder 决定渲染顺序
  const rootOrder = config.rootOrder || [];
  
  // 构建有序的根级元素列表
  const orderedRootItems: Array<{ type: 'icon' | 'folder'; id: string }> = [];
  
  // 先按 rootOrder 的顺序添加
  rootOrder.forEach(id => {
    const icon = icons.find(i => i.id === id && !i.folderId);
    const folder = folders.find(f => f.id === id && !f.parentId);
    if (icon) {
      orderedRootItems.push({ type: 'icon', id });
    } else if (folder) {
      orderedRootItems.push({ type: 'folder', id });
    }
  });
  
  // 将不在 rootOrder 中的新元素追加到末尾
  rootIcons.forEach(icon => {
    if (!rootOrder.includes(icon.id)) {
      orderedRootItems.push({ type: 'icon', id: icon.id });
    }
  });
  rootFolders.forEach(folder => {
    if (!rootOrder.includes(folder.id)) {
      orderedRootItems.push({ type: 'folder', id: folder.id });
    }
  });

  // 所有根级项目的 ID 数组，用于 SortableContext
  const allRootItemIds = orderedRootItems.map(item => item.id);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={rectIntersection} 
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="min-h-screen p-4 md:p-6"
        onPointerDownCapture={handleDesktopPointerDownCapture}
        onContextMenu={(e) => {
          const target = e.target as HTMLElement;
          // 如果点击的是图标或文件夹，不显示空白菜单
          if (target.closest('[data-icon-item]') || target.closest('[data-folder-item]')) {
            return;
          }
          e.preventDefault();
          setBlankMenuPosition({ x: e.clientX, y: e.clientY });
          setIsBlankMenuOpen(true);
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* 统一的网格容器，响应图标间距设置 */}
          <SortableContext items={allRootItemIds} strategy={rectSortingStrategy}>
            <div 
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
              style={{ gap: `${config.theme.gridSpacing}px` }}
            >
          
          {/* 根据 rootOrder 渲染根级元素 */}
          {orderedRootItems.map(item => {
            if (item.type === 'icon') {
              const icon = icons.find(i => i.id === item.id);
              if (!icon) return null;
              return (
                <div key={icon.id} className="flex justify-center w-full" style={{ padding: `${config.theme.gridSpacing}px` }}>
                  <Icon
                    item={icon}
                    onEdit={handleIconEdit}
                    onDelete={handleIconDelete}
                    onHide={handleIconHide}
                    config={config}
                    isDragging={isDragging}
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
                    icons={allIcons.length > 0 ? allIcons : icons}
                    folders={folders}
                    onRename={handleFolderRename}
                    onDelete={handleFolderDelete}
                    onAddIcon={handleAddIconToFolder}
                    onNavigate={handleFolderNavigate}
                    forceExpandIds={searchedFolderIds}
                    config={config}
                    onDeleteAll={onDeleteAllIconsInFolder}
                    onIconEdit={onIconEdit}
                    onIconDelete={handleIconDelete}
                    onIconHide={handleIconHide}
                    isDragging={isDragging}
                    isOver={overId === folder.id}
                    isDropTarget={hoverFolderId === folder.id}
                    isReadyToDrop={isReadyToDrop && hoverFolderId === folder.id}
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
        </div>
      </div>

      {/* 空白处右键菜单 */}
      <DropdownMenu 
        open={isBlankMenuOpen} 
        onOpenChange={setIsBlankMenuOpen}
      >
        <DropdownMenuTrigger asChild>
          <span className="hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start"
          style={{
            position: 'fixed',
            left: Math.min(blankMenuPosition.x, typeof window !== 'undefined' ? window.innerWidth - 180 : blankMenuPosition.x),
            top: Math.min(blankMenuPosition.y, typeof window !== 'undefined' ? window.innerHeight - 150 : blankMenuPosition.y),
          }}
        >
          <DropdownMenuItem onClick={() => {
            if (onAddIcon) onAddIcon();
            setIsBlankMenuOpen(false);
          }}>
            {STRINGS.addApp}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            if (onAddFolder) onAddFolder();
            setIsBlankMenuOpen(false);
          }}>
            {STRINGS.addFolder}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            if (onRefresh) onRefresh();
            setIsBlankMenuOpen(false);
          }}>
            {STRINGS.refresh}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 拖拽覆盖层 */}
      <DragOverlay>
        {activeId ? (
          <div className="opacity-80 scale-110 transition-transform">
            {icons.find(icon => icon.id === activeId) && (
              <Icon
                item={icons.find(icon => icon.id === activeId)!}
                onEdit={() => {}}
                onDelete={() => {}}
                onHide={() => {}}
                config={config}
                isDragging={true}
              />
            )}
            {folders.find(folder => folder.id === activeId) && (
              <Folder
                folder={folders.find(folder => folder.id === activeId)!}
                icons={allIcons.length > 0 ? allIcons : icons}
                folders={folders}
                onRename={() => {}}
                onDelete={() => {}}
                onAddIcon={() => {}}
                onNavigate={() => {}}
                forceExpandIds={[]}
                config={config}
                onDeleteAll={() => {}}
                onIconEdit={() => {}}
                onIconDelete={() => {}}
                onIconHide={() => {}}
                isDragging={true}
                isOver={false}
              />
            )}
          </div>
        ) : null}
      </DragOverlay>

      {/* 右下角添加按钮 */}
      {(config.operationMode?.showAddButton ?? true) && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              // 显示添加应用的模态框
              if (onAddIcon) {
                onAddIcon();
              }
            }}
            className="w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            title={STRINGS.addApp}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </DndContext>
  );
}
