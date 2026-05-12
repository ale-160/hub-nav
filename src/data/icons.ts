/**
 * 内置图标库配置
 */

export interface BuiltinIcon {
  id: string;
  name: string;
  emoji: string;
  type: 'emoji' | 'solid';
  color?: string;
}

/**
 * 内置图标库 - Emoji 图标
 */
export const EMOJI_ICONS: BuiltinIcon[] = [
  { id: 'home', name: '首页', emoji: '🏠', type: 'emoji' },
  { id: 'folder', name: '文件夹', emoji: '📁', type: 'emoji' },
  { id: 'game', name: '游戏', emoji: '🎮', type: 'emoji' },
  { id: 'email', name: '邮箱', emoji: '📧', type: 'emoji' },
  { id: 'twitter', name: '推特', emoji: '🐦', type: 'emoji' },
  { id: 'github', name: 'GitHub', emoji: '💻', type: 'emoji' },
  { id: 'youtube', name: 'YouTube', emoji: '📺', type: 'emoji' },
  { id: 'music', name: '音乐', emoji: '🎵', type: 'emoji' },
  { id: 'video', name: '视频', emoji: '🎬', type: 'emoji' },
  { id: 'photo', name: '图片', emoji: '📷', type: 'emoji' },
  { id: 'book', name: '书籍', emoji: '📚', type: 'emoji' },
  { id: 'news', name: '新闻', emoji: '📰', type: 'emoji' },
  { id: 'weather', name: '天气', emoji: '☀️', type: 'emoji' },
  { id: 'calendar', name: '日历', emoji: '📅', type: 'emoji' },
  { id: 'clock', name: '时钟', emoji: '⏰', type: 'emoji' },
  { id: 'map', name: '地图', emoji: '🗺️', type: 'emoji' },
  { id: 'shopping', name: '购物', emoji: '🛒', type: 'emoji' },
  { id: 'food', name: '美食', emoji: '🍔', type: 'emoji' },
  { id: 'travel', name: '旅行', emoji: '✈️', type: 'emoji' },
  { id: 'health', name: '健康', emoji: '💊', type: 'emoji' },
  { id: 'finance', name: '金融', emoji: '💰', type: 'emoji' },
  { id: 'education', name: '教育', emoji: '🎓', type: 'emoji' },
  { id: 'work', name: '工作', emoji: '💼', type: 'emoji' },
  { id: 'social', name: '社交', emoji: '👥', type: 'emoji' },
  { id: 'settings', name: '设置', emoji: '⚙️', type: 'emoji' }
];

/**
 * 内置图标库 - 纯色图标
 */
export const SOLID_ICONS: BuiltinIcon[] = [
  { id: 'solid-home', name: '首页', emoji: '🏠', type: 'solid', color: '#3b82f6' },
  { id: 'solid-folder', name: '文件夹', emoji: '📁', type: 'solid', color: '#10b981' },
  { id: 'solid-game', name: '游戏', emoji: '🎮', type: 'solid', color: '#f59e0b' },
  { id: 'solid-email', name: '邮箱', emoji: '📧', type: 'solid', color: '#ef4444' },
  { id: 'solid-code', name: '代码', emoji: '💻', type: 'solid', color: '#8b5cf6' },
  { id: 'solid-video', name: '视频', emoji: '🎬', type: 'solid', color: '#ec4899' },
  { id: 'solid-music', name: '音乐', emoji: '🎵', type: 'solid', color: '#06b6d4' },
  { id: 'solid-book', name: '书籍', emoji: '📚', type: 'solid', color: '#84cc16' },
  { id: 'solid-camera', name: '相机', emoji: '📷', type: 'solid', color: '#f97316' },
  { id: 'solid-map', name: '地图', emoji: '🗺️', type: 'solid', color: '#14b8a6' },
  { id: 'solid-shopping', name: '购物', emoji: '🛒', type: 'solid', color: '#f43f5e' },
  { id: 'solid-food', name: '美食', emoji: '🍔', type: 'solid', color: '#eab308' },
  { id: 'solid-travel', name: '旅行', emoji: '✈️', type: 'solid', color: '#0ea5e9' },
  { id: 'solid-health', name: '健康', emoji: '💊', type: 'solid', color: '#22c55e' },
  { id: 'solid-finance', name: '金融', emoji: '💰', type: 'solid', color: '#84cc16' },
  { id: 'solid-education', name: '教育', emoji: '🎓', type: 'solid', color: '#06b6d4' },
  { id: 'solid-work', name: '工作', emoji: '💼', type: 'solid', color: '#6366f1' },
  { id: 'solid-social', name: '社交', emoji: '👥', type: 'solid', color: '#ec4899' },
  { id: 'solid-settings', name: '设置', emoji: '⚙️', type: 'solid', color: '#6b7280' },
  { id: 'solid-star', name: '收藏', emoji: '⭐', type: 'solid', color: '#f59e0b' },
  { id: 'solid-heart', name: '喜欢', emoji: '❤️', type: 'solid', color: '#ef4444' },
  { id: 'solid-cloud', name: '云存储', emoji: '☁️', type: 'solid', color: '#3b82f6' },
  { id: 'solid-lock', name: '安全', emoji: '🔒', type: 'solid', color: '#10b981' },
  { id: 'solid-bell', name: '通知', emoji: '🔔', type: 'solid', color: '#f59e0b' },
  { id: 'solid-search', name: '搜索', emoji: '🔍', type: 'solid', color: '#6b7280' }
];

/**
 * 完整的内置图标库
 */
export const BUILTIN_ICONS: BuiltinIcon[] = [...EMOJI_ICONS, ...SOLID_ICONS];

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
