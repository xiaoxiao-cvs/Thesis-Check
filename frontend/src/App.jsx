import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { ConfigProvider, Spin, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import router from './router';
import store from './store';
import { fetchCurrentUser } from './store/authSlice';
import { getToken } from './utils/auth';
import './styles/global.less';

// 配置dayjs中文
dayjs.locale('zh-cn');

// 配置antd全局消息
message.config({
  top: 100,
  duration: 2,
  maxCount: 3,
});

// 初始化应用
const AppInit = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // 如果有token，自动获取用户信息
    const token = getToken();
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);
  
  return null;
};

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <AppInit />
        <Suspense
          fallback={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh' 
            }}>
              <Spin size="large" tip="加载中..." spinning={true} />
            </div>
          }
        >
          <RouterProvider router={router} />
        </Suspense>
      </ConfigProvider>
    </Provider>
  );
}

export default App;

