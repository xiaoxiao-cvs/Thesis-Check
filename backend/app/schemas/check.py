"""
检查Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.check import CheckType, IssueType, IssueLevel, CheckStatus


class CheckSubmit(BaseModel):
    """提交检查任务"""
    paper_id: int
    paper_type: str = Field(..., pattern="^(graduation|course)$")
    check_type: CheckType = CheckType.FULL
    template_id: Optional[int] = None


class CheckIssueResponse(BaseModel):
    """检查问题响应"""
    id: int
    issue_type: IssueType
    issue_level: IssueLevel
    location: Optional[str]
    description: str
    suggestion: Optional[str]
    confidence: Optional[float]
    extra_data: Optional[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True


class CheckResultResponse(BaseModel):
    """检查结果响应"""
    id: int
    paper_id: int
    paper_type: str
    check_type: CheckType
    status: CheckStatus
    progress: float
    check_time: Optional[datetime]
    total_issues: int
    statistics: Optional[Dict[str, Any]]
    report_path: Optional[str]
    annotated_path: Optional[str]
    created_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CheckStatusResponse(BaseModel):
    """检查状态响应"""
    task_id: int
    status: CheckStatus
    progress: float
    message: Optional[str] = None


class CheckResultDetailResponse(CheckResultResponse):
    """检查结果详情（包含问题列表）"""
    issues: List[CheckIssueResponse] = []
