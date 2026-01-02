"""
往届论文路由
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.paper import PreviousPaper
from app.schemas.paper import PreviousPaperCreate, PreviousPaperResponse
from app.schemas.common import Message, PaginatedResponse
from app.core.exceptions import NotFoundException, ForbiddenException
from app.core.permissions import has_minimum_role

router = APIRouter()


@router.post("", response_model=PreviousPaperResponse, status_code=status.HTTP_201_CREATED)
async def create_previous_paper(
    paper_data: PreviousPaperCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """添加往届论文（需要教师及以上权限）"""
    if not has_minimum_role(current_user, UserRole.TEACHER):
        raise ForbiddenException("需要教师及以上权限")
    
    paper = PreviousPaper(**paper_data.dict())
    
    db.add(paper)
    await db.commit()
    await db.refresh(paper)
    
    return paper


@router.get("", response_model=PaginatedResponse[PreviousPaperResponse])
async def get_previous_papers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    year: int = Query(None),
    department: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取往届论文列表"""
    query = select(PreviousPaper)
    
    if year:
        query = query.where(PreviousPaper.year == year)
    if department:
        query = query.where(PreviousPaper.department == department)
    
    # 查询总数
    total = await db.scalar(
        select(func.count()).select_from(query.subquery())
    )
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    papers = result.scalars().all()
    
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
        items=[PreviousPaperResponse.from_orm(p) for p in papers]
    )


@router.delete("/{paper_id}", response_model=Message)
async def delete_previous_paper(
    paper_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """删除往届论文（需要教师及以上权限）"""
    if not has_minimum_role(current_user, UserRole.TEACHER):
        raise ForbiddenException("需要教师及以上权限")
    
    result = await db.execute(select(PreviousPaper).where(PreviousPaper.id == paper_id))
    paper = result.scalar_one_or_none()
    
    if not paper:
        raise NotFoundException("往届论文不存在")
    
    await db.delete(paper)
    await db.commit()
    
    return Message(message="往届论文删除成功")
