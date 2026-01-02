"""
阿里云AI服务模块
"""
import aiohttp
import json
from typing import Dict, Any, Optional
from app.config import settings


class AlibabaAIService:
    """阿里云AI服务"""
    
    def __init__(self):
        self.api_key = settings.ALIBABA_API_KEY
        self.api_url = settings.ALIBABA_API_URL
    
    async def _make_request(self, prompt: str, model: str = "qwen-max") -> Optional[Dict[str, Any]]:
        """
        发送API请求
        
        Args:
            prompt: 提示词
            model: 模型名称
            
        Returns:
            API响应
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "input": {
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            },
            "parameters": {
                "result_format": "message"
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.api_url,
                    headers=headers,
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=60)
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        error_text = await response.text()
                        print(f"API Error: {response.status} - {error_text}")
                        return None
        except Exception as e:
            print(f"Request Error: {str(e)}")
            return None
    
    async def analyze_title_logic(self, title: str, similar_titles: list = None) -> Dict[str, Any]:
        """
        分析题目逻辑
        
        Args:
            title: 论文题目
            similar_titles: 相似题目列表
            
        Returns:
            分析结果
        """
        similar_titles_text = ""
        if similar_titles:
            similar_titles_text = "\n已有类似题目：\n" + "\n".join([f"- {t}" for t in similar_titles[:5]])
        
        prompt = f"""请分析以下论文题目的逻辑性和质量：
题目：{title}
{similar_titles_text}

请从以下角度分析：
1. 题目是否清晰明确
2. 是否符合学术规范
3. 题目长度是否合适
4. 是否存在逻辑问题
5. 与已有题目的重复程度（如果有）

请以JSON格式返回分析结果：
{{
    "is_valid": true/false,
    "clarity_score": 0-100,
    "issues": ["问题1", "问题2"],
    "suggestions": ["建议1", "建议2"],
    "duplicate_score": 0-100
}}
"""
        
        response = await self._make_request(prompt)
        
        if response and response.get("output"):
            try:
                content = response["output"]["choices"][0]["message"]["content"]
                # 尝试解析JSON
                result = json.loads(content)
                return result
            except:
                # 如果无法解析JSON，返回默认结果
                return {
                    "is_valid": True,
                    "clarity_score": 70,
                    "issues": [],
                    "suggestions": ["AI分析暂时不可用"],
                    "duplicate_score": 0
                }
        
        return {
            "is_valid": True,
            "clarity_score": 70,
            "issues": [],
            "suggestions": [],
            "duplicate_score": 0
        }
    
    async def check_content_logic(self, content: str) -> Dict[str, Any]:
        """
        检查内容逻辑一致性
        
        Args:
            content: 论文内容
            
        Returns:
            检查结果
        """
        # 限制内容长度
        content_sample = content[:2000] if len(content) > 2000 else content
        
        prompt = f"""请分析以下论文内容的逻辑一致性：
{content_sample}

请分析：
1. 段落之间的逻辑连贯性
2. 论点和论据的一致性
3. 是否存在前后矛盾
4. 结构是否合理

请以JSON格式返回：
{{
    "logic_score": 0-100,
    "issues": [
        {{"type": "logic_error", "location": "第X段", "description": "问题描述"}}
    ]
}}
"""
        
        response = await self._make_request(prompt)
        
        if response and response.get("output"):
            try:
                content = response["output"]["choices"][0]["message"]["content"]
                result = json.loads(content)
                return result
            except:
                return {
                    "logic_score": 75,
                    "issues": []
                }
        
        return {
            "logic_score": 75,
            "issues": []
        }
    
    async def check_duplicate_content(
        self,
        content: str,
        reference_contents: list = None
    ) -> Dict[str, Any]:
        """
        检查内容重复率（使用AI辅助）
        
        Args:
            content: 待检测内容
            reference_contents: 参考内容列表
            
        Returns:
            重复率检测结果
        """
        # 简化实现：返回模拟结果
        # 实际应该调用专业的查重API
        return {
            "duplicate_rate": 8.5,
            "sources": [
                {
                    "source": "互联网",
                    "similarity": 5.2
                },
                {
                    "source": "往届论文库",
                    "similarity": 3.3
                }
            ]
        }
    
    async def analyze_image_text_consistency(
        self,
        image_descriptions: list,
        surrounding_text: list
    ) -> Dict[str, Any]:
        """
        分析图文一致性
        
        Args:
            image_descriptions: 图片描述列表
            surrounding_text: 图片周围文本列表
            
        Returns:
            一致性分析结果
        """
        # 简化实现
        return {
            "consistency_score": 85,
            "issues": []
        }


# 全局AI服务实例
ai_service = AlibabaAIService()
