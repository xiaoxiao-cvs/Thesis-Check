import { describe, it, expect } from 'vitest';
import { getErrorMessage, getErrorType, isRetryableError, ERROR_TYPES } from '@/utils/errorHandler';

describe('errorHandler工具', () => {
  describe('getErrorMessage', () => {
    it('应该返回自定义错误消息', () => {
      const error = new Error('自定义错误');
      expect(getErrorMessage(error)).toBe('自定义错误');
    });

    it('应该处理401错误', () => {
      const error = { response: { status: 401 } };
      expect(getErrorMessage(error)).toBe('您的登录已过期，请重新登录');
    });

    it('应该处理网络错误', () => {
      const error = { message: 'Network Error' };
      expect(getErrorMessage(error)).toBe('网络连接失败，请检查您的网络设置');
    });

    it('应该处理500错误', () => {
      const error = { response: { status: 500 } };
      expect(getErrorMessage(error)).toContain('服务器出错了');
    });
  });

  describe('getErrorType', () => {
    it('应该识别网络错误', () => {
      const error = { message: 'Network Error' };
      expect(getErrorType(error)).toBe(ERROR_TYPES.NETWORK);
    });

    it('应该识别认证错误', () => {
      const error = { response: { status: 401 } };
      expect(getErrorType(error)).toBe(ERROR_TYPES.AUTH);
    });

    it('应该识别验证错误', () => {
      const error = { response: { status: 400 } };
      expect(getErrorType(error)).toBe(ERROR_TYPES.VALIDATION);
    });

    it('应该识别服务器错误', () => {
      const error = { response: { status: 500 } };
      expect(getErrorType(error)).toBe(ERROR_TYPES.SERVER);
    });
  });

  describe('isRetryableError', () => {
    it('网络错误应该可重试', () => {
      const error = { message: 'Network Error' };
      expect(isRetryableError(error)).toBe(true);
    });

    it('服务器错误应该可重试', () => {
      const error = { response: { status: 500 } };
      expect(isRetryableError(error)).toBe(true);
    });

    it('认证错误不应该重试', () => {
      const error = { response: { status: 401 } };
      expect(isRetryableError(error)).toBe(false);
    });

    it('验证错误不应该重试', () => {
      const error = { response: { status: 400 } };
      expect(isRetryableError(error)).toBe(false);
    });
  });
});
