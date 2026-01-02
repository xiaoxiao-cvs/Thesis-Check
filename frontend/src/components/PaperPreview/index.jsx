import { useState, useEffect } from 'react';
import { Modal, Spin, Alert, Button } from 'antd';
import { DownloadOutlined, CloseOutlined } from '@ant-design/icons';
import './index.less';

/**
 * 论文预览组件
 * 使用 mammoth.js 将 .docx 文件转换为 HTML 预览
 * 
 * 使用前需安装依赖：
 * pnpm add mammoth
 */
const PaperPreview = ({ visible, onClose, fileUrl, fileName }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && fileUrl) {
      loadDocument();
    }
  }, [visible, fileUrl]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 动态导入 mammoth，避免未安装时报错
      const mammoth = await import('mammoth').catch(() => {
        throw new Error('mammoth 未安装，请运行: pnpm add mammoth');
      });

      // 获取文件
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('文件加载失败');
      }

      const arrayBuffer = await response.arrayBuffer();

      // 转换为 HTML
      const result = await mammoth.convertToHtml({
        arrayBuffer,
      });

      if (result.messages.length > 0) {
        console.warn('文档转换警告:', result.messages);
      }

      setContent(result.value);
    } catch (err) {
      console.error('文档预览失败:', err);
      setError(err.message || '文档预览失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || '论文.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{fileName || '论文预览'}</span>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            下载原文件
          </Button>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ top: 20 }}
      bodyStyle={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}
      closeIcon={<CloseOutlined />}
    >
      {loading && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="正在加载文档..." />
        </div>
      )}

      {error && (
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={loadDocument}>
              重试
            </Button>
          }
        />
      )}

      {!loading && !error && content && (
        <div
          className="paper-preview-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {!loading && !error && !content && (
        <Alert
          message="暂无内容"
          description="无法预览此文档"
          type="warning"
          showIcon
        />
      )}
    </Modal>
  );
};

export default PaperPreview;
