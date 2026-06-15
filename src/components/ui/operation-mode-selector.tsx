'use client';

import { OperationModeSettings } from '@/lib/configManager';
import { getStrings } from '@/data/i18n';

interface OperationModeSelectorProps {
  operationMode: OperationModeSettings;
  onChange: (operationMode: OperationModeSettings) => void;
  language?: 'zh' | 'en';
}

/**
 * 操作模式选择器组件
 */
export function OperationModeSelector({ operationMode, onChange, language }: OperationModeSelectorProps) {
  // 根据传入的 language 参数获取对应的翻译
  const STRINGS = getStrings(language || 'zh');
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
        <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.presetMode}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 混合模式 */}
          <button
            onClick={() => handlePresetModeChange('hybrid')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              operationMode.mode === 'hybrid'
                ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                : 'border-border hover:border-foreground/30 bg-card'
            }`}
          >
            <div className="font-medium text-foreground mb-1">{STRINGS.hybridMode}</div>
            <div className="text-xs text-muted-foreground whitespace-pre-line">
              {STRINGS.hybridModeDesc}
            </div>
          </button>

          {/* 电脑端模式 */}
          <button
            onClick={() => handlePresetModeChange('desktop')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              operationMode.mode === 'desktop'
                ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                : 'border-border hover:border-foreground/30 bg-card'
            }`}
          >
            <div className="font-medium text-foreground mb-1">{STRINGS.desktopMode}</div>
            <div className="text-xs text-muted-foreground whitespace-pre-line">
              {STRINGS.desktopModeDesc}
            </div>
          </button>

          {/* 移动端模式 */}
          <button
            onClick={() => handlePresetModeChange('mobile')}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              operationMode.mode === 'mobile'
                ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                : 'border-border hover:border-foreground/30 bg-card'
            }`}
          >
            <div className="font-medium text-foreground mb-1">{STRINGS.mobileMode}</div>
            <div className="text-xs text-muted-foreground whitespace-pre-line">
              {STRINGS.mobileModeDesc}
            </div>
          </button>
        </div>
      </div>

      {/* 自定义设置 */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">{STRINGS.customSettings}</h3>
        <div className="space-y-4">
          {/* 打开方式 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {STRINGS.openMethod}
            </label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="open-method"
                  checked={operationMode.openMethod === 'click'}
                  onChange={() => handleCustomSettingChange('openMethod', 'click')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="ml-2 text-sm text-foreground">{STRINGS.click}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="open-method"
                  checked={operationMode.openMethod === 'doubleClick'}
                  onChange={() => handleCustomSettingChange('openMethod', 'doubleClick')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="ml-2 text-sm text-foreground">{STRINGS.doubleClick}</span>
              </label>
            </div>
          </div>

          {/* 菜单唤醒方式 */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {STRINGS.menuTrigger}
            </label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="menu-trigger"
                  checked={operationMode.menuTrigger === 'rightClick'}
                  onChange={() => handleCustomSettingChange('menuTrigger', 'rightClick')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="ml-2 text-sm text-foreground">{STRINGS.rightClick}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="menu-trigger"
                  checked={operationMode.menuTrigger === 'longPress'}
                  onChange={() => handleCustomSettingChange('menuTrigger', 'longPress')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="ml-2 text-sm text-foreground">{STRINGS.longPress}</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="menu-trigger"
                  checked={operationMode.menuTrigger === 'both'}
                  onChange={() => handleCustomSettingChange('menuTrigger', 'both')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="ml-2 text-sm text-foreground">{STRINGS.both}</span>
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
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
              />
              <span className="ml-2 text-sm text-foreground">{STRINGS.showAddButton}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
