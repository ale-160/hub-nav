'use client';

import React, {useState, useCallback, useMemo} from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconItem, ConfigManager } from '@/lib/configManager';
import { getBuiltinIconById, getDefaultIcon, type BuiltinIcon } from '@/data/icons';
import { extractDomain, generateFaviconCandidates, getFallbackIcon } from '@/utils/url';
import { renderSolidIcon, SOLID_COLORS } from '@/utils/icon';
import { getStrings } from '@/data/i18n';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useFolderSelector } from '@/hooks/useFolderSelector';
import { getIconSizeClass } from '@/utils/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Favicon 组件 - 专门用于展示 favicon 图片
 */
interface FaviconProps {
  src: string;
  alt: string;
  className?: string;
  appName?: string;
  isCustomIcon?: boolean; // 是否是自定义图标
}

function Favicon({ src, alt, className = '', appName = '', isCustomIcon = false }: FaviconProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  // 为自定义图标添加时间戳以避免浏览器缓存
  const [customIconTimestamp, setCustomIconTimestamp] = useState(() => Date.now());
  // 使用 ref 跟踪上一次的 src，避免在 effect 中同步调用 setState
  const prevSrcRef = React.useRef<string>('');

  // 直接从缓存读取（仅对非自定义图标使用缓存）
  const cachedSrc = useMemo(() => {
    if (!src || isCustomIcon) return null; // 自定义图标不使用缓存
    try {
      const domain = extractDomain(src);
      return ConfigManager.getCachedIcon(domain);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('检查缓存失败:', error);
      }
      return null;
    }
  }, [src, isCustomIcon]);

  // 当自定义图标 URL 变化时，更新时间戳以强制刷新
  React.useEffect(() => {
    if (isCustomIcon && src && src !== prevSrcRef.current) {
      prevSrcRef.current = src;
      setCustomIconTimestamp(Date.now());
    }
  }, [src, isCustomIcon]);

  // 处理图片加载成功 - 仅对非自定义图标写入缓存
  const handleImageLoad = useCallback(() => {
    if (src && !cachedSrc && !isCustomIcon) {
      try {
        const domain = extractDomain(src);
        ConfigManager.setIconCache(domain, src);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('写入缓存失败:', error);
        }
      }
    }
  }, [src, cachedSrc, isCustomIcon]);

  // 处理图片加载失败
  const handleImageError = useCallback(() => {
    setImageLoadFailed(true);
  }, []);

  // 如果图片加载失败，显示回退图标
  if (imageLoadFailed || !src) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <span className="text-2xl">{getFallbackIcon(appName)}</span>
      </div>
    );
  }

  // 显示图片（自定义图标直接使用src，不使用缓存）
  // 同时添加key确保图片更新时重新渲染
  // 对于自定义图标，添加时间戳参数以绕过浏览器缓存
  const displaySrc = isCustomIcon ? `${src}?t=${customIconTimestamp}` : (cachedSrc || src);
  
  return (
    <img
      key={displaySrc}
      src={displaySrc}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
}

interface IconProps {
  item: IconItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onHide: (id: string) => void;
  onMoveToFolder?: (iconId: string, folderId: string) => void; // 新增：移动到文件夹
  onMoveToRoot?: (iconId: string) => void; // 新增：移动到根级
  folders?: Array<{ id: string; name: string }>; // 新增：文件夹列表
  onDragStart?: (e: React.DragEvent, iconId: string) => void;
  isDragging?: boolean; // 全局拖拽状态
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
}

/**
 * 图标内容类型定义
 */
type IconContentType = 
  | { type: 'solid'; content: string; builtinIcon: BuiltinIcon }
  | { type: 'emoji'; content: string; builtinIcon?: BuiltinIcon }
  | { type: 'image'; content: string; isCustomIcon?: boolean };

/**
 * 图标组件 - 渲染单个图标项
 * @param props - 组件属性
 */
