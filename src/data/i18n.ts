/**
 * 多语言字符串常量 - 集中管理所有面向用户的文案
 */

export type Language = 'zh' | 'en';

// 中文文案
export const STRINGS_ZH = {
  // 应用信息
  systemName: 'hub-nav',
  appVersion: '开源版',
  
  // 顶部栏
  searchPlaceholder: '搜索图标或网址...',
  themeToggle: '切换主题',
  exportConfig: '导出配置',
  importConfig: '导入配置',
  
  // 空状态
  emptyTitle: '还没有任何内容',
  emptyDescription: '点击右下角的"+"按钮添加第一个图标或文件夹，开始定制你的导航页面',
  
  // 操作按钮
  add: '添加',
  edit: '编辑',
  rename: '重命名',
  delete: '删除',
  hide: '隐藏',
  show: '显示',
  save: '保存',
  cancel: '取消',
  confirm: '确认',
  
  // 添加模态框
  addNewItem: '添加项目',
  addApp: '添加应用',
  addFolder: '添加文件夹',
  appName: '应用名称',
  appUrl: '应用地址',
  folderName: '文件夹名称',
  appUrlPlaceholder: 'https://example.com',
  folderNamePlaceholder: '新文件夹',
  appNamePlaceholder: '应用名称',
  
  // 拖拽提示
  dragToRemove: '拖拽到这里将图标移出文件夹',
  dragArea: '拖拽区域',
  
  // 文件夹相关
  emptyFolder: '空文件夹',
  openFolder: '打开文件夹',
  renameFolder: '重命名文件夹',
  folderContainsXApps: '包含 {count} 个应用',
  folderContainsXApps_one: '包含 1 个应用',
  favorites: '收藏',
  webText: 'web-text',
  webImg: 'web-img',
  ale160: '阿乐一百六',
  
  // 配置操作
  exportSuccess: '配置导出成功',
  exportError: '配置导出失败',
  importSuccess: '配置导入成功',
  importError: '配置导入失败，请检查文件格式',
  
  // 页脚
  poweredBy: 'Powered by',
  openSourceEdition: 'Open Source Edition',
  githubRepo: 'GitHub 仓库',
  
  // 错误提示
  invalidUrl: '请输入有效的网址',
  nameRequired: '名称不能为空',
  urlRequired: '链接不能为空',
  
  // 搜索
  searchResults: '搜索结果',
  noSearchResults: '没有找到匹配的项目',
  
  // 菜单项
  refresh: '刷新',
  modify: '修改',
  moveToFolder: '放入文件夹',
  moveToRoot: '移动到根级',
  
  // 确认对话框
  confirmDelete: '确认删除',
  confirmDeleteIcon: '确定要删除"{name}"吗？此操作无法撤销。',
  confirmDeleteFolder: '确定要删除文件夹"{name}"吗？',
  confirmDeleteButton: '确认删除',
  onlyDeleteFolder: '仅删除此文件夹',
  deleteAll: '全部删除',
  
  // 文件夹模态框
  subfolders: '子文件夹',
  apps: '应用',
  
  // 设置面板
  settings: '设置',
  appearance: '外观',
  search: '搜索',
  data: '数据',
  language: '语言',
  operation: '模式',
  wallpaperSettings: '壁纸设置',
  wallpaper: '壁纸',
  noWallpaper: '无壁纸',
  gradientBlue: '渐变蓝',
  gradientPurple: '渐变紫',
  gradientOrange: '渐变橙',
  gradientGreen: '渐变绿',
  natureScenery: '自然风景',
  cityNight: '城市夜景',
  abstractArt: '抽象艺术',
  iconSize: '图标大小',
  small: '小',
  medium: '中',
  large: '大',
  gridSpacing: '图标间距',
  fontColor: '字体颜色',
  customWallpaperUrl: '自定义壁纸URL',
  apply: '应用',
  uploadLocalImage: '上传本地图片',
  imageTooLarge: '图片太大，请选择小于2MB的图片',
  pleaseSelectImage: '请选择图片文件',
  searchEngine: '搜索引擎',
  baidu: '百度',
  customSearchEngineUrl: '自定义搜索引擎URL',
  resetAllData: '重置所有数据',
  resetColor: '重置颜色',
  resetConfirmTitle: '确认重置',
  resetConfirmMessage: '这将清除所有数据并恢复默认设置，是否继续？',
  continue: '继续',
  close: '关闭',
  customColor: '自定义颜色',
  hexColorPlaceholder: '或输入十六进制颜色值',
  
  // 存储信息
  storageUsage: '存储使用情况',
  totalSize: '总大小',
  iconCount: '图标数量',
  folderCount: '文件夹数量',
  pageCount: '页面数量',
  
  // 备份管理
  backupManagement: '备份管理',
  backupList: '备份列表',
  noBackups: '暂无备份',
  backupTime: '备份时间',
  backupVersion: '版本',
  backupSize: '大小',
  restoreBackup: '恢复',
  deleteBackup: '删除',
  clearAllBackups: '清空所有备份',
  backupStorageUsed: '已用',
  backupStorageLimit: '存储即将满，建议清理备份',
  confirmDeleteBackup: '确定要删除此备份吗？',
  confirmClearAllBackups: '确定要清空所有备份吗？此操作不可恢复。',
  backupRestored: '备份已恢复，页面将刷新',
  backupDeleted: '备份已删除',
  backupsCleared: '所有备份已清空',
  
  // 颜色名称
  black: '黑',
  white: '白',
  darkGray: '深灰',
  lightGray: '浅灰',
  red: '红',
  orange: '橙',
  green: '绿',
  blue: '蓝',
  purple: '紫',
  pink: '粉',
  cyan: '青',
  naturalLandscape: '自然风景',
  
  // 操作模式
  presetMode: '预设模式',
  hybridMode: '混合模式',
  hybridModeDesc: '• 打开方式：单击打开应用/文件夹\n• 菜单方式：右键/长按打开菜单\n• 添加按钮：显示',
  desktopMode: '电脑端模式',
  desktopModeDesc: '• 双击打开应用/文件夹\n• 右键打开菜单\n• 隐藏添加按钮',
  mobileMode: '移动端模式',
  mobileModeDesc: '• 单击打开应用/文件夹\n• 长按打开菜单\n• 显示添加按钮',
  customSettings: '自定义设置',
  openMethod: '打开方式',
  click: '单击',
  doubleClick: '双击',
  menuTrigger: '菜单唤醒方式',
  rightClick: '右键',
  longPress: '长按',
  both: '两者',
  showAddButton: '显示右下角添加按钮',
  
  // 图标选择器
  iconSource: '图标来源',
  favicon: '网站图标',
  builtinIcon: '内置图标',
  customImage: '自定义图标',
  emojiIcons: 'Emoji 图标',
  solidIcons: '纯色图标',
  enterUrlHint: '请输入应用地址后自动获取网站图标',
  faviconPreview: '网站图标预览',
  autoFetchFavicon: '将自动获取网站的 favicon',
  selected: '已选择',
  fetchFailed: '无法获取图标，请使用内置图标或自定义图标',
  imageLoadFailed: '图片加载失败，请检查URL',
  customIconSuccess: '自定义图标加载成功',
  customIconPreview: '自定义图标预览',
  imageUrl: '图标URL',
  selectIcon: '选择图标',
  discoverMore: '发现更多',
  tryDiscoverMore: '尝试发现更多图标',
  selectPreferredIcon: '选择您喜欢的图标',
  searchingFavicons: '正在搜索网站图标...',
  noFaviconFound: '未找到可用图标，将使用默认图标',
  fetchError: '图标获取失败，请检查网络连接',
  useDefaultIcon: '使用默认图标',
  faviconTip: '点击任意图标即可选中，也可稍后在设置中更换',
  invalidDomain: '无效的域名',
  
  // 添加/编辑弹窗
  type: '类型',
  editApp: '编辑应用',
  name: '名称',
  url: 'URL',
  
  // 多页功能
  newPage: '新页面',
  previousPage: '上一页',
  nextPage: '下一页',
  pageIndicator: '页面指示器',
  pageManager: '页面管理',
  pageList: '页面列表',
  current: '当前',
  
  // 帮助
  help: '帮助',
  helpTitle: '使用帮助',
  helpTip1Title: '右键添加应用',
  helpTip1Desc: '在桌面空白处右键点击，可以快速添加应用或文件夹',
  helpTip2Title: '拖拽排序',
  helpTip2Desc: '长按图标或文件夹，可以拖拽调整位置或放入文件夹',
  helpTip3Title: '个性化设置',
  helpTip3Desc: '点击右上角设置按钮，可以自定义主题、壁纸和搜索引擎',
  helpTip4Title: '多页管理',
  helpTip4Desc: '左右滑动或使用导航按钮切换页面，添加更多分类',
  // 新手引导
  onboardingTitle: '欢迎使用 HubNav',
  onboardingTip1Title: '右键添加应用',
  onboardingTip1Desc: '在桌面空白处右键点击，可以快速添加应用或文件夹',
  onboardingTip2Title: '拖拽排序',
  onboardingTip2Desc: '长按图标或文件夹，可以拖拽调整位置或放入文件夹',
  onboardingTip3Title: '个性化设置',
  onboardingTip3Desc: '点击右上角设置按钮，可以自定义主题、壁纸和搜索引擎',
  onboardingButton: '开始使用',
  
  // 错误边界
  errorBoundaryTitle: '抱歉，出现了一些问题',
  errorBoundaryDesc: '应用遇到了一个意外错误。您可以尝试刷新页面来恢复。',
  errorBoundaryRefresh: '刷新页面',
  loading: '加载中...',
  
  // 语言设置提示
  languageSwitchTip: '切换语言后，界面将立即更新。刷新页面后语言设置将保持。',
  
  // 内置图标名称映射
  iconNames: {
    home: '首页',
    folder: '文件夹',
    game: '游戏',
    email: '邮箱',
    twitter: '推特',
    github: 'GitHub',
    youtube: 'YouTube',
    music: '音乐',
    video: '视频',
    photo: '图片',
    book: '书籍',
    news: '新闻',
    weather: '天气',
    calendar: '日历',
    clock: '时钟',
    map: '地图',
    shopping: '购物',
    food: '美食',
    travel: '旅行',
    health: '健康',
    finance: '金融',
    education: '教育',
    work: '收藏',
    social: '社交',
    settings: '设置',
    code: '代码',
    camera: '相机',
    star: '收藏',
    heart: '喜欢',
    cloud: '云存储',
    lock: '安全',
    bell: '通知',
    search: '搜索',
  } as const,
} as const;

