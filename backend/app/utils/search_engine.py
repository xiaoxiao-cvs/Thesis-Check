"""
Whoosh全文搜索引擎模块
"""
import os
from typing import List, Dict, Optional
from whoosh import index
from whoosh.fields import Schema, TEXT, ID, NUMERIC, DATETIME
from whoosh.qparser import QueryParser, MultifieldParser
from whoosh.analysis import StemmingAnalyzer
import jieba
from jieba.analyse import ChineseAnalyzer
from datetime import datetime

from app.config import settings
from app.utils.file_handler import ensure_directory_exists


class SearchEngine:
    """Whoosh搜索引擎封装"""
    
    def __init__(self, index_dir: str = None):
        """
        初始化搜索引擎
        
        Args:
            index_dir: 索引目录路径
        """
        self.index_dir = index_dir or settings.WHOOSH_INDEX_PATH
        ensure_directory_exists(self.index_dir)
        
        # 定义索引Schema
        self.schema = Schema(
            id=ID(stored=True, unique=True),
            title=TEXT(stored=True, analyzer=ChineseAnalyzer()),
            content=TEXT(stored=True, analyzer=ChineseAnalyzer()),
            keywords=TEXT(stored=True, analyzer=ChineseAnalyzer()),
            author=TEXT(stored=True),
            year=NUMERIC(stored=True),
            department=TEXT(stored=True),
            paper_type=ID(stored=True),
            created_at=DATETIME(stored=True)
        )
        
        # 初始化或打开索引
        if index.exists_in(self.index_dir):
            self.ix = index.open_dir(self.index_dir)
        else:
            self.ix = index.create_in(self.index_dir, self.schema)
    
    def add_document(self, doc_id: str, title: str, content: str, **kwargs):
        """
        添加文档到索引
        
        Args:
            doc_id: 文档ID
            title: 标题
            content: 内容
            **kwargs: 其他字段
        """
        writer = self.ix.writer()
        try:
            writer.add_document(
                id=doc_id,
                title=title,
                content=content,
                keywords=kwargs.get('keywords', ''),
                author=kwargs.get('author', ''),
                year=kwargs.get('year', 2024),
                department=kwargs.get('department', ''),
                paper_type=kwargs.get('paper_type', 'graduation'),
                created_at=kwargs.get('created_at', datetime.now())
            )
            writer.commit()
        except Exception as e:
            writer.cancel()
            raise e
    
    def update_document(self, doc_id: str, title: str, content: str, **kwargs):
        """
        更新文档
        
        Args:
            doc_id: 文档ID
            title: 标题
            content: 内容
            **kwargs: 其他字段
        """
        writer = self.ix.writer()
        try:
            writer.update_document(
                id=doc_id,
                title=title,
                content=content,
                keywords=kwargs.get('keywords', ''),
                author=kwargs.get('author', ''),
                year=kwargs.get('year', 2024),
                department=kwargs.get('department', ''),
                paper_type=kwargs.get('paper_type', 'graduation'),
                created_at=kwargs.get('created_at', datetime.now())
            )
            writer.commit()
        except Exception as e:
            writer.cancel()
            raise e
    
    def delete_document(self, doc_id: str):
        """
        删除文档
        
        Args:
            doc_id: 文档ID
        """
        writer = self.ix.writer()
        try:
            writer.delete_by_term('id', doc_id)
            writer.commit()
        except Exception as e:
            writer.cancel()
            raise e
    
    def search(
        self,
        query_string: str,
        fields: List[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """
        搜索文档
        
        Args:
            query_string: 查询字符串
            fields: 搜索字段列表
            limit: 返回结果数量限制
            
        Returns:
            搜索结果列表
        """
        if fields is None:
            fields = ['title', 'content', 'keywords']
        
        with self.ix.searcher() as searcher:
            # 创建多字段查询解析器
            parser = MultifieldParser(fields, schema=self.ix.schema)
            query = parser.parse(query_string)
            
            # 执行搜索
            results = searcher.search(query, limit=limit)
            
            # 转换结果为字典列表
            search_results = []
            for hit in results:
                search_results.append({
                    'id': hit['id'],
                    'title': hit['title'],
                    'content': hit.get('content', '')[:200],  # 只返回前200字符
                    'score': hit.score,
                    'author': hit.get('author', ''),
                    'year': hit.get('year', 0),
                    'department': hit.get('department', '')
                })
            
            return search_results
    
    def search_similar_titles(self, title: str, limit: int = 10) -> List[Dict]:
        """
        搜索相似标题
        
        Args:
            title: 标题
            limit: 返回结果数量限制
            
        Returns:
            相似标题列表
        """
        return self.search(title, fields=['title'], limit=limit)
    
    def search_by_content(self, content: str, limit: int = 10) -> List[Dict]:
        """
        按内容搜索
        
        Args:
            content: 内容
            limit: 返回结果数量限制
            
        Returns:
            搜索结果列表
        """
        return self.search(content, fields=['content'], limit=limit)
    
    def get_document_count(self) -> int:
        """
        获取索引中的文档数量
        
        Returns:
            文档数量
        """
        with self.ix.searcher() as searcher:
            return searcher.doc_count_all()
    
    def clear_index(self):
        """清空索引"""
        writer = self.ix.writer()
        try:
            # 删除所有文档
            writer.mergetype = index.CLEAR
            writer.commit()
        except Exception as e:
            writer.cancel()
            raise e


# 全局搜索引擎实例
search_engine = SearchEngine()
