import request from './request';

/**
 * 获取用户列表
 */
export const getUserList = (params) => {
  // 过滤掉空字符串参数
  const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
  return request.get('/users', { params: filteredParams });
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
