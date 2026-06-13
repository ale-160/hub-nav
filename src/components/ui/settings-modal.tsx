'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { UserConfig, OperationModeSettings, ConfigManager } from '@/lib/configManager';
import { Modal } from './modal';
import { Button } from './button';
import { Slider } from './slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { OperationModeSelector } from './operation-mode-selector';
import { getStrings } from '@/data/i18n';
import {
  getBackupList,
  restoreBackup,
  deleteBackup,
  clearAllBackups,
  formatBackupTime,
  calculateBackupSize,
  formatFileSize,
  getBackupStorageInfo,
  createBackup,
  saveBackup,
  exportBackupAsFile,
  importBackupFromFile,
  updateBackup,
  type BackupEntry,
} from '@/utils/config/backup';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UserConfig;
  onConfigUpdate: (partial: Partial<UserConfig>) => void;
  onImport: () => void;
  onExport: () => void;
  language?: 'zh' | 'en';
}

/**
 * 预设壁纸列表
 */
const WALLPAPERS = [
  { id: 'none', name: '', url: '' },
  { id: 'gradient1', name: '', url: 'linear-gradient(to bottom, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient2', name: '', url: 'linear-gradient(to bottom, #a78bfa 0%, #7c3aed 100%)' },
  { id: 'gradient3', name: '', url: 'linear-gradient(to bottom, #fbbf24 0%, #f59e0b 100%)' },
  { id: 'gradient4', name: '', url: 'linear-gradient(to bottom, #10b981 0%, #059669 100%)' },
  { id: 'unsplash1', name: '', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800' },
  { id: 'unsplash2', name: '', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800' },
  { id: 'unsplash3', name: '', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=800' }
];

/**
 * 搜索引擎列表
 */
const SEARCH_ENGINES = [
  { id: 'google', name: 'Google', url: 'https://www.google.com/search?q=' },
  { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=' },
  { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=' }
];

/**
 * 设置面板组件
 */
export function SettingsModal({ isOpen, onClose, config, onConfigUpdate, onImport, onExport, language }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'search' | 'data' | 'language' | 'operation'>('appearance');
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState('');
  const [customSearchEngine, setCustomSearchEngine] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [uploadedWallpaper, setUploadedWallpaper] = useState<string | null>(null);

  // 备份管理状态
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [backupStorageInfo, setBackupStorageInfo] = useState<{
    totalSize: number;
    maxSize: number;
    usagePercent: number;
    isNearLimit: boolean;
    backupCount: number;
  }>({ totalSize: 0, maxSize: 0, usagePercent: 0, isNearLimit: false, backupCount: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [renamingBackupId, setRenamingBackupId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState('');
  const importBackupFileInputRef = React.createRef<HTMLInputElement>();

  // 服务器配置状态
  const [serverConfigUrl, setServerConfigUrl] = useState('');
  const [serverConfigTesting, setServerConfigTesting] = useState(false);
  const [serverConfigApplying, setServerConfigApplying] = useState(false);
  const [hasLocalConfig, setHasLocalConfig] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // 加载备份列表
  useEffect(() => {
    if (isOpen && activeTab === 'data') {
      const loadBackups = () => {
        const backupList = getBackupList();
        setBackups(backupList);
        setBackupStorageInfo(getBackupStorageInfo());
        // 加载服务器配置 URL 和本地配置状态
        setServerConfigUrl(ConfigManager.getServerConfigUrl() || '');
        setHasLocalConfig(ConfigManager.hasLocalConfig());
        setSyncEnabled(ConfigManager.isSyncEnabled());
      };
      loadBackups();
    }
  }, [isOpen, activeTab]);

  // 保存服务器配置 URL
  useEffect(() => {
    if (isOpen && activeTab === 'data' && serverConfigUrl !== (ConfigManager.getServerConfigUrl() || '')) {
      // 保存到 localStorage
      ConfigManager.setServerConfigUrl(serverConfigUrl || null);
    }
  }, [isOpen, activeTab, serverConfigUrl]);

  // 根据当前配置的语言获取文案（优先使用传入的 language，其次使用 config 中的）
  const currentLanguage = language || config.theme.language || 'zh';
  const STRINGS = getStrings(currentLanguage);

  /**
   * 计算存储信息
   */
  const storageInfo = useMemo(() => {
    if (typeof window === 'undefined') {
      return { totalSize: '0 B', iconCount: 0, folderCount: 0, pageCount: 0 };
    }

    // 计算 localStorage 总大小
    let totalSize = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length * 2; // UTF-16 编码，每个字符 2 字节
        }
      }
    }

    // 格式化大小
    let formattedSize: string;
    if (totalSize < 1024) {
      formattedSize = `${totalSize} B`;
    } else if (totalSize < 1024 * 1024) {
      formattedSize = `${(totalSize / 1024).toFixed(1)} KB`;
    } else {
      formattedSize = `${(totalSize / (1024 * 1024)).toFixed(2)} MB`;
    }

    return {
      totalSize: formattedSize,
      iconCount: config.icons.length,
      folderCount: config.folders.length,
      pageCount: config.pages.length,
    };
  }, [config]);

  /**
   * 处理壁纸选择
   */
  const handleWallpaperSelect = useCallback((wallpaperUrl: string) => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        wallpaperUrl: wallpaperUrl === '' ? undefined : wallpaperUrl
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 处理图标大小选择
   */
  const handleIconSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        iconSize: size
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 处理图标间距变化
   */
  const handleGridSpacingChange = useCallback((spacing: number) => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        gridSpacing: spacing
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 处理图标水平间距变化
   */
  const handleGridColumnSpacingChange = useCallback((spacing: number) => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        gridColumnSpacing: spacing
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 处理字体颜色变化
   */
  const handleFontColorChange = useCallback((fontColor: string) => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        fontColor: fontColor || undefined
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 处理搜索引擎选择
   */
  const handleSearchEngineChange = useCallback((engineUrl: string) => {
    onConfigUpdate({
      searchEngine: engineUrl
    });
  }, [onConfigUpdate]);

  /**
   * 处理自定义壁纸应用
   */
  const handleCustomWallpaperApply = useCallback(() => {
    if (customWallpaperUrl.trim()) {
      handleWallpaperSelect(customWallpaperUrl.trim());
      setCustomWallpaperUrl('');
    }
  }, [customWallpaperUrl, handleWallpaperSelect]);

  /**
   * 处理自定义搜索引擎应用
   */
  const handleCustomSearchEngineApply = useCallback(() => {
    if (customSearchEngine.trim()) {
      handleSearchEngineChange(customSearchEngine.trim());
      setCustomSearchEngine('');
    }
  }, [customSearchEngine, handleSearchEngineChange]);

  /**
   * 处理导入配置
   */
  const handleImportConfig = useCallback(() => {
    onImport();
    // 导入成功后，父组件会通过 onConfigUpdate 更新配置
  }, [onImport]);

  /**
   * 处理本地上传壁纸
   */
  const handleWallpaperUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件大小（限制2MB）
    if (file.size > 2 * 1024 * 1024) {
      toast.error(STRINGS.imageTooLarge);
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error(STRINGS.pleaseSelectImage);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedWallpaper(dataUrl);
      handleWallpaperSelect(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [handleWallpaperSelect, STRINGS.imageTooLarge, STRINGS.pleaseSelectImage]);

  /**
   * 恢复备份：与"从文件导入配置"走完全相同的路径
   * 1) restoreBackup 返回备份数据的 JSON 字符串
   * 2) ConfigManager.importConfig 处理版本迁移、验证、写入 localStorage
   * 3) 刷新页面加载新配置
   */
  const handleRestoreBackup = useCallback((backupId: string) => {
    const backupJson = restoreBackup(backupId);
    if (!backupJson) {
      toast.error(STRINGS.backupRestoreFailed || '恢复失败');
      return;
    }

    const success = ConfigManager.importConfig(backupJson);
    if (success) {
      toast.success(STRINGS.backupRestored);
      window.location.reload();
    } else {
      toast.error(STRINGS.backupRestoreFailed || '恢复失败');
    }
  }, [STRINGS.backupRestored, STRINGS.backupRestoreFailed]);

  /**
   * 删除备份
   */
  const handleDeleteBackup = useCallback((backupId: string) => {
    deleteBackup(backupId);
    setBackups(getBackupList());
    setBackupStorageInfo(getBackupStorageInfo());
    setShowDeleteConfirm(null);
    toast.success(STRINGS.backupDeleted);
  }, [STRINGS.backupDeleted]);

  /**
   * 清空所有备份
   */
  const handleClearAllBackups = useCallback(() => {
    clearAllBackups();
    setBackups([]);
    setBackupStorageInfo({ totalSize: 0, maxSize: 0, usagePercent: 0, isNearLimit: false, backupCount: 0 });
    setShowClearAllConfirm(false);
    toast.success(STRINGS.backupsCleared);
  }, [STRINGS.backupsCleared]);

  /**
   * 创建新备份：将当前配置存为 JSON 写入 localStorage
   */
  const handleCreateBackup = useCallback(() => {
    const backup = createBackup(config);
    saveBackup(backup);
    setBackups(getBackupList());
    setBackupStorageInfo(getBackupStorageInfo());
    toast.success(STRINGS.backupCreated);
  }, [config, STRINGS.backupCreated]);

  /**
   * 导出备份：将某个备份以 JSON 文件下载
   */
  const handleExportBackup = useCallback((backup: BackupEntry) => {
    exportBackupAsFile(backup);
    toast.success(STRINGS.backupExported);
  }, [STRINGS.backupExported]);

  /**
   * 导入备份：选择 JSON 文件并保存为新备份
   */
  const handleImportBackupClick = useCallback(() => {
    if (importBackupFileInputRef.current) {
      importBackupFileInputRef.current.value = '';
      importBackupFileInputRef.current.click();
    }
  }, [importBackupFileInputRef]);

  const handleImportBackupFile = useCallback(async (file: File) => {
    const entry = await importBackupFromFile(file);
    if (entry) {
      setBackups(getBackupList());
      setBackupStorageInfo(getBackupStorageInfo());
      toast.success(STRINGS.backupImported);
    } else {
      toast.error(STRINGS.backupImportFailed);
    }
  }, [STRINGS.backupImported, STRINGS.backupImportFailed]);

  /**
   * 开始重命名备份
   */
  const handleStartRename = useCallback((backup: BackupEntry) => {
    setRenamingBackupId(backup.id);
    setRenamingValue(backup.name || '');
  }, []);

  /**
   * 保存备份名称
   */
  const handleSaveRename = useCallback(() => {
    if (renamingBackupId) {
      updateBackup(renamingBackupId, { name: renamingValue.trim() });
      setBackups(getBackupList());
    }
    setRenamingBackupId(null);
    setRenamingValue('');
  }, [renamingBackupId, renamingValue]);

  /**
   * 取消重命名
   */
  const handleCancelRename = useCallback(() => {
    setRenamingBackupId(null);
    setRenamingValue('');
  }, []);

  /**
   * 处理操作模式变化
   */
  const handleOperationModeChange = useCallback((operationMode: OperationModeSettings) => {
    onConfigUpdate({
      operationMode
    });
  }, [onConfigUpdate]);

  /**
   * 处理语言切换
   */
  const handleLanguageChange = useCallback((language: 'zh' | 'en') => {
    onConfigUpdate({
      theme: {
        ...config.theme,
        language
      }
    });
  }, [config.theme, onConfigUpdate]);

  /**
   * 测试服务器配置连接
   */
  const handleTestServerConfig = useCallback(async () => {
    if (!serverConfigUrl.trim()) {
      return;
    }

    setServerConfigTesting(true);
    try {
      const config = await ConfigManager.loadServerConfig();
      if (config) {
        toast.success(STRINGS.serverConfigTestSuccess);
      } else {
        toast.error(STRINGS.serverConfigTestFailed);
      }
    } catch (_error) {
      toast.error(STRINGS.serverConfigTestFailed);
    } finally {
      setServerConfigTesting(false);
    }
  }, [serverConfigUrl, STRINGS]);

  /**
   * 应用服务器配置
   */
  const handleApplyServerConfig = useCallback(async () => {
    if (!serverConfigUrl.trim()) {
      return;
    }

    // 如果存在本地配置，显示警告
    if (hasLocalConfig) {
      const confirmed = window.confirm(STRINGS.serverConfigOverwriteConfirm);
      if (!confirmed) {
        return;
      }
    }

    setServerConfigApplying(true);
    try {
      const success = await ConfigManager.applyServerConfig();
      if (success) {
        toast.success(STRINGS.serverConfigApplied);
        // 重新加载页面以应用新配置
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(STRINGS.serverConfigApplyFailed);
      }
    } catch (_error) {
      toast.error(STRINGS.serverConfigApplyFailed);
    } finally {
      setServerConfigApplying(false);
    }
  }, [serverConfigUrl, hasLocalConfig, STRINGS]);

  /**
   * 切换云端同步
   */
  const handleToggleSync = useCallback((enabled: boolean) => {
    ConfigManager.setSyncEnabled(enabled);
    setSyncEnabled(enabled);
    if (enabled) {
      toast.success(STRINGS.serverConfigSyncEnabled);
    } else {
      toast.success(STRINGS.serverConfigSyncDisabled);
    }
  }, [STRINGS]);

  /**
   * 手动同步
   */
  const handleManualSync = useCallback(async () => {
    if (!serverConfigUrl.trim()) {
      return;
    }

    setIsSyncing(true);
    try {
      const success = await ConfigManager.syncFromServer();
      if (success) {
        toast.success(STRINGS.serverConfigSyncSuccess);
        // 重新加载页面以应用新配置
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(STRINGS.serverConfigSyncFailed);
      }
    } catch (_error) {
      toast.error(STRINGS.serverConfigSyncFailed);
    } finally {
      setIsSyncing(false);
    }
  }, [serverConfigUrl, STRINGS]);

  /**
   * 重置所有数据
   */
  const handleResetAllData = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={STRINGS.settings} size="xl">
      <div className="flex max-h-[70vh]">
        {/* 左侧标签页导航 */}
        <div className="w-48 border-r border-gray-200 dark:border-border bg-background">
          <div className="flex flex-col p-2 space-y-1">
            <Button
              variant={activeTab === 'appearance' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('appearance')}
              className={`justify-start gap-3 ${activeTab === 'appearance' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/><line x1="20.05" y1="17.94" x2="15.46" y2="14"/></svg>
              <span>{STRINGS.appearance}</span>
            </Button>
            <Button
              variant={activeTab === 'search' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('search')}
              className={`justify-start gap-3 ${activeTab === 'search' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>{STRINGS.search}</span>
            </Button>
            <Button
              variant={activeTab === 'data' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('data')}
              className={`justify-start gap-3 ${activeTab === 'data' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/></svg>
              <span>{STRINGS.data}</span>
            </Button>
            <Button
              variant={activeTab === 'language' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('language')}
              className={`justify-start gap-3 ${activeTab === 'language' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <span>{STRINGS.language}</span>
            </Button>
            <Button
              variant={activeTab === 'operation' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('operation')}
              className={`justify-start gap-3 ${activeTab === 'operation' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span>{STRINGS.operation}</span>
            </Button>
          </div>
        </div>

        {/* 右侧标签页内容 */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[70vh] min-w-125 bg-background">
          {/* 外观设置 */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* 壁纸设置 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.wallpaperSettings}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {WALLPAPERS.map(wallpaper => (
                    <Button
                      key={wallpaper.id}
                      variant={config.theme.wallpaperUrl === wallpaper.url ? 'default' : 'outline'}
                      onClick={() => handleWallpaperSelect(wallpaper.url)}
                      className="aspect-video p-0 overflow-hidden"
                      style={{
                        background: wallpaper.url.startsWith('linear-gradient')
                          ? wallpaper.url
                          : wallpaper.url
                          ? `url(${wallpaper.url}) center/cover`
                          : 'transparent'
                      }}
                      title={wallpaper.id === 'none' ? STRINGS.noWallpaper :
                             wallpaper.id === 'gradient1' ? STRINGS.gradientBlue :
                             wallpaper.id === 'gradient2' ? STRINGS.gradientPurple :
                             wallpaper.id === 'gradient3' ? STRINGS.gradientOrange :
                             wallpaper.id === 'gradient4' ? STRINGS.gradientGreen :
                             wallpaper.id === 'unsplash1' ? STRINGS.naturalLandscape :
                             wallpaper.id === 'unsplash2' ? STRINGS.cityNight :
                             STRINGS.abstractArt}
                    >
                      {wallpaper.id === 'none' && (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          {STRINGS.noWallpaper}
                        </div>
                      )}
                    </Button>
                  ))}
                </div>

                {/* 自定义壁纸 */}
                <div className="mt-4 space-y-3">
                  {/* 本地上传壁纸 */}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWallpaperUpload}
                      className="hidden"
                      id="wallpaper-upload"
                    />
                    <label
                      htmlFor="wallpaper-upload"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    >
                      📁 {STRINGS.uploadLocalImage}
                    </label>
                  </div>

                  {/* 上传壁纸预览 */}
                  {uploadedWallpaper && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-16 h-10 rounded border border-gray-300 dark:border-border bg-cover bg-center"
                        style={{ backgroundImage: `url(${uploadedWallpaper})` }}
                      />
                      <span className="text-xs text-muted-foreground">{STRINGS.apply}</span>
                    </div>
                  )}

                  {/* 自定义壁纸URL */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customWallpaperUrl}
                      onChange={(e) => setCustomWallpaperUrl(e.target.value)}
                      placeholder={STRINGS.customWallpaperUrl}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                    <Button
                      onClick={handleCustomWallpaperApply}
                      disabled={!customWallpaperUrl.trim()}
                      size="sm"
                    >
                      {STRINGS.apply}
                    </Button>
                  </div>
                </div>
              </div>

              {/* 图标大小 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.iconSize}</h3>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <Button
                      key={size}
                      onClick={() => handleIconSizeChange(size as 'small' | 'medium' | 'large')}
                      variant={config.theme.iconSize === size ? 'default' : 'secondary'}
                      size="sm"
                    >
                      {size === 'small' ? STRINGS.small : size === 'medium' ? STRINGS.medium : STRINGS.large}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 图标间距 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.gridSpacing}:</h3>
                {/* 垂直间距 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">{STRINGS.verticalSpacing}:</span>
                    <span className="text-xs text-muted-foreground">{config.theme.gridSpacing}px</span>
                  </div>
                  <Slider
                    value={[config.theme.gridSpacing]}
                    onValueChange={(value) => handleGridSpacingChange(value[0])}
                    min={1}
                    max={32}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1px</span>
                    <span>32px</span>
                  </div>
                </div>
                {/* 水平间距 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground">{STRINGS.horizontalSpacing}:</span>
                    <span className="text-xs text-muted-foreground">{config.theme.gridColumnSpacing}px</span>
                  </div>
                  <Slider
                    value={[config.theme.gridColumnSpacing]}
                    onValueChange={(value) => handleGridColumnSpacingChange(value[0])}
                    min={1}
                    max={32}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1px</span>
                    <span>32px</span>
                  </div>
                </div>
              </div>

              {/* 字体颜色设置 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.fontColor}</h3>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {/* 预设颜色块（11个） */}
                  {[
                    { color: '#000000', name: STRINGS.black },
                    { color: '#ffffff', name: STRINGS.white },
                    { color: '#374151', name: STRINGS.darkGray },
                    { color: '#9ca3af', name: STRINGS.lightGray },
                    { color: '#ef4444', name: STRINGS.red },
                    { color: '#f59e0b', name: STRINGS.orange },
                    { color: '#10b981', name: STRINGS.green },
                    { color: '#3b82f6', name: STRINGS.blue },
                    { color: '#8b5cf6', name: STRINGS.purple },
                    { color: '#ec4899', name: STRINGS.pink },
                    { color: '#06b6d4', name: STRINGS.cyan }
                  ].map(({ color, name }) => (
                    <Button
                      key={color}
                      variant={config.theme.fontColor === color ? 'default' : 'outline'}
                      onClick={() => handleFontColorChange(color)}
                      className="w-8 h-8 p-0"
                      style={{ backgroundColor: color }}
                      title={name}
                    />
                  ))}

                  {/* 调色盘按钮 */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      const colorInput = document.getElementById('font-color-picker') as HTMLInputElement;
                      if (colorInput) {
                        colorInput.click();
                      }
                    }}
                    className="w-8 h-8 p-0 bg-linear-to-br from-red-400 via-purple-400 to-blue-400 flex items-center justify-center text-white text-sm"
                    title={STRINGS.customColor}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                  </Button>

                  {/* 隐藏的颜色选择器 */}
                  <input
                    id="font-color-picker"
                    type="color"
                    className="hidden"
                    onChange={(e) => handleFontColorChange(e.target.value)}
                  />
                </div>

                {/* 自定义颜色输入 */}
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.theme.fontColor || '#000000'}
                    onChange={(e) => handleFontColorChange(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.theme.fontColor || ''}
                    onChange={(e) => handleFontColorChange(e.target.value)}
                    placeholder={STRINGS.hexColorPlaceholder}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                  />
                  <Button
                    onClick={() => handleFontColorChange('')}
                    variant="secondary"
                    size="sm"
                  >
                    {STRINGS.resetColor}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 搜索设置 */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.searchEngine}</h3>
                <Select
                  value={config.searchEngine}
                  onValueChange={handleSearchEngineChange}
                >
                  <SelectTrigger className="w-full" id="search-engine-select">
                    <SelectValue placeholder={STRINGS.searchEngine} />
                  </SelectTrigger>
                  <SelectContent>
                    {SEARCH_ENGINES.map(engine => (
                      <SelectItem key={engine.id} value={engine.url}>
                        {engine.name === '百度' ? STRINGS.baidu : engine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 自定义搜索引擎 */}
                <div className="pt-4 border-t border-gray-200 dark:border-border mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">{STRINGS.customSearchEngineUrl}</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSearchEngine}
                      onChange={(e) => setCustomSearchEngine(e.target.value)}
                      placeholder={STRINGS.customSearchEngineUrl}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                    <Button
                      onClick={handleCustomSearchEngineApply}
                      disabled={!customSearchEngine.trim()}
                      size="sm"
                    >
                      {STRINGS.apply}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 数据管理 */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* 存储信息区块 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.storageUsage}</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{STRINGS.totalSize}</p>
                    <p className="text-lg font-semibold text-foreground">{storageInfo.totalSize}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{STRINGS.appCount}</p>
                    <p className="text-lg font-semibold text-foreground">{storageInfo.iconCount}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{STRINGS.folderCount}</p>
                    <p className="text-lg font-semibold text-foreground">{storageInfo.folderCount}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{STRINGS.pageCount}</p>
                    <p className="text-lg font-semibold text-foreground">{storageInfo.pageCount}</p>
                  </div>
                </div>
                {/* 数据操作图标按钮 */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={onExport}
                    variant="secondary"
                    size="icon"
                    title={STRINGS.exportConfig}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </Button>
                  <Button
                    onClick={handleImportConfig}
                    variant="secondary"
                    size="icon"
                    title={STRINGS.importConfig}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </Button>
                  <Button
                    onClick={() => setShowResetConfirm(true)}
                    variant="destructive"
                    size="icon"
                    title={STRINGS.resetAllData}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                  </Button>
                </div>
              </div>

              {/* 备份管理 */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.backupManagement}</h3>

                {/* 顶部操作按钮：新增备份 / 从文件导入 */}
                <div className="flex gap-2 mb-3">
                  <Button onClick={handleCreateBackup} size="sm" className="flex-1">
                    {STRINGS.createBackup}
                  </Button>
                  <Button onClick={handleImportBackupClick} size="sm" variant="outline" className="flex-1">
                    {STRINGS.importBackup}
                  </Button>
                  <input
                    ref={importBackupFileInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImportBackupFile(file);
                    }}
                  />
                </div>

                {/* 备份存储使用情况 */}
                <div className="mb-4 p-3 bg-muted rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground">{STRINGS.backupStorageUsed}</span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatFileSize(backupStorageInfo.totalSize)} / {formatFileSize(backupStorageInfo.maxSize)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        backupStorageInfo.isNearLimit ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(backupStorageInfo.usagePercent, 100)}%` }}
                    />
                  </div>
                  {backupStorageInfo.isNearLimit && (
                    <p className="text-xs text-red-500 mt-2">⚠️ {STRINGS.backupStorageLimit}</p>
                  )}
                </div>

                {/* 备份列表 */}
                <div className="space-y-2">
                  {backups.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{STRINGS.noBackups}</p>
                  ) : (
                    <>
                      {backups.map((backup) => (
                        <div key={backup.id} className="p-3 bg-background border border-border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-3 min-w-0">
                              {renamingBackupId === backup.id ? (
                                <div className="flex gap-2 items-center flex-wrap">
                                  <input
                                    type="text"
                                    value={renamingValue}
                                    onChange={(e) => setRenamingValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveRename();
                                      if (e.key === 'Escape') handleCancelRename();
                                    }}
                                    className="text-sm font-medium text-foreground border rounded px-2 py-1 flex-1 min-w-30"
                                    placeholder={STRINGS.backupNamePlaceholder || '备份名称'}
                                    autoFocus
                                  />
                                  <Button size="sm" onClick={handleSaveRename}>
                                    {STRINGS.save || '保存'}
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelRename}>
                                    {STRINGS.cancel || '取消'}
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {backup.name || formatBackupTime(backup.timestamp, currentLanguage)}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatBackupTime(backup.timestamp, currentLanguage)} | {STRINGS.backupVersion}: {backup.version} | {STRINGS.backupSize}: {formatFileSize(calculateBackupSize(backup))}
                                  </p>
                                </>
                              )}
                            </div>
                            {/* 操作按钮：重命名 / 导出 / 恢复 / 删除 */}
                            <div className="flex items-center gap-1 shrink-0">
                              {renamingBackupId !== backup.id && (
                                <Button
                                  size="icon-sm"
                                  variant="outline"
                                  onClick={() => handleStartRename(backup)}
                                  title={STRINGS.renameBackup || '重命名'}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </Button>
                              )}
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => handleExportBackup(backup)}
                                title={STRINGS.exportBackup}
                              >
                                {/* 向下箭头 - 导出 */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => handleRestoreBackup(backup.id)}
                                title={STRINGS.restoreBackup}
                              >
                                {/* 向上箭头 - 恢复/导入 */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21V9"/><path d="M7 14l5-5 5 5"/><path d="M5 3h14"/></svg>
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="destructive"
                                onClick={() => setShowDeleteConfirm(backup.id)}
                                title={STRINGS.deleteBackup}
                              >
                                {/* 垃圾桶 - 删除 */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* 清空所有备份按钮 */}
                      <Button
                        onClick={() => setShowClearAllConfirm(true)}
                        variant="secondary"
                        className="w-full mt-2"
                      >
                        {STRINGS.clearAllBackups}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* 服务器配置 */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.serverConfig}</h3>
                <div className="space-y-3">
                  {/* 服务器配置 URL */}
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">{STRINGS.serverConfigUrl}</label>
                    <input
                      type="text"
                      value={serverConfigUrl}
                      onChange={(e) => setServerConfigUrl(e.target.value)}
                      placeholder={STRINGS.serverConfigUrlPlaceholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-muted-foreground">{STRINGS.serverConfigUrlDesc}</p>
                  </div>

                  {/* 配置按钮 */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleTestServerConfig}
                      disabled={!serverConfigUrl.trim() || serverConfigTesting}
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                    >
                      {serverConfigTesting ? STRINGS.serverConfigTesting : STRINGS.serverConfigTestConnection}
                    </Button>
                    {serverConfigUrl && (
                      <Button
                        onClick={() => setServerConfigUrl('')}
                        variant="ghost"
                        size="sm"
                      >
                        {STRINGS.serverConfigClearUrl}
                      </Button>
                    )}
                  </div>

                  {/* 状态信息 */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{STRINGS.serverConfigStatus}:</span>
                    {serverConfigUrl ? (
                      <>
                        <span className="text-green-600">{STRINGS.serverConfigConfigured}</span>
                        {hasLocalConfig && (
                          <span className="text-amber-600">({STRINGS.serverConfigHasLocal})</span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">{STRINGS.serverConfigNotConfigured}</span>
                    )}
                  </div>

                  {/* 云端同步开关 */}
                  {serverConfigUrl && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{STRINGS.serverConfigSync}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{STRINGS.serverConfigSyncDesc}</p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={syncEnabled}
                        onClick={() => handleToggleSync(!syncEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          syncEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            syncEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* 手动同步按钮 */}
                  {serverConfigUrl && (
                    <Button
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      {isSyncing ? '🔄 Syncing...' : '🔄 ' + (STRINGS.serverConfigSyncSuccess || 'Sync Now')}
                    </Button>
                  )}

                  {/* 应用服务器配置按钮 */}
                  {serverConfigUrl && (
                    <Button
                      onClick={handleApplyServerConfig}
                      disabled={serverConfigApplying}
                      variant="outline"
                      className="w-full justify-center"
                    >
                      🔄 {STRINGS.serverConfigApply}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 语言设置 */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.language}</h3>
                <div className="space-y-2">
                  <Button
                    variant={currentLanguage === 'zh' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('zh')}
                    className="w-full justify-between px-4 py-3 h-auto"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">中文</span>
                      <p className="text-xs opacity-70 mt-1">Chinese (Simplified)</p>
                    </div>
                    {currentLanguage === 'zh' && <span>✓</span>}
                  </Button>

                  <Button
                    variant={currentLanguage === 'en' ? 'default' : 'outline'}
                    onClick={() => handleLanguageChange('en')}
                    className="w-full justify-between px-4 py-3 h-auto"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">English</span>
                      <p className="text-xs opacity-70 mt-1">English</p>
                    </div>
                    {currentLanguage === 'en' && <span>✓</span>}
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    💡 {STRINGS.languageSwitchTip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 操作模式设置 */}
          {activeTab === 'operation' && (
            <div className="space-y-6">
              <OperationModeSelector
                operationMode={config.operationMode || {
                  mode: 'hybrid',
                  openMethod: 'click',
                  menuTrigger: 'both',
                  showAddButton: true
                }}
                onChange={handleOperationModeChange}
                language={currentLanguage}
              />
            </div>
          )}
        </div>
      </div>

      {/* 重置确认对话框 */}
      {showResetConfirm && (
        <Modal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          title={STRINGS.resetConfirmTitle}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {STRINGS.resetConfirmMessage}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowResetConfirm(false)}
                variant="secondary"
                size="sm"
              >
                {STRINGS.cancel}
              </Button>
              <Button
                onClick={handleResetAllData}
                variant="destructive"
                size="sm"
              >
                {STRINGS.resetConfirmTitle}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 删除备份确认对话框 */}
      {showDeleteConfirm && (
        <Modal
          isOpen={!!showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(null)}
          title={STRINGS.deleteBackup}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {STRINGS.confirmDeleteBackup}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                variant="secondary"
                size="sm"
              >
                {STRINGS.cancel}
              </Button>
              <Button
                onClick={() => showDeleteConfirm && handleDeleteBackup(showDeleteConfirm)}
                variant="destructive"
                size="sm"
              >
                {STRINGS.deleteBackup}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 清空所有备份确认对话框 */}
      {showClearAllConfirm && (
        <Modal
          isOpen={showClearAllConfirm}
          onClose={() => setShowClearAllConfirm(false)}
          title={STRINGS.clearAllBackups}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {STRINGS.confirmClearAllBackups}
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowClearAllConfirm(false)}
                variant="secondary"
                size="sm"
              >
                {STRINGS.cancel}
              </Button>
              <Button
                onClick={handleClearAllBackups}
                variant="destructive"
                size="sm"
              >
                {STRINGS.clearAllBackups}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
