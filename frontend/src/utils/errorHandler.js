/**
 * 错误处理工具
 */

/**
 * 错误类型枚举
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown',
};

/**
 * 错误消息映射
 */
const ERROR_MESSAGES = {
  // 网络错误
  'Network Error': '网络连接失败，请检查您的网络设置',
  'timeout': '请求超时，请稍后重试',
  
  // 认证错误
  '401': '您的登录已过期，请重新登录',
  '403': '您没有权限执行此操作',
  
  // 客户端错误
  '400': '请求参数有误，请检查后重试',
  '404': '请求的资源不存在',
  '422': '数据验证失败，请检查输入',
  
  // 服务器错误
  '500': '服务器出错了，请稍后重试',
  '502': '网关错误，请稍后重试',
  '503': '服务暂时不可用，请稍后重试',
};

/**
 * 获取友好的错误消息
 * @param {Error} error - 错误对象
 * @returns {string} 友好的错误消息
 */
export const getErrorMessage = (error) => {
  if (!error) return '未知错误';
  
  // 如果有自定义消息，直接返回
  if (error.message && !error.message.includes('Error')) {
    return error.message;
  }
  
  // 处理HTTP状态码
  if (error.response?.status) {
    const status = error.response.status.toString();
    return ERROR_MESSAGES[status] || `请求失败 (${status})`;
  }
  
  // 处理网络错误
  if (error.message === 'Network Error') {
    return ERROR_MESSAGES['Network Error'];
  }
  
  // 处理超时
  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES['timeout'];
  }
  
  return '操作失败，请稍后重试';
};

/**
 * 判断错误类型
 * @param {Error} error - 错误对象
 * @returns {string} 错误类型
 */
export const getErrorType = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;
  
  // 网络错误
  if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
    return ERROR_TYPES.NETWORK;
  }
  
  // 认证错误
  if (error.response?.status === 401 || error.response?.status === 403) {
    return ERROR_TYPES.AUTH;
  }
  
  // 验证错误
  if (error.response?.status === 400 || error.response?.status === 422) {
    return ERROR_TYPES.VALIDATION;
  }
  
  // 服务器错误
  if (error.response?.status >= 500) {
    return ERROR_TYPES.SERVER;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

/**
 * 判断错误是否可以重试
 * @param {Error} error - 错误对象
 * @returns {boolean} 是否可以重试
 */
export const isRetryableError = (error) => {
  const type = getErrorType(error);
  
  // 网络错误和服务器错误可以重试
  return type === ERROR_TYPES.NETWORK || type === ERROR_TYPES.SERVER;
};

/**
 * 表单错误处理
 * @param {Object} form - Ant Design Form 实例
 * @param {Object} errors - 后端返回的错误对象
 */
export const handleFormErrors = (form, errors) => {
  if (!form || !errors) return;
  
  // 将后端错误映射到表单字段
  const fieldErrors = Object.keys(errors).map(field => ({
    name: field,
    errors: Array.isArray(errors[field]) ? errors[field] : [errors[field]],
  }));
  
  form.setFields(fieldErrors);
  
  // 滚动到第一个错误字段
  form.scrollToField(Object.keys(errors)[0]);
};

/**
 * 批量错误处理
 * @param {Array} results - 批量操作结果数组
 * @returns {Object} { success: number, failed: number, errors: Array }
 */
export const handleBatchErrors = (results) => {
  const summary = {
    success: 0,
    failed: 0,
    errors: [],
  };
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      summary.success++;
    } else {
      summary.failed++;
      summary.errors.push({
        index,
        message: getErrorMessage(result.reason),
      });
    }
  });
  
  return summary;
};

export default {
  getErrorMessage,
  getErrorType,
  isRetryableError,
  handleFormErrors,
  handleBatchErrors,
  ERROR_TYPES,
};
