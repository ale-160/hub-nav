/**
 * 配置相关类型定义
 */

/**
 * 图标缓存项接口定义
 */
export interface IconCacheItem {
  dataUrl: string;
  addedAt: number;      // 添加时间
  updatedAt: number;    // 更新时间
  lastAccessedAt: number; // 最后访问时间
}

/**
 * 图标缓存对象接口定义
 */
export interface IconCache {
  [domain: string]: IconCacheItem;
}

/**
 * 图标项接口定义
 */
export interface IconItem {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
  folderId?: string;
  order: number;
  isHidden: boolean;
  iconType?: 'favicon' | 'builtin' | 'custom';
  builtinIcon?: string;
  customIconUrl?: string;
}

/**
 * 文件夹项接口定义
 */
export interface FolderItem {
  id: string;
  name: string;
  parentId?: string;
  order: number;
}

/**
 * 操作模式接口定义
 */
export interface OperationModeSettings {
  mode: 'hybrid' | 'desktop' | 'mobile' | 'custom';
  openMethod?: 'click' | 'doubleClick'; // 打开方式
  menuTrigger?: 'rightClick' | 'longPress' | 'both'; // 菜单唤醒方式
  showAddButton?: boolean; // 添加按钮显隐
}

/**
 * 主题设置接口定义
 */
export interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  wallpaperUrl?: string;
  iconSize: 'small' | 'medium' | 'large';
  gridSpacing: number;
  fontColor?: string;
  language?: 'zh' | 'en'; // 语言设置
}

/**
 * 页面接口定义
 */
export interface Page {
  id: string;
  name: string;
  iconIds: string[]; // 该页面内图标/文件夹的显示顺序
}

/**
 * 用户配置接口定义
 */
export interface UserConfig {
  layout: { columns: number; rows: number };
  theme: ThemeSettings;
  icons: IconItem[];
  folders: FolderItem[];
  pages: Page[]; // 多页配置
  rootOrder: string[]; // 根级元素排序（图标+文件夹的ID顺序）
  version: number;
  searchEngine?: string; // 搜索引擎URL模板，默认 Google
  operationMode?: OperationModeSettings; // 操作模式设置
}
