"""
用户Schemas
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserCreate(BaseModel):
    """用户注册"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=20)
    password: str = Field(..., min_length=6, max_length=50)
    department: Optional[str] = Field(None, max_length=100)
    major: Optional[str] = Field(None, max_length=100)
    nickname: Optional[str] = Field(None, max_length=50)


class UserLogin(BaseModel):
    """用户登录"""
    username: str = Field(..., description="用户名或邮箱")
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """用户信息更新（管理员）"""
    role: Optional[UserRole] = None
    department: Optional[str] = None
    major: Optional[str] = None
    nickname: Optional[str] = None


class ProfileUpdate(BaseModel):
    """个人资料更新"""
    nickname: Optional[str] = Field(None, max_length=50)
    phone: Optional[str] = Field(None, max_length=20)
    department: Optional[str] = Field(None, max_length=100)
    major: Optional[str] = Field(None, max_length=100)


class PasswordUpdate(BaseModel):
    """密码修改"""
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    """用户响应"""
    id: int
    username: str
    email: str
    phone: Optional[str]
    role: UserRole
    department: Optional[str]
    major: Optional[str]
    nickname: Optional[str]
    avatar: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """数据库中的用户（包含密码）"""
    password: str


class TokenResponse(BaseModel):
    """Token响应"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
