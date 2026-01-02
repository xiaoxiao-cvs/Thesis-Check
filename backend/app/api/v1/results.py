"""
检查结果路由
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.check import CheckResult, CheckIssue
from app.schemas.check import CheckResultResponse, CheckResultDetailResponse, CheckIssueResponse
from app.schemas.common import PaginatedResponse
from app.core.exceptions import NotFoundException

router = APIRouter()


@router.get("", response_model=PaginatedResponse[CheckResultResponse])
async def get_results(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取检查结果列表"""
    query = select(CheckResult).where(CheckResult.created_by == current_user.id)
    
    # 查询总数
    total = await db.scalar(
        select(func.count()).select_from(query.subquery())
    )
    
    # 分页查询
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(CheckResult.created_at.desc())
    
    result = await db.execute(query)
    results = result.scalars().all()
    
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
        items=[CheckResultResponse.from_orm(r) for r in results]
    )


@router.get("/{result_id}", response_model=CheckResultDetailResponse)
async def get_result_detail(
    result_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取检查结果详情"""
    result = await db.execute(select(CheckResult).where(CheckResult.id == result_id))
    check_result = result.scalar_one_or_none()
    
    if not check_result:
        raise NotFoundException("检查结果不存在")
    
    # 获取问题列表
    issues_result = await db.execute(
        select(CheckIssue).where(CheckIssue.result_id == result_id)
    )
    issues = issues_result.scalars().all()
    
    # 构建响应
    response = CheckResultDetailResponse.from_orm(check_result)
    response.issues = [CheckIssueResponse.from_orm(issue) for issue in issues]
    
    return response
