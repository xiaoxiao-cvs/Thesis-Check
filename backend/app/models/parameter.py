"""
论文参数设置模型
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base


class PaperParameter(Base):
    """论文参数设置表"""
    __tablename__ = "paper_parameters"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    
    # 重复率阈值
    duplicate_rate_threshold = Column(Float, nullable=False, default=15.0)
    
    # 格式检查评级阈值（按问题数量）
    format_excellent_threshold = Column(Integer, nullable=False, default=0)
    format_good_threshold = Column(Integer, nullable=False, default=3)
    format_passing_threshold = Column(Integer, nullable=False, default=10)
    format_failure_threshold = Column(Integer, nullable=False, default=20)
    
    # 题目检查评级阈值
    title_excellent_threshold = Column(Integer, nullable=False, default=0)
    title_good_threshold = Column(Integer, nullable=False, default=1)
    title_passing_threshold = Column(Integer, nullable=False, default=3)
    title_failure_threshold = Column(Integer, nullable=False, default=5)
    
    # 应用范围
    application_scope = Column(String(50), nullable=False, default="global")  # global, department, major
    scope_id = Column(String(100), nullable=True)  # 如果是院系或专业级别，存储院系/专业名称
    
    # 锁定状态
    lock_status = Column(Boolean, nullable=False, default=False)
    locked_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    locked_at = Column(DateTime, nullable=True)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<PaperParameter {self.id}: {self.name}>"
