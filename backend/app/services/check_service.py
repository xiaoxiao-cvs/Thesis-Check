"""
检查服务 - 论文检查核心逻辑
"""
import asyncio
from typing import Dict, List, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.models.paper import GraduationPaper, CoursePaper, PreviousPaper
from app.models.check import CheckResult, CheckIssue, CheckType, CheckStatus, IssueType, IssueLevel
from app.models.template import Template
from app.utils.docx_parser import DocxParser
from app.utils.similarity import (
    find_similar_titles,
    calculate_duplicate_rate,
    extract_keywords
)
from app.utils.search_engine import search_engine
from app.services.ai_service import ai_service
from app.core.exceptions import NotFoundException, BadRequestException


class CheckService:
    """检查服务"""
    
    @staticmethod
    async def submit_check(
        db: AsyncSession,
        paper_id: int,
        paper_type: str,
        check_type: CheckType,
        user_id: int,
        template_id: Optional[int] = None
    ) -> CheckResult:
        """
        提交检查任务
        
        Args:
            db: 数据库会话
            paper_id: 论文ID
            paper_type: 论文类型
            check_type: 检查类型
            user_id: 用户ID
            template_id: 模板ID（可选）
            
        Returns:
            检查结果对象
        """
        # 获取论文
        if paper_type == "graduation":
            result = await db.execute(select(GraduationPaper).where(GraduationPaper.id == paper_id))
            paper = result.scalar_one_or_none()
        else:
            result = await db.execute(select(CoursePaper).where(CoursePaper.id == paper_id))
            paper = result.scalar_one_or_none()
        
        if not paper:
            raise NotFoundException("论文不存在")
        
        # 创建检查结果记录
        check_result = CheckResult(
            paper_id=paper_id,
            paper_type=paper_type,
            check_type=check_type,
            status=CheckStatus.PENDING,
            progress=0.0,
            created_by=user_id
        )
        
        db.add(check_result)
        await db.commit()
        await db.refresh(check_result)
        
        # 异步执行检查任务
        asyncio.create_task(
            CheckService._perform_check(
                check_result.id,
                paper.file_path,
                check_type,
                template_id
            )
        )
        
        return check_result
    
    @staticmethod
    async def _perform_check(
        result_id: int,
        file_path: str,
        check_type: CheckType,
        template_id: Optional[int] = None
    ):
        """
        执行检查（异步后台任务）
        
        Args:
            result_id: 检查结果ID
            file_path: 文件路径
            check_type: 检查类型
            template_id: 模板ID
        """
        from app.database import AsyncSessionLocal
        
        async with AsyncSessionLocal() as db:
            try:
                # 更新状态为处理中
                result = await db.execute(select(CheckResult).where(CheckResult.id == result_id))
                check_result = result.scalar_one()
                check_result.status = CheckStatus.PROCESSING
                check_result.progress = 10.0
                await db.commit()
                
                # 解析文档
                parser = DocxParser(file_path)
                
                issues = []
                
                # 根据检查类型执行不同检查
                if check_type in [CheckType.TITLE, CheckType.FULL]:
                    title_issues = await CheckService._check_title(parser, db)
                    issues.extend(title_issues)
                    check_result.progress = 40.0
                    await db.commit()
                
                if check_type in [CheckType.FORMAT, CheckType.FULL]:
                    format_issues = await CheckService._check_format(parser, template_id)
                    issues.extend(format_issues)
                    check_result.progress = 70.0
                    await db.commit()
                
                if check_type in [CheckType.CONTENT, CheckType.FULL]:
                    content_issues = await CheckService._check_content(parser, db)
                    issues.extend(content_issues)
                    check_result.progress = 90.0
                    await db.commit()
                
                # 保存检查问题
                for issue_data in issues:
                    issue = CheckIssue(
                        result_id=result_id,
                        **issue_data
                    )
                    db.add(issue)
                
                # 更新检查结果
                check_result.status = CheckStatus.COMPLETED
                check_result.progress = 100.0
                check_result.check_time = datetime.now()
                check_result.total_issues = len(issues)
                check_result.statistics = {
                    "critical": len([i for i in issues if i["issue_level"] == IssueLevel.CRITICAL]),
                    "error": len([i for i in issues if i["issue_level"] == IssueLevel.ERROR]),
                    "warning": len([i for i in issues if i["issue_level"] == IssueLevel.WARNING]),
                    "info": len([i for i in issues if i["issue_level"] == IssueLevel.INFO])
                }
                
                await db.commit()
                
            except Exception as e:
                # 更新为失败状态
                check_result.status = CheckStatus.FAILED
                check_result.progress = 0.0
                await db.commit()
                print(f"Check failed: {str(e)}")
    
    @staticmethod
    async def _check_title(parser: DocxParser, db: AsyncSession) -> List[Dict[str, Any]]:
        """检查标题"""
        issues = []
        title = parser.get_title()
        
        if not title:
            issues.append({
                "issue_type": IssueType.TITLE_FORMAT,
                "issue_level": IssueLevel.CRITICAL,
                "location": "文档开头",
                "description": "未找到论文标题",
                "suggestion": "请确保论文开头有清晰的标题"
            })
            return issues
        
        # 检查标题长度
        if len(title) < 5:
            issues.append({
                "issue_type": IssueType.TITLE_FORMAT,
                "issue_level": IssueLevel.WARNING,
                "location": "标题",
                "description": f"标题过短（{len(title)}字符）",
                "suggestion": "标题应该清晰表达论文主题，建议至少10个字符"
            })
        elif len(title) > 100:
            issues.append({
                "issue_type": IssueType.TITLE_FORMAT,
                "issue_level": IssueLevel.WARNING,
                "location": "标题",
                "description": f"标题过长（{len(title)}字符）",
                "suggestion": "标题应简洁明了，建议不超过50个字符"
            })
        
        # 检查标题重复（与往届论文比较）
        result = await db.execute(select(PreviousPaper).limit(100))
        previous_papers = result.scalars().all()
        
        if previous_papers:
            existing_titles = [{"id": p.id, "title": p.title} for p in previous_papers]
            similar_titles = find_similar_titles(title, existing_titles, threshold=0.7)
            
            for similar in similar_titles[:3]:  # 只报告前3个最相似的
                issues.append({
                    "issue_type": IssueType.TITLE_DUPLICATE,
                    "issue_level": IssueLevel.ERROR if similar["similarity"] > 0.9 else IssueLevel.WARNING,
                    "location": "标题",
                    "description": f"标题与往届论文重复度较高（相似度：{similar['similarity']:.1%}）",
                    "suggestion": f"相似论文：{similar['title']}，建议调整标题以增加原创性",
                    "confidence": similar["similarity"]
                })
        
        # AI逻辑分析
        try:
            ai_result = await ai_service.analyze_title_logic(
                title,
                [t["title"] for t in similar_titles[:5]] if previous_papers else None
            )
            
            for ai_issue in ai_result.get("issues", []):
                issues.append({
                    "issue_type": IssueType.TITLE_FORMAT,
                    "issue_level": IssueLevel.WARNING,
                    "location": "标题",
                    "description": ai_issue,
                    "suggestion": "请参考AI建议修改"
                })
        except:
            pass
        
        return issues
    
    @staticmethod
    async def _check_format(parser: DocxParser, template_id: Optional[int]) -> List[Dict[str, Any]]:
        """检查格式"""
        issues = []
        
        # 检查页面设置
        page_setup = parser.get_page_setup()
        
        # 检查页边距（示例：要求页边距至少2cm）
        min_margin = 1800000  # 2cm in EMU
        if page_setup.get("left_margin", 0) < min_margin:
            issues.append({
                "issue_type": IssueType.FORMAT_PAGE,
                "issue_level": IssueLevel.WARNING,
                "location": "页面设置",
                "description": "左边距小于2cm",
                "suggestion": "建议设置左边距为2cm"
            })
        
        # 检查字体
        fonts = parser.get_fonts()
        common_fonts = ["宋体", "Times New Roman", "黑体", "Arial"]
        for font in fonts:
            if font.get("name") and font["name"] not in common_fonts:
                issues.append({
                    "issue_type": IssueType.FORMAT_FONT,
                    "issue_level": IssueLevel.INFO,
                    "location": "正文",
                    "description": f"使用了非标准字体：{font['name']}",
                    "suggestion": f"建议使用标准字体：{', '.join(common_fonts)}"
                })
        
        # 检查标题层级
        headings = parser.get_headings()
        if len(headings) < 3:
            issues.append({
                "issue_type": IssueType.FORMAT_HEADING,
                "issue_level": IssueLevel.WARNING,
                "location": "文档结构",
                "description": "标题层级较少，文档结构可能不够清晰",
                "suggestion": "建议使用多级标题组织文档结构"
            })
        
        return issues
    
    @staticmethod
    async def _check_content(parser: DocxParser, db: AsyncSession) -> List[Dict[str, Any]]:
        """检查内容"""
        issues = []
        
        # 获取全文
        content = parser.get_all_text()
        
        if len(content) < 1000:
            issues.append({
                "issue_type": IssueType.CONTENT_LOGIC,
                "issue_level": IssueLevel.ERROR,
                "location": "全文",
                "description": f"论文内容过短（{len(content)}字符）",
                "suggestion": "论文内容应充实完整"
            })
        
        # AI内容逻辑检查
        try:
            ai_result = await ai_service.check_content_logic(content)
            for ai_issue in ai_result.get("issues", []):
                issues.append({
                    "issue_type": IssueType.CONTENT_LOGIC,
                    "issue_level": IssueLevel.WARNING,
                    "location": ai_issue.get("location", "未知"),
                    "description": ai_issue.get("description", ""),
                    "suggestion": "请检查并修改"
                })
        except:
            pass
        
        # 重复率检测
        try:
            duplicate_result = await ai_service.check_duplicate_content(content)
            duplicate_rate = duplicate_result.get("duplicate_rate", 0)
            
            if duplicate_rate > 15:
                issues.append({
                    "issue_type": IssueType.CONTENT_DUPLICATE,
                    "issue_level": IssueLevel.CRITICAL,
                    "location": "全文",
                    "description": f"重复率过高：{duplicate_rate:.1f}%",
                    "suggestion": "请修改重复内容，确保论文原创性",
                    "confidence": duplicate_rate / 100
                })
            elif duplicate_rate > 10:
                issues.append({
                    "issue_type": IssueType.CONTENT_DUPLICATE,
                    "issue_level": IssueLevel.WARNING,
                    "location": "全文",
                    "description": f"重复率较高：{duplicate_rate:.1f}%",
                    "suggestion": "建议适当修改重复部分",
                    "confidence": duplicate_rate / 100
                })
        except:
            pass
        
        return issues


# 全局检查服务实例
check_service = CheckService()
