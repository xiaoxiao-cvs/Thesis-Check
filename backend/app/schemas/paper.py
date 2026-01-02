"""
论文Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.paper import PaperStatus


class GraduationPaperCreate(BaseModel):
    """毕业论文创建"""
    title: str = Field(..., max_length=255)
    supervisor_id: Optional[int] = None
    department: Optional[str] = Field(None, max_length=100)
    major: Optional[str] = Field(None, max_length=100)


class GraduationPaperResponse(BaseModel):
    """毕业论文响应"""
    id: int
    title: str
    author_id: int
    supervisor_id: Optional[int]
    file_path: str
    file_format: str
    file_size: int
    status: PaperStatus
    department: Optional[str]
    major: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CoursePaperCreate(BaseModel):
    """课设论文创建"""
    title: str = Field(..., max_length=255)
    course: str = Field(..., max_length=100)
    semester: str = Field(..., max_length=50)
    supervisor_id: Optional[int] = None
    department: Optional[str] = Field(None, max_length=100)
    major: Optional[str] = Field(None, max_length=100)


class CoursePaperResponse(BaseModel):
    """课设论文响应"""
    id: int
    title: str
    author_id: int
    supervisor_id: Optional[int]
    course: str
    semester: str
    file_path: str
    file_format: str
    file_size: int
    status: PaperStatus
    department: Optional[str]
    major: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PreviousPaperCreate(BaseModel):
    """往届论文创建"""
    title: str = Field(..., max_length=255)
    keywords: Optional[List[str]] = None
    author: str = Field(..., max_length=100)
    year: int = Field(..., ge=1900, le=2100)
    department: str = Field(..., max_length=100)
    summary: Optional[str] = None


class PreviousPaperResponse(BaseModel):
    """往届论文响应"""
    id: int
    title: str
    keywords: Optional[List[str]]
    author: str
    year: int
    department: str
    summary: Optional[str]
    file_path: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaperListResponse(BaseModel):
    """论文列表响应（简化版）"""
    id: int
    title: str
    author_id: int
    status: PaperStatus
    created_at: datetime
    paper_type: str  # "graduation" or "course"
