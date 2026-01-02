import dayjs from 'dayjs';

/**
 * 格式化日期时间
 * @param {string|Date} date 日期
 * @param {string} format 格式
 * @returns {string}
 */
export const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 格式化日期
 * @param {string|Date} date 日期
 * @returns {string}
 */
export const formatDate = (date) => {
  return formatDateTime(date, 'YYYY-MM-DD');
};

/**
 * 格式化时间
 * @param {string|Date} date 日期
 * @returns {string}
 */
export const formatTime = (date) => {
  return formatDateTime(date, 'HH:mm:ss');
};

/**
 * 获取相对时间
 * @param {string|Date} date 日期
 * @returns {string}
 */
export const getRelativeTime = (date) => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

/**
 * 格式化百分比
 * @param {number} value 值
 * @param {number} decimals 小数位数
 * @returns {string}
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * 格式化数字
 * @param {number} value 值
 * @param {number} decimals 小数位数
 * @returns {string}
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return Number(value).toFixed(decimals);
};

/**
 * 截断文本
 * @param {string} text 文本
 * @param {number} maxLength 最大长度
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
