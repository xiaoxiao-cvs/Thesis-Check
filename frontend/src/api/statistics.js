import request from './request';

/**
 * 获取概览统计
 */
export const getOverviewStatistics = () => {
  return request.get('/statistics/overview');
};

/**
 * 获取学院统计
 */
export const getDepartmentStatistics = (params) => {
  return request.get('/statistics/department', { params });
};

/**
 * 获取教师统计
 */
export const getTeacherStatistics = () => {
  return request.get('/statistics/teacher');
};
