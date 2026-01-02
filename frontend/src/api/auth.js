import request from './request';

/**
 * 用户注册
 */
export const register = (data) => {
  return request.post('/auth/register', data);
};

/**
 * 用户登录
 */
export const login = (data) => {
  return request.post('/auth/login', data);
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return request.get('/auth/me');
};

/**
 * 更新用户资料
 */
export const updateProfile = (data) => {
  return request.put('/auth/profile', data);
};

/**
 * 修改密码
 */
export const changePassword = (data) => {
  return request.put('/auth/password', data);
};

/**
 * 用户登出
 */
export const logout = () => {
  return request.post('/auth/logout');
};
