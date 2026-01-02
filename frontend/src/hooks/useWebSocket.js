import { useEffect, useRef, useCallback, useState } from 'react';
import { message } from 'antd';
import { WS_URL } from '@/utils/constants';
import { getToken } from '@/utils/auth';

/**
 * WebSocket Hook
 * @param {string} url WebSocket URL
 * @param {Object} options 选项
 */
export const useWebSocket = (url, options = {}) => {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 3000,
    reconnectAttempts = 5,
  } = options;
  
  const wsRef = useRef(null);
  const reconnectCountRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  
  // 连接WebSocket
  const connect = useCallback(() => {
    try {
      const token = getToken();
      const wsUrl = `${url}?token=${token}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = (event) => {
        console.log('WebSocket连接成功');
        setIsConnected(true);
        reconnectCountRef.current = 0;
        onOpen?.(event);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (error) {
          console.error('解析WebSocket消息失败:', error);
        }
      };
      
      ws.onerror = (event) => {
        console.error('WebSocket错误:', event);
        onError?.(event);
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket连接关闭');
        setIsConnected(false);
        onClose?.(event);
        
        // 自动重连
        if (reconnect && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          console.log(`尝试重连(${reconnectCountRef.current}/${reconnectAttempts})...`);
          setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectCountRef.current >= reconnectAttempts) {
          message.error('WebSocket连接失败，请刷新页面重试');
        }
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket连接失败:', error);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval, reconnectAttempts]);
  
  // 发送消息
  const sendMessage = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket未连接');
    }
  }, []);
  
  // 断开连接
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);
  
  // 组件挂载时连接
  useEffect(() => {
    connect();
    
    // 组件卸载时断开连接
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
};
