'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

/**
 * 新手引导组件
 * 首次打开页面时显示操作提示（硬编码中英双语）
 */
export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 检查是否已显示过引导
    const hasSeenGuide = localStorage.getItem('hub-nav-onboarding-seen');
    
    if (!hasSeenGuide) {
      // 延迟显示，让页面先加载完成
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // 记录已显示过引导
    localStorage.setItem('hub-nav-onboarding-seen', 'true');
  };

  // 硬编码中英双语文案
  const tips = [
    {
      icon: '🖱️',
      title: '右键添加应用 / Right-click to Add',
      description: '在桌面空白处右键点击，可以快速添加应用或文件夹\nRight-click on empty space to quickly add apps or folders'
    },
    {
      icon: '✋',
      title: '拖拽排序 / Drag to Reorder',
      description: '长按图标或文件夹，可以拖拽调整位置或放入文件夹\nLong press and drag icons or folders to rearrange or organize'
    },
    {
      icon: '⚙️',
      title: '个性化设置 / Customize Settings',
      description: '点击右上角设置按钮，可以自定义主题、壁纸和搜索引擎\nClick the settings button to customize theme, wallpaper, and search engine'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="欢迎使用 HubNav / Welcome to HubNav">
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <span className="text-2xl">{tip.icon}</span>
            <div>
              <h3 className="font-medium text-foreground mb-1 whitespace-pre-line">{tip.title}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{tip.description}</p>
            </div>
          </div>
        ))}
        
        <div className="pt-4">
          <Button onClick={handleClose} className="w-full">
            开始使用 / Get Started
          </Button>
        </div>
      </div>
    </Modal>
  );
}
