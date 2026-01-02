"""
认证服务
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, TokenResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import UnauthorizedException, ConflictException, BadRequestException


class AuthService:
    """认证服务"""
    
    @staticmethod
    async def register(db: AsyncSession, user_data: UserCreate) -> User:
        """
        用户注册
        
        Args:
            db: 数据库会话
            user_data: 用户注册数据
            
        Returns:
            创建的用户
            
        Raises:
            ConflictException: 用户名或邮箱已存在
        """
        # 检查用户名是否已存在
        result = await db.execute(select(User).where(User.username == user_data.username))
        if result.scalar_one_or_none():
            raise ConflictException("用户名已存在")
        
        # 检查邮箱是否已存在
        result = await db.execute(select(User).where(User.email == user_data.email))
        if result.scalar_one_or_none():
            raise ConflictException("邮箱已被注册")
        
        # 创建用户
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            username=user_data.username,
            email=user_data.email,
            phone=user_data.phone,
            password=hashed_password,
            role=UserRole.STUDENT,  # 默认为学生角色
            department=user_data.department,
            major=user_data.major,
            nickname=user_data.nickname or user_data.username
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return new_user
    
    @staticmethod
    async def login(db: AsyncSession, login_data: UserLogin) -> TokenResponse:
        """
        用户登录
        
        Args:
            db: 数据库会话
            login_data: 登录数据
            
        Returns:
            Token响应
            
        Raises:
            UnauthorizedException: 认证失败
        """
        # 查询用户（可以使用用户名或邮箱登录）
        result = await db.execute(
            select(User).where(
                (User.username == login_data.username) | (User.email == login_data.username)
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise UnauthorizedException("用户名或密码错误")
        
        # 验证密码
        if not verify_password(login_data.password, user.password):
            raise UnauthorizedException("用户名或密码错误")
        
        # 创建访问令牌
        access_token = create_access_token(data={"sub": str(user.id)})
        
        from app.schemas.user import UserResponse
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.from_orm(user)
        )
    
    @staticmethod
    async def change_password(
        db: AsyncSession,
        user: User,
        old_password: str,
        new_password: str
    ) -> bool:
        """
        修改密码
        
        Args:
            db: 数据库会话
            user: 当前用户
            old_password: 旧密码
            new_password: 新密码
            
        Returns:
            是否成功
            
        Raises:
            BadRequestException: 密码验证失败
        """
        # 验证旧密码
        if not verify_password(old_password, user.password):
            raise BadRequestException("原密码错误")
        
        # 更新密码
        user.password = get_password_hash(new_password)
        await db.commit()
        
        return True


# 全局认证服务实例
auth_service = AuthService()
