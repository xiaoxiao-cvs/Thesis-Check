import { useState, useEffect } from 'react';
import { Card, Progress, Alert, Button, Descriptions, Result, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getCheckStatus } from '@/api/check';
import { WS_URL, CHECK_STATUS, CHECK_STATUS_NAMES } from '@/utils/constants';

const CheckStatus = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(CHECK_STATUS.PENDING);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('准备中...');
  const [resultId, setResultId] = useState(null);
  const [error, setError] = useState(null);

  // 初始加载状态
  useEffect(() => {
    loadStatus();
  }, [taskId]);

  const loadStatus = async () => {
    try {
      const data = await getCheckStatus(taskId);
      setStatus(data.status);
      setProgress(data.progress || 0);
      setCurrentStage(data.current_stage || '检查中...');
      if (data.result_id) {
        setResultId(data.result_id);
      }
      if (data.error) {
        setError(data.error);
      }
    } catch (error) {
      setError('加载检查状态失败');
    }
  };

  // WebSocket实时更新
  useWebSocket(`${WS_URL}/check/${taskId}`, {
    onMessage: (data) => {
      if (data.status) setStatus(data.status);
      if (data.progress !== undefined) setProgress(data.progress);
      if (data.current_stage) setCurrentStage(data.current_stage);
      if (data.result_id) setResultId(data.result_id);
      if (data.error) setError(data.error);
    },
    reconnect: true,
  });

  // 检查完成
  if (status === CHECK_STATUS.COMPLETED && resultId) {
    return (
      <Card>
        <Result
          status="success"
          icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          title="检查完成！"
          subTitle="论文检查已完成，您可以查看详细结果。"
          extra={[
            <Button type="primary" key="view" onClick={() => navigate(`/results/${resultId}`)}>
              查看结果
            </Button>,
            <Button key="back" onClick={() => navigate('/papers/list')}>
              返回论文列表
            </Button>,
          ]}
        />
      </Card>
    );
  }

  // 检查失败
  if (status === CHECK_STATUS.FAILED) {
    return (
      <Card>
        <Result
          status="error"
          title="检查失败"
          subTitle={error || '检查过程中出现错误，请稍后重试。'}
          extra={[
            <Button type="primary" key="back" onClick={() => navigate('/papers/list')}>
              返回论文列表
            </Button>,
          ]}
        />
      </Card>
    );
  }

  // 检查中
  return (
    <Card title="检查进度">
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip={currentStage}
        />
        
        <div style={{ marginTop: 40, maxWidth: 600, margin: '40px auto 0' }}>
          <Progress
            percent={Math.round(progress)}
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          
          <Alert
            message="检查中"
            description="请耐心等待，检查可能需要几分钟时间。您可以关闭此页面，稍后在结果列表中查看。"
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        </div>

        <Descriptions
          column={1}
          bordered
          size="small"
          style={{ marginTop: 24, maxWidth: 600, margin: '24px auto 0' }}
        >
          <Descriptions.Item label="当前状态">
            {CHECK_STATUS_NAMES[status]}
          </Descriptions.Item>
          <Descriptions.Item label="当前阶段">
            {currentStage}
          </Descriptions.Item>
          <Descriptions.Item label="完成进度">
            {Math.round(progress)}%
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Card>
  );
};

export default CheckStatus;
