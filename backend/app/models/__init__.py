"""
Models package
"""
from app.models.user import User
from app.models.paper import GraduationPaper, CoursePaper, PreviousPaper
from app.models.template import Template
from app.models.check import CheckResult, CheckIssue
from app.models.parameter import PaperParameter

__all__ = [
    "User",
    "GraduationPaper",
    "CoursePaper",
    "PreviousPaper",
    "Template",
    "CheckResult",
    "CheckIssue",
    "PaperParameter"
]
