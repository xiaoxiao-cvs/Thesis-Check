# 论文检查小助手设计文档

**版本号**：v2.0
**修改日期**：2026-01-02
**修改内容**：
1. 将技术栈从Java/Spring Boot迁移到Python/FastAPI
2. 前端从Thymeleaf迁移到React
3. 数据库从MySQL改为SQLite
4. 采用前后端分离架构
5. 保留所有原有的数据库表名和字段定义

## 1. 系统架构

### 1.1 整体架构
论文检查小助手采用前后端分离架构，后端基于Python + FastAPI框架提供RESTful API服务，前端使用React构建单页应用（SPA），数据库采用SQLite轻量级方案，确保系统的灵活性、可扩展性和高效性。系统主要由以下几个核心模块组成：

```
+-------------------+     +----------------------+     +------------------+
| 前端层 (React)    |     | 后端层 (FastAPI)     |     | 数据层           |
|                   |     |                      |     |                  |
| - React组件       |<--->| - RESTful API路由    |<--->| - SQLite数据库   |
| - 文件上传组件    |     | - JWT认证中间件      |     |   (用户、论文元数据) |
| - 检查结果展示    | HTTP| - 论文管理服务       |     | - 文件存储系统   |
| - 模板管理界面    | JSON| - 检查引擎服务       |     |   (原始论文、模板) |
| - 状态管理(Redux) |     | - 异步任务队列       |     | - Whoosh搜索索引 |
+-------------------+     | - 结果管理服务       |     |   (论文内容索引) |
                          | - 数据管理服务       |     |                  |
                          +----------------------+     +------------------+
```

### 1.2 技术选型

| 技术类别           | 技术选型                     | 版本     | 选择理由                                                                 |
|--------------------|------------------------------|----------|--------------------------------------------------------------------------|
| 前端框架           | React                        | 18.x     | 组件化开发，虚拟DOM，高性能，生态丰富，适合构建复杂的单页应用           |
| UI组件库           | Ant Design                   | 5.x      | 企业级UI设计，组件丰富，与React完美集成，支持主题定制                    |
| 状态管理           | Redux Toolkit                | latest   | 简化Redux使用，提供标准化的状态管理方案                                  |
| HTTP客户端         | Axios                        | latest   | 基于Promise的HTTP客户端，支持请求拦截、响应拦截等功能                    |
| 文件处理           | python-docx                  | latest   | Python原生库，支持Word文档的解析和生成                                   |
| AI大模型           | 阿里云大模型API              | latest   | 用于内容逻辑分析、重复率检测等AI功能，提升检查准确性                     |
| 后端框架           | FastAPI                      | 0.110+   | 现代化Python Web框架，高性能，自动生成API文档，支持异步处理              |
| 数据库             | SQLite                       | 3.x      | 轻量级关系型数据库，无需独立服务器，适合中小规模应用，部署简单           |
| ORM框架            | SQLAlchemy                   | 2.x      | Python最流行的ORM框架，支持多种数据库，提供灵活的查询接口               |
| 认证授权           | JWT + Python-Jose            | latest   | 基于Token的无状态认证，适合前后端分离架构                                |
| 密码加密           | Passlib + Bcrypt             | latest   | 安全的密码哈希库，支持多种加密算法                                       |
| 文件存储           | 本地文件系统                 | -        | 简化部署，适合初期开发和小规模使用                                       |
| 搜索引擎           | Whoosh                       | latest   | 纯Python实现的全文搜索引擎，轻量级，适合中小规模文本检索                 |
| 异步任务           | Celery + Redis               | latest   | 分布式任务队列，支持异步处理长耗时任务                                   |
| API文档            | Swagger UI (内置)            | -        | FastAPI自动生成交互式API文档                                             |
| Python版本         | Python                       | 3.9+     | 现代Python特性支持，类型提示，性能优化                                   |

## 2. 功能模块设计

### 2.1 用户认证与管理模块

#### 2.1.1 功能设计
- **用户注册**：支持邮箱/手机号注册，包含验证码验证
- **用户登录**：支持账号密码登录，记住密码功能
- **权限管理**：基于角色的访问控制（RBAC），支持以下角色：
  - 管理员：最高权限角色，负责系统维护和管理，管理所有用户角色和权限
  - 院长：院系级权限角色，可以管理自己院系内的用户角色，查看整个院系的论文统计信息
  - 主任：专业级权限角色，可以管理本专业内的教师角色，查看本专业的论文统计信息
  - 教师：基础管理角色，可以管理自己带教学生的论文，查看学生论文的查重率、格式等级等，管理论文模板
  - 学生：普通用户角色，可以上传论文、查看自己的论文检查结果
- **角色管理**：
  - 管理员：可以管理所有用户角色，包括管理员
  - 院长：可以管理自己院系内的用户角色
  - 主任：可以管理本专业内的教师角色
- **个人资料管理**：支持修改个人信息、密码等

#### 2.1.2 流程设计
```
用户注册 → 验证邮箱/手机号 → 创建用户记录 → 分配默认角色（学生）
用户登录 → 验证凭证 → 创建会话 → 返回会话ID
角色分配 → 管理员/院长/主任登录 → 选择用户 → 分配角色 → 更新用户权限
```

### 2.2 论文上传与管理模块

#### 2.2.1 功能设计
- **论文上传**：仅限学生用户使用，支持Word文档格式上传，分为两种类型：
  - **毕业论文上传**：需填写指导教师、论文标题
  - **课设论文上传**：需填写论文标题、所属课程、学期、指导教师
