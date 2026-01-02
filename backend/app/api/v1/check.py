"""
论文检查路由
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.check import CheckSubmit, CheckResultResponse, CheckStatusResponse
from app.schemas.common import Message
from app.services.check_service import check_service

router = APIRouter()


@router.post("/submit", response_model=CheckResultResponse, status_code=status.HTTP_201_CREATED)
async def submit_check(
    check_data: CheckSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    提交检查任务
    
    - **paper_id**: 论文ID
    - **paper_type**: 论文类型（graduation/course）
    - **check_type**: 检查类型（title/format/content/full）
    - **template_id**: 模板ID（可选，用于格式检查）
    """
    result = await check_service.submit_check(
        db,
        check_data.paper_id,
        check_data.paper_type,
        check_data.check_type,
        current_user.id,
        check_data.template_id
    )
    
    return result


@router.get("/status/{task_id}", response_model=CheckStatusResponse)
async def get_check_status(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取检查任务状态
    
    - **task_id**: 检查结果ID
    """
    from sqlalchemy import select
    from app.models.check import CheckResult
    
    result = await db.execute(select(CheckResult).where(CheckResult.id == task_id))
    check_result = result.scalar_one_or_none()
    
    if not check_result:
        from app.core.exceptions import NotFoundException
        raise NotFoundException("检查任务不存在")
    
    return CheckStatusResponse(
        task_id=check_result.id,
        status=check_result.status,
        progress=check_result.progress,
        message=f"检查进度：{check_result.progress:.1f}%"
    )
