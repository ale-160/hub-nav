/**
 * 统一右键菜单和长按菜单 Hook
 *
 * 职责：统一管理右键点击和长按触发的菜单交互
 * - 处理右键菜单打开/关闭
 * - 集成长按触发
 * - 边界检测（防止菜单超出屏幕）
 * - 点击外部自动关闭
 */

import { useState, useCallback, useEffect } from 'react';
import { useLongPressMenu } from './useLongPressMenu';

export interface UseContextMenuOptions {
  /** 菜单打开回调 */
  onOpen?: () => void;
  /** 菜单关闭回调 */
  onClose?: () => void;
  /** 是否禁用菜单 */
  disabled?: boolean;
}

export interface MenuPosition {
  x: number;
  y: number;
}

export function useContextMenu(options: UseContextMenuOptions = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });

  /**
   * 打开菜单（带边界检测）
   */
  const open = useCallback((x: number, y: number) => {
    if (options.disabled) return;

    // 边界处理：确保菜单不超出视口
    const menuWidth = 180; // 估算菜单宽度
    const menuHeight = 150; // 估算菜单高度
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

    const safeX = Math.min(x, viewportWidth - menuWidth);
    const safeY = Math.min(y, viewportHeight - menuHeight);

    setPosition({ x: safeX, y: safeY });
    setIsOpen(true);
    options.onOpen?.();
  }, [options]);

  /**
   * 关闭菜单
   */
  const close = useCallback(() => {
    setIsOpen(false);
    options.onClose?.();
  }, [options]);

  /**
   * 切换菜单状态
   */
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      // toggle 需要位置信息，通常不使用
      console.warn('toggle() 需要位置参数，建议使用 open(x, y)');
    }
  }, [isOpen, close]);

  /**
   * 处理右键点击事件
   */
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (options.disabled) return;

    e.preventDefault();
    e.stopPropagation();
    open(e.clientX, e.clientY);
  }, [open, options.disabled]);

  /**
   * 使用长按 Hook 处理触摸设备
   */
  const longPressHandlers = useLongPressMenu({
    onMenuOpen: (pos) => open(pos.x, pos.y),
    disabled: options.disabled
  });

  /**
   * 重置长按触发状态（供外部调用）
   */
  const resetLongPressState = useCallback(() => {
    longPressHandlers.longPressTriggeredRef.current = false;
  }, [longPressHandlers.longPressTriggeredRef]);

  /**
   * 点击外部自动关闭菜单
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      // 检查点击是否在菜单内部
      const target = e.target as HTMLElement;
      if (!target.closest('[role="menu"]') && !target.closest('[data-dropdown-menu]')) {
        close();
      }
    };

    // 延迟添加监听器，避免立即触发关闭
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen, close]);

  /**
   * ESC 键关闭菜单
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  return {
    isOpen,
    position,
    open,
    close,
    toggle,
    handleContextMenu,
    longPressHandlers,
    resetLongPressState
  };
}