// 英文文案
export const STRINGS_EN = {
  // App Info
  systemName: 'hub-nav',
  appVersion: 'Open Source',
  
  // Top Bar
  searchPlaceholder: 'Search icons or URLs...',
  themeToggle: 'Toggle Theme',
  exportConfig: 'Export Config',
  importConfig: 'Import Config',
  
  // Empty State
  emptyTitle: 'No content yet',
  emptyDescription: 'Click the "+" button in the bottom right corner to add your first icon or folder and start customizing your navigation page',
  
  // Action Buttons
  add: 'Add',
  edit: 'Edit',
  rename: 'Rename',
  delete: 'Delete',
  hide: 'Hide',
  show: 'Show',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  
  // Add Modal
  addNewItem: 'Add Item',
  addApp: 'Add App',
  addFolder: 'Add Folder',
  appName: 'App Name',
  appUrl: 'App URL',
  folderName: 'Folder Name',
  appUrlPlaceholder: 'https://example.com',
  folderNamePlaceholder: 'New Folder',
  appNamePlaceholder: 'App Name',
  
  // Drag & Drop
  dragToRemove: 'Drag here to remove icon from folder',
  dragArea: 'Drag Area',
  
  // Folders
  emptyFolder: 'Empty Folder',
  openFolder: 'Open Folder',
  renameFolder: 'Rename Folder',
  folderContainsXApps: 'Contains {count} apps',
  folderContainsXApps_one: 'Contains 1 app',
  favorites: 'Favorites',
  webText: 'web-text',
  webImg: 'web-img',
  ale160: 'ale160',
  
  // Config Operations
  exportSuccess: 'Configuration exported successfully',
  exportError: 'Failed to export configuration',
  importSuccess: 'Configuration imported successfully',
  importError: 'Failed to import configuration, please check the file format',
  
  // Footer
  poweredBy: 'Powered by',
  openSourceEdition: 'Open Source Edition',
  githubRepo: 'GitHub Repository',
  
  // Error Messages
  invalidUrl: 'Please enter a valid URL',
  nameRequired: 'Name cannot be empty',
  urlRequired: 'URL cannot be empty',
  
  // Search
  searchResults: 'Search Results',
  noSearchResults: 'No matching items found',
  
  // Menu Items
  refresh: 'Refresh',
  modify: 'Modify',
  moveToFolder: 'Move to Folder',
  moveToRoot: 'Move to Root',
  
  // Confirmation Dialogs
  confirmDelete: 'Confirm Delete',
  confirmDeleteIcon: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
  confirmDeleteFolder: 'Are you sure you want to delete the folder "{name}"?',
  confirmDeleteButton: 'Confirm Delete',
  onlyDeleteFolder: 'Only Delete This Folder',
  deleteAll: 'Delete All',
  
  // Folder Modal
  subfolders: 'Subfolders',
  apps: 'Apps',
  
  // Settings Panel
  settings: 'Settings',
  appearance: 'Appearance',
  search: 'Search',
  data: 'Data',
  language: 'Language',
  operation: 'Mode',
  wallpaperSettings: 'Wallpaper Settings',
  wallpaper: 'Wallpaper',
  noWallpaper: 'No Wallpaper',
  gradientBlue: 'Gradient Blue',
  gradientPurple: 'Gradient Purple',
  gradientOrange: 'Gradient Orange',
  gradientGreen: 'Gradient Green',
  natureScenery: 'Nature Scenery',
  cityNight: 'City Night',
  abstractArt: 'Abstract Art',
  iconSize: 'Icon Size',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
  gridSpacing: 'Grid Spacing',
  fontColor: 'Font Color',
  customWallpaperUrl: 'Custom Wallpaper URL',
  apply: 'Apply',
  uploadLocalImage: 'Upload Local Image',
  imageTooLarge: 'Image too large, please select an image smaller than 2MB',
  pleaseSelectImage: 'Please select an image file',
  searchEngine: 'Search Engine',
  baidu: 'Baidu',
  customSearchEngineUrl: 'Custom Search Engine URL',
  resetAllData: 'Reset All Data',
  resetColor: 'Reset Color',
  resetConfirmTitle: 'Confirm Reset',
  resetConfirmMessage: 'This will clear all data and restore default settings. Continue?',
  continue: 'Continue',
  close: 'Close',
  customColor: 'Custom Color',
  hexColorPlaceholder: 'Or enter hex color value',
  
  // Storage Info
  storageUsage: 'Storage Usage',
  totalSize: 'Total Size',
  iconCount: 'Icon Count',
  folderCount: 'Folder Count',
  pageCount: 'Page Count',
  
  // Backup Management
  backupManagement: 'Backup Management',
  backupList: 'Backup List',
  noBackups: 'No backups yet',
  backupTime: 'Time',
  backupVersion: 'Version',
  backupSize: 'Size',
  restoreBackup: 'Restore',
  deleteBackup: 'Delete',
  clearAllBackups: 'Clear All Backups',
  backupStorageUsed: 'Used',
  backupStorageLimit: 'Storage nearly full, consider cleaning up backups',
  confirmDeleteBackup: 'Are you sure you want to delete this backup?',
  confirmClearAllBackups: 'Are you sure you want to clear all backups? This action cannot be undone.',
  backupRestored: 'Backup restored, page will refresh',
  backupDeleted: 'Backup deleted',
  backupsCleared: 'All backups cleared',
  
  // Color Names
  black: 'Black',
  white: 'White',
  darkGray: 'Dark Gray',
  lightGray: 'Light Gray',
  red: 'Red',
  orange: 'Orange',
  green: 'Green',
  blue: 'Blue',
  purple: 'Purple',
  pink: 'Pink',
  cyan: 'Cyan',
  naturalLandscape: 'Nature Scenery',
  
  // Operation Mode
  presetMode: 'Preset Modes',
  hybridMode: 'Hybrid Mode',
  hybridModeDesc: '• Open Method: Click to open apps/folders\n• Menu: Right-click/long press to open menu\n• Add Button: Show',
  desktopMode: 'Desktop Mode',
  desktopModeDesc: '• Double-click to open apps/folders\n• Right-click to open menu\n• Add Button: Hide',
  mobileMode: 'Mobile Mode',
  mobileModeDesc: '• Click to open apps/folders\n• Long press to open menu\n• Add Button: Show',
  customSettings: 'Custom Settings',
  openMethod: 'Open Method',
  click: 'Click',
  doubleClick: 'Double-click',
  menuTrigger: 'Menu Trigger',
  rightClick: 'Right-click',
  longPress: 'Long Press',
  both: 'Both',
  showAddButton: 'Show Add Button in Bottom Right',
  
  // Icon Selector
  iconSource: 'Icon Source',
  favicon: 'Favicon',
  builtinIcon: 'Built-in Icon',
  customImage: 'Custom Icon',
  emojiIcons: 'Emoji Icons',
  solidIcons: 'Solid Color Icons',
  enterUrlHint: 'Enter app URL to auto-fetch favicon',
  faviconPreview: 'Favicon Preview',
  autoFetchFavicon: 'Will auto-fetch website favicon',
  selected: 'Selected',
  fetchFailed: 'Failed to fetch icon, please use built-in icon or custom icon',
  imageLoadFailed: 'Image load failed, please check URL',
  customIconSuccess: 'Custom icon loaded successfully',
  customIconPreview: 'Custom Icon Preview',
  imageUrl: 'Icon URL',
  selectIcon: 'Select Icon',
  // ✅ New: Favicon Selector strings
  discoverMore: 'Discover More',
  tryDiscoverMore: 'Try Discovering More Icons',
  selectPreferredIcon: 'Select Your Preferred Icon',
  searchingFavicons: 'Searching for favicons...',
  noFaviconFound: 'No favicon found, using default icon',
  fetchError: 'Failed to fetch icons, please check your network',
  useDefaultIcon: 'Use Default Icon',
  faviconTip: 'Click any icon to select, or change later in settings',
  invalidDomain: 'Invalid domain',
  
  // Add/Edit Modal
  type: 'Type',
  editApp: 'Edit App',
  name: 'Name',
  url: 'URL',
  
  // 多页功能
  newPage: 'New Page',
  previousPage: 'Previous Page',
  nextPage: 'Next Page',
  pageIndicator: 'Page Indicator',
  pageManager: 'Page Manager',
  pageList: 'Page List',
  current: 'Current',

  // Help
  help: 'Help',
  helpTitle: 'Help Guide',
  helpTip1Title: 'Right-click to Add',
  helpTip1Desc: 'Right-click on empty space to quickly add apps or folders',
  helpTip2Title: 'Drag to Reorder',
  helpTip2Desc: 'Long press and drag icons or folders to rearrange or organize',
  helpTip3Title: 'Customize Settings',
  helpTip3Desc: 'Click the settings button to customize theme, wallpaper, and search engine',
  helpTip4Title: 'Multi-page Management',
  helpTip4Desc: 'Swipe left/right or use navigation buttons to switch pages and add more categories',
  
  // Onboarding Guide
  onboardingTitle: 'Welcome to HubNav',
  onboardingTip1Title: 'Right-click to Add',
  onboardingTip1Desc: 'Right-click on empty space to quickly add apps or folders',
  onboardingTip2Title: 'Drag to Reorder',
  onboardingTip2Desc: 'Long press and drag icons or folders to rearrange or organize',
  onboardingTip3Title: 'Customize Settings',
  onboardingTip3Desc: 'Click the settings button to customize theme, wallpaper, and search engine',
  onboardingButton: 'Get Started',
  
  // Error Boundary
  errorBoundaryTitle: 'Sorry, Something Went Wrong',
  errorBoundaryDesc: 'The application encountered an unexpected error. You can try refreshing the page to recover.',
  errorBoundaryRefresh: 'Refresh Page',
  loading: 'Loading...',
  
  // Language Setting Tips
  languageSwitchTip: 'Interface will update immediately after switching language. Language settings will be preserved after page refresh.',
  
  // Built-in Icon Names
  iconNames: {
    home: 'Home',
    folder: 'Folder',
    game: 'Game',
    email: 'Email',
    twitter: 'Twitter',
    github: 'GitHub',
    youtube: 'YouTube',
    music: 'Music',
    video: 'Video',
    photo: 'Photo',
    book: 'Book',
    news: 'News',
    weather: 'Weather',
    calendar: 'Calendar',
    clock: 'Clock',
    map: 'Map',
    shopping: 'Shopping',
    food: 'Food',
    travel: 'Travel',
    health: 'Health',
    finance: 'Finance',
    education: 'Education',
    work: 'Favorites',
    social: 'Social',
    settings: 'Settings',
    code: 'Code',
    camera: 'Camera',
    star: 'Star',
    heart: 'Heart',
    cloud: 'Cloud Storage',
    lock: 'Security',
    bell: 'Notification',
    search: 'Search',
  } as const,
} as const;

// 获取浏览器语言
interface NavigatorWithUserLanguage extends Navigator {
  userLanguage?: string;
}

export function getBrowserLanguage(): Language {
  if (typeof window !== 'undefined') {
    const nav = navigator as NavigatorWithUserLanguage;
    const browserLang = nav.language || nav.userLanguage;
    if (browserLang && browserLang.startsWith('zh')) {
      return 'zh';
    }
  }
  return 'en';
}

/**
 * 根据语言获取对应的文案
 * @param lang - 语言代码 ('zh' | 'en')
 * @returns 对应语言的文案对象
 */
export function getStrings(lang: Language = 'en') {
  if (lang === 'en') {
    return STRINGS_EN;
  }
  return STRINGS_ZH;
}

// 为了向后兼容，导出 STRINGS 作为 STRINGS_ZH 的别名
export { STRINGS_ZH as STRINGS };
