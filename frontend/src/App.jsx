import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import router from './router';
import store from './store';
import { fetchCurrentUser } from './store/authSlice';
import { getToken } from './utils/auth';
import NotificationProvider from './components/NotificationProvider';
import { Loading, ToastProvider } from './components/ui';
import './styles/global.less';

// 配置dayjs中文
dayjs.locale('zh-cn');

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
      <ToastProvider>
        <NotificationProvider>
          <AppInit />
          <Suspense fallback={<Loading fullScreen text="加载中..." size="lg" />}>
            <RouterProvider router={router} />
          </Suspense>
        </NotificationProvider>
      </ToastProvider>
    </Provider>
  );
}

export default App;

