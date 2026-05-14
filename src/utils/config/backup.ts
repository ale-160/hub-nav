/**
 * 配置备份与回滚机制
 * 
 * 在导入新配置前自动备份当前配置，支持失败时回滚
 */

import type { UserConfig } from './types';

const BACKUP_PREFIX = 'hub-nav-backup-';
const MAX_BACKUPS = 5; // 最多保留5个备份
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 最大总大小 5MB
const WARNING_THRESHOLD = 4.5 * 1024 * 1024; // 预警阈值 4.5MB

/**
 * 备份条目接口
 */
export interface BackupEntry {
  id: string;        // 备份ID
  timestamp: string; // 备份时间 (ISO 8601)
  version: string;   // 配置版本
  data: string;      // 配置JSON字符串
}

/**
 * 生成备份ID
 * @returns 唯一的备份ID
 */
function createBackupId(): string {
  return `${BACKUP_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
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
 * 获取备份列表
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
      console.error('读取备份列表失败:', error);
    }
    return [];
  }
}

/**
 * 恢复指定备份
 * @param backupId - 备份ID
 * @returns 恢复的配置，失败返回 null
 */
export function restoreBackup(backupId: string): UserConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(backupId);
    if (!stored) return null;
    return JSON.parse(stored) as UserConfig;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('恢复备份失败:', error);
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
    
    // 删除所有备份数据
    backups.forEach(b => {
      localStorage.removeItem(b.id);
    });

    // 清空备份列表
    localStorage.removeItem('hub-nav-backups');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('清理备份失败:', error);
    }
  }
}

/**
 * 获取最新的备份
 * @returns 最新的备份条目，无备份返回 null
 */
export function getLatestBackup(): BackupEntry | null {
  const backups = getBackupList();
  return backups.length > 0 ? backups[0] : null;
}

/**
 * 格式化备份时间为可读字符串
 * @param timestamp - ISO 8601 时间戳
 * @returns 格式化的时间描述
 */
export function formatBackupTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return '刚刚';
    } else if (diffMins < 60) {
      return `${diffMins} 分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours} 小时前`;
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
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
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}

/**
 * 获取备份存储使用信息
 * @returns 存储使用信息
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
    backupCount: backups.length
  };
}
