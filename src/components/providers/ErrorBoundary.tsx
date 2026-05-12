'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getStrings, Language } from '@/data/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  language?: Language;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * React 错误边界组件
 * 捕获子组件树中的 JavaScript 错误，防止整个应用白屏
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 可以将错误日志上报给服务器
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // 可以自定义降级 UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const lang = this.props.language || 'zh';
      const S = getStrings(lang);

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-foreground mb-4">{S.errorBoundaryTitle}</h2>
            <p className="text-muted-foreground mb-4">
              {S.errorBoundaryDesc}
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-muted rounded-lg overflow-auto max-h-48">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {S.errorBoundaryRefresh}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
