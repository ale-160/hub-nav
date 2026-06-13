import type { UserConfig } from './types';

/**
 * 备份条目接口
 */
export interface BackupEntry {
  id: string;        // 备份ID
  name?: string;     // 备份名称（用户可自定义）
  timestamp: string; // 备份时间 (ISO 8601)
  version: string;   // 配置版本
  data: string;      // 配置JSON字符串
}

/**
 * 生成备份ID
 * @returns 唯一的备份ID
 */
function createBackupId(): string {
  return `hub-nav-backup-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * 创建备份条目
 * @param config - 要备份的配置
 * @returns 备份条目
 */
export function createBackup(config: UserConfig): BackupEntry {
  return {
    id: createBackupId(),
    timestamp: new Date().toISOString(),
    version: config.version || 'unknown',
    data: JSON.stringify(config)
  };
}

/**
 * 保存备份到 localStorage
 * @param backup - 备份条目
 */
export function saveBackup(backup: BackupEntry): void {
  if (typeof window === 'undefined') return;

  try {
    const backups = getBackupList();

    // 检查总大小是否超限
    const currentTotalSize = calculateTotalSize(backups);
    const newSize = new Blob([backup.data]).size;

    if (currentTotalSize + newSize > MAX_TOTAL_SIZE) {
      // 如果超限，删除最旧的备份直到有足够空间
      while (backups.length > 0 && currentTotalSize + newSize > MAX_TOTAL_SIZE) {
        const oldest = backups.pop();
        if (oldest) {
          localStorage.removeItem(oldest.id);
        }
      }
    }

    // 将新备份添加到列表开头
    backups.unshift(backup);

    // 如果超过最大备份数，删除最旧的备份
    if (backups.length > MAX_BACKUPS) {
      const toRemove = backups.splice(MAX_BACKUPS);
      toRemove.forEach(b => {
        localStorage.removeItem(b.id);
      });
    }

    // 保存备份列表索引
    localStorage.setItem('hub-nav-backups', JSON.stringify(backups));

    // 保存备份数据
    localStorage.setItem(backup.id, backup.data);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('保存备份失败:', error);
    }
  }
}

/**
 * 更新备份条目信息（用于重命名等）
 * @param id - 备份ID
 * @param updates - 要更新的字段
 * @returns 更新后的备份条目；如果未找到返回 null
 */
export function updateBackup(id: string, updates: Partial<Omit<BackupEntry, 'id' | 'data'>>): BackupEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const backups = getBackupList();
    const index = backups.findIndex(b => b.id === id);
    if (index < 0) return null;
    backups[index] = { ...backups[index], ...updates };
    localStorage.setItem('hub-nav-backups', JSON.stringify(backups));
    return backups[index];
  } catch {
    return null;
  }
}

/**
 * 从 localStorage 加载所有备份列表
 * @returns 备份条目列表
 */
export function getBackupList(): BackupEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('hub-nav-backups');
    if (!stored) return [];
    return JSON.parse(stored) as BackupEntry[];
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('加载备份列表失败:', error);
    }
    return [];
  }
}
/**
 * 从备份恢复配置
 * 仅返回备份数据的 JSON 字符串，由调用方通过 ConfigManager.importConfig 走标准导入流程
 * （含版本迁移、验证、默认值填充等），与"从文件导入"完全一致。
 * @param backupId - 备份ID
 * @returns 备份数据的 JSON 字符串；如果失败返回 null
 */
export function restoreBackup(backupId: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(backupId);
    if (!stored) return null;
    return stored;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('读取备份失败:', error);
    }
    return null;
  }
}

/**
 * 删除指定备份
 * @param backupId - 备份ID
 */
export function deleteBackup(backupId: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(backupId);

    // 从列表中移除
    const backups = getBackupList().filter(b => b.id !== backupId);
    localStorage.setItem('hub-nav-backups', JSON.stringify(backups));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('删除备份失败:', error);
    }
  }
}

/**
 * 清理所有备份
 */
export function clearAllBackups(): void {
  if (typeof window === 'undefined') return;

  try {
    const backups = getBackupList();
    backups.forEach(b => localStorage.removeItem(b.id));
    localStorage.removeItem('hub-nav-backups');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('清理备份失败:', error);
    }
  }
}

/**
 * 获取最新的备份
 * @returns 最新备份条目，如果没有备份返回 null
 */
export function getLatestBackup(): BackupEntry | null {
  const backups = getBackupList();
  return backups.length > 0 ? backups[0] : null;
}
/**
 * 格式化备份时间为友好字符串
 * @param timestamp - ISO 8601 时间戳
 * @param language - 语言 ('zh' | 'en')
 * @returns 人类可读的时间字符串
 */
export function formatBackupTime(timestamp: string, language: string = 'zh'): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (language === 'en') {
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-US');
    } else {
      if (diffMinutes < 1) return '刚刚';
      if (diffMinutes < 60) return `${diffMinutes} 分钟前`;
      if (diffHours < 24) return `${diffHours} 小时前`;
      if (diffDays < 7) return `${diffDays} 天前`;
      return date.toLocaleDateString('zh-CN');
    }
  } catch {
    return timestamp;
  }
}

/**
 * 计算单个备份的大小（字节）
 * @param backup - 备份条目
 * @returns 备份大小（字节）
 */
export function calculateBackupSize(backup: BackupEntry): number {
  return new Blob([backup.data]).size;
}

/**
 * 计算所有备份的总大小（字节）
 * @param backups - 备份列表
 * @returns 总大小（字节）
 */
export function calculateTotalSize(backups: BackupEntry[]): number {
  return backups.reduce((total, backup) => total + calculateBackupSize(backup), 0);
}

/**
 * 格式化文件大小为可读字符串
 * @param bytes - 字节数
 * @returns 格式化的大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/**
 * 获取备份存储信息
 * @returns 包含总大小、上限、使用率、是否接近限制、备份数量的信息对象
 */
export function getBackupStorageInfo(): {
  totalSize: number;
  maxSize: number;
  usagePercent: number;
  isNearLimit: boolean;
  backupCount: number;
} {
  const backups = getBackupList();
  const totalSize = calculateTotalSize(backups);
  const usagePercent = (totalSize / MAX_TOTAL_SIZE) * 100;

  return {
    totalSize,
    maxSize: MAX_TOTAL_SIZE,
    usagePercent,
    isNearLimit: totalSize >= WARNING_THRESHOLD,
    backupCount: backups.length,
  };
}

/**
 * 将备份导出为可下载的 JSON 文件
 * @param backup - 备份条目
 */
export function exportBackupAsFile(backup: BackupEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const blob = new Blob(
      [JSON.stringify({ id: backup.id, name: backup.name, timestamp: backup.timestamp, version: backup.version, data: backup.data }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = backup.timestamp.replace(/[:T]/g, '-').slice(0, 19);
    a.download = `hub-nav-backup-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('导出备份失败:', error);
    }
  }
}

