import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Upload, Select, message } from 'antd';
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { getPreviousPaperList, uploadPreviousPaper, deletePreviousPaper } from '@/api/previousPapers';
import { formatDateTime } from '@/utils/format';

const { Search } = Input;
const { Option } = Select;

const PreviousPaperList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    year: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

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
      
      const res = await getPreviousPaperList(params);
      setDataSource(res.data || []);
      setPagination(prev => ({ ...prev, total: res.total || 0 }));
    } catch (error) {
      message.error('加载往届论文列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      
      if (fileList.length === 0) {
        message.error('请上传论文文件');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('file', fileList[0]);
      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });

      await uploadPreviousPaper(formData);
      message.success('上传成功');
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇往届论文吗？',
      onOk: async () => {
        try {
          await deletePreviousPaper(id);
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
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 100,
    },
    {
      title: '院系',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: '专业',
      dataIndex: 'major',
      key: 'major',
      width: 150,
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
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <Card
      title="往届论文管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          上传论文
        </Button>
      }
    >
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Search
          placeholder="搜索论文标题或作者"
          style={{ width: 300 }}
          onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
          allowClear
        />
        <Select
          placeholder="年份筛选"
          style={{ width: 150 }}
          onChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
          allowClear
        >
          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <Option key={year} value={year}>{year}</Option>
          ))}
        </Select>
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

      <Modal
        title="上传往届论文"
        open={modalVisible}
        onOk={handleUpload}
        onCancel={() => setModalVisible(false)}
        confirmLoading={uploading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="论文标题"
            name="title"
            rules={[{ required: true, message: '请输入论文标题' }]}
          >
            <Input placeholder="请输入论文标题" />
          </Form.Item>

          <Form.Item
            label="作者"
            name="author"
            rules={[{ required: true, message: '请输入作者姓名' }]}
          >
            <Input placeholder="请输入作者姓名" />
          </Form.Item>

          <Form.Item
            label="年份"
            name="year"
            rules={[{ required: true, message: '请选择年份' }]}
          >
            <Select placeholder="请选择年份">
              {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="院系"
            name="department"
            rules={[{ required: true, message: '请输入院系' }]}
          >
            <Input placeholder="请输入院系" />
          </Form.Item>

          <Form.Item
            label="专业"
            name="major"
            rules={[{ required: true, message: '请输入专业' }]}
          >
            <Input placeholder="请输入专业" />
          </Form.Item>

          <Form.Item label="上传文件" required>
            <Upload
              beforeUpload={(file) => {
                const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                if (!isDocx) {
                  message.error('只能上传 .docx 文件');
                  return Upload.LIST_IGNORE;
                }
                const isLt50M = file.size / 1024 / 1024 < 50;
                if (!isLt50M) {
                  message.error('文件大小不能超过 50MB');
                  return Upload.LIST_IGNORE;
                }
                setFileList([file]);
                return false;
              }}
              onRemove={() => setFileList([])}
              fileList={fileList}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PreviousPaperList;
