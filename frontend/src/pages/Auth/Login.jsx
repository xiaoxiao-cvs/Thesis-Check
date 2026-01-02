import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, fetchCurrentUser } from '@/store/authSlice';
import { getErrorMessage } from '@/utils/errorHandler';
import { scrollToFirstError } from '@/utils/validators';
import './index.less';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await dispatch(login(values)).unwrap();
      await dispatch(fetchCurrentUser()).unwrap();
      message.success('登录成功，正在跳转...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      message.error(errorMsg || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFinishFailed = (errorInfo) => {
    scrollToFirstError(form, errorInfo);
  };
  
  return (
    <div className="login-container">
      <Card className="login-card" title="论文查重系统 - 登录">
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          onFinishFailed={handleFinishFailed}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 4, message: '用户名至少4个字符' },
            ]}
            validateTrigger={['onBlur', 'onChange']}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              disabled={loading}
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
            validateTrigger={['onBlur', 'onChange']}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              disabled={loading}
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
          
          <div className="login-footer">
            还没有账号？<Link to="/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
