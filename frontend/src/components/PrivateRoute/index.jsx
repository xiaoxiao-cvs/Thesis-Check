import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/utils/auth';

/**
 * 权限路由组件
 * @param {ReactNode} children 子组件
 * @param {string|string[]} requiredRoles 要求的角色
 */
const PrivateRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, role } = useAuth();
  
  // 未登录，跳转到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // 需要权限但没有权限，跳转到403页面
  if (requiredRoles && !hasPermission(role, requiredRoles)) {
    return <Navigate to="/403" replace />;
  }
  
  return children;
};

export default PrivateRoute;
