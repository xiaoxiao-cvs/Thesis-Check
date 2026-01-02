import { useState, useEffect } from 'react';
import { Card, Descriptions, Button, Space, message, Modal, Table, Tag, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { getPaperDetail, deletePaper } from '@/api/papers';
import { getResultList } from '@/api/results';
import { formatDateTime } from '@/utils/format';
import { PAPER_TYPE_NAMES } from '@/utils/constants';
import GradeTag from '@/components/GradeTag';

const PaperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paper, setPaper] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const paperData = await getPaperDetail(id);
      setPaper(paperData);
      
      // 获取检查结果
      const resultData = await getResultList({ paper_id: id });
      setResults(resultData.data || []);
    } catch (error) {
      message.error('加载论文详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇论文吗？删除后无法恢复。',
      onOk: async () => {
        try {
          await deletePaper(id);
          message.success('删除成功');
          navigate('/papers/list');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const resultColumns = [
    {
      title: '检查时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => formatDateTime(time),
    },
    {
      title: '评级',
      dataIndex: 'overall_grade',
      key: 'overall_grade',
      render: (grade) => <GradeTag grade={grade} />,
    },
    {
      title: '查重率',
      dataIndex: 'duplicate_rate',
      key: 'duplicate_rate',
      render: (rate) => `${(rate * 100).toFixed(2)}%`,
    },
    {
      title: '问题数',
      dataIndex: 'problem_count',
      key: 'problem_count',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/results/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <Spin tip="加载中..." />
      </Card>
    );
  }

  return (
    <div>
      <Card
        title="论文信息"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => navigate(`/check/submit/${id}`)}
            >
              提交检查
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              删除
            </Button>
          </Space>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="论文标题" span={2}>{paper?.title}</Descriptions.Item>
          <Descriptions.Item label="论文类型">
            <Tag color={paper?.paper_type === 'graduation' ? 'blue' : 'green'}>
              {PAPER_TYPE_NAMES[paper?.paper_type]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="学生姓名">{paper?.student_name}</Descriptions.Item>
          <Descriptions.Item label="学号">{paper?.student_number}</Descriptions.Item>
          
          {paper?.paper_type === 'graduation' ? (
            <>
              <Descriptions.Item label="专业">{paper?.major}</Descriptions.Item>
              <Descriptions.Item label="院系">{paper?.department}</Descriptions.Item>
              <Descriptions.Item label="指导教师">{paper?.advisor}</Descriptions.Item>
              <Descriptions.Item label="学年">{paper?.academic_year}</Descriptions.Item>
            </>
          ) : (
            <>
              <Descriptions.Item label="课程名称">{paper?.course_name}</Descriptions.Item>
              <Descriptions.Item label="课程代码">{paper?.course_code}</Descriptions.Item>
              <Descriptions.Item label="学期">{paper?.semester}</Descriptions.Item>
              <Descriptions.Item label="任课教师">{paper?.instructor}</Descriptions.Item>
            </>
          )}
          
          <Descriptions.Item label="上传时间" span={2}>
            {formatDateTime(paper?.created_at)}
          </Descriptions.Item>
          
          {paper?.description && (
            <Descriptions.Item label="备注" span={2}>{paper?.description}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="检查历史" style={{ marginTop: 16 }}>
        <Table
          columns={resultColumns}
          dataSource={results}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无检查记录' }}
        />
      </Card>
    </div>
  );
};

export default PaperDetail;
