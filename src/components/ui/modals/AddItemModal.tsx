import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Modal } from '../modal';
import { Button } from '../button';
import { IconSelector } from '../icon-selector';
import { getStrings } from '@/data/i18n';
import { validateUrl } from '@/utils/url';

/**
 * 添加新项目类型
 */
type AddItemType = 'icon' | 'folder';

/**
 * 添加新项目表单数据
 */
interface AddItemForm {
  type: AddItemType;
  name: string;
  url: string;
  folderId?: string;
  iconType?: 'favicon' | 'builtin' | 'custom';
  builtinIcon?: string;
  customIconUrl?: string; // 自定义图标 URL（仅用于图片）
  customColor?: string;   // 自定义颜色值（仅用于纯色图标）
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AddItemForm) => Promise<void>;
  language: 'zh' | 'en';
  initialFolderId?: string;
  initialType?: 'icon' | 'folder';
}

/**
 * 添加项目模态框组件
 *
 * ⚠️ 重要：表单状态完全在组件内部管理，避免输入卡顿
 * 只在提交时通过 onSubmit 通知父组件
 */
export function AddItemModal({
  isOpen,
  onClose,
  onSubmit,
  language,
  initialFolderId,
  initialType = 'icon'
}: AddItemModalProps) {
  const S = getStrings(language);

  // 调试日志：检查传入的 props
  if (process.env.NODE_ENV === 'development' && isOpen) {
    console.log('[AddItemModal] 初始化 - initialType:', initialType, 'initialFolderId:', initialFolderId);
  }

  // ✅ 表单状态下沉到组件内部
  const [form, setForm] = useState<AddItemForm>({
    type: initialType,
    name: '',
    url: '',
    folderId: initialFolderId,
    iconType: 'favicon',
    builtinIcon: undefined,
    customIconUrl: undefined,
    customColor: undefined
  });

  // 使用 ref 跟踪模态框是否已打开，避免在 effect 中 setState
  const hasOpenedRef = useRef(false);

  // 当模态框首次打开时，根据 initialType 和 initialFolderId 初始化表单
  useEffect(() => {
    if (isOpen && !hasOpenedRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AddItemModal] useEffect - 模态框首次打开，初始化表单 - initialType:', initialType, 'initialFolderId:', initialFolderId);
      }
      hasOpenedRef.current = true;
      setForm({
        type: initialType,
        name: '',
        url: '',
        folderId: initialFolderId,
        iconType: 'favicon',
        builtinIcon: undefined,
        customIconUrl: undefined,
        customColor: undefined
      });
    }
    
    // 模态框关闭时重置标志
    if (!isOpen) {
      hasOpenedRef.current = false;
    }
  }, [isOpen, initialType, initialFolderId]);

  const [isLoading, setIsLoading] = useState(false);

  /**
   * 重置表单
   */
  const resetForm = useCallback(() => {
    setForm({
      type: initialType,
      name: '',
      url: '',
      folderId: initialFolderId,
      iconType: 'favicon',
      builtinIcon: undefined,
      customIconUrl: undefined,
      customColor: undefined
    });
  }, [initialFolderId, initialType]);

  /**
   * 处理表单字段变化
   */
  const handleFieldChange = useCallback(<K extends keyof AddItemForm>(field: K, value: AddItemForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * 处理图标类型变化
   */
  const handleIconTypeChange = useCallback((iconType: 'favicon' | 'builtin' | 'custom') => {
    setForm(prev => ({
      ...prev,
      iconType,
      builtinIcon: iconType === 'builtin' ? prev.builtinIcon || 'home' : undefined,
      customIconUrl: iconType === 'custom' ? prev.customIconUrl : undefined
    }));
  }, []);

  /**
   * 处理内置图标选择
   */
  const handleBuiltinIconChange = useCallback((iconId: string) => {
    setForm(prev => ({ ...prev, builtinIcon: iconId }));
  }, []);

  /**
   * 处理自定义图标 URL 变化
   */
  const handleCustomIconUrlChange = useCallback((url: string) => {
    setForm(prev => ({ ...prev, customIconUrl: url }));
  }, []);

  /**
   * 处理自定义颜色变化（调色盘）
   */
  const handleCustomColorChange = useCallback((color: string) => {
    setForm(prev => ({ ...prev, customColor: color }));
  }, []);

  /**
   * 处理提交
   */
  const handleSubmit = useCallback(async () => {
    if (!form.name.trim()) {
      toast.error(S.nameRequired);
      return;
    }

    if (form.type === 'icon') {
      const urlToValidate = form.url.trim();

      if (!urlToValidate) {
        toast.error(S.urlRequired);
        return;
      }

      // URL 格式验证
      const validation = validateUrl(urlToValidate);
      if (!validation.isValid) {
        toast.error(`URL 验证失败: ${validation.errorMessage}`);
        return;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[AddItemModal] 提交表单数据:', form);
    }

    setIsLoading(true);

    try {
      await onSubmit(form);
      resetForm();
      onClose();
    } catch (error) {
      console.error('[AddItemModal] Submit error:', error);
      toast.error('添加失败');
    } finally {
      setIsLoading(false);
    }
  }, [form, onSubmit, resetForm, onClose, S]);

  /**
   * 处理关闭
   */
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={S.addApp}
      size="md"
    >
      <div className="space-y-4">
        {/* 类型选择 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {S.type}
          </label>
          <div className="flex gap-2">
            <Button
              variant={form.type === 'icon' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleFieldChange('type', 'icon')}
            >
              {S.addApp}
            </Button>
            <Button
              variant={form.type === 'folder' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => handleFieldChange('type', 'folder')}
            >
              {S.addFolder}
            </Button>
          </div>
        </div>

        {/* 名称输入 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            {form.type === 'icon' ? S.appName : S.folderName}
          </label>
          <input
            type="text"
            id="name"
            value={form.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder={form.type === 'icon' ? S.appNamePlaceholder : S.folderNamePlaceholder}
            className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* 应用地址输入（仅应用类型） */}
        {form.type === 'icon' && (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
              {S.appUrl}
            </label>
            <input
              type="url"
              id="url"
              value={form.url}
              onChange={(e) => handleFieldChange('url', e.target.value)}
              placeholder={S.appUrlPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        )}

        {/* 图标选择器（仅图标类型） */}
        {form.type === 'icon' && (
          <IconSelector
            iconType={form.iconType || 'favicon'}
            builtinIcon={form.builtinIcon}
            customIconUrl={form.customIconUrl}
            websiteUrl={form.url}
            appName={form.name}
            language={language}
            onIconTypeChange={handleIconTypeChange}
            onBuiltinIconChange={handleBuiltinIconChange}
            onCustomIconUrlChange={handleCustomIconUrlChange}
            onWebsiteUrlChange={(url) => handleFieldChange('url', url)}
            onCustomColorChange={handleCustomColorChange}
          />
        )}

        {/* 操作按钮 */}
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
            disabled={isLoading}
          >
            {isLoading ? '加载中...' : S.add}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
