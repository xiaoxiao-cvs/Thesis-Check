"""
API v1 router
"""
from fastapi import APIRouter

# 导入所有路由模块
from app.api.v1 import auth, users, papers, templates, check, results, previous_papers, parameters, statistics

# 创建v1路由器
api_v1_router = APIRouter(prefix="/api/v1")

# 注册各模块路由
api_v1_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_v1_router.include_router(users.router, prefix="/users", tags=["用户管理"])
api_v1_router.include_router(papers.router, prefix="/papers", tags=["论文管理"])
api_v1_router.include_router(templates.router, prefix="/templates", tags=["模板管理"])
api_v1_router.include_router(check.router, prefix="/check", tags=["论文检查"])
api_v1_router.include_router(results.router, prefix="/results", tags=["检查结果"])
api_v1_router.include_router(previous_papers.router, prefix="/previous-papers", tags=["往届论文"])
api_v1_router.include_router(parameters.router, prefix="/parameters", tags=["参数设置"])
api_v1_router.include_router(statistics.router, prefix="/statistics", tags=["统计分析"])
