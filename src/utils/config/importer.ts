/**
 * 配置导入功能
 * 
 * 从 JSON 字符串导入配置，支持版本迁移、数据验证和备份
 */

import { migrationManager } from './migrations';
import { CURRENT_VERSION } from './version';
import { applyDefaults } from './defaults';
import { validateConfig } from './validator';
import { createBackup, saveBackup } from './backup';
import { validateExportedFormat } from './exporter';
import type { UserConfig, ExportedConfig } from './types';

/**
 * 导入错误代码
 */
type ImportErrorCode =
  | 'INVALID_FORMAT'      // 无效的JSON格式
  | 'INVALID_VERSION'     // 不支持的版本
  | 'MIGRATION_FAILED'    // 迁移失败
  | 'VALIDATION_FAILED'   // 验证失败
  | 'STORAGE_ERROR'       // 存储错误
  | 'UNKNOWN';            // 未知错误

/**
 * 导入错误接口
 */
export interface ImportError {
  code: ImportErrorCode;
  message: string;
  details?: unknown;
}

/**
 * 导入警告代码
 */
type ImportWarningCode =
  | 'UNKNOWN_FIELDS'         // 未知字段
  | 'MISSING_OPTIONAL_FIELDS' // 缺少可选字段
  | 'DEPRECATED_FIELDS'      // 已弃用字段
  | 'MIGRATION_APPLIED';     // 应用了迁移

/**
 * 导入警告接口
 */
export interface ImportWarning {
  code: ImportWarningCode;
  message: string;
  field?: string;
}

/**
 * 迁移信息接口
 */
export interface MigrationInfo {
  fromVersion: string;
  toVersion: string;
  steps: string[];
}

/**
 * 导入结果接口
 */
export interface ImportResult {
  success: boolean;
  data?: UserConfig;
  error?: ImportError;
  warnings: ImportWarning[];
  migration?: MigrationInfo;
  backupId?: string;
}

/**
 * 从 JSON 字符串导入配置
 * 
 * 导入流程：
 * 1. 解析 JSON
 * 2. 检测格式（标准导出格式或旧格式）
 * 3. 检查版本，如需迁移则执行迁移
 * 4. 填充默认值
 * 5. 验证数据完整性
 * 6. 返回结果
 * 
 * @param jsonString - JSON 字符串
 * @returns 导入结果
 */
export function importFromJson(jsonString: string): ImportResult {
  const warnings: ImportWarning[] = [];
  let backupId: string | undefined;

  try {
    // 1. 解析 JSON
    const parsed = JSON.parse(jsonString);

    let configData: UserConfig;
    let migration: MigrationInfo | undefined;

    // 2. 检测格式并提取配置数据
    if (validateExportedFormat(parsed)) {
      // 标准导出格式
      const exported = parsed as ExportedConfig;
      configData = exported.data;
      migration = {
        fromVersion: exported.data.version || '0.1.0',
        toVersion: CURRENT_VERSION,
        steps: []
      };
    } else {
      // 旧格式或直接的用户配置
      configData = parsed as UserConfig;
    }

    // 3. 检查是否需要迁移
    if (configData.version !== CURRENT_VERSION) {
      // 在迁移前备份当前配置
      const currentConfig = loadCurrentConfig();
      if (currentConfig) {
        const backup = createBackup(currentConfig);
        saveBackup(backup);
        backupId = backup.id;
        warnings.push({
          code: 'MIGRATION_APPLIED',
          message: `已创建备份: ${backup.timestamp}`
        });
      }

      // 执行迁移
      const migrationResult = migrationManager.migrateToVersion(
        configData,
        CURRENT_VERSION
      );

      if (!migrationResult.success) {
        return {
          success: false,
          error: {
            code: 'MIGRATION_FAILED',
            message: `版本迁移失败：${migrationResult.error || '配置文件版本不兼容'}`
          },
          warnings,
          migration
        };
      }

      configData = migrationResult.data!;
      if (migration) {
        migration.steps = migrationResult.migrationsApplied;
      }
    }

    // 4. 填充默认值
    configData = applyDefaults(configData);

    // 5. 验证数据完整性
    const validation = validateConfig(configData);

    if (!validation.valid) {
      // 提取第一个错误作为主要错误信息
      const firstError = validation.errors[0];
      const errorMessage = firstError 
        ? `数据验证失败：${firstError.message}（字段：${firstError.path}）`
        : '数据验证失败，配置文件结构不完整';

      return {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: errorMessage,
          details: validation.errors
        },
        warnings: [...warnings, ...validation.warnings.map(w => ({
          code: 'UNKNOWN_FIELDS' as ImportWarningCode,
          message: w.message,
          field: w.path
        }))],
        migration,
        backupId
      };
    }

    // 添加验证警告
    warnings.push(...validation.warnings.map(w => ({
      code: 'UNKNOWN_FIELDS' as ImportWarningCode,
      message: w.message,
      field: w.path
    })));

    // 6. 返回成功结果
    return {
      success: true,
      data: configData,
      warnings,
      migration,
      backupId
    };

  } catch (error) {
    // 提供更友好的错误信息
    let errorCode: ImportErrorCode = 'UNKNOWN';
    let errorMessage = '导入失败';

    if (error instanceof SyntaxError) {
      // JSON 解析错误
      errorCode = 'INVALID_FORMAT';
      errorMessage = '配置文件格式错误，请检查 JSON 格式是否正确';
    } else if (error instanceof Error) {
      // 其他已知错误
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('version') || errorMsg.includes('migrat')) {
        errorCode = 'MIGRATION_FAILED';
        errorMessage = '版本迁移失败，配置文件可能不兼容';
      } else if (errorMsg.includes('validat')) {
        errorCode = 'VALIDATION_FAILED';
        errorMessage = '数据验证失败，配置文件结构不完整';
      } else {
        errorCode = 'UNKNOWN';
        errorMessage = `导入失败: ${error.message}`;
      }
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage
      },
      warnings
    };
  }
}

/**
 * 加载当前配置（用于备份）
 * @returns 当前配置，无则返回 null
 */
function loadCurrentConfig(): UserConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('hub-nav-config');
    if (!stored) return null;
    return JSON.parse(stored) as UserConfig;
  } catch {
    return null;
  }
}
