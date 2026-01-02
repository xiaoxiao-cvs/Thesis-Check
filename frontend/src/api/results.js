import request from './request';

/**
 * 获取结果列表
 */
export const getResultList = (params) => {
  return request.get('/results', { params });
};

/**
 * 获取结果详情
 */
export const getResultDetail = (id) => {
  return request.get(`/results/${id}`);
};

/**
 * 删除检查结果
 */
export const deleteResult = (id) => {
  return request.delete(`/results/${id}`);
};
