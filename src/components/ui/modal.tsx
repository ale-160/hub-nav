'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideCloseButton?: boolean;
}

/**
 * 模态框组件 - 基于 shadcn Dialog 的包装器
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  hideCloseButton = false
}: ModalProps) {
  // 尺寸配置
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-3xl'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`${sizeClasses[size]} bg-card`} showCloseButton={!hideCloseButton}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : (
            // 注意：不使用 sr-only 重复 title，避免无障碍阅读器重复朗读
            // DialogTitle 已经提供了足够的语义信息
            null
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
