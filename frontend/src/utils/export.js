/**
 * 导出工具函数
 */

/**
 * 将数据导出为CSV文件
 * @param {Array} data - 要导出的数据数组
 * @param {Array} columns - 列配置 [{ key: 'id', title: 'ID' }, ...]
 * @param {string} filename - 文件名
 */
export const exportToCSV = (data, columns, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.warn('没有数据可导出');
    return;
  }

  // 生成CSV头部
  const headers = columns.map(col => col.title).join(',');
  
  // 生成CSV行
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      
      // 处理特殊类型
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'object') {
        value = JSON.stringify(value);
      } else {
        value = String(value);
      }
      
      // 转义逗号和引号
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(',');
  });

  // 合并为完整CSV
  const csv = [headers, ...rows].join('\n');
  
  // 添加UTF-8 BOM，确保Excel正确识别中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  
  // 触发下载
  downloadBlob(blob, filename);
};

/**
 * 将数据导出为JSON文件
 * @param {any} data - 要导出的数据
 * @param {string} filename - 文件名
 */
export const exportToJSON = (data, filename = 'export.json') => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
};

/**
 * 下载Blob对象
 * @param {Blob} blob - Blob对象
 * @param {string} filename - 文件名
 */
const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * 导出表格数据
 * @param {Array} data - 表格数据
 * @param {Array} columns - Ant Design表格列配置
 * @param {string} filename - 文件名（不含扩展名）
 * @param {string} format - 导出格式 'csv' | 'json'
 */
export const exportTableData = (data, columns, filename = 'export', format = 'csv') => {
  if (!data || data.length === 0) {
    return { success: false, message: '没有数据可导出' };
  }

  try {
    // 过滤出需要导出的列（排除操作列等）
    const exportColumns = columns.filter(col => 
      col.dataIndex && col.title && col.key !== 'action'
    ).map(col => ({
      key: col.dataIndex,
      title: col.title,
    }));

    if (format === 'csv') {
      exportToCSV(data, exportColumns, `${filename}.csv`);
    } else if (format === 'json') {
      exportToJSON(data, `${filename}.json`);
    } else {
      return { success: false, message: '不支持的导出格式' };
    }

    return { success: true, message: '导出成功' };
  } catch (error) {
    console.error('导出失败:', error);
    return { success: false, message: '导出失败' };
  }
};

/**
 * 下载文件（通过URL）
 * @param {string} url - 文件URL
 * @param {string} filename - 文件名
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || url.split('/').pop();
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 批量下载文件
 * @param {Array} urls - 文件URL数组
 * @param {number} delay - 下载间隔（毫秒）
 */
export const downloadFileBatch = async (urls, delay = 500) => {
  for (const url of urls) {
    downloadFile(url);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

export default {
  exportToCSV,
  exportToJSON,
  exportTableData,
  downloadFile,
  downloadFileBatch,
};
