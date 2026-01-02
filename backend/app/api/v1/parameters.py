"""
参数设置路由
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.parameter import PaperParameter
from app.schemas.parameter import ParameterCreate, ParameterUpdate, ParameterResponse
from app.schemas.common import Message, PaginatedResponse
from app.core.exceptions import NotFoundException, ForbiddenException
from app.core.permissions import has_minimum_role

router = APIRouter()


@router.post("", response_model=ParameterResponse, status_code=status.HTTP_201_CREATED)
async def create_parameter(
    param_data: ParameterCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """创建参数设置（需要主任及以上权限）"""
    if not has_minimum_role(current_user, UserRole.DIRECTOR):
        raise ForbiddenException("需要主任及以上权限")
    
    parameter = PaperParameter(
        **param_data.dict(),
        created_by=current_user.id
    )
    
    db.add(parameter)
    await db.commit()
    await db.refresh(parameter)
    
    return parameter


@router.get("", response_model=list[ParameterResponse])
async def get_parameters(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取参数设置列表"""
    result = await db.execute(select(PaperParameter))
    parameters = result.scalars().all()
    
    return [ParameterResponse.from_orm(p) for p in parameters]


@router.put("/{param_id}", response_model=ParameterResponse)
async def update_parameter(
    param_id: int,
    param_data: ParameterUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """更新参数设置（需要主任及以上权限）"""
    if not has_minimum_role(current_user, UserRole.DIRECTOR):
        raise ForbiddenException("需要主任及以上权限")
    
    result = await db.execute(select(PaperParameter).where(PaperParameter.id == param_id))
    parameter = result.scalar_one_or_none()
    
    if not parameter:
        raise NotFoundException("参数设置不存在")
    
    # 检查是否已锁定
    if parameter.lock_status:
        raise ForbiddenException("参数已被锁定，无法修改")
    
    # 更新参数
    for field, value in param_data.dict(exclude_unset=True).items():
        setattr(parameter, field, value)
    
    await db.commit()
    await db.refresh(parameter)
    
    return parameter


@router.post("/{param_id}/lock", response_model=Message)
async def lock_parameter(
    param_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """锁定参数设置（需要院长权限）"""
    if not has_minimum_role(current_user, UserRole.DEAN):
        raise ForbiddenException("需要院长权限")
    
    result = await db.execute(select(PaperParameter).where(PaperParameter.id == param_id))
    parameter = result.scalar_one_or_none()
    
    if not parameter:
        raise NotFoundException("参数设置不存在")
    
    from datetime import datetime
    parameter.lock_status = True
    parameter.locked_by = current_user.id
    parameter.locked_at = datetime.now()
    
    await db.commit()
    
    return Message(message="参数已锁定")


@router.post("/{param_id}/unlock", response_model=Message)
async def unlock_parameter(
    param_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """解锁参数设置（需要院长权限）"""
    if not has_minimum_role(current_user, UserRole.DEAN):
        raise ForbiddenException("需要院长权限")
    
    result = await db.execute(select(PaperParameter).where(PaperParameter.id == param_id))
    parameter = result.scalar_one_or_none()
    
    if not parameter:
        raise NotFoundException("参数设置不存在")
    
    parameter.lock_status = False
    parameter.locked_by = None
    parameter.locked_at = None
    
    await db.commit()
    
    return Message(message="参数已解锁")
