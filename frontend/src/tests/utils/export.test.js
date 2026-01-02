import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportToJSON } from '@/utils/export';

// Mock DOM APIs
beforeEach(() => {
  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();
  
  // Mock document.createElement
  document.createElement = vi.fn((tag) => {
    if (tag === 'a') {
      return {
        href: '',
        download: '',
        click: vi.fn(),
        style: {},
      };
    }
    return {};
  });
  
  // Mock document.body
  document.body.appendChild = vi.fn();
  document.body.removeChild = vi.fn();
});

describe('export工具', () => {
  describe('exportToCSV', () => {
    it('应该正确导出CSV数据', () => {
      const data = [
        { id: 1, name: '张三', age: 20 },
        { id: 2, name: '李四', age: 22 },
      ];
      
      const columns = [
        { key: 'id', title: 'ID' },
        { key: 'name', title: '姓名' },
        { key: 'age', title: '年龄' },
      ];
      
      exportToCSV(data, columns, 'test.csv');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('空数据不应该导出', () => {
      const columns = [{ key: 'id', title: 'ID' }];
      
      exportToCSV([], columns, 'test.csv');
      
      // 不应该创建元素
      expect(document.createElement).not.toHaveBeenCalled();
    });
  });

  describe('exportToJSON', () => {
    it('应该正确导出JSON数据', () => {
      const data = { name: '测试', value: 123 };
      
      exportToJSON(data, 'test.json');
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });
});
