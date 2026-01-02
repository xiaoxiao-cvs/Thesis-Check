"""
论文管理路由
"""
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional
import os

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.paper import GraduationPaper, CoursePaper, PaperStatus
from app.schemas.paper import (
    GraduationPaperCreate, GraduationPaperResponse,
    CoursePaperCreate, CoursePaperResponse,
    PaperListResponse
)
from app.schemas.common import Message, PaginatedResponse
from app.core.exceptions import NotFoundException, ForbiddenException
from app.core.permissions import has_minimum_role, can_access_paper
from app.utils.file_handler import save_upload_file, delete_file, get_file_extension
from app.config import settings

router = APIRouter()


@router.post("/graduation", response_model=GraduationPaperResponse, status_code=status.HTTP_201_CREATED)
async def upload_graduation_paper(
    file: UploadFile = File(...),
    title: str = Form(...),
    supervisor_id: Optional[int] = Form(None),
    department: Optional[str] = Form(None),
    major: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    上传毕业论文
    
    - **file**: 论文文件（.docx, .doc, .pdf）
    - **title**: 论文标题
    - **supervisor_id**: 指导教师ID（可选）
    - **department**: 院系
    - **major**: 专业
    """
    # 保存文件
    storage_dir = os.path.join(settings.STORAGE_PATH, "graduation")
    file_path, file_size = await save_upload_file(file, storage_dir)
    
    # 创建论文记录
    paper = GraduationPaper(
        title=title,
        author_id=current_user.id,
        supervisor_id=supervisor_id,
        file_path=file_path,
        file_format=get_file_extension(file.filename),
        file_size=file_size,
        department=department or current_user.department,
        major=major or current_user.major,
        status=PaperStatus.DRAFT
    )
    
    db.add(paper)
    await db.commit()
    await db.refresh(paper)
    
    return paper


@router.post("/course", response_model=CoursePaperResponse, status_code=status.HTTP_201_CREATED)
async def upload_course_paper(
    file: UploadFile = File(...),
    title: str = Form(...),
    course: str = Form(...),
    semester: str = Form(...),
    supervisor_id: Optional[int] = Form(None),
    department: Optional[str] = Form(None),
    major: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    上传课设论文
    
    - **file**: 论文文件
    - **title**: 论文标题
    - **course**: 课程名称
    - **semester**: 学期
    - **supervisor_id**: 指导教师ID（可选）
    """
    # 保存文件
    storage_dir = os.path.join(settings.STORAGE_PATH, "course")
    file_path, file_size = await save_upload_file(file, storage_dir)
    
    # 创建论文记录
    paper = CoursePaper(
        title=title,
        author_id=current_user.id,
        supervisor_id=supervisor_id,
        course=course,
        semester=semester,
        file_path=file_path,
        file_format=get_file_extension(file.filename),
        file_size=file_size,
        department=department or current_user.department,
        major=major or current_user.major,
        status=PaperStatus.DRAFT
    )
    
    db.add(paper)
    await db.commit()
    await db.refresh(paper)
    
    return paper


@router.get("", response_model=PaginatedResponse[PaperListResponse])
async def get_papers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    paper_type: Optional[str] = Query(None, regex="^(graduation|course)$"),
    status: Optional[PaperStatus] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    获取论文列表
    
    - **page**: 页码
    - **page_size**: 每页数量
    - **paper_type**: 论文类型（graduation/course）
    - **status**: 状态筛选
    """
    papers = []
    
    # 查询毕业论文
    if not paper_type or paper_type == "graduation":
        query = select(GraduationPaper)
        
        # 学生只能看自己的论文
        if not has_minimum_role(current_user, UserRole.TEACHER):
            query = query.where(GraduationPaper.author_id == current_user.id)
        
        if status:
            query = query.where(GraduationPaper.status == status)
        
        result = await db.execute(query)
        grad_papers = result.scalars().all()
        
        for paper in grad_papers:
            papers.append({
                "id": paper.id,
                "title": paper.title,
                "author_id": paper.author_id,
                "status": paper.status,
                "created_at": paper.created_at,
                "paper_type": "graduation"
            })
    
    # 查询课设论文
    if not paper_type or paper_type == "course":
        query = select(CoursePaper)
        
        # 学生只能看自己的论文
        if not has_minimum_role(current_user, UserRole.TEACHER):
            query = query.where(CoursePaper.author_id == current_user.id)
        
        if status:
            query = query.where(CoursePaper.status == status)
        
        result = await db.execute(query)
        course_papers = result.scalars().all()
        
        for paper in course_papers:
            papers.append({
                "id": paper.id,
                "title": paper.title,
                "author_id": paper.author_id,
                "status": paper.status,
                "created_at": paper.created_at,
                "paper_type": "course"
            })
    
    # 分页
    total = len(papers)
    start = (page - 1) * page_size
    end = start + page_size
    
    return PaginatedResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
        items=[PaperListResponse(**p) for p in papers[start:end]]
    )


@router.get("/{paper_id}")
async def get_paper(
    paper_id: int,
    paper_type: str = Query(..., regex="^(graduation|course)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """获取论文详情"""
    if paper_type == "graduation":
        result = await db.execute(select(GraduationPaper).where(GraduationPaper.id == paper_id))
        paper = result.scalar_one_or_none()
    else:
        result = await db.execute(select(CoursePaper).where(CoursePaper.id == paper_id))
        paper = result.scalar_one_or_none()
    
    if not paper:
        raise NotFoundException("论文不存在")
    
    # 权限检查
    if not can_access_paper(current_user, paper.author_id):
        raise ForbiddenException("无权访问该论文")
    
    return paper


@router.delete("/{paper_id}", response_model=Message)
async def delete_paper(
    paper_id: int,
    paper_type: str = Query(..., regex="^(graduation|course)$"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """删除论文"""
    if paper_type == "graduation":
        result = await db.execute(select(GraduationPaper).where(GraduationPaper.id == paper_id))
        paper = result.scalar_one_or_none()
    else:
        result = await db.execute(select(CoursePaper).where(CoursePaper.id == paper_id))
        paper = result.scalar_one_or_none()
    
    if not paper:
        raise NotFoundException("论文不存在")
    
    # 权限检查：只有作者或管理员可以删除
    if paper.author_id != current_user.id and not has_minimum_role(current_user, UserRole.ADMIN):
        raise ForbiddenException("无权删除该论文")
    
    # 删除文件
    delete_file(paper.file_path)
    
    # 删除记录
    await db.delete(paper)
    await db.commit()
    
    return Message(message="论文删除成功")
