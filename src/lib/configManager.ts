/**
 * 配置管理器 - 用于管理用户配置的存储、加载、导入导出等功能
 */

// 重新导出类型定义（保持向后兼容）
export type {
  IconItem,
  FolderItem,
  OperationModeSettings,
  ThemeSettings,
  Page,
  UserConfig
} from '@/utils/config/types';

// 从新位置导入类型
import type {
  Page,
  UserConfig
} from '@/utils/config/types';

// 导入新的导入导出模块
import { exportToJson } from '@/utils/config/exporter';
import { importFromJson } from '@/utils/config/importer';

// 导入多语言支持
import { Language } from '@/data/i18n';

// 注册迁移函数（只需导入一次）
import '@/utils/config/migration-registry';

/**
 * 配置管理器类
 * 提供配置的保存、加载、导入导出等功能
 */
export class ConfigManager {
  private static readonly STORAGE_KEY = 'hub-nav-config';
  private static readonly DEBOUNCE_DELAY = 300;
  private static saveTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * 保存配置到 localStorage
   * 使用防抖机制，避免频繁保存
   * @param config - 用户配置对象
   * @throws 当 localStorage 空间不足或其他存储错误时抛出异常
   */
  static saveConfig(config: UserConfig): void {
    // 服务端环境不执行
    if (typeof window === 'undefined') {
      return;
    }

    // 清除之前的防抖定时器
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // 设置新的防抖定时器
    this.saveTimeout = setTimeout(() => {
      try {
        const jsonString = JSON.stringify(config);

        // 检查配置大小（localStorage 通常限制为 5MB）
        const sizeInBytes = new Blob([jsonString]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);

        // 如果配置超过 4.5MB，发出警告
        if (sizeInMB > 4.5) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`配置大小 (${sizeInMB.toFixed(2)}MB) 接近 localStorage 上限，可能导致保存失败`);
          }
        }

        localStorage.setItem(this.STORAGE_KEY, jsonString);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          throw new Error('localStorage 空间不足，无法保存配置。请尝试清理部分数据或导出备份后重置。');
        }
        throw new Error(`保存配置失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * 从 localStorage 加载配置
   * @returns 用户配置对象，如果解析失败或不存在则返回 null
   */
  static loadConfig(): UserConfig | null {
    // 服务端环境返回 null
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const config = JSON.parse(stored) as UserConfig;

      // 基础结构验证
      if (!this.isValidConfig(config)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('配置数据格式无效，返回 null');
        }
        return null;
      }

      // 向后兼容：如果没有 pages 字段，则创建默认页面并将所有根级元素放入第一页
      if (!config.pages || config.pages.length === 0) {
        const rootOrder = config.rootOrder || [];
        config.pages = [
          {
            id: 'page-1',
            name: '新页面',
            iconIds: [...rootOrder]
          },
          {
            id: 'page-2',
            name: '新页面',
            iconIds: []
          }
        ];
        // 保存更新后的配置
        this.saveConfig(config);
      }

      return config;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('加载配置失败:', error);
      }
      return null;
    }
  }

  /**
   * 导出配置为 JSON 字符串
   * @returns 配置的 JSON 字符串表示（包含元数据）
   */
  static exportConfig(): string {
    // 服务端环境返回空对象
    if (typeof window === 'undefined') {
      return '{}';
    }

    const config = this.loadConfig();
    if (!config) {
      throw new Error('没有可导出的配置数据');
    }

    // 使用新的导出模块，生成带元数据的格式
    return exportToJson(config);
  }

  /**
   * 从 JSON 字符串导入配置
   * @param json - 包含配置数据的 JSON 字符串
   * @returns 导入成功返回 true，失败返回 false
   */
  static importConfig(json: string): boolean {
    try {
      // 使用新的导入模块，自动处理版本迁移和验证
      const result = importFromJson(json);

      if (!result.success) {
        if (process.env.NODE_ENV === 'development') {
          console.error('导入配置失败:', result.error?.message);
        }
        return false;
      }

      // 保存导入的配置 - 绕过防抖，直接同步写入
      if (typeof window !== 'undefined' && result.data) {
        try {
          const jsonString = JSON.stringify(result.data);
          localStorage.setItem(this.STORAGE_KEY, jsonString);
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('导入配置保存失败:', error);
          }
          return false;
        }
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('导入配置失败:', error);
      }
      return false;
    }
  }

  /**
   * 验证配置对象的基本结构
   * @param config - 待验证的配置对象
   * @returns 配置有效返回 true，否则返回 false
   */
  private static isValidConfig(config: unknown): config is UserConfig {
    if (!config || typeof config !== 'object') {
      return false;
    }

    // 类型断言，确保我们可以安全地访问属性
    const configObj = config as Record<string, unknown>;

    // 检查必需字段，但允许部分字段缺失或使用默认值
    if (!configObj.layout || !configObj.theme || !Array.isArray(configObj.icons) || !Array.isArray(configObj.folders)) {
      return false;
    }

    // pages 是可选的，如果存在必须是数组
    if (configObj.pages !== undefined && !Array.isArray(configObj.pages)) {
      return false;
    }

    // rootOrder 是可选的，如果存在必须是数组
    if (configObj.rootOrder !== undefined && !Array.isArray(configObj.rootOrder)) {
      return false;
    }

    // 检查 layout 结构，允许部分字段缺失
    const layout = configObj.layout as Record<string, unknown>;
    if (layout.columns !== undefined && typeof layout.columns !== 'number') {
      return false;
    }
    if (layout.rows !== undefined && typeof layout.rows !== 'number') {
      return false;
    }

    // 检查 theme 结构，允许部分字段缺失
    const theme = configObj.theme as Record<string, unknown>;
    if (theme.mode !== undefined && !['light', 'dark'].includes(theme.mode as string)) {
      return false;
    }
    if (theme.primaryColor !== undefined && typeof theme.primaryColor !== 'string') {
      return false;
    }
    if (theme.iconSize !== undefined && !['small', 'medium', 'large'].includes(theme.iconSize as string)) {
      return false;
    }
    if (theme.gridSpacing !== undefined && typeof theme.gridSpacing !== 'number') {
      return false;
    }

    // 检查 icons 数组中的项，允许部分字段缺失
    const icons = configObj.icons as Array<Record<string, unknown>>;
    for (const icon of icons) {
      if (icon.id !== undefined && typeof icon.id !== 'string') {
        return false;
      }
      if (icon.name !== undefined && typeof icon.name !== 'string') {
        return false;
      }
      if (icon.url !== undefined && typeof icon.url !== 'string') {
        return false;
      }
      if (icon.order !== undefined && typeof icon.order !== 'number') {
        return false;
      }
      if (icon.isHidden !== undefined && typeof icon.isHidden !== 'boolean') {
        return false;
      }
    }

    // 检查 folders 数组中的项，允许部分字段缺失
    const folders = configObj.folders as Array<Record<string, unknown>>;
    for (const folder of folders) {
      if (folder.id !== undefined && typeof folder.id !== 'string') {
        return false;
      }
      if (folder.name !== undefined && typeof folder.name !== 'string') {
        return false;
      }
      if (folder.order !== undefined && typeof folder.order !== 'number') {
        return false;
      }
    }

    // 检查 pages 数组中的项，允许部分字段缺失
    if (configObj.pages !== undefined) {
      const pages = configObj.pages as Array<Record<string, unknown>>;
      for (const page of pages) {
        if (page.id !== undefined && typeof page.id !== 'string') {
          return false;
        }
        if (page.name !== undefined && typeof page.name !== 'string') {
          return false;
        }
        if (page.iconIds !== undefined && !Array.isArray(page.iconIds)) {
          return false;
        }
      }
    }

    // 检查 operationMode 结构，允许部分字段缺失
    if (configObj.operationMode !== undefined) {
      const operationMode = configObj.operationMode as Record<string, unknown>;
      if (operationMode.mode !== undefined && !['hybrid', 'desktop', 'mobile', 'custom'].includes(operationMode.mode as string)) {
        return false;
      }
      if (operationMode.openMethod !== undefined && !['click', 'doubleClick'].includes(operationMode.openMethod as string)) {
        return false;
      }
      if (operationMode.menuTrigger !== undefined && !['rightClick', 'longPress', 'both'].includes(operationMode.menuTrigger as string)) {
        return false;
      }
      if (operationMode.showAddButton !== undefined && typeof operationMode.showAddButton !== 'boolean') {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取默认配置
   * 用于初始化或重置配置
   * @param lang - 语言代码 ('zh' | 'en')
   * @returns 默认的用户配置对象（从 config.json 加载）
   */
  static async getDefaultConfig(lang: Language = 'en'): Promise<UserConfig | null> {
    return this.loadDefaultConfig(lang);
  }
// ==================== 远程配置管理 ====================

  private static readonly SERVER_CONFIG_URL_KEY = 'hub-nav-server-config-url';
  private static readonly SYNC_ENABLED_KEY = 'hub-nav-sync-enabled';

  /**
   * 检查是否存在本地配置
   * @returns 存在本地配置返回 true，否则返回 false
   */
  static hasLocalConfig(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored !== null && stored.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * 获取服务器配置 URL
   * @returns 服务器配置 URL，不存在则返回 null
   */
  static getServerConfigUrl(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(this.SERVER_CONFIG_URL_KEY);
    } catch {
      return null;
    }
  }

  /**
   * 设置服务器配置 URL
   * @param url - 服务器配置 URL，为 null 则清除
   */
  static setServerConfigUrl(url: string | null): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (url === null) {
        localStorage.removeItem(this.SERVER_CONFIG_URL_KEY);
      } else {
        localStorage.setItem(this.SERVER_CONFIG_URL_KEY, url);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('设置服务器配置 URL 失败:', error);
      }
    }
  }

  /**
   * 检查是否启用同步
   * @returns 是否启用同步
   */
  static isSyncEnabled(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return localStorage.getItem(this.SYNC_ENABLED_KEY) === 'true';
    } catch {
      return false;
    }
  }

  /**
   * 设置同步启用状态
   * @param enabled - 是否启用同步
   */
  static setSyncEnabled(enabled: boolean): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (enabled) {
        localStorage.setItem(this.SYNC_ENABLED_KEY, 'true');
      } else {
        localStorage.removeItem(this.SYNC_ENABLED_KEY);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('设置同步状态失败:', error);
      }
    }
  }

  /**
   * 从内置 JSON 文件加载默认配置
   * @param lang - 语言代码
   * @returns 默认配置
   */
  static async loadDefaultConfig(lang: 'zh' | 'en' = 'zh'): Promise<UserConfig | null> {
    try {
      const configUrl = lang === 'en' ? '/config.en.json' : '/config.json';
      const response = await fetch(configUrl);

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`加载默认配置失败: ${response.status} ${response.statusText}`);
        }
        return null;
      }

      const config = await response.json();

      // 使用导入功能处理配置
      const importResult = importFromJson(JSON.stringify(config));

      if (importResult.success && importResult.data) {
        if (process.env.NODE_ENV === 'development') {
          console.log('默认配置加载成功');
        }
        return importResult.data;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('默认配置验证失败');
        }
        return null;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('加载默认配置失败:', error);
      }
      return null;
    }
  }

  /**
   * 从本地 JSON 文件导入配置
   * @param file - JSON 文件
   * @returns 导入结果
   */
  static async importFromFile(file: File): Promise<UserConfig | null> {
    try {
      const text = await file.text();
      const importResult = importFromJson(text);

      if (importResult.success && importResult.data) {
        if (process.env.NODE_ENV === 'development') {
          console.log('本地文件配置导入成功');
        }
        return importResult.data;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('本地文件配置验证失败:', importResult.error);
        }
        return null;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('导入本地文件失败:', error);
      }
      return null;
    }
  }

  /**
   * 从服务器加载配置
   * @param timeout - 超时时间（毫秒），默认 5000
   * @returns 成功返回配置对象，失败返回 null
   */
  static async loadServerConfig(timeout = 5000): Promise<UserConfig | null> {
    const url = this.getServerConfigUrl();

    if (!url) {
      if (process.env.NODE_ENV === 'development') {
        console.log('未配置服务器配置 URL');
      }
      return null;
    }

    // 验证 URL 格式
    try {
      new URL(url);
    } catch {
      if (process.env.NODE_ENV === 'development') {
        console.error('服务器配置 URL 格式无效');
      }
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`服务器配置加载失败: ${response.status} ${response.statusText}`);
        }
        return null;
      }

      const text = await response.text();

      // 使用导入功能处理配置
      const importResult = importFromJson(text);

      if (importResult.success && importResult.data) {
        if (process.env.NODE_ENV === 'development') {
          console.log('服务器配置加载成功');
        }
        return importResult.data;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('服务器配置验证失败:', importResult.error);
        }
        return null;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          if (process.env.NODE_ENV === 'development') {
            console.error('服务器配置加载超时');
          }
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          // CORS 或网络错误
          if (process.env.NODE_ENV === 'development') {
            console.error('服务器配置加载失败: 网络错误或 CORS 跨域问题。请确保服务器允许跨域请求。');
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('加载服务器配置失败:', error.message);
          }
        }
      }
      return null;
    }
  }

  /**
   * 使用服务器配置覆盖本地配置
   * @returns 成功返回 true，失败返回 false
   */
  static async applyServerConfig(): Promise<boolean> {
    const serverConfig = await this.loadServerConfig();

    if (!serverConfig) {
      return false;
    }

    try {
      this.saveConfig(serverConfig);
      // 强制立即保存，不使用防抖
      const jsonString = JSON.stringify(serverConfig);
      localStorage.setItem(this.STORAGE_KEY, jsonString);

      if (process.env.NODE_ENV === 'development') {
        console.log('服务器配置已覆盖本地配置');
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('覆盖本地配置失败:', error);
      }
      return false;
    }
  }

  /**
   * 同步服务器配置到本地（如果启用同步）
   * @returns 同步成功返回 true，失败或未启用返回 false
   */
  static async syncFromServer(): Promise<boolean> {
    if (!this.isSyncEnabled()) {
      return false;
    }

    const serverConfig = await this.loadServerConfig();

    if (!serverConfig) {
      return false;
    }

    try {
      this.saveConfig(serverConfig);
      const jsonString = JSON.stringify(serverConfig);
      localStorage.setItem(this.STORAGE_KEY, jsonString);

      if (process.env.NODE_ENV === 'development') {
        console.log('服务器配置已同步到本地');
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('同步服务器配置失败:', error);
      }
      return false;
    }
  }
  /**
   * 创建新页面
   * @param config - 当前配置
   * @returns 更新后的配置，包含新页面
   */
  static addPage(config: UserConfig): UserConfig {
    const newPage: Page = {
      id: `page-${crypto.randomUUID()}`,
      name: '新页面',
      iconIds: []
    };

    return {
      ...config,
      pages: [...config.pages, newPage]
    };
  }

  /**
   * 检查 localStorage 是否可用
   * @returns localStorage 可用返回 true，否则返回 false
   */
  static isStorageAvailable(): boolean {
    // 服务端环境返回 false
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // ==================== 图标缓存管理 ====================

  private static readonly ICON_CACHE_KEY = 'hub-nav-icon-cache';

  /**
   * 清除所有图标缓存（旧缓存键，用于清理遗留数据）
   */
  static clearAllIconCache(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.ICON_CACHE_KEY);
    } catch (_error) {
      // 忽略
    }
  }
}
