"""
用户管理路由
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.common import Message, PaginatedResponse
from app.core.exceptions import NotFoundException, ForbiddenException
from app.core.permissions import has_minimum_role, can_modify_user

router = APIRouter()


@router.get("", response_model=PaginatedResponse[UserResponse])
async def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    department: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取用户列表（需要教师及以上权限）
    
    - **page**: 页码
    - **page_size**: 每页数量
    - **role**: 角色筛选（可选）
    - **department**: 院系筛选（可选）
    """
    # 权限检查
    if not has_minimum_role(current_user, UserRole.TEACHER):
        raise ForbiddenException("需要教师及以上权限")
    
    # 构建查询
    query = select(User)
    
    if role:
        query = query.where(User.role == role)
    if department:
        query = query.where(User.department == department)
    
    # 查询总数
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    users = result.scalars().all()
    
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
        items=[UserResponse.from_orm(user) for user in users]
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取用户详情"""
    # 权限检查：只能查看自己或有权限查看他人
    if current_user.id != user_id and not has_minimum_role(current_user, UserRole.TEACHER):
        raise ForbiddenException("无权查看该用户信息")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise NotFoundException("用户不存在")
    
    return user


@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    修改用户角色（需要管理员权限）
    
    - **role**: 新角色
    """
    # 权限检查
    if not has_minimum_role(current_user, UserRole.ADMIN):
        raise ForbiddenException("需要管理员权限")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise NotFoundException("用户不存在")
    
    # 更新角色
    if user_update.role:
        user.role = user_update.role
    if user_update.department:
        user.department = user_update.department
    if user_update.major:
        user.major = user_update.major
    if user_update.nickname:
        user.nickname = user_update.nickname
    
    await db.commit()
    await db.refresh(user)
    
    return user


@router.delete("/{user_id}", response_model=Message)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """删除用户（需要管理员权限）"""
    # 权限检查
    if not has_minimum_role(current_user, UserRole.ADMIN):
        raise ForbiddenException("需要管理员权限")
    
    # 不能删除自己
    if current_user.id == user_id:
        raise ForbiddenException("不能删除自己")
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise NotFoundException("用户不存在")
    
    await db.delete(user)
    await db.commit()
    
    return Message(message="用户删除成功")
