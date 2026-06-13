import React, { useState, useCallback } from 'react';
import { Modal } from '../modal';
import { Button } from '../button';
import { IconSelector } from '../icon-selector';
import { getStrings } from '@/data/i18n';
import { IconItem } from '@/lib/configManager';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedItem: IconItem) => Promise<void>;
  item: IconItem | null;
  language: 'zh' | 'en';
}

/**
 * 编辑项目模态框组件
 *
 * ⚠️ 重要：表单状态完全在组件内部管理，避免输入卡顿
 * 只在提交时通过 onSubmit 通知父组件
 */
export function EditItemModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  language
}: EditItemModalProps) {
  const S = getStrings(language);
    
  // ✅ 表单状态下沉到组件内部
  // 使用 key 属性确保每次打开模态框时重置表单状态
  const [editForm, setEditForm] = useState<IconItem | null>(item ? { ...item } : null);

  /**
   * 处理字段变化
   */
  const handleFieldChange = useCallback(<K extends keyof IconItem>(field: K, value: IconItem[K]) => {
    setEditForm(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  /**
   * 处理图标类型变化
   */
  const handleIconTypeChange = useCallback((iconType: 'favicon' | 'builtin' | 'custom') => {
    setEditForm(prev => {
      if (!prev) return null;
      return {
        ...prev,
        iconType,
        builtinIcon: iconType === 'builtin' ? prev.builtinIcon || 'home' : undefined,
        customIconUrl: iconType === 'custom' ? prev.customIconUrl : undefined,
        customColor: iconType === 'builtin' && prev.builtinIcon?.startsWith('solid-color-') ? prev.customColor : undefined
      };
    });
  }, []);

  /**
   * 处理内置图标选择
   */
  const handleBuiltinIconChange = useCallback((iconId: string) => {
    setEditForm(prev => prev ? { ...prev, builtinIcon: iconId } : null);
  }, []);

  /**
   * 处理自定义图标 URL 变化
   */
  const handleCustomIconUrlChange = useCallback((url: string) => {
    setEditForm(prev => prev ? { ...prev, customIconUrl: url } : null);
  }, []);

  /**
   * 处理自定义颜色变化（调色盘）
   */
  const handleCustomColorChange = useCallback((color: string) => {
    setEditForm(prev => prev ? { ...prev, customColor: color } : null);
  }, []);

  /**
   * 处理提交
   */
  const handleSubmit = useCallback(async () => {
    if (!editForm) return;

    try {
      await onSubmit(editForm);
      onClose();
    } catch (error) {
      console.error('[EditItemModal] Submit error:', error);
    }
  }, [editForm, onSubmit, onClose]);

  /**
   * 处理关闭
   */
  const handleClose = useCallback(() => {
    setEditForm(null);
    onClose();
  }, [onClose]);

  if (!editForm) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={S.editApp}
      size="md"
    >
      <div className="space-y-4">
        {/* 名称输入 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {S.name}
          </label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* URL 输入 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {S.url}
          </label>
          <input
            type="url"
            value={editForm.url}
            onChange={(e) => handleFieldChange('url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* 图标选择器 */}
        <IconSelector
          iconType={editForm.iconType || 'favicon'}
          builtinIcon={editForm.builtinIcon}
          customIconUrl={editForm.customIconUrl}
          websiteUrl={editForm.url}
          appName={editForm.name}
          language={language}
          onIconTypeChange={handleIconTypeChange}
          onBuiltinIconChange={handleBuiltinIconChange}
          onCustomIconUrlChange={handleCustomIconUrlChange}
          onWebsiteUrlChange={(url) => handleFieldChange('url', url)}
          onCustomColorChange={handleCustomColorChange}
          onFaviconSelect={(url) => {
            // 用户选择了 favicon，更新 iconUrl 并保持 favicon 类型
            handleFieldChange('iconUrl', url);
            handleFieldChange('iconType', 'favicon');
            handleFieldChange('customIconUrl', undefined);
          }}
        />

        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            {S.cancel}
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
          >
            {S.save}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
