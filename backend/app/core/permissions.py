"""
权限控制模块
"""
from functools import wraps
from typing import List, Callable
from fastapi import HTTPException, status
from app.models.user import UserRole, User


# 角色层级定义
ROLE_HIERARCHY = {
    UserRole.ADMIN: 5,
    UserRole.DEAN: 4,
    UserRole.DIRECTOR: 3,
    UserRole.TEACHER: 2,
    UserRole.STUDENT: 1
}


def has_role(user: User, required_roles: List[UserRole]) -> bool:
    """
    检查用户是否具有指定角色之一
    
    Args:
        user: 用户对象
        required_roles: 要求的角色列表
        
    Returns:
        是否具有权限
    """
    return user.role in required_roles


def has_minimum_role(user: User, minimum_role: UserRole) -> bool:
    """
    检查用户是否具有最低角色等级
    
    Args:
        user: 用户对象
        minimum_role: 最低要求的角色
        
    Returns:
        是否具有权限
    """
    user_level = ROLE_HIERARCHY.get(user.role, 0)
    required_level = ROLE_HIERARCHY.get(minimum_role, 0)
    return user_level >= required_level


def require_roles(roles: List[UserRole]):
    """
    装饰器：要求特定角色
    
    Args:
        roles: 允许的角色列表
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从kwargs中获取current_user
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="未认证"
                )
            
            if not has_role(current_user, roles):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="权限不足"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_minimum_role(minimum_role: UserRole):
    """
    装饰器：要求最低角色等级
    
    Args:
        minimum_role: 最低要求的角色
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从kwargs中获取current_user
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="未认证"
                )
            
            if not has_minimum_role(current_user, minimum_role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"需要{minimum_role.value}或更高权限"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def can_modify_user(current_user: User, target_user: User) -> bool:
    """
    检查用户是否可以修改目标用户
    
    规则：
    1. 管理员可以修改所有人
    2. 院长可以修改院长及以下
    3. 主任可以修改主任及以下
    4. 教师可以修改教师及以下
    5. 用户可以修改自己
    
    Args:
        current_user: 当前用户
        target_user: 目标用户
        
    Returns:
        是否有权限修改
    """
    if current_user.id == target_user.id:
        return True
    
    current_level = ROLE_HIERARCHY.get(current_user.role, 0)
    target_level = ROLE_HIERARCHY.get(target_user.role, 0)
    
    return current_level >= target_level


def can_access_paper(current_user: User, paper_author_id: int) -> bool:
    """
    检查用户是否可以访问论文
    
    规则：
    1. 管理员、院长、主任、教师可以访问所有论文
    2. 学生只能访问自己的论文
    
    Args:
        current_user: 当前用户
        paper_author_id: 论文作者ID
        
    Returns:
        是否有权限访问
    """
    if has_minimum_role(current_user, UserRole.TEACHER):
        return True
    
    return current_user.id == paper_author_id
