"""
FastAPI应用主入口
"""
import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

# 添加 backend 目录到 Python 路径
backend_dir = Path(__file__).parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.database import init_db, AsyncSessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.api.v1 import api_v1_router
from app.utils.file_handler import ensure_directory_exists


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    应用生命周期管理
    - 启动时创建必要的目录结构
    - 初始化数据库
    - 创建默认管理员账户
    """
    print("🚀 应用启动中...")
    
    # 1. 创建data目录结构
    data_dirs = [
        "./data/database",
        "./data/storage/graduation",
        "./data/storage/course",
        "./data/storage/templates",
        "./data/storage/reports",
        "./data/whoosh_index"
    ]
    
    for directory in data_dirs:
        ensure_directory_exists(directory)
        print(f"✅ 目录已创建: {directory}")
    
    # 2. 初始化数据库
    print("📦 正在初始化数据库...")
    await init_db()
    print("✅ 数据库初始化完成")
    
    # 3. 创建默认管理员账户
    async with AsyncSessionLocal() as db:
        try:
            # 检查管理员是否已存在
            result = await db.execute(
                select(User).where(User.username == settings.INITIAL_ADMIN_USERNAME)
            )
            admin = result.scalar_one_or_none()
            
            if not admin:
                # 创建管理员账户
                admin = User(
                    username=settings.INITIAL_ADMIN_USERNAME,
                    email=settings.INITIAL_ADMIN_EMAIL,
                    password=get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
                    role=UserRole.ADMIN,
                    nickname="系统管理员"
                )
                db.add(admin)
                await db.commit()
                print(f"✅ 管理员账户已创建")
                print(f"   用户名: {settings.INITIAL_ADMIN_USERNAME}")
                print(f"   邮箱: {settings.INITIAL_ADMIN_EMAIL}")
                print(f"   密码: {settings.INITIAL_ADMIN_PASSWORD}")
                print(f"   ⚠️  请及时修改默认密码！")
            else:
                print(f"ℹ️  管理员账户已存在: {admin.username}")
        except Exception as e:
            print(f"❌ 创建管理员账户失败: {str(e)}")
    
    print("✨ 应用启动完成！")
    print(f"📖 API文档: http://localhost:8000/docs")
    print(f"📖 ReDoc: http://localhost:8000/redoc")
    
    yield
    
    # 应用关闭时的清理工作
    print("👋 应用正在关闭...")


# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="基于FastAPI的论文检查系统后端API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该设置具体的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 根路由
@app.get("/", tags=["Root"])
async def root():
    """根路由 - API状态检查"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["Root"])
async def health_check():
    """健康检查"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


# 注册API路由
app.include_router(api_v1_router)


# 异常处理器
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """全局异常处理"""
    import traceback
    print(f"❌ 未处理的异常: {str(exc)}")
    print(traceback.format_exc())
    
    return {
        "detail": "服务器内部错误",
        "error": str(exc) if settings.DEBUG else "Internal Server Error"
    }


if __name__ == "__main__":
    import uvicorn
    
    # 确保工作目录正确
    os.chdir(backend_dir)
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
