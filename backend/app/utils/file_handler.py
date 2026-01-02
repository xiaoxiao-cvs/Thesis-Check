"""
文件处理模块
"""
import os
import shutil
import hashlib
from pathlib import Path
from typing import Optional, Tuple
from datetime import datetime
from fastapi import UploadFile
from app.config import settings
from app.core.exceptions import BadRequestException


# 允许的文件扩展名
ALLOWED_EXTENSIONS = {'.docx', '.doc', '.pdf'}
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE


def ensure_directory_exists(directory: str):
    """
    确保目录存在，不存在则创建
    
    Args:
        directory: 目录路径
    """
    Path(directory).mkdir(parents=True, exist_ok=True)


def get_file_extension(filename: str) -> str:
    """
    获取文件扩展名
    
    Args:
        filename: 文件名
        
    Returns:
        文件扩展名（小写）
    """
    return Path(filename).suffix.lower()


def validate_file(file: UploadFile) -> None:
    """
    验证上传的文件
    
    Args:
        file: 上传的文件
        
    Raises:
        BadRequestException: 文件验证失败
    """
    # 检查文件名
    if not file.filename:
        raise BadRequestException("文件名不能为空")
    
    # 检查扩展名
    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise BadRequestException(f"不支持的文件格式，仅支持: {', '.join(ALLOWED_EXTENSIONS)}")


def generate_unique_filename(original_filename: str) -> str:
    """
    生成唯一文件名
    
    Args:
        original_filename: 原始文件名
        
    Returns:
        唯一文件名
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    random_str = hashlib.md5(f"{original_filename}{timestamp}".encode()).hexdigest()[:8]
    ext = get_file_extension(original_filename)
    
    return f"{timestamp}_{random_str}{ext}"


async def save_upload_file(
    file: UploadFile,
    directory: str,
    custom_filename: Optional[str] = None
) -> Tuple[str, int]:
    """
    保存上传的文件
    
    Args:
        file: 上传的文件
        directory: 保存目录
        custom_filename: 自定义文件名（可选）
        
    Returns:
        (文件路径, 文件大小)
        
    Raises:
        BadRequestException: 文件保存失败
    """
    # 验证文件
    validate_file(file)
    
    # 确保目录存在
    ensure_directory_exists(directory)
    
    # 生成文件名
    if custom_filename:
        filename = custom_filename
    else:
        filename = generate_unique_filename(file.filename)
    
    file_path = os.path.join(directory, filename)
    
    # 保存文件
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            
            # 检查文件大小
            file_size = len(content)
            if file_size > MAX_FILE_SIZE:
                raise BadRequestException(f"文件大小超过限制 ({MAX_FILE_SIZE / 1024 / 1024}MB)")
            
            buffer.write(content)
        
        return file_path, file_size
    except Exception as e:
        # 如果保存失败，删除可能已创建的文件
        if os.path.exists(file_path):
            os.remove(file_path)
        raise BadRequestException(f"文件保存失败: {str(e)}")


def delete_file(file_path: str) -> bool:
    """
    删除文件
    
    Args:
        file_path: 文件路径
        
    Returns:
        是否成功删除
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False


def get_file_info(file_path: str) -> dict:
    """
    获取文件信息
    
    Args:
        file_path: 文件路径
        
    Returns:
        文件信息字典
    """
    if not os.path.exists(file_path):
        return {}
    
    stat = os.stat(file_path)
    return {
        "size": stat.st_size,
        "created": datetime.fromtimestamp(stat.st_ctime),
        "modified": datetime.fromtimestamp(stat.st_mtime),
        "extension": get_file_extension(file_path)
    }


def copy_file(source: str, destination: str) -> bool:
    """
    复制文件
    
    Args:
        source: 源文件路径
        destination: 目标文件路径
        
    Returns:
        是否成功复制
    """
    try:
        # 确保目标目录存在
        ensure_directory_exists(os.path.dirname(destination))
        shutil.copy2(source, destination)
        return True
    except Exception:
        return False
