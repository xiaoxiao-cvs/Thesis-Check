"""
检查结果模型
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Text, JSON, Float
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class CheckType(str, enum.Enum):
    """检查类型"""
    TITLE = "title"
    FORMAT = "format"
    CONTENT = "content"
    FULL = "full"


class IssueType(str, enum.Enum):
    """问题类型"""
    TITLE_DUPLICATE = "title_duplicate"
    TITLE_FORMAT = "title_format"
    FORMAT_PAGE = "format_page"
    FORMAT_FONT = "format_font"
    FORMAT_PARAGRAPH = "format_paragraph"
    FORMAT_HEADING = "format_heading"
    FORMAT_REFERENCE = "format_reference"
    FORMAT_TABLE = "format_table"
    FORMAT_FIGURE = "format_figure"
    CONTENT_DUPLICATE = "content_duplicate"
    CONTENT_LOGIC = "content_logic"
    CONTENT_GRAMMAR = "content_grammar"
    CONTENT_SPELLING = "content_spelling"


class IssueLevel(str, enum.Enum):
    """问题等级"""
    CRITICAL = "critical"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class CheckStatus(str, enum.Enum):
    """检查状态"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class CheckResult(Base):
    """检查结果表"""
    __tablename__ = "check_results"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    paper_id = Column(Integer, nullable=False, index=True)
    paper_type = Column(String(20), nullable=False)  # "graduation" or "course"
    check_type = Column(SQLEnum(CheckType), nullable=False)
    
    status = Column(SQLEnum(CheckStatus), nullable=False, default=CheckStatus.PENDING)
    progress = Column(Float, nullable=False, default=0.0)  # 0.0 - 100.0
    
    check_time = Column(DateTime, nullable=True)
    total_issues = Column(Integer, nullable=False, default=0)
    
    # 统计信息（JSON格式）
    statistics = Column(JSON, nullable=True)
    
    # 报告文件路径
    report_path = Column(String(500), nullable=True)
    annotated_path = Column(String(500), nullable=True)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<CheckResult {self.id}: {self.check_type} for paper {self.paper_id}>"


class CheckIssue(Base):
    """检查问题表"""
    __tablename__ = "check_issues"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    result_id = Column(Integer, ForeignKey("check_results.id"), nullable=False, index=True)
    
    issue_type = Column(SQLEnum(IssueType), nullable=False)
    issue_level = Column(SQLEnum(IssueLevel), nullable=False)
    
    location = Column(String(255), nullable=True)  # 问题位置（如：第3页、第2段、图1）
    description = Column(Text, nullable=False)
    suggestion = Column(Text, nullable=True)
    
    confidence = Column(Float, nullable=True)  # AI检查的置信度
    
    # 额外数据（JSON格式）
    extra_data = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<CheckIssue {self.id}: {self.issue_type} ({self.issue_level})>"