- **论文预览**：在线预览论文内容，支持分页查看
- **历史论文管理**：查看、删除、重新检查等
- **论文分类管理**：按论文类型、学期、课程等分类
- **论文检查**：仅限学生用户使用，支持内容检查等多种检查类型

#### 2.2.2 存储设计
- 原始论文文件存储在本地文件系统中（按论文类型分目录存储）
- 论文元数据分为两张表存储：毕业论文表和课设论文表
- 论文内容索引存储在Elasticsearch中

### 2.3 内容检查模块（包含题目检查）

#### 2.3.1 功能设计
- **题目检查**：
  - 题目重复检测：与往届论文题目进行相似度比对（包括逻辑意思是否重复）
  - 题目关键词重复检测：检查关键词与往届论文的重复情况
  - 题目命名逻辑检查：分析题目命名的合理性（如"管理系统"与"信息系统"的区分）
  - 题目长度和格式检查：检查题目长度是否符合要求，格式是否规范
- **内容重复率检测**：
  - 与互联网内容相似度检测
  - 与数据库中文献相似度检测
  - 重复内容定位和标记
  - 重复率计算和报告生成
- **逻辑一致性检查**：
  - 图片与文字描述一致性检查
  - 段落间逻辑关系检查
  - 论点与论据匹配检查
  - 章节结构合理性检查
- **内容质量检查**：
  - 错别字和语法错误检查
  - 专业术语一致性检查
  - 句子复杂度和可读性分析

#### 2.3.2 算法设计
- **题目检查算法**：
  - 使用余弦相似度算法计算题目相似度（能够检测逻辑意思是否重复）
  - 采用TF-IDF提取关键词特征
  - 基于规则引擎检查命名逻辑
- **逻辑一致性检查**：集成阿里云大模型API进行文本逻辑分析，检查图片与文字描述一致性、段落间逻辑关系等
- **重复率检测**：结合SimHash算法和阿里云大模型的语义相似度分析，提高重复内容检测准确性，支持逻辑意思重复的检测
- **语法与质量检查**：使用阿里云大模型进行错别字、语法错误检查和专业术语一致性分析

**Python实现关键技术**：
- 使用`scikit-learn`计算TF-IDF和余弦相似度
- 使用`requests`库调用阿里云大模型API
- 利用`asyncio`实现异步并发检查

### 2.4 格式检查模块

#### 2.4.1 功能设计
- **模板管理**：
  - 模板列表，支持分页和搜索
  - 模板分类标签：全局模板
  - 模板上传（包含专业类型选择）、编辑、删除按钮
  - 权限控制：主任和教师只能上传本专业的论文模板，院长可以上传所有专业的模板
- **格式自动检查**：
  - 页面设置检查（页边距、纸张大小等）
  - 字体格式检查（字体类型、大小、颜色等）
  - 段落格式检查（缩进、行间距、段落间距等）
  - 标题格式检查（标题级别、编号等）
  - 引用格式检查（脚注、参考文献等）
  - 图表格式检查（图表编号、标题位置等）
- **问题标记**：在论文中直接标记格式错误位置，提供详细的错误说明和修正建议，支持错误分类和筛选

#### 2.4.2 实现方式
- 使用python-docx库解析Word文档格式
- 基于模板规则进行格式比对
- 生成带有标记的新文档

**Python实现关键技术**：
- 使用`python-docx`读取和修改Word文档
- 解析段落、标题、表格等元素的格式属性
- 使用模式匹配和条件判断发现格式差异

### 2.5 内容检查模块

#### 2.5.1 功能设计
- **逻辑一致性检查**：
  - 图片与文字描述一致性检查
  - 段落间逻辑关系检查
  - 论点与论据匹配检查
  - 章节结构合理性检查
- **重复率检测**：
  - 与互联网内容相似度检测
  - 与数据库中文献相似度检测
  - 重复内容定位和标记
  - 重复率计算和报告生成
- **内容质量检查**：
  - 错别字和语法错误检查
  - 专业术语一致性检查
  - 句子复杂度和可读性分析

#### 2.5.2 算法设计
- **逻辑一致性检查**：集成阿里云大模型API进行文本逻辑分析，检查图片与文字描述一致性、段落间逻辑关系等
- **重复率检测**：结合SimHash算法和阿里云大模型的语义相似度分析，提高重复内容检测准确性，支持逻辑意思重复的检测
- **语法与质量检查**：使用阿里云大模型进行错别字、语法错误检查和专业术语一致性分析

**Python实现关键技术**：
- 使用`simhash`库计算文本的哈希值
- 使用`whoosh`建立全文搜索索引
- 集成阿里云大模型进行语义分析

### 2.6 检查结果管理模块

#### 2.6.1 功能设计
- **结果展示**：检查结果实时展示，问题分类和优先级排序
- **论文批注**：在原有论文上进行批注，将检查问题直接标记在论文内容中，便于用户直接查看问题并进行修改
- **报告生成**：生成详细的检查报告，支持Word文档导出
- **历史记录**：查看历史检查记录，支持版本对比和查询

#### 2.6.2 数据结构
- 检查结果按模块分类存储
- 每个问题包含位置、类型、描述和建议
- 支持批量导出和打印

### 2.7 数据管理模块

#### 2.7.1 功能设计
- **用户与角色管理**：
  - 管理员：管理所有用户角色，包括院长、主任、教师、学生和管理员
  - 院长：管理自己院系内的用户角色
  - 主任：管理本专业内的教师角色
  - 教师：管理自己带教的学生信息

