'use client';

/**
 * 确认对话框 Hook
 * 
 * 职责：统一管理删除/操作确认对话框
 * - 提供标准化的确认 UI
 * - 支持多种确认类型（删除文件夹、删除图标等）
 * - 自动处理国际化文案
 */

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getStrings } from '@/data/i18n';
import type { Language } from '@/data/i18n';

export interface ConfirmDialogOptions {
  language?: Language;
}

export interface FolderDeleteConfirmProps {
  folderName: string;
  onFolderOnly: () => void;
  onDeleteAll: () => void;
  onCancel: () => void;
}

export interface IconDeleteConfirmProps {
  iconName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function useConfirmDialog(options: ConfirmDialogOptions = {}) {
  const S = getStrings(options.language || 'zh');

  /**
   * 渲染文件夹删除确认对话框
   */
  const renderFolderDeleteConfirm = useCallback((props: FolderDeleteConfirmProps) => {
    if (!props.folderName) return null;

    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-medium text-card-foreground mb-4">
            {S.confirmDelete}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {S.confirmDeleteFolder.replace('{name}', props.folderName)}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={props.onCancel}
              className="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              {S.cancel}
            </button>
            <button
              onClick={props.onFolderOnly}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {S.onlyDeleteFolder}
            </button>
            <button
              onClick={props.onDeleteAll}
              className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors"
            >
              {S.deleteAll}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }, [S.confirmDelete, S.confirmDeleteFolder, S.cancel, S.onlyDeleteFolder, S.deleteAll]);

  /**
   * 渲染图标删除确认对话框
   */
  const renderIconDeleteConfirm = useCallback((props: IconDeleteConfirmProps) => {
    if (!props.iconName) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30"
        style={{ pointerEvents: 'auto' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="bg-card rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-medium text-card-foreground mb-4">
            {S.confirmDelete}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {S.confirmDeleteIcon.replace('{name}', props.iconName)}
          </p>
          <div className="flex gap-3 justify-end">
            <button
              draggable={false}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={props.onCancel}
              className="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              {S.cancel}
            </button>
            <button
              draggable={false}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={props.onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors"
            >
              {S.confirmDeleteButton}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }, [S.confirmDelete, S.confirmDeleteIcon, S.cancel, S.confirmDeleteButton]);

  return {
    renderFolderDeleteConfirm,
    renderIconDeleteConfirm
  };
}
