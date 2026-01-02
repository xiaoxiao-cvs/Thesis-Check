import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLoading from '@/hooks/useLoading';

describe('useLoading Hook', () => {
  it('应该初始化为false', () => {
    const { result } = renderHook(() => useLoading());
    expect(result.current.loading).toBe(false);
  });

  it('应该初始化为指定值', () => {
    const { result } = renderHook(() => useLoading(true));
    expect(result.current.loading).toBe(true);
  });

  it('startLoading应该设置loading为true', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.startLoading();
    });
    
    expect(result.current.loading).toBe(true);
  });

  it('stopLoading应该设置loading为false', () => {
    const { result } = renderHook(() => useLoading(true));
    
    act(() => {
      result.current.stopLoading();
    });
    
    expect(result.current.loading).toBe(false);
  });

  it('withLoading应该自动管理loading状态', async () => {
    const { result } = renderHook(() => useLoading());
    
    const asyncFunc = () => new Promise(resolve => setTimeout(resolve, 100));
    
    expect(result.current.loading).toBe(false);
    
    const promise = act(async () => {
      await result.current.withLoading(asyncFunc);
    });
    
    // 执行中应该是true
    expect(result.current.loading).toBe(true);
    
    await promise;
    
    // 完成后应该是false
    expect(result.current.loading).toBe(false);
  });

  it('应该支持按键管理独立loading状态', () => {
    const { result } = renderHook(() => useLoading());
    
    act(() => {
      result.current.startLoading('save');
    });
    
    expect(result.current.isLoading('save')).toBe(true);
    expect(result.current.isLoading('delete')).toBe(false);
    
    act(() => {
      result.current.stopLoading('save');
    });
    
    expect(result.current.isLoading('save')).toBe(false);
  });
});
