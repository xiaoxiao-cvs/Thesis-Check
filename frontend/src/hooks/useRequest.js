import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getErrorMessage, isRetryableError } from '@/utils/errorHandler';

/**
 * 带重试功能的请求 Hook
 * @param {Object} options - 配置选项
 * @param {number} options.maxRetries - 最大重试次数
 * @param {number} options.retryDelay - 重试延迟（毫秒）
 * @param {boolean} options.showError - 是否显示错误消息
 */
const useRequest = (options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    showError = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * 延迟函数
   */
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * 执行请求
   * @param {Function} requestFn - 请求函数
   * @param {Object} requestOptions - 请求配置
   */
  const run = useCallback(async (requestFn, requestOptions = {}) => {
    const {
      showLoading = true,
      onSuccess,
      onError,
      retry = true,
    } = requestOptions;

    setError(null);
    setRetryCount(0);

    if (showLoading) {
      setLoading(true);
    }

    let lastError = null;
    let attempts = 0;

    while (attempts <= (retry ? maxRetries : 0)) {
      try {
        const result = await requestFn();
        
        if (showLoading) {
          setLoading(false);
        }
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        lastError = err;
        attempts++;
        setRetryCount(attempts);

        // 判断是否应该重试
        const shouldRetry = retry && 
                           attempts <= maxRetries && 
                           isRetryableError(err);

        if (shouldRetry) {
          // 计算重试延迟（指数退避）
          const currentDelay = retryDelay * Math.pow(2, attempts - 1);
          
          if (showError) {
            message.warning(
              `请求失败，${currentDelay / 1000}秒后重试 (${attempts}/${maxRetries})`,
              currentDelay / 1000
            );
          }
          
          await delay(currentDelay);
        } else {
          // 不再重试，处理错误
          setError(err);
          
          if (showLoading) {
            setLoading(false);
          }
          
          const errorMsg = getErrorMessage(err);
          
          if (showError) {
            message.error(errorMsg);
          }
          
          if (onError) {
            onError(err);
          }
          
          throw err;
        }
      }
    }

    // 如果所有重试都失败了
    setError(lastError);
    
    if (showLoading) {
      setLoading(false);
    }
    
    const errorMsg = getErrorMessage(lastError);
    
    if (showError) {
      message.error(`${errorMsg}（已重试${maxRetries}次）`);
    }
    
    if (requestOptions.onError) {
      requestOptions.onError(lastError);
    }
    
    throw lastError;
  }, [maxRetries, retryDelay, showError]);

  /**
   * 手动重试
   */
  const retry = useCallback((requestFn, requestOptions) => {
    return run(requestFn, requestOptions);
  }, [run]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    loading,
    error,
    retryCount,
    run,
    retry,
    reset,
  };
};

export default useRequest;
