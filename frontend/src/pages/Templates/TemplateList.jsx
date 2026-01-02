import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { getTemplateList, uploadTemplate, updateTemplate, deleteTemplate } from '@/api/templates';
import { formatDateTime } from '@/utils/format';
import { TEMPLATE_TYPES } from '@/utils/constants';

const { TextArea } = Input;
const { Option } = Select;

const TemplateList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getTemplateList({});
      setDataSource(res.data || []);
    } catch (error) {
      message.error('加载模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTemplate(null);
    setFileList([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingTemplate(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      template_type: record.template_type,
      visibility: record.visibility,
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模板吗？',
      onOk: async () => {
        try {
          await deleteTemplate(id);
          message.success('删除成功');
          loadData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);

      if (editingTemplate) {
        // 编辑模板
        await updateTemplate(editingTemplate.id, values);
        message.success('更新成功');
      } else {
        // 新增模板
        if (fileList.length === 0) {
          message.error('请上传模板文件');
          setUploading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', fileList[0]);
        Object.keys(values).forEach(key => {
          formData.append(key, values[key]);
        });

        await uploadTemplate(formData);
        message.success('上传成功');
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'template_type',
      key: 'template_type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'graduation' ? 'blue' : 'green'}>
          {type === 'graduation' ? '毕业论文' : '课程论文'}
        </Tag>
      ),
    },
    {
      title: '可见性',
      dataIndex: 'visibility',
      key: 'visibility',
      width: 100,
      render: (visibility) => (
        <Tag color={visibility === 'public' ? 'green' : 'orange'}>
          {visibility === 'public' ? '公开' : '私有'}
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
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
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
    <Card
      title="模板管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          上传模板
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
        title={editingTemplate ? '编辑模板' : '上传模板'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={uploading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="模板名称"
            name="name"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="请输入模板描述" />
          </Form.Item>

          <Form.Item
            label="模板类型"
            name="template_type"
            rules={[{ required: true, message: '请选择模板类型' }]}
          >
            <Select placeholder="请选择模板类型">
              <Option value="graduation">毕业论文</Option>
              <Option value="course">课程论文</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="可见性"
            name="visibility"
            rules={[{ required: true, message: '请选择可见性' }]}
          >
            <Select placeholder="请选择可见性">
              <Option value="public">公开</Option>
              <Option value="private">私有</Option>
            </Select>
          </Form.Item>

          {!editingTemplate && (
            <Form.Item label="上传文件" required>
              <Upload
                beforeUpload={(file) => {
                  setFileList([file]);
                  return false;
                }}
                onRemove={() => setFileList([])}
                fileList={fileList}
              >
                <Button icon={<UploadOutlined />}>选择文件</Button>
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default TemplateList;
