'use client';

import { OperationModeSettings } from '@/lib/configManager';
import { STRINGS } from '@/lib/strings';

interface OperationModeSelectorProps {
  operationMode: OperationModeSettings;
  onChange: (operationMode: OperationModeSettings) => void;
  language?: 'zh' | 'en';
}

/**
 * 操作模式选择器组件
 */
export function OperationModeSelector({ operationMode, onChange }: OperationModeSelectorProps) {
  /**
   * 处理预设模式选择
   */
  const handlePresetModeChange = (mode: 'hybrid' | 'desktop' | 'mobile') => {
    const newSettings: OperationModeSettings = {
      mode,
      openMethod: mode === 'desktop' ? 'doubleClick' : 'click',
      menuTrigger: mode === 'mobile' ? 'longPress' : mode === 'desktop' ? 'rightClick' : 'both',
      showAddButton: mode !== 'desktop'
    };
    onChange(newSettings);
  };

  /**
   * 处理自定义设置变化
   */
  const handleCustomSettingChange = (key: keyof Omit<OperationModeSettings, 'mode'>, value: 'click' | 'doubleClick' | 'rightClick' | 'longPress' | 'both' | boolean) => {
    onChange({
      ...operationMode,
      mode: 'custom',
      [key]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* 预设模式选择 */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">{STRINGS.presetMode}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 混合模式 */}
          <button
            onClick={() => handlePresetModeChange('hybrid')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              operationMode.mode === 'hybrid'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{STRINGS.hybridMode}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {STRINGS.hybridModeDesc}
            </div>
          </button>

          {/* 电脑端模式 */}
          <button
            onClick={() => handlePresetModeChange('desktop')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              operationMode.mode === 'desktop'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{STRINGS.desktopMode}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {STRINGS.desktopModeDesc}
            </div>
          </button>

          {/* 移动端模式 */}
          <button
            onClick={() => handlePresetModeChange('mobile')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              operationMode.mode === 'mobile'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-200'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{STRINGS.mobileMode}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {STRINGS.mobileModeDesc}
            </div>
          </button>
        </div>
      </div>

      {/* 自定义设置 */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">{STRINGS.customSettings}</h3>
        <div className="space-y-4">
          {/* 打开方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {STRINGS.openMethod}
            </label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="open-method"
                  checked={operationMode.openMethod === 'click'}
                  onChange={() => handleCustomSettingChange('openMethod', 'click')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{STRINGS.click}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="open-method"
                  checked={operationMode.openMethod === 'doubleClick'}
                  onChange={() => handleCustomSettingChange('openMethod', 'doubleClick')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{STRINGS.doubleClick}</span>
              </label>
            </div>
          </div>

          {/* 菜单唤醒方式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {STRINGS.menuTrigger}
            </label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="menu-trigger"
                  checked={operationMode.menuTrigger === 'rightClick'}
                  onChange={() => handleCustomSettingChange('menuTrigger', 'rightClick')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{STRINGS.rightClick}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="menu-trigger"
                  checked={operationMode.menuTrigger === 'longPress'}
                  onChange={() => handleCustomSettingChange('menuTrigger', 'longPress')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{STRINGS.longPress}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="menu-trigger"
                  checked={operationMode.menuTrigger === 'both'}
                  onChange={() => handleCustomSettingChange('menuTrigger', 'both')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{STRINGS.both}</span>
              </label>
            </div>
          </div>

          {/* 添加按钮显示 */}
          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={operationMode.showAddButton ?? true}
                onChange={(e) => handleCustomSettingChange('showAddButton', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{STRINGS.showAddButton}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
