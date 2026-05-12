'use client';

import React, { useState, useCallback } from 'react';
import { Page, UserConfig, ConfigManager } from '@/lib/configManager';
import { getStrings } from '@/data/i18n';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Check, X, MoreHorizontal } from 'lucide-react';

interface PageManagerProps {
  pages: Page[];
  currentPageIndex: number;
  config: UserConfig;
  onUpdate: (config: Partial<UserConfig>) => void;
  onPageChange: (index: number) => void;
  language?: 'zh' | 'en';
}

/**
 * 页面管理器组件 - 提供页面的列表、重命名、删除和新建功能
 */
export function PageManager({
  pages,
  currentPageIndex,
  config,
  onUpdate,
  onPageChange,
  language = 'zh',
}: PageManagerProps) {
  const STRINGS = getStrings(language);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  /**
   * 处理页面重命名
   */
  const handleRenameStart = useCallback((page: Page) => {
    setEditingPageId(page.id);
    setEditingName(page.name);
  }, []);

  /**
   * 确认重命名
   */
  const handleRenameConfirm = useCallback(() => {
    if (!editingPageId || !editingName.trim()) return;

    const updatedPages = pages.map(page =>
      page.id === editingPageId
        ? { ...page, name: editingName.trim() }
        : page
    );
    onUpdate({ pages: updatedPages });
    setEditingPageId(null);
    setEditingName('');
  }, [editingPageId, editingName, pages, onUpdate]);

  /**
   * 取消重命名
   */
  const handleRenameCancel = useCallback(() => {
    setEditingPageId(null);
    setEditingName('');
  }, []);

  /**
   * 处理删除页面
   */
  const handleDeletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) return; // 至少保留一页

    const pageIndex = pages.findIndex(p => p.id === pageId);
    const updatedPages = pages.filter(page => page.id !== pageId);

    // 获取该页面的所有图标和文件夹 ID

    // 删除该页面中引用的文件夹（不在其他页面中的文件夹）
    const remainingFolderIds = updatedPages.flatMap(p => p.iconIds);
    const deletedFolderIds = config.folders
      .filter(folder => !remainingFolderIds.includes(folder.id))
      .map(folder => folder.id);

    // 从图标中清除 folderId（如果文件夹被删除）
    const updatedIcons = config.icons.map(icon => {
      if (deletedFolderIds.includes(icon.folderId || '')) {
        return { ...icon, folderId: undefined };
      }
      return icon;
    });

    const updatedFolders = config.folders.filter(folder =>
      remainingFolderIds.includes(folder.id)
    );

    onUpdate({
      pages: updatedPages,
      icons: updatedIcons,
      folders: updatedFolders,
    });

    // 如果删除的是当前页，切换到第一页
    if (pageIndex === currentPageIndex) {
      onPageChange(0);
    } else if (pageIndex < currentPageIndex) {
      // 如果删除的页面在当前页之前，切换到前一页
      onPageChange(Math.max(0, currentPageIndex - 1));
    }

    setDeleteConfirmId(null);
  }, [pages, config, currentPageIndex, onUpdate, onPageChange]);

  /**
   * 处理新建页面
   */
  const handleAddPage = useCallback(() => {
    const newConfig = ConfigManager.addPage(config);
    onUpdate(newConfig);
    // 切换到新页面
    onPageChange(config.pages.length);
    setIsOpen(false);
  }, [config, onUpdate, onPageChange]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild id="page-manager-menu">
        <button
          className="w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-accent transition-all duration-200"
          title={STRINGS.pageManager}
          aria-label={STRINGS.pageManager}
        >
          <MoreHorizontal className="w-4 h-4 text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64">
        {/* 页面列表 */}
        <div className="px-1.5 py-1">
          <p className="text-xs font-medium text-muted-foreground px-2 py-1">
            {STRINGS.pageList}
          </p>
        </div>

        {pages.map((page, index) => (
          <div key={page.id} className="px-1.5">
            {editingPageId === page.id ? (
              /* 重命名模式 */
              <div className="flex items-center gap-1 px-1.5 py-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameConfirm();
                    if (e.key === 'Escape') handleRenameCancel();
                  }}
                  className="h-7 flex-1 text-sm"
                  autoFocus
                />
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={handleRenameConfirm}
                  className="text-[var(--success)] hover:text-[var(--success)]/80 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <Check className="size-3" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={handleRenameCancel}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ) : deleteConfirmId === page.id ? (
              /* 删除确认模式 */
              <div className="flex items-center gap-1 px-1.5 py-1">
                <span className="flex-1 text-sm text-muted-foreground truncate">
                  {STRINGS.confirmDelete}?
                </span>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => handleDeletePage(page.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Check className="size-3" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setDeleteConfirmId(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </Button>
              </div>
            ) : (
              /* 正常模式 */
              <div className="group flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent">
                <button
                  className="flex-1 text-left text-sm truncate"
                  onClick={() => {
                    onPageChange(index);
                    setIsOpen(false);
                  }}
                >
                  <span className={index === currentPageIndex ? 'font-medium text-primary' : ''}>
                    {page.name}
                  </span>
                  {index === currentPageIndex && (
                    <span className="ml-2 text-xs text-muted-foreground">({STRINGS.current})</span>
                  )}
                </button>
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameStart(page);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                    title={STRINGS.rename}
                  >
                    <Pencil className="size-3" />
                  </Button>
                  {pages.length > 1 && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(page.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                      title={STRINGS.delete}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <DropdownMenuSeparator />

        {/* 新建页面 */}
        <DropdownMenuItem onClick={handleAddPage} className="cursor-pointer">
          <Plus className="size-4 mr-2" />
          {STRINGS.newPage}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
