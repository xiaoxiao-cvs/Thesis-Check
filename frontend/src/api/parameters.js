import request from './request';

/**
 * 创建参数配置
 */
export const createParameter = (data) => {
  return request.post('/parameters', data);
};

/**
 * 获取参数列表
 */
export const getParameterList = (params) => {
  return request.get('/parameters', { params });
};

/**
 * 获取参数详情
 */
export const getParameterDetail = (id) => {
  return request.get(`/parameters/${id}`);
};

/**
 * 更新参数配置
 */
export const updateParameter = (id, data) => {
  return request.put(`/parameters/${id}`, data);
};

/**
 * 锁定参数配置
 */
export const lockParameter = (id) => {
  return request.post(`/parameters/${id}/lock`);
};

/**
 * 解锁参数配置
 */
export const unlockParameter = (id) => {
  return request.post(`/parameters/${id}/unlock`);
};

/**
 * 删除参数配置
 */
export const deleteParameter = (id) => {
  return request.delete(`/parameters/${id}`);
};
