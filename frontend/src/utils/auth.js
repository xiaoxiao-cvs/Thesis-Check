import { USER_ROLES, ROLE_LEVELS } from './constants';

/**
 * Token管理
 */
export const TOKEN_KEY = 'access_token';

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * 检查用户是否有权限
 * @param {string} userRole 用户角色
 * @param {string|string[]} requiredRoles 要求的角色（单个或数组）
 * @returns {boolean}
 */
export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole) return false;
  
  // 管理员拥有所有权限
  if (userRole === USER_ROLES.ADMIN) return true;
  
  // 如果是数组，检查是否包含用户角色
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }
  
  // 单个角色，检查权限等级
  const userLevel = ROLE_LEVELS[userRole] || 0;
  const requiredLevel = ROLE_LEVELS[requiredRoles] || 0;
  
  return userLevel >= requiredLevel;
};

/**
 * 检查用户是否至少拥有某个权限等级
 * @param {string} userRole 用户角色
 * @param {string} minRole 最低要求角色
 * @returns {boolean}
 */
export const hasMinRole = (userRole, minRole) => {
  if (!userRole) return false;
  
  const userLevel = ROLE_LEVELS[userRole] || 0;
  const minLevel = ROLE_LEVELS[minRole] || 0;
  
  return userLevel >= minLevel;
};

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 检查文件类型
 * @param {File} file 文件对象
 * @param {string[]} allowedTypes 允许的文件类型
 * @returns {boolean}
 */
export const checkFileType = (file, allowedTypes) => {
  if (!file || !file.name) return false;
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};
