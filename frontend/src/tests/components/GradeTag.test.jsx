import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GradeTag from '@/components/GradeTag';

describe('GradeTag组件', () => {
  it('应该渲染优秀标签', () => {
    render(<GradeTag grade="excellent" />);
    expect(screen.getByText('优秀')).toBeInTheDocument();
  });

  it('应该渲染良好标签', () => {
    render(<GradeTag grade="good" />);
    expect(screen.getByText('良好')).toBeInTheDocument();
  });

  it('应该渲染合格标签', () => {
    render(<GradeTag grade="pass" />);
    expect(screen.getByText('合格')).toBeInTheDocument();
  });

  it('应该渲染不合格标签', () => {
    render(<GradeTag grade="fail" />);
    expect(screen.getByText('不合格')).toBeInTheDocument();
  });

  it('未知评级应该渲染默认标签', () => {
    render(<GradeTag grade="unknown" />);
    expect(screen.getByText('未知')).toBeInTheDocument();
  });
});