- **模板管理**（主任、院长和教师专属）：
  - 模板列表，支持分页和搜索
  - 模板分类标签：全局模板
  - 模板上传（包含专业类型选择）、编辑、删除按钮
  - 权限控制：主任和教师只能上传本专业的论文模板，院长可以上传所有专业的模板
- **往届论文数据库管理**（主任、院长和教师专属）



- **论文参数设置**（教师、主任、院长可使用）：
  - 重复率阈值设置：设置论文内容重复率的不合格阈值
  - 格式错误百分比评级标准：在重复率达标的前提下，设置格式错误百分比对应的评级（优良、一般、合格、不合格）
  - 题目错误百分比评级标准：在重复率达标的前提下，设置题目错误百分比对应的评级（优良、一般、合格、不合格）
  - 参数应用范围设置：可设置参数应用于所有学生、特定专业或特定课程
  - 参数锁死功能：院长专属功能，可以锁死参数设置，一旦锁死，教师和主任都不能修改这些参数

- **论文统计与分析**：
  - 院长：查看整个院系的论文统计信息，包括：
    - 论文总数、合格人数、不合格人数
    - 各专业论文质量分布
    - 年度论文质量趋势分析
    - 查重率分布统计
  - 主任：查看本专业的论文统计信息，包括：
    - 专业内论文总数、合格人数、不合格人数
    - 专业内论文查重率分布
    - 各教师带教学生的论文质量统计
  - 教师：查看自己带教学生的论文统计信息，包括：
    - 学生论文总数、合格人数、不合格人数
    - 学生论文查重率分布
    - 学生论文格式等级分布
    - 单个学生的论文详细检查结果

- **论文分类查看**：
  - 院长：查看整个院系的毕业论文和课设论文信息，包括：
    - 按论文类型分类查看
    - 按院系、专业筛选查看
    - 论文详细信息查看（标题、作者、指导教师、检查状态等）
    - 批量导出论文信息功能
  - 主任：查看本专业的毕业论文和课设论文信息，包括：
    - 按论文类型分类查看
    - 按教师、学生筛选查看
    - 论文详细信息查看（标题、作者、指导教师、检查状态等）
  - 教师：查看自己带教学生的毕业论文和课设论文信息，包括：
    - 按论文类型分类查看
    - 按学生筛选查看
    - 论文详细信息查看（标题、作者、课程、学期、检查状态等）
    - 单个论文的检查结果查看


## 3. 数据库设计

### 3.1 用户表（users）
| 字段名          | 数据类型   | 约束     | 描述               |
|-----------------|------------|----------|--------------------|
| id              | BIGINT     | 主键     | 用户ID             |
| username        | VARCHAR(50)| 唯一     | 用户名             |
| email           | VARCHAR(100)| 唯一    | 邮箱               |
| phone           | VARCHAR(20)| 唯一     | 手机号             |
| password        | VARCHAR(100)| 非空    | 加密后的密码       |
| role            | VARCHAR(20)| 非空     | 用户角色（student/teacher/director/dean/admin） |
| department      | VARCHAR(100)|          | 所属院系           |
| major           | VARCHAR(100)|          | 所属专业           |
| nickname        | VARCHAR(50)|          | 昵称               |
| avatar          | VARCHAR(200)|          | 头像URL            |
| created_at      | DATETIME   | 非空     | 创建时间           |
| updated_at      | DATETIME   | 非空     | 更新时间           |

### 3.2 毕业论文表（graduation_papers）
| 字段名          | 数据类型   | 约束     | 描述               |
|-----------------|------------|----------|--------------------|
| id              | BIGINT     | 主键     | 论文ID             |
| title           | VARCHAR(200)| 非空    | 论文标题           |
| author_id       | BIGINT     | 外键     | 作者ID             |
| supervisor_id   | BIGINT     | 外键     | 指导教师ID         |
| file_path       | VARCHAR(200)| 非空    | 文件存储路径       |
| file_format     | VARCHAR(20)| 非空     | 文件格式           |
| file_size       | BIGINT     | 非空     | 文件大小（字节）   |
| status          | VARCHAR(20)| 非空     | 论文状态           |
| created_at      | DATETIME   | 非空     | 创建时间           |
| updated_at      | DATETIME   | 非空     | 更新时间           |

### 3.3 课设论文表（course_papers）
| 字段名          | 数据类型   | 约束     | 描述               |
|-----------------|------------|----------|--------------------|
| id              | BIGINT     | 主键     | 论文ID             |
| title           | VARCHAR(200)| 非空    | 论文标题           |
| author_id       | BIGINT     | 外键     | 作者ID             |
| course          | VARCHAR(100)| 非空    | 所属课程           |
| semester        | VARCHAR(50)| 非空     | 学期               |
| supervisor_id   | BIGINT     | 外键     | 指导教师ID         |
| file_path       | VARCHAR(200)| 非空    | 文件存储路径       |
| file_format     | VARCHAR(20)| 非空     | 文件格式           |
| file_size       | BIGINT     | 非空     | 文件大小（字节）   |
| status          | VARCHAR(20)| 非空     | 论文状态           |
| created_at      | DATETIME   | 非空     | 创建时间           |
| updated_at      | DATETIME   | 非空     | 更新时间           |

### 3.4 模板表（templates）
| 字段名          | 数据类型   | 约束     | 描述               |
|-----------------|------------|----------|--------------------|
| id              | BIGINT     | 主键     | 模板ID             |
| name            | VARCHAR(100)| 非空    | 模板名称           |
| version         | VARCHAR(20)| 非空     | 模板版本           |
| file_path       | VARCHAR(200)| 非空    | 文件存储路径       |
| description     | TEXT       |          | 模板描述           |
| applicable_scope| VARCHAR(100)|          | 适用范围           |
| template_type   | VARCHAR(20)| 非空     | 模板类型（global） |
| visibility      | VARCHAR(20)| 非空     | 可见性（public）   |
| created_by      | BIGINT     | 外键     | 创建人ID           |
| created_at      | DATETIME   | 非空     | 创建时间           |
| updated_at      | DATETIME   | 非空     | 更新时间           |

