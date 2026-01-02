import request from './request';

/**
 * 提交检查任务
 */
export const submitCheck = (data) => {
  return request.post('/check/submit', data);
};

/**
 * 获取检查状态
 */
export const getCheckStatus = (taskId) => {
  return request.get(`/check/status/${taskId}`);
};
