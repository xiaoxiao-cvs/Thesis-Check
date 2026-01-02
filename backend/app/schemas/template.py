"""
模板Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.template import TemplateType, TemplateVisibility


class TemplateCreate(BaseModel):
    """模板创建"""
    name: str = Field(..., max_length=255)
    version: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    applicable_scope: Optional[str] = Field(None, max_length=100)
    template_type: TemplateType = TemplateType.GENERAL
    visibility: TemplateVisibility = TemplateVisibility.PUBLIC


class TemplateUpdate(BaseModel):
    """模板更新"""
    name: Optional[str] = Field(None, max_length=255)
    version: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    applicable_scope: Optional[str] = Field(None, max_length=100)
    visibility: Optional[TemplateVisibility] = None


class TemplateResponse(BaseModel):
    """模板响应"""
    id: int
    name: str
    version: Optional[str]
    file_path: str
    description: Optional[str]
    applicable_scope: Optional[str]
    template_type: TemplateType
    visibility: TemplateVisibility
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
