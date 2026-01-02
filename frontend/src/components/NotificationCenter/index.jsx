import { useState } from 'react';
import { Badge, Drawer, List, Button, Empty, Typography, Space, Tag } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNotification } from '../NotificationProvider';
import { formatDateTime } from '@/utils/format';
import './index.less';

const { Text } = Typography;

/**
 * 通知中心组件
 */
const NotificationCenter = () => {
  const [visible, setVisible] = useState(false);
  const {
    notifications,
    getUnreadCount,
    markAllAsRead,
    clearAll,
    removeNotification,
  } = useNotification();

  const unreadCount = getUnreadCount();

  const getTypeColor = (type) => {
    const colors = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'processing',
    };
    return colors[type] || 'default';
  };

  const getTypeText = (type) => {
    const texts = {
      success: '成功',
      error: '错误',
      warning: '警告',
      info: '信息',
    };
    return texts[type] || '消息';
  };

  return (
    <>
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          onClick={() => setVisible(true)}
          className="notification-button"
        />
      </Badge>

      <Drawer
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>通知中心</span>
            {unreadCount > 0 && (
              <Badge count={unreadCount} showZero={false} />
            )}
          </div>
        }
        placement="right"
        width={400}
        open={visible}
        onClose={() => setVisible(false)}
        extra={
          <Space>
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={markAllAsRead}
              >
                全部已读
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={clearAll}
              >
                清空
              </Button>
            )}
          </Space>
        }
      >
        {notifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无通知"
          />
        ) : (
          <List
            className="notification-list"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`notification-item ${!item.read ? 'unread' : ''}`}
                actions={[
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeNotification(item.key)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={getTypeColor(item.type)}>
                        {getTypeText(item.type)}
                      </Tag>
                      {!item.read && <Badge status="processing" />}
                      <Text strong={!item.read}>{item.message}</Text>
                    </Space>
                  }
                  description={
                    <div>
                      <div className="notification-description">
                        {item.description}
                      </div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatDateTime(item.timestamp)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Drawer>
    </>
  );
};

export default NotificationCenter;
