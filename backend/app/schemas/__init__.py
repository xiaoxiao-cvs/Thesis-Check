"""
Schemas package
"""
from app.schemas.user import (
    UserCreate, UserLogin, UserUpdate, UserResponse, UserInDB,
    PasswordUpdate, ProfileUpdate
)
from app.schemas.paper import (
    GraduationPaperCreate, GraduationPaperResponse,
    CoursePaperCreate, CoursePaperResponse,
    PreviousPaperCreate, PreviousPaperResponse,
    PaperListResponse
)
from app.schemas.template import (
    TemplateCreate, TemplateUpdate, TemplateResponse
)
from app.schemas.check import (
    CheckSubmit, CheckResultResponse, CheckIssueResponse,
    CheckStatusResponse
)
from app.schemas.parameter import (
    ParameterCreate, ParameterUpdate, ParameterResponse
)
from app.schemas.common import (
    Message, PaginationParams, PaginatedResponse
)

__all__ = [
    "UserCreate", "UserLogin", "UserUpdate", "UserResponse", "UserInDB",
    "PasswordUpdate", "ProfileUpdate",
    "GraduationPaperCreate", "GraduationPaperResponse",
    "CoursePaperCreate", "CoursePaperResponse",
    "PreviousPaperCreate", "PreviousPaperResponse", "PaperListResponse",
    "TemplateCreate", "TemplateUpdate", "TemplateResponse",
    "CheckSubmit", "CheckResultResponse", "CheckIssueResponse", "CheckStatusResponse",
    "ParameterCreate", "ParameterUpdate", "ParameterResponse",
    "Message", "PaginationParams", "PaginatedResponse"
]
