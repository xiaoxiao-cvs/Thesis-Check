import request from './request';
import axios from 'axios';
import { getToken } from '@/utils/auth';
import { API_BASE_URL } from '@/utils/constants';

/**
 * 上传毕业论文
 */
export const uploadGraduationPaper = (formData) => {
  return axios.post(`${API_BASE_URL}/papers/graduation`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/**
 * 上传课程论文
 */
export const uploadCoursePaper = (formData) => {
  return axios.post(`${API_BASE_URL}/papers/course`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/**
 * 获取论文列表
 */
export const getPaperList = (params) => {
  return request.get('/papers', { params });
};

/**
 * 获取论文详情
 */
export const getPaperDetail = (id) => {
  return request.get(`/papers/${id}`);
};

/**
 * 删除论文
 */
export const deletePaper = (id) => {
  return request.delete(`/papers/${id}`);
};
