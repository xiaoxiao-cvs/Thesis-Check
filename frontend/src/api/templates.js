import request from './request';
import axios from 'axios';
import { getToken } from '@/utils/auth';
import { API_BASE_URL } from '@/utils/constants';

/**
 * 上传模板
 */
export const uploadTemplate = (formData) => {
  return axios.post(`${API_BASE_URL}/templates`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/**
 * 获取模板列表
 */
export const getTemplateList = (params) => {
  return request.get('/templates', { params });
};

/**
 * 获取模板详情
 */
export const getTemplateDetail = (id) => {
  return request.get(`/templates/${id}`);
};

/**
 * 更新模板
 */
export const updateTemplate = (id, data) => {
  return request.put(`/templates/${id}`, data);
};

/**
 * 删除模板
 */
export const deleteTemplate = (id) => {
  return request.delete(`/templates/${id}`);
};
