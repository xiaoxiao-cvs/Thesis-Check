import request from './request';

/**
 * 获取用户列表
 */
export const getUserList = (params) => {
  return request.get('/users', { params });
};

/**
 * 获取用户详情
 */
export const getUserDetail = (id) => {
  return request.get(`/users/${id}`);
};

/**
 * 更新用户角色
 */
export const updateUserRole = (id, data) => {
  return request.put(`/users/${id}/role`, data);
};

/**
 * 删除用户
 */
export const deleteUser = (id) => {
  return request.delete(`/users/${id}`);
};
