import { useState, useCallback } from 'react';

/**
 * 加载状态管理 Hook
 * @param {boolean} initialState - 初始加载状态
 * @returns {Object} { loading, startLoading, stopLoading, withLoading }
 */
const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  const [loadingMap, setLoadingMap] = useState({});

  const startLoading = useCallback((key) => {
    if (key) {
      setLoadingMap(prev => ({ ...prev, [key]: true }));
    } else {
      setLoading(true);
    }
  }, []);

  const stopLoading = useCallback((key) => {
    if (key) {
      setLoadingMap(prev => ({ ...prev, [key]: false }));
    } else {
      setLoading(false);
    }
  }, []);

  const isLoading = useCallback((key) => {
    if (key) {
      return loadingMap[key] || false;
    }
    return loading;
  }, [loading, loadingMap]);

  /**
   * 包装异步函数，自动管理加载状态
   * @param {Function} asyncFunc - 异步函数
   * @param {string} key - 可选的加载状态key
   */
  const withLoading = useCallback(async (asyncFunc, key) => {
    startLoading(key);
    try {
      return await asyncFunc();
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading,
    isLoading,
    loadingMap,
  };
};

export default useLoading;
