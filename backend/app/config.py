"""
应用配置模块
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用基础配置
    APP_NAME: str = "Thesis-Check API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # 数据库配置
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/database/paper_checking.db"
    
    # JWT配置
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30天
    
    # 阿里云AI配置
    ALIBABA_API_KEY: str
    ALIBABA_API_URL: str = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    
    # 文件存储配置
    STORAGE_PATH: str = "./data/storage"
    MAX_UPLOAD_SIZE: int = 52428800  # 50MB
    
    # Whoosh索引配置
    WHOOSH_INDEX_PATH: str = "./data/whoosh_index"
    
    # 服务器配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # 初始管理员配置
    INITIAL_ADMIN_USERNAME: str = "admin"
    INITIAL_ADMIN_EMAIL: str = "admin@thesis-check.com"
    INITIAL_ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        # 查找 .env 文件（在 backend 目录）
        env_file = str(Path(__file__).parent.parent / ".env")
        case_sensitive = True


# 全局配置实例
settings = Settings()
