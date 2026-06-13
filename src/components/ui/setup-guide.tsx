'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Modal } from './modal';
import { Button } from './button';
import { ConfigManager } from '@/lib/configManager';
import { getStrings, getBrowserLanguage } from '@/data/i18n';
import type { UserConfig } from '@/lib/configManager';
import { Upload, Globe, Sparkles } from 'lucide-react';

interface SetupGuideProps {
  isOpen: boolean;
  onComplete: (config: UserConfig) => void;
}

/**
 * 首次使用引导组件
 * 提供三种配置初始化方式
 */
export function SetupGuide({ isOpen, onComplete }: SetupGuideProps) {
  const [step, setStep] = useState<'choice' | 'url'>('choice');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  
  // 获取浏览器语言和文案
  const browserLang = getBrowserLanguage();
  const STRINGS = getStrings(browserLang);

  /**
   * 使用默认配置
   */
  const handleUseDefault = useCallback(async () => {
    setLoading(true);
    try {
      const defaultConfig = await ConfigManager.loadDefaultConfig(browserLang);
      if (defaultConfig) {
        onComplete(defaultConfig);
        toast.success(STRINGS.setupComplete || 'Setup complete');
      } else {
        toast.error('Failed to load default configuration');
      }
    } catch (error) {
      toast.error('Failed to load default configuration');
    } finally {
      setLoading(false);
    }
  }, [browserLang, onComplete, STRINGS]);

  /**
   * 从文件导入配置
   */
  const handleFileImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    try {
      const config = await ConfigManager.importFromFile(file);
      if (config) {
        onComplete(config);
        toast.success(STRINGS.importSuccess);
      } else {
        toast.error(STRINGS.importError);
      }
    } catch (error) {
      toast.error(STRINGS.importError);
    } finally {
      setFileLoading(false);
    }
  }, [onComplete, STRINGS]);

  /**
   * 使用 URL 配置
   */
  const handleUseUrl = useCallback(() => {
    setStep('url');
  }, []);

  /**
   * 从 URL 加载配置
   */
  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) {
      toast.error(STRINGS.invalidUrl);
      return;
    }

    setLoading(true);
    try {
      // 临时设置 URL
      ConfigManager.setServerConfigUrl(urlInput.trim());
      
      const config = await ConfigManager.loadServerConfig();
      if (config) {
        // 保存配置和 URL
        ConfigManager.saveConfig(config);
        onComplete(config);
        toast.success(STRINGS.setupComplete || 'Setup complete');
      } else {
        toast.error(STRINGS.importError);
        // 清除 URL
        ConfigManager.setServerConfigUrl(null);
      }
    } catch (error) {
      toast.error(STRINGS.importError);
      ConfigManager.setServerConfigUrl(null);
    } finally {
      setLoading(false);
    }
  }, [urlInput, onComplete, STRINGS]);

  /**
   * 返回选择页面
   */
  const handleBack = useCallback(() => {
    setStep('choice');
    setUrlInput('');
  }, []);

  // 选择页面
  if (step === 'choice') {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title={STRINGS.welcome || 'Welcome'} size="lg" hideCloseButton>
        <div className="space-y-6">
          {/* 欢迎信息 */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {STRINGS.welcomeTitle || 'Welcome to hub-nav'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {STRINGS.welcomeDesc || 'Choose how you want to initialize your configuration'}
            </p>
          </div>

          {/* 选择卡片 */}
          <div className="grid gap-4">
            {/* 使用默认配置 */}
            <button
              onClick={handleUseDefault}
              disabled={loading}
              className="p-6 border border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {STRINGS.useDefault || 'Use Default Configuration'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {STRINGS.useDefaultDesc || 'Start with the default configuration and customize it later'}
                  </p>
                </div>
              </div>
            </button>

            {/* 导入 JSON 文件 */}
            <label
              className="p-6 border border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-all cursor-pointer"
            >
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                disabled={fileLoading}
                className="hidden"
              />
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors">
                  <Upload className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {STRINGS.importJson || 'Import JSON File'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {STRINGS.importJsonDesc || 'Import a previously exported configuration file'}
                  </p>
                </div>
              </div>
            </label>

            {/* 使用 URL */}
            <button
              onClick={handleUseUrl}
              className="p-6 border border-border rounded-lg hover:border-primary hover:bg-accent/50 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                  <Globe className="w-6 h-6 text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    {STRINGS.useUrl || 'Use URL'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {STRINGS.useUrlDesc || 'Load configuration from a remote URL (supports cloud sync)'}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  // URL 输入页面
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={STRINGS.useUrl || 'Use URL'} size="lg" hideCloseButton>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {STRINGS.enterConfigUrl || 'Enter Configuration URL'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {STRINGS.enterConfigUrlDesc || 'Provide a URL to a JSON configuration file'}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={STRINGS.serverConfigUrlPlaceholder}
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            disabled={loading}
          />

          <div className="flex gap-3">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex-1"
              disabled={loading}
            >
              {STRINGS.back || 'Back'}
            </Button>
            <Button
              onClick={handleUrlSubmit}
              className="flex-1"
              disabled={!urlInput.trim() || loading}
            >
              {loading ? (STRINGS.loading || 'Loading...') : (STRINGS.confirm || 'Confirm')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
