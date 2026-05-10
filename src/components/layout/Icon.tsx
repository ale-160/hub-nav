'use client';

import React, {useState, useCallback, useEffect, useRef} from 'react';
import { createPortal } from 'react-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconItem, ConfigManager } from '@/lib/configManager';
import { BuiltinIcon, getBuiltinIconById, getDefaultIcon } from '@/lib/builtinIcons';
import { extractDomain, getFaviconUrls, getFallbackIcon } from '@/lib/urlUtils';
import { getStrings } from '@/lib/strings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Favicon 组件 - 专门用于展示 favicon 图片，使用拼接方式
 */
interface FaviconProps {
  src: string;
  alt: string;
  className?: string;
  appName?: string;
}

function Favicon({ src, alt, className = '', appName = '' }: FaviconProps) {
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [cachedSrc, setCachedSrc] = useState<string | null>(null);

  // 初始化时检查缓存
  useEffect(() => {
    if (src) {
      try {
        const domain = extractDomain(src);
        const cachedIcon = ConfigManager.getCachedIcon(domain);
        if (cachedIcon) {
          setCachedSrc(cachedIcon);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('检查缓存失败:', error);
        }
      }
    }
  }, [src]);

  // 处理图片加载成功
  const handleImageLoad = useCallback(() => {
    if (src && !cachedSrc) {
      try {
        const domain = extractDomain(src);
        ConfigManager.setIconCache(domain, src);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('写入缓存失败:', error);
        }
      }
    }
  }, [src, cachedSrc]);

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

  // 显示图片（优先使用缓存）
  return (
    <img
      src={cachedSrc || src}
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
 * 图标组件 - 渲染单个图标项
 * @param props - 组件属性
 */
export function Icon({ item, onEdit, onDelete, onMoveToFolder, onMoveToRoot, folders, config }: IconProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showFolderSelector, setShowFolderSelector] = useState(false); // 新增：文件夹选择器
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  // 根据当前配置的语言获取文案
  const currentLanguage = config?.theme?.language || 'zh';
  const STRINGS = getStrings(currentLanguage);

  // 拖拽样式
  const shouldDisableMenu = isDragging;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

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

  /**
   * 渲染纯色图标（首字+背景色）
   */
  const renderSolidIcon = useCallback((icon: BuiltinIcon, appName?: string) => {
    // 提取应用名称的第一个字符
    const getFirstChar = (name: string): string => {
      if (!name || name.trim().length === 0) return '?';

      const firstChar = name.trim().charAt(0);
      // 如果是中文，直接返回第一个汉字
      if (/[\u4e00-\u9fa5]/.test(firstChar)) {
        return firstChar;
      }
      // 如果是英文，返回大写字母
      if (/[a-zA-Z]/.test(firstChar)) {
        return firstChar.toUpperCase();
      }
      // 其他情况返回原字符或 ?
      return firstChar || '?';
    };

    const displayChar = appName ? getFirstChar(appName) : getFirstChar(icon.name);

    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
        style={{ backgroundColor: icon.color }}
      >
        {displayChar}
      </div>
    );
  }, []);

  /**
   * 获取图标内容
   */
  const getIconContent = useCallback(() => {
    const iconType = item.iconType || 'favicon';

    switch (iconType) {
      case 'builtin':
        // 处理纯色图标 (solid-color-X 格式)
        if (item.builtinIcon && item.builtinIcon.startsWith('solid-color-')) {
          const colorIndex = parseInt(item.builtinIcon.replace('solid-color-', ''));
          const solidColors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#14b8a6',
            '#f43f5e', '#eab308', '#0ea5e9', '#22c55e', '#6366f1',
            '#6b7280', '#000000', '#ffffff'
          ];

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
        return {
          type: builtinIcon?.type === 'solid' ? 'solid' as const : 'emoji' as const,
          content: builtinIcon?.emoji || '',
          builtinIcon: builtinIcon
        };

      case 'custom':
        return {
          type: 'image' as const,
          content: item.customIconUrl || ''
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

        // 使用拼接方式获取图标
        const domain = extractDomain(item.url);
        const faviconUrls = getFaviconUrls(domain);

        if (faviconUrls.length > 0) {
          return {
            type: 'image' as const,
            content: faviconUrls[0]
          };
        } else {
          // 如果无法获取图标 URL，使用回退图标
          return {
            type: 'emoji' as const,
            content: getFallbackIcon(item.name)
          };
        }
    }
  }, [item.iconType, item.builtinIcon, item.customIconUrl, item.iconUrl, item.url, item.name]);

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
   * 处理点击事件
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

    // 只有在点击打开方式为单击时，才打开链接
    if (operationMode.openMethod === 'click' && !item.isHidden) {
      window.open(item.url, '_blank');
    }
  }, [item.url, item.isHidden, config?.operationMode, isMenuOpen]);

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
        onPointerDownCapture={handlePointerDownCapture}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          if (!shouldDisableMenu) {
            setMenuPosition({ x: e.clientX, y: e.clientY });
            setIsMenuOpen(true);
          }
        }}
      >
        {/* 图标内容 */}
        <div className={`${getIconSizeClass()} mb-2 rounded-lg overflow-hidden bg-transparent flex items-center justify-center`}>
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

      {/* 右键菜单 - 通过 onContextMenu 触发 */}
      <DropdownMenu 
        open={shouldDisableMenu ? false : isMenuOpen} 
        onOpenChange={setIsMenuOpen}
      >
        <DropdownMenuTrigger asChild>
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
            onEdit(item.id);
            setIsMenuOpen(false);
          }}>
            {STRINGS.modify}
          </DropdownMenuItem>
          {onMoveToFolder && folders && folders.length > 0 && (
            <DropdownMenuItem onClick={() => {
              setShowFolderSelector(true);
              setIsMenuOpen(false);
            }}>
              {STRINGS.moveToFolder || '放入文件夹'}
            </DropdownMenuItem>
          )}
          {item.folderId && onMoveToRoot && (
            <DropdownMenuItem onClick={() => {
              onMoveToRoot(item.id);
              setIsMenuOpen(false);
            }}>
              {STRINGS.moveToRoot || '移动到根级'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => {
            setShowDeleteConfirm(true);
            setIsMenuOpen(false);
          }} className="text-red-600 dark:text-red-400">
            {STRINGS.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 删除确认对话框 - 使用 Portal 渲染到 body */}
      {showDeleteConfirm && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30"
          style={{ pointerEvents: 'auto' }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              {STRINGS.confirmDelete}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {STRINGS.confirmDeleteIcon.replace('{name}', item.name)}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                draggable={false}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {STRINGS.cancel}
              </button>
              <button
                draggable={false}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  onDelete(item.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors"
              >
                {STRINGS.confirmDeleteButton}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 文件夹选择器 - 使用 Portal 渲染到 body */}
      {showFolderSelector && folders && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30"
          style={{ pointerEvents: 'auto' }}
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          <div className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-card-foreground mb-4">
              {STRINGS.moveToFolder || '放入文件夹'}
            </h3>
            <div className="space-y-2">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  draggable={false}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    if (onMoveToFolder) {
                      onMoveToFolder(item.id, folder.id);
                    }
                    setShowFolderSelector(false);
                  }}
                  className="w-full px-4 py-3 text-left rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
                >
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  <span className="text-sm font-medium text-card-foreground">{folder.name}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                draggable={false}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setShowFolderSelector(false)}
                className="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {STRINGS.cancel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