### 3.5 检查结果表（check_results）
| 字段名          | 数据类型   | 约束     | 描述               |
|-----------------|------------|----------|--------------------|
| id              | BIGINT     | 主键     | 结果ID             |
| paper_id        | BIGINT     | 外键     | 论文ID（关联graduation_papers或course_papers） |
| paper_type      | VARCHAR(20)| 非空     | 论文类型（graduation/course） |
| check_type      | VARCHAR(20)| 非空     | 检查类型           |
| check_time      | DATETIME   | 非空     | 检查时间           |
| total_issues    | INT        | 非空     | 问题总数           |
| issues          | JSON       | 非空     | 问题列表           |
| report_path     | VARCHAR(200)|          | 报告存储路径       |
| created_by      | BIGINT     | 外键     | 检查人ID           |

### 3.6 检查问题表（check_issues）
| 字段名          | 数据类型   | 约束     | 描述               |
|-----------------|------------|----------|--------------------|
| id              | BIGINT     | 主键     | 问题ID             |
| result_id       | BIGINT     | 外键     | 结果ID             |
| issue_type      | VARCHAR(20)| 非空     | 问题类型           |
| issue_level     | VARCHAR(20)| 非空     | 问题级别           |
| location        | VARCHAR(100)| 非空    | 问题位置           |
| description     | TEXT       | 非空     | 问题描述           |
| suggestion      | TEXT       |          | 修正建议           |
| confidence      | DOUBLE     |          | 问题置信度         |

### 3.7 往届论文表（previous_papers）
| 字段名          | 数据类型   | 约束     | 描述               |
|-----------------|------------|----------|--------------------|
| id              | BIGINT     | 主键     | 论文ID             |
| title           | VARCHAR(200)| 非空    | 论文标题           |
| keywords        | JSON       | 非空     | 关键词列表         |
| author          | VARCHAR(50)| 非空     | 作者               |
| year            | INT        | 非空     | 年份               |
| department      | VARCHAR(100)|          | 院系               |
| summary         | TEXT       |          | 摘要               |

### 3.8 论文参数设置表（paper_parameters）
| 字段名          | 数据类型   | 约束     | 描述               |
|-----------------|------------|----------|--------------------|
| id              | BIGINT     | 主键     | 参数设置ID         |
| name            | VARCHAR(100)| 非空    | 参数名称           |
| duplicate_rate_threshold | DOUBLE | 非空     | 重复率不合格阈值（百分比） |
| format_excellent_threshold | DOUBLE | 非空     | 格式优良阈值（错误百分比） |
| format_good_threshold | DOUBLE | 非空     | 格式一般阈值（错误百分比） |
| format_passing_threshold | DOUBLE | 非空     | 格式合格阈值（错误百分比） |
| format_failure_threshold | DOUBLE | 非空     | 格式不合格阈值（错误百分比） |
| title_excellent_threshold | DOUBLE | 非空     | 题目优良阈值（错误百分比） |
| title_good_threshold | DOUBLE | 非空     | 题目一般阈值（错误百分比） |
| title_passing_threshold | DOUBLE | 非空     | 题目合格阈值（错误百分比） |
| title_failure_threshold | DOUBLE | 非空     | 题目不合格阈值（错误百分比） |
| application_scope | VARCHAR(20)| 非空     | 应用范围（all/major/course） |
| scope_id        | BIGINT     |          | 范围ID（如果是major或course） |
| lock_status     | BOOLEAN    | 非空     | 锁死状态（true/false） |
| locked_by       | BIGINT     |          | 锁死人ID（仅院长可操作） |
| locked_at       | DATETIME   |          | 锁死时间           |
| created_by      | BIGINT     | 外键     | 创建人ID           |
| created_at      | DATETIME   | 非空     | 创建时间           |
| updated_at      | DATETIME   | 非空     | 更新时间           |

## 4. 界面设计

### 4.1 整体风格
- **主色调**：蓝色系（#1890ff）搭配绿色系（#52c41a），营造专业且鲜活的视觉效果
- **辅助色**：橙色（#fa8c16）用于强调和警告，灰色系用于背景和次要信息
- **字体**：采用无衬线字体，确保跨平台一致性和可读性
- **布局**：响应式设计，支持桌面端和移动端

### 4.2 主要界面

#### 4.2.1 登录注册界面
- 简洁的表单设计，支持邮箱/手机号注册
- 密码强度提示，验证码验证
- 记住密码功能，忘记密码链接

#### 4.2.2 主界面
- 顶部导航栏：用户信息、通知、设置
- 左侧菜单栏：论文管理、模板管理、检查记录、数据管理
- 右侧工作区：根据选择的功能模块显示相应内容

#### 4.2.3 论文上传界面
- 拖拽上传区域，支持单文件上传
- 文件格式和大小限制提示
- 上传进度显示
- 模板选择下拉框

#### 4.2.4 论文检查界面（学生专属）
- 论文预览窗口
- 检查选项设置：
  - 内容检查（必选/可选，包含题目检查和内容检查）
  - 格式检查（必选/可选）
  - 其他检查类型（如适用）
- 内容检查包含：
  - 题目逻辑重复检查
  - 内容重复率检测
  - 图文一致性检查
  - 段落逻辑思路检查
