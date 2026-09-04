import { afterEach, describe, expect, it, vi } from 'vitest';

import { getDefaultConfig } from './defaults';
import {
  MAX_BACKUPS,
  MAX_TOTAL_SIZE,
  calculateBackupSize,
  calculateTotalSize,
  clearAllBackups,
  createBackup,
  deleteBackup,
  formatBackupTime,
  formatFileSize,
  getBackupList,
  getBackupStorageInfo,
  getLatestBackup,
  restoreBackup,
  saveBackup,
  updateBackup,
} from './backup';

/**
 * backup.ts 通过 `typeof window === 'undefined'` 判断运行环境，
 * Node 单测环境下用内存 Map 模拟 localStorage。
 */
function installStorageStub(): Map<string, string> {
  const store = new Map<string, string>();
  const localStorageStub: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = {
    getItem: (key: string) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
  vi.stubGlobal('localStorage', localStorageStub);
  vi.stubGlobal('window', {});
  return store;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('无浏览器环境时的行为', () => {
  it('读写接口直接 no-op 不抛错', () => {
    expect(getBackupList()).toEqual([]);
    expect(restoreBackup('missing')).toBeNull();
    expect(getLatestBackup()).toBeNull();
    expect(() => saveBackup(createBackup(getDefaultConfig()))).not.toThrow();
    expect(() => deleteBackup('missing')).not.toThrow();
    expect(() => clearAllBackups()).not.toThrow();
    expect(updateBackup('missing', { name: 'x' })).toBeNull();
  });
});

describe('createBackup', () => {
  it('生成合法的备份条目', () => {
    const backup = createBackup(getDefaultConfig());
    expect(backup.id.startsWith('hub-nav-backup-')).toBe(true);
    expect(new Date(backup.timestamp).toString()).not.toBe('Invalid Date');
    expect(backup.version).toBe(getDefaultConfig().version);
    expect(JSON.parse(backup.data)).toMatchObject({ version: getDefaultConfig().version });
  });
});

describe('备份持久化流程', () => {
  it('保存后可读取并恢复', () => {
    installStorageStub();
    const backup = createBackup(getDefaultConfig());
    saveBackup(backup);

    const list = getBackupList();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(backup.id);
    expect(restoreBackup(backup.id)).toBe(backup.data);
    expect(getLatestBackup()?.id).toBe(backup.id);
  });

  it('新备份排在列表最前面', () => {
    installStorageStub();
    const first = createBackup(getDefaultConfig());
    saveBackup(first);
    const second = createBackup(getDefaultConfig());
    saveBackup(second);

    expect(getBackupList().map((b) => b.id)).toEqual([second.id, first.id]);
  });

  it('超过最大备份数时淘汰最旧备份', () => {
    installStorageStub();
    const ids: string[] = [];
    for (let i = 0; i < MAX_BACKUPS + 2; i += 1) {
      const backup = createBackup(getDefaultConfig());
      ids.push(backup.id);
      saveBackup(backup);
    }
    const list = getBackupList();
    expect(list).toHaveLength(MAX_BACKUPS);
    // 最旧的两个已被淘汰
    expect(list.map((b) => b.id)).not.toContain(ids[0]);
    expect(list.map((b) => b.id)).not.toContain(ids[1]);
  });

  it('删除与清空备份', () => {
    installStorageStub();
    const backup = createBackup(getDefaultConfig());
    saveBackup(backup);
    deleteBackup(backup.id);
    expect(getBackupList()).toHaveLength(0);
    expect(restoreBackup(backup.id)).toBeNull();

    saveBackup(createBackup(getDefaultConfig()));
    clearAllBackups();
    expect(getBackupList()).toHaveLength(0);
  });

  it('重命名备份', () => {
    installStorageStub();
    const backup = createBackup(getDefaultConfig());
    saveBackup(backup);
    const updated = updateBackup(backup.id, { name: '手动备份' });
    expect(updated?.name).toBe('手动备份');
    expect(getBackupList()[0].name).toBe('手动备份');
  });
});

describe('备份大小与时间格式化', () => {
  it('calculateBackupSize / calculateTotalSize', () => {
    const backup = createBackup(getDefaultConfig());
    expect(calculateBackupSize(backup)).toBeGreaterThan(0);
    expect(calculateTotalSize([backup, backup])).toBe(calculateBackupSize(backup) * 2);
  });

  it('formatFileSize', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB');
  });

  it('formatBackupTime 中英文', () => {
    const now = new Date().toISOString();
    expect(formatBackupTime(now, 'zh')).toBe('刚刚');
    expect(formatBackupTime(now, 'en')).toBe('Just now');

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatBackupTime(threeDaysAgo, 'zh')).toBe('3 天前');
    expect(formatBackupTime(threeDaysAgo, 'en')).toBe('3 days ago');
  });

  it('getBackupStorageInfo 返回用量信息', () => {
    installStorageStub();
    saveBackup(createBackup(getDefaultConfig()));
    const info = getBackupStorageInfo();
    expect(info.backupCount).toBe(1);
    expect(info.totalSize).toBeGreaterThan(0);
    expect(info.maxSize).toBe(MAX_TOTAL_SIZE);
    expect(info.isNearLimit).toBe(false);
  });
});
