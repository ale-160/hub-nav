/**
 * 内置图标库配置
 */

export interface BuiltinIcon {
  id: string;
  name: string;
  emoji: string;
  type: 'emoji' | 'solid' | 'vector';
  color?: string;
  // 矢量图标：Feather/Lucide 风格的线性 SVG path，由组件根据 name 解析
  svgKey?: string;
  svgColor?: string;
}

/**
 * 矢量图标 SVG 路径库（Feather 风格，24x24 viewbox）
 * 返回 SVG 内部内容（不含外层 svg 标签）
 */
export const VECTOR_SVG_MAP: Record<string, { paths: string[]; color: string; label: string }> = {
  home:      { label: '首页',   color: '#3b82f6', paths: ['<path d="M3 9.5L12 3l9 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<path d="M5 9v11a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<path d="M10 20h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  folder:    { label: '文件夹', color: '#10b981', paths: ['<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  gamepad:   { label: '游戏',   color: '#ef4444', paths: ['<rect x="2" y="7" width="20" height="12" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>', '<circle cx="8" cy="13" r="1.2" fill="currentColor"/>', '<circle cx="16" cy="13" r="1.2" fill="currentColor"/>', '<path d="M11 13h2M12 12v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'] },
  mail:      { label: '邮箱',   color: '#f59e0b', paths: ['<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  twitter:   { label: '社交',   color: '#1da1f2', paths: ['<path d="M22 5.9c-.7.3-1.5.6-2.3.7.8-.5 1.5-1.3 1.8-2.2-.8.5-1.7.8-2.6 1-1.5-1.6-4.1-1.7-5.7-.2-1 1-1.5 2.4-1.2 3.8C9 8.7 6 7 4 4.4c-1.5 2.6-.7 6 1.9 7.7-.6 0-1.3-.2-1.9-.5 0 2.7 1.9 5 4.5 5.6-.5.1-1 .2-1.5.1.5 1.7 2 2.8 3.7 2.8-1.6 1.2-3.6 1.9-5.7 1.6 2.5 1.6 5.3 1.6 7.9-.1 2.3-2.5 4-4.2 2.4-1.7.6-3.5.9-5.4.9 2.7 1.8 6 2.8 9.4 2.7 8 0 12.3-6.7 12.3-12.5v-.6c.8-.6 1.5-1.4 2.1-2.3-.7.3-1.5.5-2.3.6.8-.5 1.5-1.3 1.8-2.2z" fill="currentColor"/>'] },
  code:      { label: '代码',   color: '#8b5cf6', paths: ['<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  video:     { label: '视频',   color: '#ec4899', paths: ['<rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M17 10l4-2v8l-4-2v-4z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="currentColor" fill-opacity="0.25"/>'] },
  music:     { label: '音乐',   color: '#06b6d4', paths: ['<path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="2" fill="none"/>', '<circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="2" fill="none"/>'] },
  camera:    { label: '相机',   color: '#f97316', paths: ['<path d="M3 8a2 2 0 012-2h3l2-2h4l2 2h3a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<circle cx="12" cy="13" r="3.5" stroke="currentColor" stroke-width="2" fill="none"/>'] },
  book:      { label: '书籍',   color: '#84cc16', paths: ['<path d="M5 4h4a3 3 0 013 3v13a2 2 0 00-2-2H5V4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<path d="M19 4h-4a3 3 0 00-3 3v13a2 2 0 012-2h5V4z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  map:       { label: '地图',   color: '#14b8a6', paths: ['<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2V6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<path d="M9 4v16M15 6v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'] },
  shopping:  { label: '购物',   color: '#f43f5e', paths: ['<path d="M3 5h2l2.4 11.4a2 2 0 002 1.6h8.2a2 2 0 002-1.5L21 8H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<circle cx="9" cy="21" r="1.5" fill="currentColor"/>', '<circle cx="18" cy="21" r="1.5" fill="currentColor"/>'] },
  coffee:    { label: '美食',   color: '#eab308', paths: ['<path d="M3 8h14v6a5 5 0 01-5 5H8a5 5 0 01-5-5V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<path d="M17 10h2a2 2 0 010 4h-2M7 3v2M11 3v2M15 3v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  plane:     { label: '旅行',   color: '#0ea5e9', paths: ['<path d="M2 13l20-8v10L12 18l-10-5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>', '<path d="M12 18l-3 4M22 5l-6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  heart:     { label: '喜欢',   color: '#ef4444', paths: ['<path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  star:      { label: '收藏',   color: '#f59e0b', paths: ['<path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 20.9l1.1-6.5L2.6 9.8l6.5-.9L12 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  cloud:     { label: '云存储', color: '#3b82f6', paths: ['<path d="M6 18a4 4 0 01-.6-7.96 6 6 0 0111.6-1.2A4.5 4.5 0 0118 18H6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  lock:      { label: '安全',   color: '#10b981', paths: ['<rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M8 11V7a4 4 0 118 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<circle cx="12" cy="16" r="1.2" fill="currentColor"/>'] },
  bell:      { label: '通知',   color: '#f59e0b', paths: ['<path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<path d="M10 20.5a2 2 0 004 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'] },
  search:    { label: '搜索',   color: '#6366f1', paths: ['<circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M20 20l-4.2-4.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'] },
  settings:  { label: '设置',   color: '#6b7280', paths: ['<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.56V21a2 2 0 11-4 0v-.1A1.7 1.7 0 009 19.4a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.56-1H3a2 2 0 110-4h.1A1.7 1.7 0 004.6 9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009 4.6a1.7 1.7 0 001-1.56V3a2 2 0 114 0v.1A1.7 1.7 0 0015 4.6a1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 9a1.7 1.7 0 001.56 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.56 1z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  globe:     { label: '新闻',   color: '#0ea5e9', paths: ['<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>'] },
  sun:       { label: '天气',   color: '#f59e0b', paths: ['<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'] },
  calendar:  { label: '日历',   color: '#84cc16', paths: ['<rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M3 9h18M8 3v4M16 3v4M8 14h2M12 14h2M8 18h2M12 18h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  clock:     { label: '时钟',   color: '#6b7280', paths: ['<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  briefcase: { label: '工作',   color: '#6366f1', paths: ['<rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  users:     { label: '社交',   color: '#ec4899', paths: ['<circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M3 20a6 6 0 0112 0v1H3v-1zM17 11a2.5 2.5 0 110-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<path d="M14 20a5 5 0 017-4.5v1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  gradcap:   { label: '教育',   color: '#06b6d4', paths: ['<path d="M2 9l10-4 10 4-10 4L2 9z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>', '<path d="M6 11v5c2 1.5 4 2 6 2s4-.5 6-2v-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  pill:      { label: '健康',   color: '#22c55e', paths: ['<path d="M10 3l8 8a4 4 0 11-5.7 5.7l-8-8A4 4 0 0110 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<path d="M8 11.5l4.5-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'] },
  dollar:    { label: '金融',   color: '#84cc16', paths: ['<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/>', '<path d="M15 8h-4a1.5 1.5 0 000 3h2a1.5 1.5 0 010 3H9M12 5v14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  file:      { label: '文件',   color: '#6366f1', paths: ['<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>', '<path d="M14 3v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'] },
  tag:       { label: '标签',   color: '#ec4899', paths: ['<path d="M20 12l-8 8a2 2 0 01-2.8 0L3 14V4h10l7 8z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>', '<circle cx="8" cy="9" r="1.5" fill="currentColor"/>'] }
};

/**
 * 内置图标库 - 矢量图标（SVG）
 * 原先的 Emoji 图标，现在统一使用矢量图标
 */
export const VECTOR_ICONS: BuiltinIcon[] = (Object.keys(VECTOR_SVG_MAP) as Array<keyof typeof VECTOR_SVG_MAP>).map((key) => ({
  id: `vector-${key}`,
  name: VECTOR_SVG_MAP[key].label,
  emoji: '',
  type: 'vector' as const,
  color: VECTOR_SVG_MAP[key].color,
  svgKey: key,
  svgColor: VECTOR_SVG_MAP[key].color,
}));

/**
 * 内置图标库 - 纯色图标
 * 保留：纯色背景 + 首字 组合
 */
export const SOLID_ICONS: BuiltinIcon[] = [
  { id: 'solid-home', name: '首页', emoji: '', type: 'solid', color: '#3b82f6' },
  { id: 'solid-folder', name: '文件夹', emoji: '', type: 'solid', color: '#10b981' },
  { id: 'solid-game', name: '游戏', emoji: '', type: 'solid', color: '#f59e0b' },
  { id: 'solid-email', name: '邮箱', emoji: '', type: 'solid', color: '#ef4444' },
  { id: 'solid-code', name: '代码', emoji: '', type: 'solid', color: '#8b5cf6' },
  { id: 'solid-video', name: '视频', emoji: '', type: 'solid', color: '#ec4899' },
  { id: 'solid-music', name: '音乐', emoji: '', type: 'solid', color: '#06b6d4' },
  { id: 'solid-book', name: '书籍', emoji: '', type: 'solid', color: '#84cc16' },
  { id: 'solid-camera', name: '相机', emoji: '', type: 'solid', color: '#f97316' },
  { id: 'solid-map', name: '地图', emoji: '', type: 'solid', color: '#14b8a6' },
  { id: 'solid-shopping', name: '购物', emoji: '', type: 'solid', color: '#f43f5e' },
  { id: 'solid-food', name: '美食', emoji: '', type: 'solid', color: '#eab308' },
  { id: 'solid-travel', name: '旅行', emoji: '', type: 'solid', color: '#0ea5e9' },
  { id: 'solid-health', name: '健康', emoji: '', type: 'solid', color: '#22c55e' },
  { id: 'solid-finance', name: '金融', emoji: '', type: 'solid', color: '#84cc16' },
  { id: 'solid-education', name: '教育', emoji: '', type: 'solid', color: '#06b6d4' },
  { id: 'solid-work', name: '工作', emoji: '', type: 'solid', color: '#6366f1' },
  { id: 'solid-social', name: '社交', emoji: '', type: 'solid', color: '#ec4899' },
  { id: 'solid-settings', name: '设置', emoji: '', type: 'solid', color: '#6b7280' },
  { id: 'solid-star', name: '收藏', emoji: '', type: 'solid', color: '#f59e0b' },
  { id: 'solid-heart', name: '喜欢', emoji: '', type: 'solid', color: '#ef4444' },
  { id: 'solid-cloud', name: '云存储', emoji: '', type: 'solid', color: '#3b82f6' },
  { id: 'solid-lock', name: '安全', emoji: '', type: 'solid', color: '#10b981' },
  { id: 'solid-bell', name: '通知', emoji: '', type: 'solid', color: '#f59e0b' },
  { id: 'solid-search', name: '搜索', emoji: '', type: 'solid', color: '#6b7280' }
];

/**
 * 完整的内置图标库
 */
export const BUILTIN_ICONS: BuiltinIcon[] = [...SOLID_ICONS, ...VECTOR_ICONS];

/**
 * 根据 ID 获取内置图标
 */
export function getBuiltinIconById(id: string): BuiltinIcon | undefined {
  return BUILTIN_ICONS.find(icon => icon.id === id);
}

/**
 * 获取默认图标（用于回退）
 */
export function getDefaultIcon(): BuiltinIcon {
  return BUILTIN_ICONS[0]; // 返回第一个图标作为默认
}