- 检查进度显示
- 实时问题统计

#### 4.2.5 检查结果界面（学生专属）
- **头部按钮**：学生用户专属的操作按钮区域
- **检查结果概览**：
  - 论文整体规范评级：优良、一般、合格、不合格，如果重复率未达标直接判不合格，并显示重复率未达标提示
  - 查重率显示
  - 内容问题个数（包括题目问题）
  - 格式问题个数
- **详细问题列表**：
  - 切换按钮：格式问题、内容问题
  - 问题显示内容：问题类型、位置、严重程度、建议
  - 合理的布局设计，便于查看和定位问题
- **检查报告**：
  - 下载查重报告按钮
  - 论文修正建议按钮（包含具体批注的原文档）
  - 重新检查按钮（返回论文检查页面）
- 问题类型筛选和排序
- 论文内容与问题标记同步显示
- 问题详情弹窗

#### 4.2.6 模板管理界面（主任、院长和教师专属）
- 模板列表，支持分页和搜索
- 模板分类标签：全局模板
- 模板上传（包含专业类型选择）、编辑、删除按钮（权限控制）
- 权限控制：主任和教师只能上传本专业的论文模板，院长可以上传所有专业的模板

#### 4.2.7 历史记录界面（学生专属）
- 检查记录列表，支持按时间、状态筛选
- 记录列表显示列：论文标题、检查时间、整体论文质量、查重率、检查状态
- 记录详情查看
- 重新检查功能
- 报告下载功能

#### 4.2.8 角色管理界面（管理员、院长、主任专属）
- 用户列表，支持按角色、院系、专业筛选
- 角色分配和修改功能（根据用户角色限制权限范围）
- 用户权限查看

#### 4.2.9 论文统计分析界面
- 院长视图：展示整个院系的论文统计信息，包括合格/不合格人数、查重率分布等
- 主任视图：展示本专业的论文统计信息，包括专业内论文质量分布、教师带教情况等
- 教师视图：展示自己带教学生的论文统计信息，包括学生论文查重率、格式等级等

#### 4.2.10 论文分类查看界面
- 论文类型切换选项：毕业论文/课设论文
- 论文列表展示，支持分页、搜索和筛选
- 筛选条件：按院系、专业、教师、学生、检查状态等
- 论文详细信息查看弹窗
- 批量操作功能（导出、统计）
- 权限控制：根据用户角色（管理员/院长/主任/教师）显示不同的筛选条件和操作权限

#### 4.2.11 论文参数设置界面（教师、主任、院长专属）
- 参数设置区域：
  - 重复率阈值设置：输入框，用于设置论文内容重复率的不合格阈值（百分比）
  - 格式错误百分比评级标准：
    - 优良：设置格式错误百分比的优良阈值
    - 一般：设置格式错误百分比的一般阈值
    - 合格：设置格式错误百分比的合格阈值
    - 不合格：设置格式错误百分比的不合格阈值
  - 题目错误百分比评级标准：
    - 优良：设置题目错误百分比的优良阈值
    - 一般：设置题目错误百分比的一般阈值
    - 合格：设置题目错误百分比的合格阈值
    - 不合格：设置题目错误百分比的不合格阈值
- 参数应用范围设置：
  - 所有学生
  - 特定专业（下拉选择）
  - 特定课程（下拉选择）
- 锁死状态显示：
  - 显示当前参数的锁死状态
  - 如果被锁死，显示锁死人和锁死时间
- 操作按钮：
  - 保存参数：保存当前设置的参数（如果参数被锁死且当前用户不是院长，则禁用）
  - 应用参数：立即应用参数到论文检查系统（如果参数被锁死且当前用户不是院长，则禁用）
  - 重置参数：恢复默认参数设置（如果参数被锁死且当前用户不是院长，则禁用）
  - 锁死/解锁参数：院长专属按钮，用于锁死或解锁参数设置
- 权限控制：
  - 教师：只能设置自己带教学生的参数，无法修改被锁死的参数
  - 主任：可以设置本专业所有学生的参数，无法修改被锁死的参数
  - 院长：可以设置全院系学生的参数，并且拥有锁死/解锁参数的权限

## 5. 关键功能流程

### 5.1 论文检查流程

```
开始 → 学生登录 → 上传论文 → 选择模板 → 选择检查模块（内容检查等） → 提交检查 →
→ 解析论文内容 → 执行内容检查（包含题目检查） → 执行格式检查 →
→ 生成检查结果 → 保存结果 → 展示给用户 → 导出Word报告 → 结束
```

### 5.2 格式检查流程

```
开始 → 加载论文模板 → 解析待检查论文 → 提取格式信息 →
→ 与模板格式比对 → 发现格式差异 → 记录问题位置和描述 →
→ 生成带有标记的论文 → 返回检查结果 → 结束
```

### 5.3 重复率检测流程

```
开始 → 提取论文内容 → 分词处理 → 生成特征向量 →
→ 与数据库中文献比对 → 计算相似度 → 筛选高相似度内容 →
→ 记录重复位置和来源 → 计算总体重复率 → 返回检测结果 → 结束
```

## 6. 安全性设计

### 6.1 数据安全
- 敏感数据在传输过程中使用HTTPS加密
- 论文内容存储时进行加密处理
- 定期数据备份，确保数据可恢复性

### 6.2 访问控制
- 基于角色的访问控制（RBAC）
- JWT Token认证机制，支持Token过期和刷新
- API请求频率限制，防止暴力攻击
- 敏感操作需要二次验证
- 使用Bcrypt加密存储密码

