import React from 'react';

interface CustomIconInputProps {
  customIconUrl?: string;
  hasError: boolean;
  onUrlChange: (url: string) => void;
  labels: {
    imageUrl: string;
    previewLabel: string;
    loadFailedLabel: string;
    successLabel: string;
  };
}

/**
 * 自定义图标输入组件
 * URL 输入框 + 错误提示
 */
export const CustomIconInput = React.memo(function CustomIconInput({
  customIconUrl,
  onUrlChange,
  labels
}: CustomIconInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {labels.imageUrl}
      </label>
      <input
        type="url"
        value={customIconUrl || ''}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="https://example.com/icon.png"
        className="w-full px-3 py-2 border border-gray-300 dark:border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      />
    </div>
  );
});
