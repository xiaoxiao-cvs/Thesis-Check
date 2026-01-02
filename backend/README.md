# Thesis-Check Backend API

基于FastAPI的论文检查系统后端服务。

## 功能特性

- ✅ 用户认证与权限管理（JWT + RBAC）
- ✅ 论文上传与管理（毕业论文/课设论文）
- ✅ 题目检查（重复检测、逻辑分析）
- ✅ 格式检查（模板对比）
- ✅ 内容检查（重复率、图文一致性）
- ✅ 模板管理
- ✅ 检查结果管理
- ✅ 统计分析

## 技术栈

- **框架**: FastAPI 0.110+
- **数据库**: SQLite + SQLAlchemy 2.x
- **认证**: JWT + Bcrypt
- **AI**: 阿里云大模型API
- **搜索**: Whoosh全文搜索引擎
- **异步**: Python asyncio

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 3. 启动服务

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 访问文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
backend/
├── app/
│   ├── api/v1/          # API路由（所有端点以/api/v1开头）
│   ├── core/            # 核心功能（认证、权限）
│   ├── models/          # 数据库模型
│   ├── schemas/         # Pydantic模型
│   ├── services/        # 业务逻辑层
│   ├── utils/           # 工具函数
│   ├── config.py        # 配置文件
│   ├── database.py      # 数据库连接
│   ├── dependencies.py  # 依赖注入
│   └── main.py          # 应用入口
├── data/                # 数据目录（自动创建）
│   ├── database/        # SQLite数据库
│   ├── storage/         # 文件存储
│   └── whoosh_index/    # 搜索索引
├── .env                 # 环境变量
├── .gitignore          
├── requirements.txt     # 依赖列表
└── README.md
```

## API端点

所有API端点都以 `/api/v1` 为前缀。

### 认证 (`/api/v1/auth`)
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/me` - 获取当前用户
- `PUT /api/v1/auth/profile` - 更新个人资料
- `PUT /api/v1/auth/password` - 修改密码

### 用户管理 (`/api/v1/users`)
- `GET /api/v1/users` - 获取用户列表
- `GET /api/v1/users/{id}` - 获取用户详情
- `PUT /api/v1/users/{id}/role` - 修改用户角色
- `DELETE /api/v1/users/{id}` - 删除用户

### 论文管理 (`/api/v1/papers`)
- `POST /api/v1/papers/graduation` - 上传毕业论文
- `POST /api/v1/papers/course` - 上传课设论文
- `GET /api/v1/papers` - 获取论文列表
- `GET /api/v1/papers/{id}` - 获取论文详情
- `DELETE /api/v1/papers/{id}` - 删除论文

更多API详情请访问 `/docs`。

## 默认管理员账户

- 用户名: `admin`
- 邮箱: `admin@thesis-check.com`
- 密码: `Admin@123456`

**⚠️ 首次启动后请立即修改密码！**

## 开发说明

### 数据库迁移

数据库会在首次启动时自动创建。

### 异步任务

论文检查等耗时操作使用 Python asyncio 实现，不会阻塞主线程。

### 文件存储

所有上传的文件存储在 `data/storage/` 目录下：
- `graduation/` - 毕业论文
- `course/` - 课设论文
- `templates/` - 模板文件
- `reports/` - 检查报告

## 许可证

MIT License
