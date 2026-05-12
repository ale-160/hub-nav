import { useState, useEffect, useCallback } from 'react';

/**
 * 自定义 Hook：用于管理 localStorage 的读取、写入和删除操作
 * @template T - 存储值的类型
 * @param key - localStorage 的键名
 * @param initialValue - 初始值
 * @returns 包含当前值、设置值函数和删除值函数的元组
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // 获取初始值函数（不使用 useCallback，避免依赖循环）
  const getStoredValue = (): T => {
    // 服务端环境直接返回初始值
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        try {
          return JSON.parse(item) as T;
        } catch {
          // 如果 JSON 解析失败，说明存储的是普通字符串，直接返回
          return item as unknown as T;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`读取 localStorage 键 "${key}" 失败:`, error);
      }
    }
    return initialValue;
  };

  const [storedValue, setStoredValue] = useState<T>(() => getStoredValue());

  // 监听 localStorage 变化（跨标签页同步）
  useEffect(() => {
    // 服务端环境不执行
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          try {
            setStoredValue(JSON.parse(event.newValue) as T);
          } catch {
            // 如果 JSON 解析失败，说明存储的是普通字符串，直接返回
            setStoredValue(event.newValue as unknown as T);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`解析 localStorage 变化失败:`, error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // 设置值的函数
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue(prev => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
              if (process.env.NODE_ENV === 'development') {
                console.error('localStorage 空间不足，无法存储数据');
              }
              throw new Error('存储空间不足');
            }
            throw error;
          }
          
          return valueToStore;
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`设置 localStorage 键 "${key}" 失败:`, error);
        }
      }
    },
    [key]
  );

  // 删除值的函数
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`删除 localStorage 键 "${key}" 失败:`, error);
      }
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
