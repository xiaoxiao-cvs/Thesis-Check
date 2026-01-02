"""
认证路由
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserLogin, TokenResponse, UserResponse,
    PasswordUpdate, ProfileUpdate
)
from app.schemas.common import Message
from app.services.auth_service import auth_service

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    用户注册
    
    - **username**: 用户名（3-50字符）
    - **email**: 邮箱
    - **password**: 密码（至少6字符）
    - **phone**: 手机号（可选）
    - **department**: 院系（可选）
    - **major**: 专业（可选）
    """
    user = await auth_service.register(db, user_data)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    用户登录
    
    - **username**: 用户名或邮箱
    - **password**: 密码
    
    返回访问令牌和用户信息
    """
    return await auth_service.login(db, login_data)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """获取当前登录用户信息"""
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    更新个人资料
    
    - **nickname**: 昵称
    - **phone**: 手机号
    - **department**: 院系
    - **major**: 专业
    """
    # 更新用户信息
    for field, value in profile_data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.put("/password", response_model=Message)
async def change_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    修改密码
    
    - **old_password**: 旧密码
    - **new_password**: 新密码（至少6字符）
    """
    await auth_service.change_password(
        db,
        current_user,
        password_data.old_password,
        password_data.new_password
    )
    
    return Message(message="密码修改成功")


@router.post("/logout", response_model=Message)
async def logout(
    current_user: User = Depends(get_current_user)
):
    """
    用户登出
    
    注意：由于使用JWT，实际的登出需要在客户端删除token
    """
    return Message(message="登出成功")
