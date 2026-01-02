import { createContext, useContext, useState, useCallback } from 'react';
import { notification } from 'antd';

/**
 * 通知上下文
 */
const NotificationContext = createContext(null);

/**
 * 通知类型
 */
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

/**
 * 通知Provider组件
 */
export const NotificationProvider = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();
  const [notifications, setNotifications] = useState([]);

  /**
   * 显示通知
   */
  const showNotification = useCallback((config) => {
    const {
      type = NOTIFICATION_TYPES.INFO,
      message,
      description,
      duration = 4.5,
      placement = 'topRight',
      onClick,
      onClose,
      ...rest
    } = config;

    const key = `notification_${Date.now()}`;
    
    api[type]({
      key,
      message,
      description,
      duration,
      placement,
      onClick: () => {
        onClick?.(key);
      },
      onClose: () => {
        removeNotification(key);
        onClose?.(key);
      },
      ...rest,
    });

    // 保存到通知列表
    const newNotification = {
      key,
      type,
      message,
      description,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // 最多保存50条
    
    return key;
  }, [api]);

  /**
   * 检查完成通知
   */
  const notifyCheckComplete = useCallback((data) => {
    const { paper_title, overall_grade, result_id } = data;
    
    showNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message: '检查完成',
      description: `论文《${paper_title}》检查完成，评级：${overall_grade}`,
      duration: 10,
      onClick: () => {
        // 跳转到结果详情
        window.location.href = `/results/${result_id}`;
      },
    });

    // 如果支持浏览器通知，也发送浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('论文检查完成', {
        body: `《${paper_title}》检查完成`,
        icon: '/favicon.ico',
        tag: `check_${result_id}`,
      });
    }
  }, [showNotification]);

  /**
   * 系统消息通知
   */
  const notifySystemMessage = useCallback((data) => {
    const { title, content, type = 'info' } = data;
    
    showNotification({
      type: NOTIFICATION_TYPES[type.toUpperCase()] || NOTIFICATION_TYPES.INFO,
      message: title,
      description: content,
      duration: 6,
    });
  }, [showNotification]);

  /**
   * 移除通知
   */
  const removeNotification = useCallback((key) => {
    setNotifications(prev => 
      prev.map(n => n.key === key ? { ...n, read: true } : n)
    );
    api.destroy(key);
  }, [api]);

  /**
   * 标记所有为已读
   */
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  /**
   * 清空所有通知
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
    api.destroy();
  }, [api]);

  /**
   * 获取未读数量
   */
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  /**
   * 请求浏览器通知权限
   */
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('浏览器不支持通知API');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const value = {
    showNotification,
    notifyCheckComplete,
    notifySystemMessage,
    removeNotification,
    markAllAsRead,
    clearAll,
    getUnreadCount,
    requestNotificationPermission,
    notifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * 使用通知Hook
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
