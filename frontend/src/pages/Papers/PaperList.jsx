import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPaperList, deletePaper } from '@/api/papers';
import { formatDateTime } from '@/utils/format';
import { PAPER_TYPE_NAMES } from '@/utils/constants';
import TableSkeleton from '@/components/TableSkeleton';
import useLoading from '@/hooks/useLoading';
import { handleBatchErrors } from '@/utils/errorHandler';

const { Search } = Input;
const { Option } = Select;

const PaperList = () => {
  const navigate = useNavigate();
  const { loading, withLoading, isLoading } = useLoading(true);
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
    await withLoading(async () => {
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
        message.error('加载论文列表失败，请稍后重试');
      }
    });
  };
  
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇论文吗？删除后无法恢复。',
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await withLoading(async () => {
          try {
            await deletePaper(id);
            message.success('删除成功');
            loadData();
          } catch (error) {
            message.error(error.message || '删除失败，请稍后重试');
          }
        }, `delete_${id}`);
      },
    });
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的论文');
      return;
    }

    Modal.confirm({
      title: '批量删除确认',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 篇论文吗？删除后无法恢复。`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        await withLoading(async () => {
          try {
            // 并行删除所有选中的论文
            const deletePromises = selectedRowKeys.map(id => 
              deletePaper(id).catch(error => ({ error, id }))
            );
            
            const results = await Promise.allSettled(deletePromises);
            const summary = handleBatchErrors(results);
            
            if (summary.success > 0) {
              message.success(`成功删除 ${summary.success} 篇论文`);
            }
            
            if (summary.failed > 0) {
              message.error(`${summary.failed} 篇论文删除失败`);
            }
            
            // 清空选择并重新加载
            setSelectedRowKeys([]);
            loadData();
          } catch (error) {
            message.error('批量删除失败');
          }
        }, 'batch_delete');
      },
    });
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
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
            loading={isLoading(`delete_${record.id}`)}
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={isLoading('batch_delete')}
              onClick={handleBatchDelete}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          )}
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

      {loading && dataSource.length === 0 ? (
        <TableSkeleton columns={5} rows={pagination.pageSize} />
      ) : (
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          loading={loading && dataSource.length > 0}
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
      )}
    </div>
  );
};

export default PaperList;
