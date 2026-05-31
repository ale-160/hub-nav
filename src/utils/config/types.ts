/**
 * 配置相关类型定义
 */

/**
 * 版本号类型 - 使用语义化版本格式
 */
export type Version = string; // 例如 "0.1.8"、"1.0.0-beta.1"

/**
 * 导出元数据接口
 */
export interface ExportMeta {
  exportedAt: string;      // 导出时间 (ISO 8601)
  appVersion: string;      // 应用版本
  schemaVersion: string;   // 数据schema版本
  previousVersion?: string; // 迁移前的版本
  migratedAt?: string;     // 迁移时间
}

/**
 * 导出的配置包装结构
 */
export interface ExportedConfig {
  _schema: 'hub-nav-config';
  _version: string;
  _meta: ExportMeta;
  data: UserConfig;
}

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
 * 图标扩展字段
 */
export interface IconExtensions {
  badge?: string;                    // 图标徽章
  customSize?: number;               // 自定义大小
  animation?: 'none' | 'pulse' | 'bounce'; // 动画效果
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
  customIconUrl?: string; // 自定义图标 URL（仅用于图片）
  customColor?: string;   // 自定义颜色值（仅用于纯色图标，如 #ff5500）
  _ext?: IconExtensions;  // 扩展字段
}

/**
 * 文件夹扩展字段
 */
export interface FolderExtensions {
  defaultExpanded?: boolean; // 默认展开状态
  iconColor?: string;        // 文件夹图标颜色
}

/**
 * 文件夹项接口定义
 */
export interface FolderItem {
  id: string;
  name: string;
  parentId?: string;
  order: number;
  _ext?: FolderExtensions; // 扩展字段
}

/**
 * 操作模式扩展字段
 */
export interface OperationModeExtensions {
  longPressDelay?: number;  // 长按延迟(ms)
  swipeThreshold?: number;   // 滑动阈值
}

/**
 * 操作模式接口定义
 */
export interface OperationModeSettings {
  mode: 'hybrid' | 'desktop' | 'mobile' | 'custom';
  openMethod?: 'click' | 'doubleClick'; // 打开方式
  menuTrigger?: 'rightClick' | 'longPress' | 'both'; // 菜单唤醒方式
  showAddButton?: boolean; // 添加按钮显隐
  extensions?: OperationModeExtensions; // 扩展字段
}

/**
 * 主题扩展字段
 */
export interface ThemeExtensions {
  blurIntensity?: number;                        // 背景模糊强度
  wallpaperFit?: 'cover' | 'contain' | 'fill';  // 壁纸适配方式
  fontFamily?: string;                           // 自定义字体
  iconShape?: 'square' | 'rounded' | 'circle';  // 图标形状
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
  language: 'zh' | 'en'; // 语言设置
  extensions?: ThemeExtensions; // 扩展字段
}

/**
 * 布局扩展字段
 */
export interface LayoutExtensions {
  showPageIndicator?: boolean; // 显示页面指示器
  autoArrange?: boolean;       // 自动排列
  snapToGrid?: boolean;        // 吸附到网格
}

/**
 * 布局设置接口定义
 */
export interface LayoutSettings {
  columns: number;
  rows: number;
  extensions?: LayoutExtensions; // 扩展字段
}

/**
 * 页面扩展字段
 */
export interface PageExtensions {
  backgroundColor?: string; // 页面背景色
  backgroundImage?: string; // 页面背景图
}

/**
 * 页面接口定义
 */
export interface Page {
  id: string;
  name: string;
  iconIds: string[]; // 该页面内图标/文件夹的显示顺序
  _ext?: PageExtensions; // 扩展字段
}

/**
 * 用户配置接口定义
 */
export interface UserConfig {
  layout: LayoutSettings;
  theme: ThemeSettings;
  icons: IconItem[];
  folders: FolderItem[];
  pages: Page[]; // 多页配置
  rootOrder: string[]; // 根级元素排序（图标+文件夹的ID顺序）
  version: Version;
  searchEngine?: string; // 搜索引擎URL模板，默认 Google
  operationMode?: OperationModeSettings; // 操作模式设置
  _meta?: ExportMeta;      // 元数据（导入时填充）
  _ext?: Record<string, unknown>; // 全局扩展字段
}