### 6.3 上传安全
- 文件类型验证和过滤（仅允许Word文档）
- 文件大小限制（10MB以内）
- 上传文件重命名，防止路径遍历攻击
- 使用FastAPI的File上传验证机制

**Python安全实践**：
- 使用`passlib`进行密码哈希
- 使用`python-jose`生成和验证JWT
- 使用`slowapi`实现API限流

## 7. 性能优化

### 7.1 后端优化
- 使用Redis缓存频繁访问的数据（用户信息、模板配置等）
- SQLite数据库查询优化，使用索引提高查询效率
- 异步处理长耗时任务（如论文检查）使用Celery
- SQLAlchemy连接池优化
- 使用FastAPI的异步特性提高并发处理能力

### 7.2 前端优化
- React组件懒加载和Code Splitting
- 静态资源压缩和缓存
- 使用CDN加速静态资源
- 减少HTTP请求数量，合并API调用
- 使用React.memo和useMemo优化渲染性能
- 使用虚拟滚动处理大量数据列表

### 7.3 检查引擎优化
- 多线程并行检查不同模块使用`concurrent.futures`
- 大文件分片处理
- 缓存检查结果，避免重复计算
- 使用Celery异步处理长耗时任务

**Python性能优化技术**：
- 使用`asyncio`实现异步I/O操作
- 使用`multiprocessing`处理CPU密集型任务
- 使用`ujson`代替标准json库提高JSON处理速度

## 8. 部署方案

### 8.1 开发环境
- Python 3.9+
- Node.js 18.x+ (前端开发)
- SQLite 3.x
- Redis 7.x (可选，用于缓存和任务队列)
- Whoosh (搜索引擎)
- IDE：VS Code / PyCharm

### 8.2 测试环境
- 独立的测试数据库 (SQLite)
- 模拟数据生成工具
- 自动化测试脚本 (pytest)
- API测试工具 (Postman / Thunder Client)

### 8.3 生产环境
- 服务器：Linux服务器 (Ubuntu 20.04+)
- Python 3.9+
- 进程管理：Gunicorn + Supervisor / Uvicorn
- Web服务器：Nginx (反向代理 + 静态资源)
- SQLite 3.x (小规模) 或 PostgreSQL (大规模)
- 监控工具：Prometheus + Grafana

### 8.4 Docker部署 (推荐)
- 后端：FastAPI + Gunicorn
- 前端：Nginx + React构建产物
- 数据库：SQLite文件挂载或PostgreSQL容器
- Redis容器
- 使用docker-compose编排服务

## 9. 监控与维护

### 9.1 系统监控
- 应用性能监控（APM）：使用New Relic或Datadog
- 服务器资源监控：Prometheus + Grafana
- 数据库性能监控
- FastAPI请求日志和性能指标

### 9.2 日志管理
- 集中式日志收集（ELK Stack 或 Loki）
- 日志分级和分类：使用Python `logging`模块
- 日志分析和检索
- 异常日志告警

### 9.3 维护计划
- 定期系统更新：Python包和依赖库
- 漏洞扫描和修复：使用`safety`工具
- 性能优化和调优
- 用户反馈收集和处理

## 10. 文档和培训

### 10.1 用户文档
- 系统使用指南
- 功能操作手册
- 常见问题解答

### 10.2 开发文档
- RESTful API接口文档 (自动生成 by FastAPI Swagger)
- 数据库设计文档
- 架构设计文档
- Python代码规范文档 (PEP 8)
- React组件开发文档

### 10.3 培训计划
- 教师用户培训
- 学生用户培训
- 技术支持团队培训

## 11. 其他要求

- 整体风格和颜色要鲜活明艳的
- 使用SQLite数据库，轻量级且易于部署
- 集成阿里云大模型API，使用密钥：sk-6f43fe9047914dbfb8b97d6092f1da96
- 确保阿里云大模型API密钥的安全存储和管理（使用环境变量或配置文件）
- 前后端分离架构，前端使用React，后端使用FastAPI

## 12. 环境配置

### 12.1 阿里云大模型配置
- API密钥管理（默认密钥：sk-6f43fe9047914dbfb8b97d6092f1da96）
- 使用Python-dotenv管理环境变量
- 配置文件示例：`.env.example`

### 12.2 数据库配置
- SQLite数据库文件路径：`./data/paper_checking.db`
- 自动创建数据库表结构（使用SQLAlchemy）
- 支持数据库迁移（Alembic）


## 13. 数据库Schema定义（SQLite）

**注意**：以下SQL语句适用于SQLite数据库。实际开发中推荐使用SQLAlchemy ORM自动创建表结构。

