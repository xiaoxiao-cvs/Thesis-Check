"""
模板管理路由
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
import os

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateUpdate, TemplateResponse
from app.schemas.common import Message, PaginatedResponse
from app.core.exceptions import NotFoundException, ForbiddenException
from app.core.permissions import has_minimum_role
from app.utils.file_handler import save_upload_file, delete_file, get_file_extension
from app.config import settings

router = APIRouter()


@router.post("", response_model=TemplateResponse, status_code=status.HTTP_201_CREATED)
async def create_template(
    file: UploadFile = File(...),
    name: str = Form(...),
    version: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """上传模板（需要教师及以上权限）"""
    if not has_minimum_role(current_user, UserRole.TEACHER):
        raise ForbiddenException("需要教师及以上权限")
    
    # 保存文件
    storage_dir = os.path.join(settings.STORAGE_PATH, "templates")
    file_path, file_size = await save_upload_file(file, storage_dir)
    
    # 创建模板记录
    template = Template(
        name=name,
        version=version,
        file_path=file_path,
        description=description,
        created_by=current_user.id
    )
    
    db.add(template)
    await db.commit()
    await db.refresh(template)
    
    return template


@router.get("", response_model=PaginatedResponse[TemplateResponse])
async def get_templates(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取模板列表"""
    query = select(Template)
    
    # 分页
    total = await db.scalar(select(func.count()).select_from(Template))
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    result = await db.execute(query)
    templates = result.scalars().all()
    
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
        items=[TemplateResponse.from_orm(t) for t in templates]
    )


@router.delete("/{template_id}", response_model=Message)
async def delete_template(
    template_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """删除模板（需要教师及以上权限）"""
    if not has_minimum_role(current_user, UserRole.TEACHER):
        raise ForbiddenException("需要教师及以上权限")
    
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()
    
    if not template:
        raise NotFoundException("模板不存在")
    
    # 删除文件
    delete_file(template.file_path)
    
    # 删除记录
    await db.delete(template)
    await db.commit()
    
    return Message(message="模板删除成功")
