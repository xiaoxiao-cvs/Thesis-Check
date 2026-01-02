# 前端依赖安装说明

## 必需依赖（已在package.json中）

```bash
pnpm install
```

已安装的核心依赖：
- react@19.2.0
- react-dom@19.2.0
- react-router-dom@7.11.0
- antd@6.1.3
- @ant-design/icons@6.1.0
- @reduxjs/toolkit@2.11.2
- react-redux@9.2.0
- axios@1.13.2
- echarts@6.0.0
- echarts-for-react@3.0.5
- dayjs@1.11.19

## 可选依赖

### 1. 论文预览功能

如需使用 Word 文档在线预览，需安装：

```bash
pnpm add mammoth
```

**用途：** 在论文详情页面预览 .docx 文件

**相关文件：**
- `/components/PaperPreview/index.jsx`
- `/pages/Papers/PaperDetail.jsx`

---

### 2. 测试工具（未来计划）

```bash
# 单元测试
pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# API Mock
pnpm add -D msw

# E2E测试
pnpm add -D playwright @playwright/test
```

---

### 3. 代码质量工具（可选）

```bash
# Prettier 代码格式化
pnpm add -D prettier

# Husky Git Hooks
pnpm add -D husky lint-staged
```

---

## 安装后验证

### 验证基本功能
```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:5173
# 测试登录、上传论文等功能
```

### 验证论文预览（如已安装 mammoth）
1. 上传一篇论文
2. 进入论文详情页
3. 点击"预览"按钮
4. 应能看到 Word 文档内容

---

## 常见问题

### Q: 为什么不自动安装 mammoth？
A: mammoth 体积较大（~500KB），如果项目不需要预览功能，可以不安装以减小打包体积。

### Q: 其他预览方案？
A: 
1. **Office Online** - 需要Office 365订阅
2. **Google Docs Viewer** - 需要公网访问
3. **PDF转换** - 后端转换为PDF后预览
4. **mammoth.js** - 当前方案，客户端解析

### Q: 如何禁用预览功能？
A: 在论文详情页面注释或移除"预览"按钮即可，不影响其他功能。

---

## 依赖更新

定期检查依赖更新：

```bash
# 检查过时依赖
pnpm outdated

# 更新所有依赖到latest
pnpm update --latest

# 更新特定依赖
pnpm update react react-dom
```

---

## 依赖分析

查看打包体积：

```bash
# 构建并分析
pnpm build
pnpm analyze  # 需要配置 rollup-plugin-visualizer
```

---

最后更新：2026年1月2日
