/**
 * 配置模块统一导出
 * 
 * 集中导出所有配置相关的工具函数和类型
 */

// 类型定义
export type {
  Version,
  ExportMeta,
  ExportedConfig,
  IconExtensions,
  IconItem,
  FolderExtensions,
  FolderItem,
  OperationModeExtensions,
  OperationModeSettings,
  ThemeExtensions,
  ThemeSettings,
  LayoutExtensions,
  LayoutSettings,
  PageExtensions,
  Page,
  UserConfig
} from './types';

// 版本管理
export {
  CURRENT_VERSION,
  VERSION_HISTORY,
  parseVersion,
  compareVersions,
  isVersionCompatible,
  getNextMinorVersion,
  getNextMajorVersion,
  versionsEqual,
  formatVersionDescription
} from './version';

// 默认值填充
export {
  fillIconDefaults,
  fillFolderDefaults,
  fillPageDefaults,
  fillThemeDefaults,
  fillLayoutDefaults,
  fillOperationModeDefaults,
  getDefaultConfig,
  fillConfigDefaults,
  applyDefaults
} from './defaults';

// 数据验证
export type {
  ValidationError,
  ValidationWarning,
  ValidationResult
} from './validator';
export { validateConfig } from './validator';

// 备份机制
export type { BackupEntry } from './backup';
export {
  createBackup,
  saveBackup,
  getBackupList,
  restoreBackup,
  deleteBackup,
  clearAllBackups,
  getLatestBackup,
  formatBackupTime
} from './backup';

// 迁移管理
export type { Migration, MigrationResult } from './migrations';
export { migrationManager } from './migrations';

// 导入导出
export { exportToJson, validateExportedFormat } from './exporter';
export type { ImportError, ImportWarning, MigrationInfo, ImportResult } from './importer';
export { importFromJson } from './importer';