/**
 * 从 JSON 文件导入备份（仅保存到备份列表，不自动生效）
 * 支持三种格式：
 * 1. 标准导出格式（含 _schema / _version / _meta / data）
 * 2. 备份条目格式（含 id / timestamp / version / data 字符串）
 * 3. 裸 UserConfig 对象
 * @param file - 上传的 .json 文件
 * @returns 解析后的备份条目；如果失败返回 null
 */
export function importBackupFromFile(file: File): Promise<BackupEntry | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = String(e.target?.result || '');
        const parsed = JSON.parse(text);

        let entry: BackupEntry;

        // 格式 1：标准导出格式（_schema: "hub-nav-config", _version, _meta, data）
        if (parsed._schema === 'hub-nav-config' && typeof parsed.data === 'object') {
          const version = parsed._version || parsed._meta?.schemaVersion || 'imported';
          const exportedAt = parsed._meta?.exportedAt || new Date().toISOString();
          entry = {
            id: `hub-nav-backup-${Date.now()}-import`,
            name: parsed._meta?.previousVersion ? `v${parsed._meta.previousVersion}` : undefined,
            timestamp: exportedAt,
            version,
            data: JSON.stringify(parsed.data),
          };
        }
        // 格式 2：备份条目格式（data 是字符串）
        else if (typeof parsed.data === 'string') {
          entry = {
            id: parsed.id || `hub-nav-backup-${Date.now()}-import`,
            name: parsed.name,
            timestamp: parsed.timestamp || new Date().toISOString(),
            version: parsed.version || 'imported',
            data: parsed.data,
          };
        }
        // 格式 3：裸 UserConfig 对象
        else {
          const version = parsed.version || 'imported';
          entry = {
            id: `hub-nav-backup-${Date.now()}-import`,
            timestamp: new Date().toISOString(),
            version,
            data: JSON.stringify(parsed),
          };
        }

        saveBackup(entry);
        resolve(entry);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

/**
 * 最大备份数（保留最新的 N 个）
 */
export const MAX_BACKUPS = 20;

/**
 * 所有备份的总大小上限（字节）— 4.5 MB（localStorage 通常约 5 MB）
 */
export const MAX_TOTAL_SIZE = 4.5 * 1024 * 1024;

/**
 * 警告阈值：达到此大小时提示用户（默认 4 MB）
 */
export const WARNING_THRESHOLD = 4 * 1024 * 1024;
