/**
 * 配置管理器 - 用于管理用户配置的存储、加载、导入导出等功能
 */

// 重新导出类型定义（保持向后兼容）
export type {
  IconCacheItem,
  IconCache,
  IconItem,
  FolderItem,
  OperationModeSettings,
  ThemeSettings,
  Page,
  UserConfig
} from '@/utils/config/types';

// 从新位置导入类型
import type {
  IconCache,
  Page,
  UserConfig
} from '@/utils/config/types';

// 导入新的导入导出模块
import { exportToJson } from '@/utils/config/exporter';
import { importFromJson } from '@/utils/config/importer';
import { CURRENT_VERSION } from '@/utils/config/version';

// 导入多语言支持
import { getStrings, Language } from '@/data/i18n';

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
   * @returns 默认的用户配置对象
   */
  static getDefaultConfig(lang: Language = 'en'): UserConfig {
    const S = getStrings(lang);
    return {
      layout: {
        columns: 5,
        rows: 4,
        extensions: undefined
      },
      theme: {
        mode: 'light',
        primaryColor: '#3b82f6',
        iconSize: 'medium',
        gridSpacing: 16,
        language: lang, // 使用传入的语言
        extensions: undefined
      },
      icons: [
        {
          id: 'icon-ale160',
          name: S.ale160,
          url: 'https://ale160.com',
          folderId: undefined,
          order: 0,
          isHidden: false,
          iconType: 'favicon'
        },
        {
          id: 'icon-web-text',
          name: S.webText,
          url: 'https://web-text.ale160.com',
          folderId: 'folder-favorites',
          order: 1,
          isHidden: false,
          iconType: 'favicon'
        },
        {
          id: 'icon-web-img',
          name: S.webImg,
          url: 'https://web-img.ale160.com/',
          folderId: 'folder-favorites',
          order: 2,
          isHidden: false,
          iconType: 'favicon'
        }
      ],
      folders: [
        {
          id: 'folder-favorites',
          name: S.favorites,
          parentId: undefined,
          order: 0
        }
      ],
      pages: [
        {
          id: 'page-1',
          name: S.newPage,
          iconIds: ['icon-ale160', 'folder-favorites']
        },
        {
          id: 'page-2',
          name: S.newPage,
          iconIds: []
        }
      ],
      rootOrder: ['icon-ale160', 'folder-favorites'], // 初始化根级排序数组
      version: CURRENT_VERSION, // 使用语义化版本号
      searchEngine: 'https://www.bing.com/search?q=',
      operationMode: {
        mode: 'hybrid',
        openMethod: 'click',
        menuTrigger: 'rightClick',
        showAddButton: true
      }
    };
  }

  /**
   * 清除所有配置数据
   */
  static clearConfig(): void {
    // 服务端环境不执行
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('清除配置失败:', error);
      }
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
  private static readonly CACHE_EXPIRY_DAYS = 7; // 缓存有效期7天
  private static readonly MAX_CACHE_SIZE = 5 * 1024 * 1024; // 最大缓存大小5MB

  /**
   * 读取整个图标缓存对象
   * @returns 图标缓存对象，服务端返回空对象
   */
  static getIconCache(): IconCache {
    // 服务端环境返回空对象
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const cached = localStorage.getItem(this.ICON_CACHE_KEY);
      if (!cached) {
        return {};
      }
      return JSON.parse(cached) as IconCache;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('读取图标缓存失败:', error);
      }
      return {};
    }
  }

  /**
   * 检查某个域名是否有有效缓存
   * @param domain - 域名
   * @returns 有有效缓存返回 dataUrl，无则返回 null
   */
  static getCachedIcon(domain: string): string | null {
    if (!domain || typeof window === 'undefined') {
      return null;
    }

    try {
      const cache = this.getIconCache();
      const cachedItem = cache[domain];

      if (!cachedItem) {
        return null;
      }

      // 检查缓存是否过期（7天）
      const now = Date.now();
      const expiryTime = cachedItem.lastAccessedAt + (this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

      if (now > expiryTime) {
        // 缓存过期，删除该条目
        delete cache[domain];
        localStorage.setItem(this.ICON_CACHE_KEY, JSON.stringify(cache));
        return null;
      }

      // 更新最后访问时间
      cachedItem.lastAccessedAt = now;
      localStorage.setItem(this.ICON_CACHE_KEY, JSON.stringify(cache));

      return cachedItem.dataUrl;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('获取缓存图标失败:', error);
      }
      return null;
    }
  }



  /**
   * 设置图标缓存
   * @param domain - 域名
   * @param url - 图标URL
   */
  static setIconCache(domain: string, url: string): void {
    if (!domain || !url || typeof window === 'undefined') {
      return;
    }

    try {
      // 清理过期缓存
      this.cleanExpiredCache();

      const cache = this.getIconCache();
      const now = Date.now();

      // 检查缓存大小是否超限
      if (this.isCacheSizeExceeded(cache, url)) {
        this.cleanOldestCache(cache);
      }

      // 写入新缓存或更新现有缓存
      if (cache[domain]) {
        // 更新现有缓存
        cache[domain] = {
          ...cache[domain],
          dataUrl: url,
          updatedAt: now,
          lastAccessedAt: now
        };
      } else {
        // 添加新缓存
        cache[domain] = {
          dataUrl: url,
          addedAt: now,
          updatedAt: now,
          lastAccessedAt: now
        };
      }

      localStorage.setItem(this.ICON_CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('写入图标缓存失败:', error);
      }
    }
  }

  /**
   * 清理过期缓存（超过7天的条目）
   */
  static cleanExpiredCache(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const cache = this.getIconCache();
      const now = Date.now();
      let hasChanges = false;

      for (const domain in cache) {
        const cachedItem = cache[domain];
        const expiryTime = cachedItem.lastAccessedAt + (this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        if (now > expiryTime) {
          delete cache[domain];
          hasChanges = true;
        }
      }

      if (hasChanges) {
        localStorage.setItem(this.ICON_CACHE_KEY, JSON.stringify(cache));
      }
    } catch (_error) {
    }
  }

  /**
   * 清除特定域名的缓存
   * @param domain - 域名
   */
  static clearDomainCache(domain: string): void {
    if (!domain || typeof window === 'undefined') {
      return;
    }

    try {
      const cache = this.getIconCache();
      if (cache[domain]) {
        delete cache[domain];
        localStorage.setItem(this.ICON_CACHE_KEY, JSON.stringify(cache));
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('清除域名缓存失败:', error);
      }
    }
  }

  /**
   * 清除所有图标缓存
   */
  static clearAllIconCache(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.ICON_CACHE_KEY);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('清除所有缓存失败:', error);
      }
    }
  }

  /**
   * 检查是否有特定域名的缓存
   * @param domain - 域名
   * @returns 是否有缓存
   */
  static hasDomainCache(domain: string): boolean {
    if (!domain || typeof window === 'undefined') {
      return false;
    }

    try {
      const cache = this.getIconCache();
      return !!cache[domain];
    } catch {
      return false;
    }
  }

  /**
   * 检查缓存大小是否超限
   * @param cache - 当前缓存对象
   * @param newDataUrl - 要添加的新数据URL
   * @returns 是否超限
   */
  private static isCacheSizeExceeded(cache: IconCache, newDataUrl: string): boolean {
    try {
      // 计算当前缓存大小
      const cacheString = JSON.stringify(cache);
      const currentSize = new Blob([cacheString]).size;

      // 计算新缓存项的大小
      const newItemSize = new Blob([newDataUrl]).size;
      const newSize = currentSize + newItemSize;

      return newSize > this.MAX_CACHE_SIZE;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('检查缓存大小失败:', error);
      }
      return false;
    }
  }

  /**
   * 清理最旧的缓存条目（基于最后访问时间）
   * @param cache - 缓存对象
   */
  private static cleanOldestCache(cache: IconCache): void {
    try {
      // 将缓存条目按最后访问时间排序
      const entries = Object.entries(cache);
      entries.sort((a, b) => a[1].lastAccessedAt - b[1].lastAccessedAt);

      // 删除最旧的条目直到总大小低于3MB
      const TARGET_SIZE = 3 * 1024 * 1024; // 3MB

      for (const [domain] of entries) {
        delete cache[domain];

        // 重新检查大小
        const cacheString = JSON.stringify(cache);
        const currentSize = new Blob([cacheString]).size;

        if (currentSize <= TARGET_SIZE) {
          break;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('清理最旧缓存失败:', error);
      }
    }
  }
}
