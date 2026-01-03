import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  CheckCircle,
  FileSearch,
  Database,
  Settings,
  Users,
  Upload,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { logout } from '@/store/authSlice';
import { USER_ROLES } from '@/utils/constants';
import { useToast } from '@/components/ui';
import NotificationCenter from '@/components/NotificationCenter';
import { cn } from '@/utils/cn';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { checkMinRole } = usePermission();
  const toast = useToast();

  // 退出登录
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      toast.success('退出成功');
      navigate('/login');
    } catch (error) {
      toast.error('退出失败');
    }
  };

  // 侧边栏菜单项
  const getMenuItems = () => {
    const items = [
      {
        key: '/dashboard',
        icon: BarChart3,
        label: '工作台',
      },
      {
        key: '/papers',
        icon: FileText,
        label: '我的论文',
        children: [
          {
            key: '/papers/list',
            label: '论文列表',
          },
          {
            key: '/papers/upload',
            icon: Upload,
            label: '上传论文',
          },
        ],
      },
      {
        key: '/results',
        icon: CheckCircle,
        label: '检查结果',
      },
    ];

    // 教师及以上权限
    if (checkMinRole(USER_ROLES.TEACHER)) {
      items.push({
        key: '/templates',
        icon: FileSearch,
        label: '模板管理',
      });
      items.push({
        key: '/previous-papers',
        icon: Database,
        label: '往届论文',
      });
      items.push({
        key: '/statistics',
        icon: BarChart3,
        label: '统计分析',
      });
    }

    // 主任及以上权限
    if (checkMinRole(USER_ROLES.DIRECTOR)) {
      items.push({
        key: '/parameters',
        icon: Settings,
        label: '参数设置',
      });
    }

    // 管理员权限
    if (checkMinRole(USER_ROLES.ADMIN)) {
      items.push({
        key: '/users',
        icon: Users,
        label: '用户管理',
      });
    }

    return items;
  };

  const isActive = (key) => {
    if (key === '/dashboard') return location.pathname === key;
    return location.pathname.startsWith(key);
  };

  const MenuItem = ({ item, depth = 0 }) => {
    const [isOpen, setIsOpen] = useState(isActive(item.key));
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div>
        <button
          onClick={() => {
            if (hasChildren) {
              setIsOpen(!isOpen);
            } else {
              navigate(item.key);
              setMobileMenuOpen(false);
            }
          }}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
            'hover:bg-primary/10 hover:text-primary',
            isActive(item.key) && 'bg-primary/10 text-primary',
            !isActive(item.key) && 'text-muted-foreground',
            depth > 0 && 'pl-12'
          )}
        >
          {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
          {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
          {!collapsed && hasChildren && (
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'rotate-90'
              )}
            />
          )}
        </button>

        {hasChildren && !collapsed && isOpen && (
          <div className="border-l-2 border-primary/20 ml-7">
            {item.children.map((child) => (
              <MenuItem key={child.key} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          'md:relative'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              论文查重系统
            </h1>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {getMenuItems().map((item) => (
            <MenuItem key={item.key} item={item} />
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t p-4">
          {!collapsed ? (
            <div className="space-y-2">
              <button
                onClick={() => navigate('/profile')}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted rounded-md transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="flex-1 text-left font-medium">
                  {user?.nickname || user?.username}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>退出登录</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-md"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <NotificationCenter />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Outlet />
        </main>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
