"""
依赖注入
"""
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedException

# HTTP Bearer认证
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    获取当前登录用户
    
    Args:
        credentials: Bearer token
        db: 数据库会话
        
    Returns:
        当前用户对象
        
    Raises:
        UnauthorizedException: 认证失败
    """
    token = credentials.credentials
    
    # 解码token
    payload = decode_access_token(token)
    if payload is None:
        raise UnauthorizedException(detail="无效的认证令牌")
    
    # 获取用户ID
    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise UnauthorizedException(detail="无效的认证令牌")
    
    # 查询用户
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    
    if user is None:
        raise UnauthorizedException(detail="用户不存在")
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    获取当前活跃用户（可扩展用于检查用户状态）
    
    Args:
        current_user: 当前用户
        
    Returns:
        当前用户对象
    """
    # 这里可以添加检查用户是否被禁用等逻辑
    return current_user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    获取可选用户（用于可选认证的端点）
    
    Args:
        credentials: 可选的Bearer token
        db: 数据库会话
        
    Returns:
        用户对象或None
    """
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        payload = decode_access_token(token)
        if payload is None:
            return None
        
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        # 使用同步方式查询（这里简化处理）
        return None
    except Exception:
        return None