```sql
-- SQLite数据库文件：paper_checking.db

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department VARCHAR(100),
    major VARCHAR(100),
    nickname VARCHAR(50),
    avatar VARCHAR(200),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建毕业论文表
CREATE TABLE IF NOT EXISTS graduation_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    author_id INTEGER NOT NULL,
    supervisor_id INTEGER NOT NULL,
    file_path VARCHAR(200) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    file_size INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建课设论文表
CREATE TABLE IF NOT EXISTS course_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    author_id INTEGER NOT NULL,
    course VARCHAR(100) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    supervisor_id INTEGER NOT NULL,
    file_path VARCHAR(200) NOT NULL,
    file_format VARCHAR(20) NOT NULL,
    file_size INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建模板表
CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    file_path VARCHAR(200) NOT NULL,
    description TEXT,
    applicable_scope VARCHAR(100),
    template_type VARCHAR(20) NOT NULL DEFAULT 'global',
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    created_by INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建检查结果表
CREATE TABLE IF NOT EXISTS check_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    paper_type VARCHAR(20) NOT NULL,
    check_type VARCHAR(20) NOT NULL,
    check_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_issues INTEGER NOT NULL,
    issues TEXT NOT NULL,  -- SQLite使用TEXT存储JSON数据
    report_path VARCHAR(200),
    created_by INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建检查问题表
CREATE TABLE IF NOT EXISTS check_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    result_id INTEGER NOT NULL,
    issue_type VARCHAR(20) NOT NULL,
    issue_level VARCHAR(20) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    suggestion TEXT,
    confidence REAL,  -- SQLite使用REAL代替DOUBLE
    FOREIGN KEY (result_id) REFERENCES check_results(id) ON DELETE CASCADE
);

-- 创建往届论文表
CREATE TABLE IF NOT EXISTS previous_papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    keywords TEXT NOT NULL,  -- SQLite使用TEXT存储JSON数据
    author VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL,
    department VARCHAR(100),
    summary TEXT
);

-- 创建论文参数设置表
CREATE TABLE IF NOT EXISTS paper_parameters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    duplicate_rate_threshold REAL NOT NULL,
    format_excellent_threshold REAL NOT NULL,
    format_good_threshold REAL NOT NULL,
    format_passing_threshold REAL NOT NULL,
    format_failure_threshold REAL NOT NULL,
    title_excellent_threshold REAL NOT NULL,
    title_good_threshold REAL NOT NULL,
    title_passing_threshold REAL NOT NULL,
    title_failure_threshold REAL NOT NULL,
    application_scope VARCHAR(20) NOT NULL,
    scope_id INTEGER,
    lock_status INTEGER NOT NULL DEFAULT 0,  -- SQLite使用INTEGER代替BOOLEAN，0=false, 1=true
    locked_by INTEGER,
    locked_at DATETIME,
    created_by INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_graduation_papers_author ON graduation_papers(author_id);
CREATE INDEX IF NOT EXISTS idx_course_papers_author ON course_papers(author_id);
CREATE INDEX IF NOT EXISTS idx_check_results_paper ON check_results(paper_id, paper_type);
```

## 14. SQLAlchemy模型定义说明

推荐在实际开发中使用SQLAlchemy定义模型，自动管理表结构：

