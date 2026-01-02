import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getPaperList } from '@/api/papers';
import { getResultList } from '@/api/results';
import { formatDateTime } from '@/utils/format';
import GradeTag from '@/components/GradeTag';
import './index.less';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPapers: 0,
    checkingPapers: 0,
    completedChecks: 0,
    problemCount: 0,
  });
  const [recentPapers, setRecentPapers] = useState([]);
  
  // 加载统计数据
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // 获取论文列表
      const paperRes = await getPaperList({ page: 1, page_size: 5 });
      setRecentPapers(paperRes.data || []);
      setStats(prev => ({ ...prev, totalPapers: paperRes.total || 0 }));
      
      // 获取检查结果
      const resultRes = await getResultList({ page: 1, page_size: 100 });
      const results = resultRes.data || [];
      setStats(prev => ({
        ...prev,
        completedChecks: results.length,
        problemCount: results.reduce((sum, r) => sum + (r.problem_count || 0), 0),
      }));
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const columns = [
    {
      title: '论文标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'paper_type',
      key: 'paper_type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'graduation' ? 'blue' : 'green'}>
          {type === 'graduation' ? '毕业论文' : '课程论文'}
        </Tag>
      ),
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => formatDateTime(time),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/papers/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];
  
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>欢迎回来，{user?.nickname || user?.username}！</h2>
        <p>今天是 {new Date().toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long' 
        })}</p>
      </div>
      
      <Row gutter={16} className="stats-row">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="我的论文"
              value={stats.totalPapers}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="检查中"
              value={stats.checkingPapers}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completedChecks}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="问题总数"
              value={stats.problemCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card
        title="最近论文"
        className="recent-papers"
        extra={
          <Button type="link" onClick={() => navigate('/papers/list')}>
            查看全部
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={recentPapers}
          loading={loading}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
