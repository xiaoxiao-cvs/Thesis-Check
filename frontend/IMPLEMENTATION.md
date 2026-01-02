# 前端实现总结

## 项目概述

本项目是一个基于 React + Vite 的论文检查系统前端，实现了完整的五级权限管理系统（学生→教师→主任→院长→管理员），支持论文上传、多维度检查（标题/格式/内容/查重/逻辑）和结果查看等功能。

**项目完成度**: 100% ✅  
**页面总数**: 17 个  
**实现状态**: 全部完成

---

## 技术栈

### 核心框架
- **React 19.2.0**: 最新的 React 版本，支持现代 Hooks 特性
- **Vite 7.3.0**: 快速的开发服务器和构建工具
- **React Router 7.11.0**: 声明式路由，支持懒加载

### UI 组件库
- **Ant Design 6.1.3**: 企业级 UI 设计语言，提供丰富的组件
- **@ant-design/icons**: Ant Design 图标库
- **Less 4.5.1**: CSS 预处理器，配合 Ant Design 主题定制

### 状态管理
- **Redux Toolkit 2.11.2**: 简化的 Redux 配置，用于全局认证状态管理

### 数据请求
- **Axios 1.13.2**: HTTP 客户端，配置了请求拦截器和响应拦截器

### 数据可视化
- **ECharts 6.0.0**: 强大的数据可视化库
- **echarts-for-react 3.0.5**: React 封装的 ECharts 组件

### 工具库
- **Day.js 1.11.19**: 轻量级日期处理库

---

## 核心功能

### 1. 认证系统 ✅

#### JWT Token 管理
- Token 存储在 localStorage
- Axios 请求拦截器自动添加 Authorization 头
- 401 响应自动跳转登录页并清除 Token
- Redux 管理用户登录状态

#### 登录流程
1. 用户提交用户名和密码
2. 调用 `/api/v1/auth/login` 获取 Token
3. 存储 Token 和用户信息到 Redux Store
4. 存储 Token 到 localStorage
5. 跳转到首页

#### 注册流程
1. 用户填写注册表单
2. 前端验证密码一致性
3. 调用 `/api/v1/auth/register`
4. 注册成功跳转到登录页

### 2. 权限管理 ✅

#### 五级权限体系
```javascript
USER_ROLES = {
  STUDENT: 'student',      // 学生（权限等级 1）
  TEACHER: 'teacher',      // 教师（权限等级 2）
  DIRECTOR: 'director',    // 主任（权限等级 3）
  DEAN: 'dean',            // 院长（权限等级 4）
  ADMIN: 'admin'           // 管理员（权限等级 5）
}
```

#### 权限检查
- `hasPermission(requiredRole)`: 检查用户是否拥有所需权限
- `PrivateRoute`: 路由级别的权限控制
- 权限不足自动跳转 403 页面

#### 菜单权限
- 根据用户角色动态生成侧边栏菜单
- 不同角色看到不同的菜单项

### 3. 论文管理 ✅

#### 论文列表
- 表格展示论文列表
- 支持标题搜索和类型筛选
- 分页功能
- 操作：查看详情、提交检查、删除

#### 论文上传
- 支持拖拽上传 .docx 文件
- 文件大小限制 50MB
- 根据论文类型动态显示表单字段
  - 毕业论文：专业、院系、指导老师、学年
  - 课程论文：课程名称、课程代码、学期、授课教师
- 表单验证
- 使用 FormData 上传

#### 论文详情
- 展示论文元数据
- 检查历史表格
- 操作按钮：提交检查、删除论文

### 4. 检查功能 ✅

#### 提交检查
- 显示论文基本信息
- 选择检查类型（至少选择一项）：
  - 标题检查
  - 格式检查
  - 内容检查
  - 查重检查
  - 逻辑检查
- 选择检查模板（根据论文类型筛选）
- 提交后跳转到检查状态页

#### 检查状态（WebSocket 实时）
- WebSocket 实时连接
  - 连接到 `ws://localhost:8888/ws/check/{taskId}`
  - 自动重连机制
  - 心跳保持连接
- 进度显示
  - Progress 进度条
  - 当前阶段提示
  - 状态信息表格
- 完成处理
  - 成功：显示成功结果，跳转到结果详情页
  - 失败：显示错误信息

### 5. 结果查看 ✅

#### 结果列表
- 表格展示检查结果
- 成绩标签（优秀/良好/中等/及格/不及格）
- 重复率颜色标记：
  - >30%: 红色
  - 15-30%: 橙色
  - <15%: 绿色
- 标题搜索
- 分页功能

#### 结果详情
- **统计卡片**
  - 总体成绩（带标签）
  - 重复率（带颜色）
  - 问题总数
  - 检查时间
- **各项成绩**
  - 标题检查分数
  - 格式检查分数
  - 内容检查分数
  - 逻辑检查分数
- **问题列表（分类标签页）**
  - 标题问题、格式问题、内容问题、逻辑问题
  - 每个问题显示：位置、严重程度、描述、建议

### 6. 个人中心 ✅

#### 三个标签页
1. **基本信息**
   - 用户名、邮箱、角色、昵称、电话、院系、专业、注册时间

2. **编辑资料**
   - 可修改：昵称、电话、院系、专业
   - 保存成功提示

3. **修改密码**
   - 字段：旧密码、新密码、确认密码
   - 确认密码验证
   - 修改成功提示

### 7. 模板管理 ✅（教师+）

- 模板列表表格
- 上传新模板（表单 + 文件上传）
- 编辑模板信息（不能修改文件）
- 删除模板（确认弹窗）
- 字段：模板名称、描述、模板类型、可见性

### 8. 用户管理 ✅（管理员）

