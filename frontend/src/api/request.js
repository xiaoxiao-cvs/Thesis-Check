import axios from 'axios';
import { message } from 'antd';
import { getToken, removeToken } from '@/utils/auth';
import { API_BASE_URL } from '@/utils/constants';

// 创建axios实例
const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加Token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data;
    
    // 如果返回的状态码不是200，说明接口有问题
    if (response.status !== 200) {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    return res;
  },
  (error) => {
    console.error('响应错误:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Token过期或无效
      if (status === 401) {
        message.error('登录已过期，请重新登录');
        removeToken();
        // 跳转到登录页
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // 权限不足
      if (status === 403) {
        message.error('权限不足');
        return Promise.reject(error);
      }
      
      // 404
      if (status === 404) {
        message.error('请求的资源不存在');
        return Promise.reject(error);
      }
      
      // 服务器错误
      if (status >= 500) {
        message.error(data?.detail || '服务器错误，请稍后重试');
        return Promise.reject(error);
      }
      
      // 其他错误
      message.error(data?.detail || data?.message || '请求失败');
    } else if (error.request) {
      message.error('网络连接失败，请检查网络');
    } else {
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default request;
