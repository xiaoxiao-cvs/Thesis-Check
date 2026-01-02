"""
模板模型
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class TemplateType(str, enum.Enum):
    """模板类型"""
    GRADUATION = "graduation"
    COURSE = "course"
    GENERAL = "general"


class TemplateVisibility(str, enum.Enum):
    """模板可见性"""
    PUBLIC = "public"
    DEPARTMENT = "department"
    PRIVATE = "private"


class Template(Base):
    """模板表"""
    __tablename__ = "templates"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    version = Column(String(50), nullable=True)
    file_path = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    
    applicable_scope = Column(String(100), nullable=True)  # 适用范围（如：计算机学院、软件工程专业）
    template_type = Column(SQLEnum(TemplateType), nullable=False, default=TemplateType.GENERAL)
    visibility = Column(SQLEnum(TemplateVisibility), nullable=False, default=TemplateVisibility.PUBLIC)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Template {self.id}: {self.name}>"
