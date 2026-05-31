'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { getStrings } from '@/data/i18n';

/**
 * 帮助组件
 * 显示使用帮助
 */
interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'zh' | 'en';
}

export function OnboardingGuide({ isOpen, onClose, language }: OnboardingGuideProps) {
  const S = getStrings(language);

  const tips = [
    {
      icon: '🖱️',
      title: S.helpTip1Title,
      description: S.helpTip1Desc
    },
    {
      icon: '✋',
      title: S.helpTip2Title,
      description: S.helpTip2Desc
    },
    {
      icon: '⚙️',
      title: S.helpTip3Title,
      description: S.helpTip3Desc
    },
    {
      icon: '📄',
      title: S.helpTip4Title,
      description: S.helpTip4Desc
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={S.helpTitle}>
      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <span className="text-2xl">{tip.icon}</span>
            <div>
              <h3 className="font-medium text-foreground mb-1">{tip.title}</h3>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
            </div>
          </div>
        ))}
        
        <div className="pt-4">
          <Button onClick={onClose} className="w-full">
            {S.close}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
