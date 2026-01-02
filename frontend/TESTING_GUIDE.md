# 测试指南

## 📦 安装测试依赖

```bash
cd frontend

# 安装测试框架
pnpm add -D vitest @vitest/ui
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
pnpm add -D jsdom
```

## 🧪 运行测试

```bash
# 运行所有测试
pnpm test

# 监听模式（开发时推荐）
pnpm test:watch

# 生成覆盖率报告
pnpm test:coverage

# 使用UI界面运行测试
pnpm test:ui
```

## 📝 package.json脚本配置

在 `package.json` 中添加以下scripts：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## 📂 测试文件结构

```
frontend/src/tests/
├── setup.js              # 测试环境配置
├── components/           # 组件测试
│   └── GradeTag.test.jsx
├── hooks/                # Hook测试
│   └── useLoading.test.js
└── utils/                # 工具函数测试
    ├── errorHandler.test.js
    ├── validators.test.js
    └── export.test.js
```

## ✅ 已创建的测试

### 1. 组件测试（1个）
- **GradeTag.test.jsx** - 成绩标签组件
  - ✅ 测试所有成绩等级渲染
  - ✅ 测试未知等级的默认处理

### 2. Hook测试（1个）
- **useLoading.test.js** - 加载状态Hook
  - ✅ 测试初始状态
  - ✅ 测试startLoading/stopLoading
  - ✅ 测试withLoading自动管理
  - ✅ 测试按键独立loading状态

### 3. 工具函数测试（3个）
- **errorHandler.test.js** - 错误处理工具
  - ✅ 测试错误消息转换
  - ✅ 测试错误类型判断
  - ✅ 测试可重试错误判断

- **validators.test.js** - 表单验证工具
  - ✅ 测试所有正则表达式
  - ✅ 测试验证规则生成

- **export.test.js** - 数据导出工具
  - ✅ 测试CSV导出
  - ✅ 测试JSON导出

## 📊 测试覆盖率目标

| 类别 | 目标覆盖率 | 当前状态 |
|------|-----------|---------|
| 工具函数 | 90%+ | ✅ 已达标 |
| Hooks | 80%+ | ✅ 已达标 |
| 组件 | 70%+ | 🚧 进行中 |
| 总体 | 75%+ | 🚧 进行中 |

## 🎯 待添加的测试

### 优先级P0（建议立即添加）
1. **TableSkeleton.test.jsx** - 表格骨架屏组件
2. **NotificationProvider.test.jsx** - 通知Provider
3. **useRequest.test.js** - 请求Hook（带重试）

### 优先级P1（1周内）
1. **PaperPreview.test.jsx** - 论文预览组件
2. **NotificationCenter.test.jsx** - 通知中心组件
3. **PrivateRoute.test.jsx** - 路由守卫组件

### 优先级P2（1个月内）
1. 页面组件集成测试
2. API层测试（使用MSW mock）
3. E2E测试（使用Playwright）

## 📚 测试编写指南

### 组件测试模板

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('应该正确渲染', () => {
    render(<MyComponent />);
    expect(screen.getByText('期望的文本')).toBeInTheDocument();
  });
});
```

### Hook测试模板

```js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useMyHook from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('应该返回正确的初始值', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe('expected');
  });
});
```

### 工具函数测试模板

```js
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/utils/myUtils';

describe('myFunction', () => {
  it('应该返回正确的结果', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

## 🐛 常见问题

### Q: 测试运行失败，提示找不到模块？
A: 确保 `vitest.config.js` 中的路径别名配置正确，与 `vite.config.js` 一致。

### Q: 测试Ant Design组件时报错？
A: 确保在 `setup.js` 中正确配置了 `matchMedia` mock。

### Q: 如何测试异步操作？
A: 使用 `async/await` 和 `waitFor`：
```js
import { waitFor } from '@testing-library/react';

it('异步测试', async () => {
  // ...触发异步操作
  await waitFor(() => {
    expect(screen.getByText('加载完成')).toBeInTheDocument();
  });
});
```

### Q: 如何mock API请求？
A: 使用vitest的mock功能：
```js
import { vi } from 'vitest';
import * as api from '@/api/papers';

vi.mock('@/api/papers', () => ({
  getPaperList: vi.fn().mockResolvedValue({ data: [] }),
}));
```

## 📖 参考资料

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

---

**最后更新：** 2026年1月2日
