'use client';

/**
 * 文件夹选择器 Hook
 * 
 * 职责：统一管理移动到文件夹的选择器 UI
 * - 提供标准化的文件夹列表展示
 * - 自动处理国际化文案
 * - 支持 Portal 渲染
 */

import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getStrings } from '@/data/i18n';
import type { Language } from '@/data/i18n';

export interface FolderOption {
  id: string;
  name: string;
}

export interface UseFolderSelectorOptions {
  language?: Language;
}

export interface FolderSelectorProps {
  folders: FolderOption[];
  onSelect: (folderId: string) => void;
  onCancel: () => void;
}

export function useFolderSelector(options: UseFolderSelectorOptions = {}) {
  const S = getStrings(options.language || 'zh');

  /**
   * 渲染文件夹选择器
   */
  const renderFolderSelector = useCallback((props: FolderSelectorProps) => {
    if (!props.folders || props.folders.length === 0) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30"
        style={{ pointerEvents: 'auto' }}
        onPointerDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
      >
        <div className="bg-card rounded-lg shadow-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-medium text-card-foreground mb-4">
            {S.moveToFolder || '放入文件夹'}
          </h3>
          <div className="space-y-2">
            {props.folders.map(folder => (
              <button
                key={folder.id}
                draggable={false}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  props.onSelect(folder.id);
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
              onClick={props.onCancel}
              className="px-4 py-2 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              {S.cancel}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }, [S.moveToFolder, S.cancel]);

  return {
    renderFolderSelector
  };
}
