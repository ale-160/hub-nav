import React, { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface BlankContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onAddIcon?: () => void;
  onAddFolder?: () => void;
  onRefresh?: () => void;
  labels: {
    addApp: string;
    addFolder: string;
    refresh: string;
  };
}

/**
 * 空白处右键菜单组件
 * 桌面空白区域右键点击时显示
 */
export const BlankContextMenu = React.memo(function BlankContextMenu({
  isOpen,
  position,
  onClose,
  onAddIcon,
  onAddFolder,
  onRefresh,
  labels
}: BlankContextMenuProps) {
  // ✅ 使用 state 存储窗口尺寸，避免 SSR 环境下直接访问 window
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // 在客户端获取窗口尺寸
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // 初始化
    updateSize();

    // 监听窗口大小变化
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 计算菜单位置（防止超出视口）
  const menuWidth = 180;
  const menuHeight = 150;
  const left = Math.min(position.x, windowSize.width - menuWidth);
  const top = Math.min(position.y, windowSize.height - menuHeight);
  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
    >
      <DropdownMenuTrigger asChild id="page-blank-menu">
        <span className="hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        style={{
          position: 'fixed',
          left: left,
          top: top,
        }}
      >
        {onAddIcon && (
          <DropdownMenuItem onClick={() => {
            onAddIcon();
            onClose();
          }}>
            {labels.addApp}
          </DropdownMenuItem>
        )}
        {onAddFolder && (
          <DropdownMenuItem onClick={() => {
            onAddFolder();
            onClose();
          }}>
            {labels.addFolder}
          </DropdownMenuItem>
        )}
        {onRefresh && (
          <DropdownMenuItem onClick={() => {
            onRefresh();
            onClose();
          }}>
            {labels.refresh}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
