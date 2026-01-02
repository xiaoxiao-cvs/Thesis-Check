"""
参数设置Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ParameterCreate(BaseModel):
    """参数创建"""
    name: str = Field(..., max_length=100)
    duplicate_rate_threshold: float = Field(15.0, ge=0, le=100)
    format_excellent_threshold: int = Field(0, ge=0)
    format_good_threshold: int = Field(3, ge=0)
    format_passing_threshold: int = Field(10, ge=0)
    format_failure_threshold: int = Field(20, ge=0)
    title_excellent_threshold: int = Field(0, ge=0)
    title_good_threshold: int = Field(1, ge=0)
    title_passing_threshold: int = Field(3, ge=0)
    title_failure_threshold: int = Field(5, ge=0)
    application_scope: str = Field("global", pattern="^(global|department|major)$")
    scope_id: Optional[str] = None


class ParameterUpdate(BaseModel):
    """参数更新"""
    name: Optional[str] = Field(None, max_length=100)
    duplicate_rate_threshold: Optional[float] = Field(None, ge=0, le=100)
    format_excellent_threshold: Optional[int] = Field(None, ge=0)
    format_good_threshold: Optional[int] = Field(None, ge=0)
    format_passing_threshold: Optional[int] = Field(None, ge=0)
    format_failure_threshold: Optional[int] = Field(None, ge=0)
    title_excellent_threshold: Optional[int] = Field(None, ge=0)
    title_good_threshold: Optional[int] = Field(None, ge=0)
    title_passing_threshold: Optional[int] = Field(None, ge=0)
    title_failure_threshold: Optional[int] = Field(None, ge=0)
    application_scope: Optional[str] = Field(None, pattern="^(global|department|major)$")
    scope_id: Optional[str] = None


class ParameterResponse(BaseModel):
    """参数响应"""
    id: int
    name: str
    duplicate_rate_threshold: float
    format_excellent_threshold: int
    format_good_threshold: int
    format_passing_threshold: int
    format_failure_threshold: int
    title_excellent_threshold: int
    title_good_threshold: int
    title_passing_threshold: int
    title_failure_threshold: int
    application_scope: str
    scope_id: Optional[str]
    lock_status: bool
    locked_by: Optional[int]
    locked_at: Optional[datetime]
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
