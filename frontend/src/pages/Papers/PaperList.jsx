import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPaperList, deletePaper } from '@/api/papers';
import { formatDateTime } from '@/utils/format';
import { PAPER_TYPE_NAMES } from '@/utils/constants';

const { Search } = Input;
const { Option } = Select;

const PaperList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    paper_type: '',
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
      
      const res = await getPaperList(params);
      setDataSource(res.data || []);
      setPagination(prev => ({ ...prev, total: res.total || 0 }));
    } catch (error) {
      message.error('加载论文列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇论文吗？删除后无法恢复。',
      onOk: async () => {
        try {
          await deletePaper(id);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
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
          {PAPER_TYPE_NAMES[type]}
        </Tag>
      ),
    },
    {
      title: '学生姓名',
      dataIndex: 'student_name',
      key: 'student_name',
      width: 100,
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/papers/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => navigate(`/check/submit/${record.id}`)}
          >
            检查
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  
  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Search
            placeholder="搜索论文标题或学生"
            style={{ width: 250 }}
            onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
            allowClear
          />
          <Select
            placeholder="论文类型"
            style={{ width: 120 }}
            onChange={(value) => setFilters(prev => ({ ...prev, paper_type: value }))}
            allowClear
          >
            <Option value="graduation">毕业论文</Option>
            <Option value="course">课程论文</Option>
          </Select>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/papers/upload')}
        >
          上传论文
        </Button>
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
    </div>
  );
};

export default PaperList;
