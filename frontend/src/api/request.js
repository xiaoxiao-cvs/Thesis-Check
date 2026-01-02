import axios from 'axios';
import { message } from 'antd';
import { getToken, removeToken } from '@/utils/auth';
import { API_BASE_URL } from '@/utils/constants';
import { getErrorMessage } from '@/utils/errorHandler';

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
    
    // 正常返回数据
    return res;
  },
  (error) => {
    // 不在这里显示错误，让调用方决定如何处理
    // 只处理特殊情况：401 自动跳转登录
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Token过期或无效
      if (status === 401) {
        const currentPath = window.location.pathname;
        // 如果不在登录页，才跳转并显示提示
        if (currentPath !== '/login' && currentPath !== '/register') {
          message.error('登录已过期，请重新登录');
          removeToken();
          // 延迟跳转，让用户看到消息
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      }
      
      // 将后端错误信息附加到error对象
      error.message = data?.detail || data?.message || getErrorMessage(error);
    } else if (error.request) {
      // 网络错误
      error.message = '网络连接失败，请检查您的网络设置';
    } else {
      // 其他错误
      error.message = error.message || '请求失败';
    }
    
    return Promise.reject(error);
  }
);

export default request;
