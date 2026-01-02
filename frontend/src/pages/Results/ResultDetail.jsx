import { useState, useEffect } from 'react';
import { Card, Descriptions, Tabs, Table, Tag, Button, Space, message, Spin, Statistic, Row, Col } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { DownloadOutlined, LeftOutlined } from '@ant-design/icons';
import { getResultDetail } from '@/api/results';
import { formatDateTime } from '@/utils/format';
import GradeTag from '@/components/GradeTag';
import SeverityTag from '@/components/SeverityTag';

const ResultDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getResultDetail(id);
      setResult(data);
    } catch (error) {
      message.error('加载结果详情失败');
    } finally {
      setLoading(false);
    }
  };

  const problemColumns = [
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => <SeverityTag severity={severity} />,
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '建议',
      dataIndex: 'suggestion',
      key: 'suggestion',
      ellipsis: true,
    },
  ];

  if (loading) {
    return (
      <Card>
        <Spin tip="加载中..." />
      </Card>
    );
  }

  const tabItems = [
    {
      key: 'title',
      label: `题目问题 (${result?.title_problems?.length || 0})`,
      children: (
        <Table
          columns={problemColumns}
          dataSource={result?.title_problems || []}
          rowKey={(record, index) => index}
          pagination={false}
          locale={{ emptyText: '无题目问题' }}
        />
      ),
    },
    {
      key: 'format',
      label: `格式问题 (${result?.format_problems?.length || 0})`,
      children: (
        <Table
          columns={problemColumns}
          dataSource={result?.format_problems || []}
          rowKey={(record, index) => index}
          pagination={false}
          locale={{ emptyText: '无格式问题' }}
        />
      ),
    },
    {
      key: 'content',
      label: `内容问题 (${result?.content_problems?.length || 0})`,
      children: (
        <Table
          columns={problemColumns}
          dataSource={result?.content_problems || []}
          rowKey={(record, index) => index}
          pagination={false}
          locale={{ emptyText: '无内容问题' }}
        />
      ),
    },
    {
      key: 'logic',
      label: `逻辑问题 (${result?.logic_problems?.length || 0})`,
      children: (
        <Table
          columns={problemColumns}
          dataSource={result?.logic_problems || []}
          rowKey={(record, index) => index}
          pagination={false}
          locale={{ emptyText: '无逻辑问题' }}
        />
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <Button
              icon={<LeftOutlined />}
              onClick={() => navigate('/results')}
            >
              返回
            </Button>
            检查结果详情
          </Space>
        }
        extra={
          <Button icon={<DownloadOutlined />} type="primary">
            下载报告
          </Button>
        }
      >
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="整体评级"
                value={result?.overall_grade}
                valueRender={(value) => <GradeTag grade={value} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="查重率"
                value={(result?.duplicate_rate * 100).toFixed(2)}
                suffix="%"
                valueStyle={{ 
                  color: result?.duplicate_rate > 0.3 ? '#cf1322' : 
                         result?.duplicate_rate > 0.15 ? '#fa8c16' : '#3f8600' 
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="问题总数"
                value={result?.problem_count}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="检查时间"
                value={formatDateTime(result?.created_at)}
                valueStyle={{ fontSize: 14 }}
              />
            </Card>
          </Col>
        </Row>

        <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
          <Descriptions.Item label="论文标题" span={2}>
            {result?.paper_title}
          </Descriptions.Item>
          <Descriptions.Item label="题目评级">
            <GradeTag grade={result?.title_grade} />
          </Descriptions.Item>
          <Descriptions.Item label="格式评级">
            <GradeTag grade={result?.format_grade} />
          </Descriptions.Item>
          <Descriptions.Item label="内容评级">
            <GradeTag grade={result?.content_grade} />
          </Descriptions.Item>
          <Descriptions.Item label="逻辑评级">
            <GradeTag grade={result?.logic_grade} />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="问题详情" style={{ marginTop: 16 }}>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default ResultDetail;