```python
# 示例：使用SQLAlchemy定义User模型
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

使用Alembic进行数据库迁移管理。

---

## 15. 前端实现规划

### 15.1 前端技术栈

| 技术类别      | 技术选型                | 版本    | 说明                           |
|--------------|------------------------|---------|-------------------------------|
| 框架         | React                  | 19.2    | 最新版本，支持并发特性          |
| 构建工具      | Vite                   | 7.3     | 快速的开发构建工具              |
| UI组件库      | Ant Design             | 6.1     | 企业级UI组件库                 |
| 状态管理      | Redux Toolkit          | 2.11    | 简化的Redux状态管理             |
| 路由         | React Router           | 7.11    | 声明式路由                     |
| HTTP客户端    | Axios                  | 1.13    | Promise风格的HTTP库            |
| 日期处理      | Day.js                 | 1.11    | 轻量级日期库                   |
| 样式方案      | Less                   | 4.5     | CSS预处理器                    |
| 图表库       | ECharts                | 待定    | 数据可视化（统计分析页面）       |

### 15.2 已完成功能 ✅

#### 基础架构（100%）
- ✅ Vite项目初始化，核心依赖安装
- ✅ Vite配置（代理、路径别名、Less支持）
- ✅ 环境变量配置（开发/生产环境）
- ✅ 标准化目录结构（api、components、pages、store、utils等）
- ✅ 路由配置（懒加载、嵌套路由、权限路由）

#### API封装（100%）
- ✅ Axios实例配置（JWT拦截器、统一错误处理）
- ✅ 10个API模块：auth、users、papers、templates、check、results、parameters、previousPapers、statistics

#### 认证与权限系统（100%）
- ✅ Redux authSlice（登录、获取用户、登出）
- ✅ JWT Token管理（localStorage）
- ✅ PrivateRoute组件（路由级权限控制）
- ✅ useAuth Hook（认证状态）
- ✅ usePermission Hook（权限检查）
- ✅ 五级权限体系实现（学生/教师/主任/院长/管理员）

#### 通用组件（100%）
- ✅ MainLayout（侧边栏菜单、顶栏、根据权限动态显示菜单）
- ✅ PrivateRoute（权限路由包装器）
- ✅ GradeTag（评级标签）
- ✅ SeverityTag（问题严重程度标签）

#### 自定义Hooks（100%）
- ✅ useAuth（认证状态管理）
- ✅ usePermission（权限检查）
- ✅ useWebSocket（WebSocket连接，支持自动重连）

#### 工具函数（100%）
- ✅ constants.js（角色、状态、类型等常量定义）
- ✅ auth.js（Token管理、权限判断）
- ✅ format.js（日期、数字、文本格式化）

#### 核心页面（30%）
- ✅ Login（登录页面）
- ✅ Register（注册页面）
- ✅ Dashboard（工作台，统计卡片、最近论文）
- ✅ PaperList（论文列表，搜索、筛选、分页）
- ✅ NotFound、Forbidden（错误页面）

### 15.3 待完成功能 ⚠️

#### 学生端核心功能
1. **个人资料页面** - 显示用户信息、修改资料、修改密码
2. **论文上传页面** - 文件上传组件（拖拽）、根据类型显示不同表单、进度显示
3. **论文详情页面** - 显示论文元数据、历史检查记录、操作按钮
4. **检查提交页面** - 选择检查类型、选择模板、提交任务
5. **检查状态页面** - WebSocket实时显示进度、完成后跳转
6. **结果列表页面** - 显示检查结果、筛选搜索
7. **结果详情页面** - 整体评级、问题分类展示、下载报告

#### 教师端功能
8. **模板管理页面** - 上传模板、列表、编辑/删除
9. **往届论文管理** - 上传往届论文、列表、删除
10. **统计分析页面** - ECharts图表、多维度统计

#### 管理端功能
11. **用户管理页面** - 用户列表、修改角色、删除用户
12. **参数设置页面** - 创建/编辑参数、锁定/解锁（院长权限）

### 15.4 前端项目结构

```
frontend/
├── src/
│   ├── api/                    # API接口封装 ✅
│   │   ├── request.js          # Axios实例
│   │   ├── auth.js             # 认证API
│   │   ├── users.js            # 用户API
│   │   ├── papers.js           # 论文API
│   │   ├── templates.js        # 模板API
│   │   ├── check.js            # 检查API
│   │   ├── results.js          # 结果API
│   │   ├── parameters.js       # 参数API
│   │   ├── previousPapers.js   # 往届论文API
│   │   └── statistics.js       # 统计API
│   │
│   ├── components/             # 通用组件 ✅
│   │   ├── Layout/             # 主布局
│   │   ├── PrivateRoute/       # 权限路由
│   │   ├── GradeTag/           # 评级标签
│   │   └── SeverityTag/        # 严重程度标签
│   │
│   ├── pages/                  # 页面组件
│   │   ├── Auth/               # 登录注册 ✅
│   │   ├── Dashboard/          # 工作台 ✅
│   │   ├── Profile/            # 个人资料 ⚠️
│   │   ├── Papers/             # 论文管理（部分完成）
│   │   ├── Check/              # 检查相关 ⚠️
│   │   ├── Results/            # 结果管理 ⚠️
│   │   ├── Templates/          # 模板管理 ⚠️
│   │   ├── Users/              # 用户管理 ⚠️
│   │   ├── Parameters/         # 参数设置 ⚠️
│   │   ├── Statistics/         # 统计分析 ⚠️
│   │   ├── PreviousPapers/     # 往届论文 ⚠️
│   │   └── Error/              # 错误页面 ✅
│   │
│   ├── store/                  # Redux状态管理 ✅
│   │   ├── authSlice.js        # 认证状态
│   │   └── index.js            # Store配置
│   │
│   ├── hooks/                  # 自定义Hooks ✅
│   │   ├── useAuth.js          # 认证Hook
│   │   ├── usePermission.js    # 权限Hook
│   │   └── useWebSocket.js     # WebSocket Hook
│   │
│   ├── utils/                  # 工具函数 ✅
│   │   ├── constants.js        # 常量定义
│   │   ├── auth.js             # 认证工具
│   │   └── format.js           # 格式化工具
│   │
│   ├── styles/                 # 全局样式 ✅
│   │   └── global.less         # 全局样式
│   │
│   ├── App.jsx                 # 根组件 ✅
│   ├── main.jsx                # 入口文件
│   └── router.jsx              # 路由配置 ✅
│
├── .env                        # 环境变量 ✅
├── .env.production             # 生产环境变量 ✅
├── vite.config.js              # Vite配置 ✅
├── package.json
├── README.md                   # 项目说明
└── IMPLEMENTATION.md           # 实现总结
```

### 15.5 前端启动说明

```bash
# 进入前端目录
cd frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
# 访问 http://localhost:5173

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

### 15.6 环境变量配置

`.env` - 开发环境：
```env
VITE_API_BASE_URL=http://localhost:8888/api/v1
VITE_WS_URL=ws://localhost:8888/ws
VITE_MAX_UPLOAD_SIZE=52428800
```

`.env.production` - 生产环境：
```env
VITE_API_BASE_URL=https://api.example.com/api/v1
VITE_WS_URL=wss://api.example.com/ws
VITE_MAX_UPLOAD_SIZE=52428800
```

### 15.7 核心功能实现说明

#### WebSocket实时通信
检查状态页面使用WebSocket接收实时进度更新：
```javascript
const { isConnected, lastMessage, sendMessage } = useWebSocket(
  `${WS_URL}/check/${taskId}`,
  {
    onMessage: (data) => {
      // 处理检查进度消息
      setProgress(data.progress);
      setStatus(data.status);
    },
    reconnect: true,
    reconnectAttempts: 5,
  }
);
```

#### 权限控制
五级权限体系，组件级和路由级双重控制：
```javascript
// 路由级权限
<PrivateRoute requiredRoles={USER_ROLES.TEACHER}>
  <TemplateList />
</PrivateRoute>

// 组件级权限
const { checkMinRole } = usePermission();
{checkMinRole(USER_ROLES.ADMIN) && (
  <Button onClick={deleteUser}>删除用户</Button>
)}
```

#### API请求流程
1. 请求拦截：自动添加JWT Token
2. 响应拦截：统一错误处理
3. 401自动跳转登录
4. 统一的错误消息提示

### 15.8 开发进度总结

- 🎉 **基础架构**: 100% 完成
- 🎉 **认证系统**: 100% 完成
- 🎉 **权限系统**: 100% 完成
- 🎉 **API封装**: 100% 完成
- 🎉 **主布局**: 100% 完成
- ⚠️ **功能页面**: 约30% 完成（6/18个页面）
- ⚠️ **整体进度**: 约60% 完成

项目已经具备完整的基础架构和核心功能，可以正常启动运行。剩余的功能页面可以基于现有的组件和工具函数快速开发。

---
