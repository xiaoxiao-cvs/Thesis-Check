import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Select, Input, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUserList, updateUserRole, deleteUser } from '@/api/users';
import { formatDateTime } from '@/utils/format';
import { ROLE_NAMES, USER_ROLES } from '@/utils/constants';

const { Option } = Select;
const { Search } = Input;

const UserList = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    role: '',
    search: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

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
      
      const res = await getUserList(params);
      setDataSource(res.items || []);
      setPagination(prev => ({ ...prev, total: res.total || 0 }));
    } catch (error) {
      message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (record) => {
    setEditingUser(record);
    form.setFieldsValue({ role: record.role });
    setModalVisible(true);
  };

  const handleUpdateRole = async () => {
    try {
      const values = await form.validateFields();
      await updateUserRole(editingUser.id, values);
      message.success('角色更新成功');
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      onOk: async () => {
        try {
          await deleteUser(id);
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
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => {
        const colors = {
          student: 'default',
          teacher: 'blue',
          director: 'purple',
          dean: 'orange',
          admin: 'red',
        };
        return <Tag color={colors[role]}>{ROLE_NAMES[role]}</Tag>;
      },
    },
    {
      title: '院系',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '注册时间',
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
            onClick={() => handleEditRole(record)}
          >
            改角色
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
    <Card title="用户管理">
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Search
          placeholder="搜索用户名或邮箱"
          style={{ width: 300 }}
          onSearch={(value) => setFilters(prev => ({ ...prev, search: value }))}
          allowClear
        />
        <Select
          placeholder="角色筛选"
          style={{ width: 150 }}
          onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
          allowClear
        >
          <Option value="student">学生</Option>
          <Option value="teacher">教师</Option>
          <Option value="director">主任</Option>
          <Option value="dean">院长</Option>
          <Option value="admin">管理员</Option>
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
        title="修改用户角色"
        open={modalVisible}
        onOk={handleUpdateRole}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="用户名">
            {editingUser?.username}
          </Form.Item>
          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value={USER_ROLES.STUDENT}>学生</Option>
              <Option value={USER_ROLES.TEACHER}>教师</Option>
              <Option value={USER_ROLES.DIRECTOR}>主任</Option>
              <Option value={USER_ROLES.DEAN}>院长</Option>
              <Option value={USER_ROLES.ADMIN}>管理员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserList;
