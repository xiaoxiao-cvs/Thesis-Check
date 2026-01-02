"""
用户模型
"""
from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """用户角色枚举"""
    STUDENT = "student"
    TEACHER = "teacher"
    DIRECTOR = "director"
    DEAN = "dean"
    ADMIN = "admin"


class User(Base):
    """用户表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    phone = Column(String(20), unique=True, nullable=True, index=True)
    password = Column(String(255), nullable=False)
    
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.STUDENT)
    department = Column(String(100), nullable=True)
    major = Column(String(100), nullable=True)
    nickname = Column(String(50), nullable=True)
    avatar = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<User {self.username} ({self.role})>"
