import { useRef, useCallback } from 'react';

interface UseLongPressMenuOptions {
  /** 菜单打开回调，接收坐标位置 */
  onMenuOpen: (position: { x: number; y: number }) => void;
  /** 长按触发延迟（毫秒），默认 500ms */
  delay?: number;
  /** 移动取消阈值（像素），默认 5px */
  moveThreshold?: number;
  /** 是否禁用长按 */
  disabled?: boolean;
}

interface UseLongPressMenuResult {
  /** 指针按下事件处理函数 */
  handlePointerDownCapture: (e: React.PointerEvent) => void;
  /** 长按触发标记 ref（用于区分长按和点击） */
  longPressTriggeredRef: React.MutableRefObject<boolean>;
}

/**
 * 长按触发菜单 Hook
 * 
 * 用于移动端触摸交互，长按 500ms 触发右键菜单
 * 如果移动超过阈值则取消长按，避免与拖拽冲突
 * 
 * 使用方式：
 * const { handlePointerDownCapture, longPressTriggeredRef } = useLongPressMenu({
 *   onMenuOpen: (pos) => { setMenuPosition(pos); setIsMenuOpen(true); }
 * });
 */
export function useLongPressMenu({
  onMenuOpen,
  delay = 500,
  moveThreshold = 5,
  disabled = false
}: UseLongPressMenuOptions): UseLongPressMenuResult {
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const handlePointerDownCapture = useCallback((e: React.PointerEvent) => {
    // 如果禁用或忽略触控笔
    if (disabled || e.pointerType === 'pen') return;

    const startX = e.clientX;
    const startY = e.clientY;

    // 启动长按定时器
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      onMenuOpen({ x: startX, y: startY });
    }, delay);

    // 移动处理 - 超过阈值则取消长按
    const handleMove = (moveE: PointerEvent) => {
      if (Math.abs(moveE.clientX - startX) > moveThreshold || 
          Math.abs(moveE.clientY - startY) > moveThreshold) {
        clearTimeout(longPressTimerRef.current!);
        longPressTriggeredRef.current = false;
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
      }
    };

    // 抬起处理 - 取消长按
    const handleUp = () => {
      clearTimeout(longPressTimerRef.current!);
      longPressTriggeredRef.current = false;
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [onMenuOpen, delay, moveThreshold, disabled]);

  return {
    handlePointerDownCapture,
    longPressTriggeredRef,
  };
}
