import { describe, it, expect } from 'vitest';
import { REGEX, RULES } from '@/utils/validators';

describe('validators工具', () => {
  describe('REGEX正则表达式', () => {
    it('邮箱正则应该正确验证', () => {
      expect(REGEX.EMAIL.test('test@example.com')).toBe(true);
      expect(REGEX.EMAIL.test('invalid-email')).toBe(false);
    });

    it('手机号正则应该正确验证', () => {
      expect(REGEX.PHONE.test('13800138000')).toBe(true);
      expect(REGEX.PHONE.test('12345678901')).toBe(false);
    });

    it('用户名正则应该正确验证', () => {
      expect(REGEX.USERNAME.test('user_123')).toBe(true);
      expect(REGEX.USERNAME.test('ab')).toBe(false); // 太短
      expect(REGEX.USERNAME.test('user@name')).toBe(false); // 包含非法字符
    });

    it('密码正则应该正确验证', () => {
      expect(REGEX.PASSWORD.test('password123')).toBe(true);
      expect(REGEX.PASSWORD.test('12345678')).toBe(false); // 没有字母
      expect(REGEX.PASSWORD.test('password')).toBe(false); // 没有数字
    });

    it('学号正则应该正确验证', () => {
      expect(REGEX.STUDENT_NUMBER.test('20210001')).toBe(true);
      expect(REGEX.STUDENT_NUMBER.test('1234567')).toBe(false); // 太短
    });

    it('年份正则应该正确验证', () => {
      expect(REGEX.YEAR.test('2024')).toBe(true);
      expect(REGEX.YEAR.test('1999')).toBe(true);
      expect(REGEX.YEAR.test('2100')).toBe(false); // 超出范围
    });
  });

  describe('RULES验证规则', () => {
    it('required规则应该有正确的message', () => {
      const rule = RULES.required();
      expect(rule.required).toBe(true);
      expect(rule.message).toBe('此字段为必填项');
    });

    it('required规则应该支持自定义message', () => {
      const rule = RULES.required('请输入用户名');
      expect(rule.message).toBe('请输入用户名');
    });

    it('email规则应该有正确的pattern', () => {
      const rule = RULES.email();
      expect(rule.pattern).toBe(REGEX.EMAIL);
    });

    it('length规则应该有正确的min和max', () => {
      const rule = RULES.length(4, 20);
      expect(rule.min).toBe(4);
      expect(rule.max).toBe(20);
    });
  });
});
