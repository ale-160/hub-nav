/**
 * 配置数据验证器
 *
 * 提供完整的配置数据结构验证，确保导入数据的合法性
 */

/**
 * 验证错误接口
 */
export interface ValidationError {
  path: string;      // 错误字段路径，如 "icons[0].name"
  message: string;   // 错误描述
  value?: unknown;   // 导致错误的值
}

/**
 * 验证警告接口
 */
export interface ValidationWarning {
  path: string;      // 警告字段路径
  message: string;   // 警告描述
}

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean;           // 是否通过验证
  errors: ValidationError[];    // 错误列表
  warnings: ValidationWarning[]; // 警告列表
}

// 已知字段集合（用于检测未知字段）
const KNOWN_FIELDS = new Set([
  'layout', 'theme', 'icons', 'folders', 'pages',
  'rootOrder', 'version', 'searchEngine', 'operationMode',
  '_meta', '_ext'
]);

/**
 * 验证配置数据
 * @param data - 待验证的配置数据
 * @returns 验证结果
 */
export function validateConfig(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 基础类型检查
  if (!data || typeof data !== 'object') {
    errors.push({
      path: '$',
      message: '配置必须是对象'
    });
    return { valid: false, errors, warnings };
  }

  const config = data as Record<string, unknown>;

  // 验证必需字段
  if (!config.layout) {
    errors.push({ path: 'layout', message: '缺少 layout 字段' });
  } else {
    validateLayout(config.layout, 'layout', errors, warnings);
  }

  if (!config.theme) {
    errors.push({ path: 'theme', message: '缺少 theme 字段' });
  } else {
    validateTheme(config.theme, 'theme', errors, warnings);
  }

  if (!Array.isArray(config.icons)) {
    errors.push({ path: 'icons', message: 'icons 必须是数组' });
  } else {
    config.icons.forEach((icon, index) => {
      validateIcon(icon, `icons[${index}]`, errors, warnings);
    });
  }

  if (!Array.isArray(config.folders)) {
    errors.push({ path: 'folders', message: 'folders 必须是数组' });
  } else {
    config.folders.forEach((folder, index) => {
      validateFolder(folder, `folders[${index}]`, errors, warnings);
    });
  }

  if (!Array.isArray(config.pages)) {
    errors.push({ path: 'pages', message: 'pages 必须是数组' });
  } else {
    config.pages.forEach((page, index) => {
      validatePage(page, `pages[${index}]`, errors, warnings);
    });
  }

  if (config.rootOrder !== undefined && !Array.isArray(config.rootOrder)) {
    errors.push({ path: 'rootOrder', message: 'rootOrder 必须是数组' });
  }

  if (config.version !== undefined && typeof config.version !== 'string') {
    warnings.push({ path: 'version', message: 'version 应该是字符串格式' });
  }

  if (config.searchEngine !== undefined && typeof config.searchEngine !== 'string') {
    warnings.push({ path: 'searchEngine', message: 'searchEngine 应该是字符串' });
  }

  if (config.operationMode !== undefined) {
    validateOperationMode(config.operationMode, 'operationMode', errors, warnings);
  }

  // 检测未知字段
  for (const key in config) {
    if (!KNOWN_FIELDS.has(key) && !key.startsWith('_')) {
      warnings.push({
        path: key,
        message: `未知字段: ${key}`
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 验证布局设置
 */
function validateLayout(
  layout: unknown,
  path: string,
  errors: ValidationError[],
  _warnings: ValidationWarning[]
): void {
  if (!layout || typeof layout !== 'object') {
    errors.push({ path, message: 'layout 必须是对象' });
    return;
  }

  const obj = layout as Record<string, unknown>;

  if (obj.columns !== undefined) {
    if (typeof obj.columns !== 'number' || obj.columns < 1) {
      errors.push({ path: `${path}.columns`, message: 'columns 必须是正整数' });
    }
  }

  if (obj.rows !== undefined) {
    if (typeof obj.rows !== 'number' || obj.rows < 1) {
      errors.push({ path: `${path}.rows`, message: 'rows 必须是正整数' });
    }
  }
}

/**
 * 验证主题设置
 */
function validateTheme(
  theme: unknown,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!theme || typeof theme !== 'object') {
    errors.push({ path, message: 'theme 必须是对象' });
    return;
  }

  const obj = theme as Record<string, unknown>;

  if (obj.mode !== undefined && !['light', 'dark'].includes(obj.mode as string)) {
    errors.push({ path: `${path}.mode`, message: 'mode 必须是 light 或 dark' });
  }

  if (obj.primaryColor !== undefined && typeof obj.primaryColor !== 'string') {
    errors.push({ path: `${path}.primaryColor`, message: 'primaryColor 必须是字符串' });
  }

  if (obj.iconSize !== undefined && !['small', 'medium', 'large'].includes(obj.iconSize as string)) {
    errors.push({ path: `${path}.iconSize`, message: 'iconSize 必须是 small、medium 或 large' });
  }

  if (obj.gridSpacing !== undefined && typeof obj.gridSpacing !== 'number') {
    errors.push({ path: `${path}.gridSpacing`, message: 'gridSpacing 必须是数字' });
  }

  if (obj.gridColumnSpacing !== undefined && typeof obj.gridColumnSpacing !== 'number') {
    errors.push({ path: `${path}.gridColumnSpacing`, message: 'gridColumnSpacing 必须是数字' });
  }

  if (obj.language !== undefined && !['zh', 'en'].includes(obj.language as string)) {
    warnings.push({ path: `${path}.language`, message: 'language 应该是 zh 或 en' });
  }
}

/**
 * 验证图标项
 */
function validateIcon(
  icon: unknown,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!icon || typeof icon !== 'object') {
    errors.push({ path, message: '图标项必须是对象' });
    return;
  }

  const item = icon as Record<string, unknown>;

  if (typeof item.id !== 'string') {
    errors.push({ path: `${path}.id`, message: '缺少有效的 id' });
  }

  if (typeof item.name !== 'string') {
    warnings.push({ path: `${path}.name`, message: '缺少 name，将使用默认值' });
  }

  if (typeof item.url !== 'string') {
    warnings.push({ path: `${path}.url`, message: '缺少 url' });
  }

  if (item.order !== undefined && typeof item.order !== 'number') {
    warnings.push({ path: `${path}.order`, message: 'order 应该是数字' });
  }

  if (item.isHidden !== undefined && typeof item.isHidden !== 'boolean') {
    warnings.push({ path: `${path}.isHidden`, message: 'isHidden 应该是布尔值' });
  }

  if (item.iconType !== undefined && !['favicon', 'builtin', 'custom'].includes(item.iconType as string)) {
    warnings.push({ path: `${path}.iconType`, message: `未知的图标类型: ${item.iconType}` });
  }
}

/**
 * 验证文件夹项
 */
function validateFolder(
  folder: unknown,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!folder || typeof folder !== 'object') {
    errors.push({ path, message: '文件夹项必须是对象' });
    return;
  }

  const item = folder as Record<string, unknown>;

  if (typeof item.id !== 'string') {
    errors.push({ path: `${path}.id`, message: '缺少有效的 id' });
  }

  if (typeof item.name !== 'string') {
    warnings.push({ path: `${path}.name`, message: '缺少 name，将使用默认值' });
  }

  if (item.order !== undefined && typeof item.order !== 'number') {
    warnings.push({ path: `${path}.order`, message: 'order 应该是数字' });
  }
}

/**
 * 验证页面
 */
function validatePage(
  page: unknown,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!page || typeof page !== 'object') {
    errors.push({ path, message: '页面必须是对象' });
    return;
  }

  const item = page as Record<string, unknown>;

  if (typeof item.id !== 'string') {
    errors.push({ path: `${path}.id`, message: '缺少有效的 id' });
  }

  if (typeof item.name !== 'string') {
    warnings.push({ path: `${path}.name`, message: '缺少 name，将使用默认值' });
  }

  if (item.iconIds !== undefined && !Array.isArray(item.iconIds)) {
    errors.push({ path: `${path}.iconIds`, message: 'iconIds 必须是数组' });
  }
}

/**
 * 验证操作模式设置
 */
function validateOperationMode(
  mode: unknown,
  path: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!mode || typeof mode !== 'object') {
    errors.push({ path, message: 'operationMode 必须是对象' });
    return;
  }

  const obj = mode as Record<string, unknown>;

  if (obj.mode !== undefined && !['hybrid', 'desktop', 'mobile', 'custom'].includes(obj.mode as string)) {
    errors.push({ path: `${path}.mode`, message: 'mode 必须是 hybrid、desktop、mobile 或 custom' });
  }

  if (obj.openMethod !== undefined && !['click', 'doubleClick'].includes(obj.openMethod as string)) {
    warnings.push({ path: `${path}.openMethod`, message: 'openMethod 应该是 click 或 doubleClick' });
  }

  if (obj.menuTrigger !== undefined && !['rightClick', 'longPress', 'both'].includes(obj.menuTrigger as string)) {
    warnings.push({ path: `${path}.menuTrigger`, message: 'menuTrigger 应该是 rightClick、longPress 或 both' });
  }

  if (obj.showAddButton !== undefined && typeof obj.showAddButton !== 'boolean') {
    warnings.push({ path: `${path}.showAddButton`, message: 'showAddButton 应该是布尔值' });
  }
}