- 用户列表表格
- 搜索用户（用户名或邮箱）
- 角色筛选
- 修改用户角色（弹窗选择）
- 删除用户（确认弹窗）
- 显示字段：用户名、昵称、邮箱、角色、院系、注册时间

### 9. 参数设置 ✅（主任+）

- 参数列表表格
- 新增参数
- 编辑参数（未锁定或院长可编辑）
- 锁定/解锁参数（仅院长）
- 字段：
  - 参数名称、描述
  - 重复率阈值、格式检查阈值、标题检查阈值、内容检查阈值、逻辑检查阈值
  - 适用范围（全局/院系/专业）
  - 范围 ID、锁定状态

### 10. 往届论文管理 ✅（教师+）

- 往届论文列表表格
- 搜索（标题或作者）
- 年份筛选
- 上传往届论文（表单 + 文件上传）
- 删除论文（确认弹窗）
- 字段：论文标题、作者、年份、院系、专业、上传时间

### 11. 统计分析 ✅（主任+）

- 日期范围选择（默认最近30天）
- 总览统计卡片
  - 论文总数、已完成数、检查中数、失败数
- 可视化图表
  1. 检查状态分布（饼图）
  2. 成绩分布（柱状图）
  3. 院系对比（柱状图+折线图，仅院长可见）
  4. 教师统计（柱状图，Top 10）

### 12. 首页 Dashboard ✅

- 统计卡片（我的论文数、检查次数、待审核结果、平均分数）
- 最近论文列表（最近 5 篇）
- 快捷入口（上传论文、提交检查）

---

## 页面完成列表

| 页面 | 路由 | 权限 | 状态 |
|-----|------|------|------|
| 登录 | `/login` | 无 | ✅ 完成 |
| 注册 | `/register` | 无 | ✅ 完成 |
| 首页 | `/` | 学生+ | ✅ 完成 |
| 论文列表 | `/papers` | 学生+ | ✅ 完成 |
| 上传论文 | `/papers/upload` | 学生+ | ✅ 完成 |
| 论文详情 | `/papers/:id` | 学生+ | ✅ 完成 |
| 提交检查 | `/check/submit/:paperId` | 学生+ | ✅ 完成 |
| 检查状态 | `/check/status/:taskId` | 学生+ | ✅ 完成 |
| 结果列表 | `/results` | 学生+ | ✅ 完成 |
| 结果详情 | `/results/:id` | 学生+ | ✅ 完成 |
| 个人中心 | `/profile` | 学生+ | ✅ 完成 |
| 模板管理 | `/templates` | 教师+ | ✅ 完成 |
| 用户管理 | `/users` | 管理员 | ✅ 完成 |
| 参数设置 | `/parameters` | 主任+ | ✅ 完成 |
| 往届论文 | `/previous-papers` | 教师+ | ✅ 完成 |
| 统计分析 | `/statistics` | 主任+ | ✅ 完成 |
| 404 | `/404` | 无 | ✅ 完成 |
| 403 | `/403` | 无 | ✅ 完成 |

**总计**: 17 个页面，全部完成 ✅

---

## 技术亮点

### 1. WebSocket 实时通信

实现了自动重连和心跳保持的 WebSocket Hook：

```javascript
const useWebSocket = (url, onMessage) => {
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const heartbeatTimer = useRef(null);

  useEffect(() => {
    const connect = () => {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        setConnected(true);
        // 心跳保持
        heartbeatTimer.current = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };
      
      ws.current.onclose = () => {
        setConnected(false);
        // 自动重连
        reconnectTimer.current = setTimeout(connect, 3000);
      };
    };
    
    connect();
    return () => {
      ws.current?.close();
      clearTimeout(reconnectTimer.current);
      clearInterval(heartbeatTimer.current);
    };
  }, [url]);
  
  return { connected };
};
```

### 2. 统一的 API 错误处理

```javascript
// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 清除 Token，跳转登录页
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 3. 路由懒加载

```javascript
const PaperList = lazy(() => import('@/pages/Papers/PaperList'));
const PaperUpload = lazy(() => import('@/pages/Papers/PaperUpload'));
```

### 4. 权限路由封装

```javascript
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading } = useAuth();
  const { hasPermission } = usePermission();
  
  if (loading) return <Spin />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/403" />;
  }
  
  return children;
};
```

### 5. 自定义 Hooks

- **useAuth**: 封装认证状态和方法
- **usePermission**: 封装权限检查逻辑
- **useWebSocket**: 封装 WebSocket 连接和重连逻辑

---

## 开发配置

### Vite 配置

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      }
    }
  }
});
```

### 环境变量

**.env (开发环境)**
```
VITE_API_BASE_URL=http://localhost:8888/api/v1
VITE_WS_URL=ws://localhost:8888/ws
```

**.env.production (生产环境)**
```
VITE_API_BASE_URL=/api/v1
VITE_WS_URL=wss://your-domain.com/ws
```

---

## 开发和部署

### 开发环境启动

```bash
cd frontend
pnpm install
pnpm dev
```

访问: http://localhost:5173

### 生产构建

```bash
pnpm build
```

构建产物在 `dist` 目录。

### 部署（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws {
        proxy_pass http://backend:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 总结

本前端项目实现了完整的论文检查系统功能，包括：
- ✅ 17 个功能页面全部实现
- ✅ 五级权限管理系统
- ✅ WebSocket 实时通信
- ✅ 数据可视化统计
- ✅ 文件上传功能
- ✅ 响应式布局
- ✅ 完善的错误处理
- ✅ 统一的 API 封装

项目结构清晰，代码规范，可维护性强，为后续功能扩展和优化打下了良好基础。

**开发完成时间**: 2026年1月2日  
**开发者**: GitHub Copilot
