import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { getParameterList, createParameter, updateParameter, lockParameter } from '@/api/parameters';
import { formatDateTime } from '@/utils/format';
import { usePermission } from '@/hooks/usePermission';
import { USER_ROLES } from '@/utils/constants';

const { Option } = Select;
const { TextArea } = Input;

const ParameterList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParam, setEditingParam] = useState(null);
  const [form] = Form.useForm();
  const { hasPermission } = usePermission();
  const isDean = hasPermission(USER_ROLES.DEAN);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getParameterList({});
      setDataSource(res.data || []);
    } catch (error) {
      message.error('加载参数列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingParam(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    if (record.is_locked && !isDean) {
      message.warning('该参数已锁定，仅院长可修改');
      return;
    }
    setEditingParam(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleLock = async (id, lock) => {
    try {
      await lockParameter(id, { lock });
      message.success(lock ? '锁定成功' : '解锁成功');
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingParam) {
        await updateParameter(editingParam.id, values);
        message.success('更新成功');
      } else {
        await createParameter(values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '参数名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '重复率阈值',
      dataIndex: 'duplicate_rate_threshold',
      key: 'duplicate_rate_threshold',
      width: 120,
      render: (val) => `${val}%`,
    },
    {
      title: '格式阈值',
      dataIndex: 'format_threshold',
      key: 'format_threshold',
      width: 100,
      render: (val) => `${val}%`,
    },
    {
      title: '适用范围',
      dataIndex: 'application_scope',
      key: 'application_scope',
      width: 120,
      render: (scope) => (
        <Tag color={scope === 'global' ? 'blue' : scope === 'department' ? 'green' : 'orange'}>
          {scope === 'global' ? '全局' : scope === 'department' ? '院系' : '专业'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_locked',
      key: 'is_locked',
      width: 80,
      render: (locked) => (
        <Tag color={locked ? 'red' : 'green'}>
          {locked ? '已锁定' : '未锁定'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.is_locked && !isDean}
          >
            编辑
          </Button>
          {isDean && (
            <Button
              type="link"
              size="small"
              icon={record.is_locked ? <UnlockOutlined /> : <LockOutlined />}
              onClick={() => handleLock(record.id, !record.is_locked)}
            >
              {record.is_locked ? '解锁' : '锁定'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="参数设置"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增参数
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={{ showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
      />

      <Modal
        title={editingParam ? '编辑参数' : '新增参数'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="参数名称"
            name="name"
            rules={[{ required: true, message: '请输入参数名称' }]}
          >
            <Input placeholder="请输入参数名称" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
          >
            <TextArea rows={2} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            label="重复率阈值 (%)"
            name="duplicate_rate_threshold"
            rules={[{ required: true, message: '请输入重复率阈值' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
          </Form.Item>

          <Form.Item
            label="格式检查阈值 (%)"
            name="format_threshold"
            rules={[{ required: true, message: '请输入格式检查阈值' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
          </Form.Item>

          <Form.Item
            label="标题检查阈值 (%)"
            name="title_threshold"
            rules={[{ required: true, message: '请输入标题检查阈值' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
          </Form.Item>

          <Form.Item
            label="内容检查阈值 (%)"
            name="content_threshold"
            rules={[{ required: true, message: '请输入内容检查阈值' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
          </Form.Item>

          <Form.Item
            label="逻辑检查阈值 (%)"
            name="logic_threshold"
            rules={[{ required: true, message: '请输入逻辑检查阈值' }]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
          </Form.Item>

          <Form.Item
            label="适用范围"
            name="application_scope"
            rules={[{ required: true, message: '请选择适用范围' }]}
          >
            <Select placeholder="请选择适用范围">
              <Option value="global">全局</Option>
              <Option value="department">院系</Option>
              <Option value="major">专业</Option>
            </Select>
          </Form.Item>

          <Form.Item label="范围ID" name="scope_id">
            <Input placeholder="如选择院系/专业，请输入对应ID" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ParameterList;
