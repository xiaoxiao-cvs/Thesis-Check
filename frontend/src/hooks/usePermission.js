import { useAuth } from './useAuth';
import { hasPermission, hasMinRole } from '@/utils/auth';

/**
 * 权限检查Hook
 */
export const usePermission = () => {
  const { role } = useAuth();
  
  /**
   * 检查是否有权限
   * @param {string|string[]} requiredRoles 要求的角色
   */
  const checkPermission = (requiredRoles) => {
    return hasPermission(role, requiredRoles);
  };
  
  /**
   * 检查是否至少拥有某个权限等级
   * @param {string} minRole 最低要求角色
   */
  const checkMinRole = (minRole) => {
    return hasMinRole(role, minRole);
  };
  
  return {
    checkPermission,
    checkMinRole,
    role,
  };
};
