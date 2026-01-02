import request from './request';
import axios from 'axios';
import { getToken } from '@/utils/auth';
import { API_BASE_URL } from '@/utils/constants';

/**
 * 上传往届论文
 */
export const uploadPreviousPaper = (formData) => {
  return axios.post(`${API_BASE_URL}/previous-papers`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/**
 * 获取往届论文列表
 */
export const getPreviousPaperList = (params) => {
  return request.get('/previous-papers', { params });
};

/**
 * 获取往届论文详情
 */
export const getPreviousPaperDetail = (id) => {
  return request.get(`/previous-papers/${id}`);
};

/**
 * 删除往届论文
 */
export const deletePreviousPaper = (id) => {
  return request.delete(`/previous-papers/${id}`);
};
