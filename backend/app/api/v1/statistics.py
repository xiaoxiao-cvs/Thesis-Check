"""
统计分析路由
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.paper import GraduationPaper, CoursePaper
from app.models.check import CheckResult
from app.core.exceptions import ForbiddenException
from app.core.permissions import has_minimum_role

router = APIRouter()


@router.get("/overview")
async def get_overview_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取概览统计（需要教师及以上权限）"""
    if not has_minimum_role(current_user, UserRole.TEACHER):
        raise ForbiddenException("需要教师及以上权限")
    
    # 统计论文数量
    grad_count = await db.scalar(select(func.count()).select_from(GraduationPaper))
    course_count = await db.scalar(select(func.count()).select_from(CoursePaper))
    
    # 统计检查次数
    check_count = await db.scalar(select(func.count()).select_from(CheckResult))
    
    # 统计用户数量
    user_count = await db.scalar(select(func.count()).select_from(User))
    
    return {
        "total_papers": grad_count + course_count,
        "graduation_papers": grad_count,
        "course_papers": course_count,
        "total_checks": check_count,
        "total_users": user_count
    }


@router.get("/department")
async def get_department_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取院系统计（需要主任及以上权限）"""
    if not has_minimum_role(current_user, UserRole.DIRECTOR):
        raise ForbiddenException("需要主任及以上权限")
    
    # 按院系统计论文数量（简化版）
    result = await db.execute(
        select(GraduationPaper.department, func.count(GraduationPaper.id))
        .group_by(GraduationPaper.department)
    )
    
    departments = {}
    for dept, count in result.all():
        if dept:
            departments[dept] = count
    
    return {
        "departments": departments
    }


@router.get("/teacher")
async def get_teacher_statistics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取教师统计（需要主任及以上权限）"""
    if not has_minimum_role(current_user, UserRole.DIRECTOR):
        raise ForbiddenException("需要主任及以上权限")
    
    # 按指导教师统计论文数量
    result = await db.execute(
        select(GraduationPaper.supervisor_id, func.count(GraduationPaper.id))
        .where(GraduationPaper.supervisor_id.isnot(None))
        .group_by(GraduationPaper.supervisor_id)
    )
    
    teachers = {}
    for teacher_id, count in result.all():
        teachers[teacher_id] = count
    
    return {
        "teachers": teachers
    }