export function Icon({ item, onEdit, onDelete, onMoveToFolder, onMoveToRoot, folders, config }: IconProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(false);

  // 根据当前配置的语言获取文案
  const currentLanguage = config?.theme?.language || 'zh';
  const STRINGS = getStrings(currentLanguage);

  // 使用统一菜单 Hook
  const {
    isOpen: isMenuOpen,
    position: menuPosition,
    close: closeMenu,
    handleContextMenu,
    longPressHandlers,
    resetLongPressState
  } = useContextMenu({
    disabled: isDragging,
    onOpen: () => {},
    onClose: () => {}
  });

  // 使用确认对话框 Hook
  const confirmDialog = useConfirmDialog({ language: currentLanguage });
  const renderIconDeleteConfirm = confirmDialog.renderIconDeleteConfirm;

  // 使用文件夹选择器 Hook
  const folderSelector = useFolderSelector({ language: currentLanguage });
  const renderFolderSelector = folderSelector.renderFolderSelector;

  // 拖拽样式
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  /**
   * 获取图标内容
   */
  const getIconContent = useCallback((): IconContentType => {
    const iconType = item.iconType || 'favicon';

    switch (iconType) {
      case 'builtin':
        // 处理纯色图标 (solid-color-X 格式)
        if (item.builtinIcon && item.builtinIcon.startsWith('solid-color-')) {
          const colorIndex = parseInt(item.builtinIcon.replace('solid-color-', ''));
          // ✅ 使用共享常量，动态添加调色盘颜色
          const solidColors = [...SOLID_COLORS, item.customColor || '#ffffff'];

          const color = solidColors[colorIndex] || '#ffffff';
          return {
            type: 'solid' as const,
            content: '',
            builtinIcon: {
              id: item.builtinIcon,
              name: `颜色${colorIndex + 1}`,
              emoji: '',
              type: 'solid' as const,
              color: color
            }
          };
        }

        // 处理普通内置图标
        const builtinIcon = item.builtinIcon ? getBuiltinIconById(item.builtinIcon) : getDefaultIcon();
        
        if (!builtinIcon) {
          // 如果找不到内置图标，使用默认图标
          return {
            type: 'emoji' as const,
            content: '',
            builtinIcon: getDefaultIcon()
          };
        }
        
        return {
          type: builtinIcon.type === 'solid' ? 'solid' as const : 'emoji' as const,
          content: builtinIcon.emoji || '',
          builtinIcon: builtinIcon
        };

      case 'custom':
        return {
          type: 'image' as const,
          content: item.customIconUrl || '',
          isCustomIcon: true // 标记为自定义图标
        };

      case 'favicon':
      default:
        // 兼容旧数据，如果没有 iconType 则使用 favicon
        if (item.iconUrl) {
          return {
            type: 'image' as const,
            content: item.iconUrl
          };
        }

        // ✅ 优先使用缓存：用户在 FaviconSelector 中选择并保存的图标
        const domain = extractDomain(item.url);
        const cachedIcon = ConfigManager.getCachedIcon(domain);
        
        if (cachedIcon) {
          return {
            type: 'image' as const,
            content: cachedIcon
          };
        }

        // 无缓存时使用多策略获取图标
        const candidates = generateFaviconCandidates(domain);

        if (candidates.length > 0) {
          return {
            type: 'image' as const,
            content: candidates[0]
          };
        } else {
          // 如果无法获取图标 URL，使用回退图标
          return {
            type: 'emoji' as const,
            content: getFallbackIcon(item.name)
          };
        }
    }
  }, [item.iconType, item.builtinIcon, item.customIconUrl, item.iconUrl, item.url, item.customColor, item.name]);

  /**
   * 处理点击事件
   */
  /* eslint-disable react-hooks/exhaustive-deps */
  const handleClick = useCallback(() => {
    // 如果刚刚触发了长按，跳过点击逻辑
    if (longPressHandlers.longPressTriggeredRef.current) {
      resetLongPressState();
      return;
    }

    // 如果菜单已打开，先关闭菜单
    if (isMenuOpen) {
      closeMenu();
      return;
    }

    const operationMode = config?.operationMode || {
      mode: 'hybrid' as const,
      openMethod: 'click' as const,
      menuTrigger: 'both' as const,
      showAddButton: true
    };

    // 只有在点击打开方式为单击时，才打开链接
    if (operationMode.openMethod === 'click' && !item.isHidden) {
      window.open(item.url, '_blank');
    }
  }, [item.url, item.isHidden, config?.operationMode, isMenuOpen, closeMenu, resetLongPressState]);
  /* eslint-enable react-hooks/exhaustive-deps */

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

    // 只有在双击打开方式为双击时，才打开链接
    if (operationMode.openMethod === 'doubleClick' && !item.isHidden) {
      window.open(item.url, '_blank');
    }
  }, [item.url, item.isHidden, config?.operationMode]);

  if (item.isHidden) {
    return null;
  }

  return (
    <div className="relative group" data-icon-item data-id={item.id}>
      {/* 图标容器 - 可拖拽区域 */}
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group relative flex flex-col items-center p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-accent/50 hover:shadow-md active:scale-95 active:opacity-50"
        onPointerDownCapture={longPressHandlers.handlePointerDownCapture}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {/* 图标内容 */}
        <div
          className={`${getIconSizeClass(config)} mb-2 rounded-lg overflow-hidden bg-transparent flex items-center justify-center`}
          suppressHydrationWarning
        >
          {(() => {
            const iconContent = getIconContent();

            if (iconContent.type === 'emoji') {
              return (
                <span className="text-2xl">
                  {iconContent.content}
                </span>
              );
            } else if (iconContent.type === 'solid' && iconContent.builtinIcon) {
              return renderSolidIcon(iconContent.builtinIcon, item.name);
            } else {
              return (
                <Favicon
                  src={iconContent.content}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  appName={item.name}
                  isCustomIcon={iconContent.type === 'image' ? iconContent.isCustomIcon : false}
                />
              );
            }
          })()}
        </div>

        {/* 图标名称 */}
        <span className="text-xs text-center text-muted-foreground font-medium truncate max-w-full px-1">
          {item.name}
        </span>
      </div>

      {/* 右键菜单 - 通过 useContextMenu 管理 */}
      <DropdownMenu
        open={isMenuOpen}
        onOpenChange={(open) => !open && closeMenu()}
      >
        <DropdownMenuTrigger asChild id={`icon-menu-${item.id}`}>
          <span className="hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          style={{
            position: 'fixed',
            left: menuPosition.x,
            top: menuPosition.y,
          }}
        >
          <DropdownMenuItem onClick={() => {
            onEdit(item.id);
            closeMenu();
          }}>
            {STRINGS.modify}
          </DropdownMenuItem>
          {onMoveToFolder && folders && folders.length > 0 && (
            <DropdownMenuItem onClick={() => {
              setShowFolderSelector(true);
              closeMenu();
            }}>
              {STRINGS.moveToFolder || '放入文件夹'}
            </DropdownMenuItem>
          )}
          {item.folderId && onMoveToRoot && (
            <DropdownMenuItem onClick={() => {
              onMoveToRoot(item.id);
              closeMenu();
            }}>
              {STRINGS.moveToRoot || '移动到根级'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => {
            setShowDeleteConfirm(true);
            closeMenu();
          }} className="text-red-600 dark:text-red-400">
            {STRINGS.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 - 使用 Hook 渲染 */}
      {showDeleteConfirm && renderIconDeleteConfirm({
        iconName: item.name,
        onConfirm: () => {
          onDelete(item.id);
          setShowDeleteConfirm(false);
        },
        onCancel: () => setShowDeleteConfirm(false)
      })}

      {/* 文件夹选择器 - 使用 Hook 渲染 */}
      {showFolderSelector && folders && renderFolderSelector({
        folders: folders.map(f => ({ id: f.id, name: f.name })),
        onSelect: (folderId) => {
          if (onMoveToFolder) {
            onMoveToFolder(item.id, folderId);
          }
          setShowFolderSelector(false);
        },
        onCancel: () => setShowFolderSelector(false)
      })}
    </div>
  );
}
