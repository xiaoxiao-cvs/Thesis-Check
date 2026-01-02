# 论文查重系统 - 前端项目

基于 React + Vite + Ant Design 的论文质量检查管理系统前端。

## 技术栈

- **框架**: React 19.2 + Vite 7.3
- **UI 组件库**: Ant Design 6.1
- **状态管理**: Redux Toolkit 2.11
- **路由**: React Router 7.11
- **HTTP 客户端**: Axios 1.13
- **日期处理**: Day.js 1.11
- **样式**: Less

## 已完成功能 ✅

1. **项目初始化**: Vite + React 项目搭建，核心依赖安装
2. **基础配置**: Vite 配置（代理、别名）、环境变量、路由配置
3. **API 封装**: 10+ API 模块（auth、users、papers、templates、check、results等）
4. **认证系统**: JWT Token 管理、Redux authSlice、登录/注册页面
5. **权限系统**: 五级权限体系、PrivateRoute组件、usePermission Hook
6. **主布局**: 侧边栏菜单（根据权限动态显示）、顶栏用户信息
7. **核心组件**: GradeTag、SeverityTag等
8. **WebSocket**: useWebSocket Hook（支持自动重连）
9. **工具函数**: 常量定义、权限判断、格式化、认证工具等
10. **页面**: Login、Register、Dashboard、PaperList、错误页面

## 待完成页面 ⚠️

需要继续实现以下页面（已创建路由配置）:

1. **Profile** - 个人资料管理
2. **PaperUpload** - 论文上传（文件上传组件）
3. **PaperDetail** - 论文详情
4. **CheckSubmit** - 提交检查任务
5. **CheckStatus** - 检查状态（WebSocket实时更新）
6. **ResultList** - 检查结果列表
7. **ResultDetail** - 结果详情（问题分类展示）
8. **TemplateList** - 模板管理
9. **UserList** - 用户管理（管理员）
10. **ParameterList** - 参数设置（主任+）
11. **Statistics** - 统计分析（ECharts图表）
12. **PreviousPaperList** - 往届论文管理

## 开发指南

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm dev
```
访问: http://localhost:5173

### 构建生产版本
```bash
pnpm build
```

## 环境变量

- `VITE_API_BASE_URL`: 后端 API 基础 URL (默认: http://localhost:8888/api/v1)
- `VITE_WS_URL`: WebSocket URL (默认: ws://localhost:8888/ws)
- `VITE_MAX_UPLOAD_SIZE`: 最大上传文件大小 (默认: 52428800 字节 = 50MB)

## 权限说明

五级权限体系: 学生 → 教师 → 主任 → 院长 → 管理员

- **学生**: 上传论文、查看自己的论文和结果
- **教师**: + 模板管理、往届论文、统计分析
- **主任**: + 参数设置
- **院长**: + 锁定/解锁参数
- **管理员**: + 用户管理

## 项目结构

```
src/
├── api/          # API 封装 ✅
├── components/   # 通用组件 ✅ (Layout, PrivateRoute, Tags)
├── hooks/        # 自定义Hooks ✅ (useAuth, usePermission, useWebSocket)
├── pages/        # 页面组件 (部分完成)
├── store/        # Redux状态管理 ✅
├── styles/       # 全局样式 ✅
├── utils/        # 工具函数 ✅
├── App.jsx       # 根组件 ✅
├── main.jsx      # 入口
└── router.jsx    # 路由配置 ✅
```

## 相关文档

- [后端 API 文档](../backend/Thesis-Check-API.postman_collection.json)
- [需求文档](../requirements.md)
- [设计文档](../design.md)
