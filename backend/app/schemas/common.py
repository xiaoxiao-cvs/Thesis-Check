"""
通用Schemas
"""
from pydantic import BaseModel, Field
from typing import Generic, TypeVar, List, Optional

T = TypeVar('T')


class Message(BaseModel):
    """通用消息响应"""
    message: str
    code: int = 200
    

class PaginationParams(BaseModel):
    """分页参数"""
    page: int = Field(1, ge=1, description="页码")
    page_size: int = Field(20, ge=1, le=100, description="每页数量")
    

class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应"""
    total: int = Field(..., description="总数")
    page: int = Field(..., description="当前页码")
    page_size: int = Field(..., description="每页数量")
    total_pages: int = Field(..., description="总页数")
    items: List[T] = Field(..., description="数据列表")
