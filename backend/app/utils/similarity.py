"""
相似度计算模块
"""
from typing import List, Tuple, Dict
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import jieba


def preprocess_text(text: str) -> str:
    """
    文本预处理
    
    Args:
        text: 原始文本
        
    Returns:
        预处理后的文本
    """
    # 使用jieba分词
    words = jieba.cut(text)
    return " ".join(words)


def calculate_cosine_similarity(text1: str, text2: str) -> float:
    """
    计算两个文本的余弦相似度
    
    Args:
        text1: 文本1
        text2: 文本2
        
    Returns:
        相似度 (0-1)
    """
    if not text1 or not text2:
        return 0.0
    
    # 预处理文本
    processed_text1 = preprocess_text(text1)
    processed_text2 = preprocess_text(text2)
    
    # TF-IDF向量化
    vectorizer = TfidfVectorizer()
    try:
        tfidf_matrix = vectorizer.fit_transform([processed_text1, processed_text2])
        
        # 计算余弦相似度
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(similarity)
    except:
        return 0.0


def calculate_batch_similarity(query_text: str, texts: List[str]) -> List[Tuple[int, float]]:
    """
    批量计算查询文本与多个文本的相似度
    
    Args:
        query_text: 查询文本
        texts: 文本列表
        
    Returns:
        [(索引, 相似度)] 列表，按相似度降序排列
    """
    if not query_text or not texts:
        return []
    
    # 预处理所有文本
    processed_query = preprocess_text(query_text)
    processed_texts = [preprocess_text(text) for text in texts]
    
    # TF-IDF向量化
    vectorizer = TfidfVectorizer()
    try:
        all_texts = [processed_query] + processed_texts
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # 计算查询文本与所有文本的相似度
        query_vector = tfidf_matrix[0:1]
        text_vectors = tfidf_matrix[1:]
        
        similarities = cosine_similarity(query_vector, text_vectors)[0]
        
        # 创建 (索引, 相似度) 列表并排序
        results = [(i, float(sim)) for i, sim in enumerate(similarities)]
        results.sort(key=lambda x: x[1], reverse=True)
        
        return results
    except:
        return []


def calculate_jaccard_similarity(text1: str, text2: str) -> float:
    """
    计算Jaccard相似度
    
    Args:
        text1: 文本1
        text2: 文本2
        
    Returns:
        相似度 (0-1)
    """
    if not text1 or not text2:
        return 0.0
    
    # 分词
    words1 = set(jieba.cut(text1))
    words2 = set(jieba.cut(text2))
    
    # 计算交集和并集
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    
    if len(union) == 0:
        return 0.0
    
    return len(intersection) / len(union)


def find_similar_titles(
    query_title: str,
    existing_titles: List[Dict[str, any]],
    threshold: float = 0.7
) -> List[Dict[str, any]]:
    """
    查找相似的标题
    
    Args:
        query_title: 查询标题
        existing_titles: 现有标题列表 [{"id": 1, "title": "xxx"}, ...]
        threshold: 相似度阈值
        
    Returns:
        相似标题列表，包含相似度信息
    """
    if not query_title or not existing_titles:
        return []
    
    similar_titles = []
    
    for item in existing_titles:
        title = item.get("title", "")
        if not title:
            continue
        
        # 计算余弦相似度
        cos_sim = calculate_cosine_similarity(query_title, title)
        
        # 计算Jaccard相似度
        jac_sim = calculate_jaccard_similarity(query_title, title)
        
        # 综合相似度（加权平均）
        combined_sim = 0.7 * cos_sim + 0.3 * jac_sim
        
        if combined_sim >= threshold:
            similar_titles.append({
                **item,
                "similarity": combined_sim,
                "cosine_similarity": cos_sim,
                "jaccard_similarity": jac_sim
            })
    
    # 按相似度降序排序
    similar_titles.sort(key=lambda x: x["similarity"], reverse=True)
    
    return similar_titles


def calculate_duplicate_rate(text: str, reference_texts: List[str], window_size: int = 100) -> float:
    """
    计算文本重复率（基于滑动窗口）
    
    Args:
        text: 待检测文本
        reference_texts: 参考文本列表
        window_size: 窗口大小（字符数）
        
    Returns:
        重复率 (0-100)
    """
    if not text or not reference_texts:
        return 0.0
    
    # 简化实现：计算与每个参考文本的最大相似度
    max_similarity = 0.0
    
    for ref_text in reference_texts:
        similarity = calculate_cosine_similarity(text, ref_text)
        max_similarity = max(max_similarity, similarity)
    
    return max_similarity * 100


def extract_keywords(text: str, top_n: int = 10) -> List[str]:
    """
    从文本中提取关键词
    
    Args:
        text: 文本
        top_n: 返回前N个关键词
        
    Returns:
        关键词列表
    """
    if not text:
        return []
    
    # 分词
    words = jieba.cut(text)
    
    # 过滤停用词（简单实现）
    stopwords = {'的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这'}
    filtered_words = [w for w in words if len(w) > 1 and w not in stopwords]
    
    # 统计词频
    word_freq = {}
    for word in filtered_words:
        word_freq[word] = word_freq.get(word, 0) + 1
    
    # 排序并返回前N个
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    
    return [word for word, freq in sorted_words[:top_n]]
