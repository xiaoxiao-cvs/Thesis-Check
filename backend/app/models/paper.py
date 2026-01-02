"""
论文模型
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Text, JSON
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class PaperStatus(str, enum.Enum):
    """论文状态"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    CHECKING = "checking"
    CHECKED = "checked"
    APPROVED = "approved"
    REJECTED = "rejected"


class GraduationPaper(Base):
    """毕业论文表"""
    __tablename__ = "graduation_papers"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    supervisor_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    file_path = Column(String(500), nullable=False)
    file_format = Column(String(20), nullable=False)
    file_size = Column(Integer, nullable=False)
    
    status = Column(SQLEnum(PaperStatus), nullable=False, default=PaperStatus.DRAFT)
    
    department = Column(String(100), nullable=True)
    major = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<GraduationPaper {self.id}: {self.title}>"


class CoursePaper(Base):
    """课设论文表"""
    __tablename__ = "course_papers"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    supervisor_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    course = Column(String(100), nullable=False)
    semester = Column(String(50), nullable=False)
    
    file_path = Column(String(500), nullable=False)
    file_format = Column(String(20), nullable=False)
    file_size = Column(Integer, nullable=False)
    
    status = Column(SQLEnum(PaperStatus), nullable=False, default=PaperStatus.DRAFT)
    
    department = Column(String(100), nullable=True)
    major = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<CoursePaper {self.id}: {self.title}>"


class PreviousPaper(Base):
    """往届论文表"""
    __tablename__ = "previous_papers"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    keywords = Column(JSON, nullable=True)  # 存储为JSON数组
    author = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    department = Column(String(100), nullable=False, index=True)
    summary = Column(Text, nullable=True)
    
    file_path = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<PreviousPaper {self.id}: {self.title} ({self.year})>"
