import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, Card } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getResultList } from '@/api/results';
import { formatDateTime, formatPercent } from '@/utils/format';
import GradeTag from '@/components/GradeTag';

const { Search } = Input;
const { Option } = Select;

const ResultList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
  });

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...filters,
      };
      
      const res = await getResultList(params);
      setDataSource(res.data || []);
      setPagination(prev => ({ ...prev, total: res.total || 0 }));
    } catch (error) {
      console.error('加载结果列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '论文标题',
      dataIndex: 'paper_title',
      key: 'paper_title',
      ellipsis: true,
    },
    {
      title: '检查时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => formatDateTime(time),
    },
    {
      title: '评级',
      dataIndex: 'overall_grade',
      key: 'overall_grade',
      width: 100,
      render: (grade) => <GradeTag grade={grade} />,
    },
    {
      title: '查重率',
      dataIndex: 'duplicate_rate',
      key: 'duplicate_rate',
      width: 100,
      render: (rate) => {
        const percent = rate * 100;
        let color = 'green';
        if (percent > 30) color = 'red';
        else if (percent > 15) color = 'orange';
        return <Tag color={color}>{percent.toFixed(2)}%</Tag>;
      },
    },
    {
      title: '问题数',
      dataIndex: 'problem_count',
      key: 'problem_count',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/results/${record.id}`)}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="检查结果">
      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索论文标题"
          style={{ width: 300 }}
          onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
          allowClear
        />
      </div>
      
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            setPagination(prev => ({ ...prev, current: page, pageSize }));
          },
        }}
      />
    </Card>
  );
};

export default ResultList;
