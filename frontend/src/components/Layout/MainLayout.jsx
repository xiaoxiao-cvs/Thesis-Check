import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, message, Space } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  FileAddOutlined,
  TeamOutlined,
  FileSearchOutlined,
  DatabaseOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { logout } from '@/store/authSlice';
import { USER_ROLES } from '@/utils/constants';
import NotificationCenter from '@/components/NotificationCenter';
import './index.less';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { checkMinRole } = usePermission();
  
  // 退出登录
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      message.success('退出成功');
      navigate('/login');
    } catch (error) {
      message.error('退出失败');
    }
  };
  
  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'divider',
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];
  
  // 侧边栏菜单项
  const getMenuItems = () => {
    const items = [
      {
        key: '/dashboard',
        icon: <BarChartOutlined />,
        label: '工作台',
      },
      {
        key: '/papers',
        icon: <FileTextOutlined />,
        label: '我的论文',
        children: [
          {
            key: '/papers/list',
            label: '论文列表',
          },
          {
            key: '/papers/upload',
            icon: <FileAddOutlined />,
            label: '上传论文',
          },
        ],
      },
      {
        key: '/results',
        icon: <CheckCircleOutlined />,
        label: '检查结果',
      },
    ];
    
    // 教师及以上权限
    if (checkMinRole(USER_ROLES.TEACHER)) {
      items.push({
        key: '/templates',
        icon: <FileSearchOutlined />,
        label: '模板管理',
      });
      items.push({
        key: '/previous-papers',
        icon: <DatabaseOutlined />,
        label: '往届论文',
      });
      items.push({
        key: '/statistics',
        icon: <BarChartOutlined />,
        label: '统计分析',
      });
    }
    
    // 主任及以上权限
    if (checkMinRole(USER_ROLES.DIRECTOR)) {
      items.push({
        key: '/parameters',
        icon: <ControlOutlined />,
        label: '参数设置',
      });
    }
    
    // 管理员权限
    if (checkMinRole(USER_ROLES.ADMIN)) {
      items.push({
        key: '/users',
        icon: <TeamOutlined />,
        label: '用户管理',
      });
    }
    
    return items;
  };
  
  return (
    <Layout className="main-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        className="layout-sider"
      >
        <div className="logo">
          {!collapsed ? '论文查重系统' : '论文'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['/papers']}
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="layout-header">
          <div className="header-right">
            <Space size="large">
              <NotificationCenter />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-info">
                  <Avatar icon={<UserOutlined />} />
                  <span className="username">{user?.nickname || user?.username}</span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className="layout-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
