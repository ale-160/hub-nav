import React from 'react';
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
          left: Math.min(position.x, typeof window !== 'undefined' ? window.innerWidth - 180 : position.x),
          top: Math.min(position.y, typeof window !== 'undefined' ? window.innerHeight - 150 : position.y),
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
