import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import PrivateRoute from '@/components/PrivateRoute';
import { USER_ROLES } from '@/utils/constants';

// 懒加载页面组件
const Login = lazy(() => import('@/pages/Auth/Login'));
const Register = lazy(() => import('@/pages/Auth/Register'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));

// 论文管理
const PaperList = lazy(() => import('@/pages/Papers/PaperList'));
const PaperUpload = lazy(() => import('@/pages/Papers/PaperUpload'));
const PaperDetail = lazy(() => import('@/pages/Papers/PaperDetail'));

// 检查相关
const CheckSubmit = lazy(() => import('@/pages/Check/CheckSubmit'));
const CheckStatus = lazy(() => import('@/pages/Check/CheckStatus'));

// 结果管理
const ResultList = lazy(() => import('@/pages/Results/ResultList'));
const ResultDetail = lazy(() => import('@/pages/Results/ResultDetail'));

// 模板管理（教师+）
const TemplateList = lazy(() => import('@/pages/Templates/TemplateList'));

// 往届论文（教师+）
const PreviousPaperList = lazy(() => import('@/pages/PreviousPapers/PreviousPaperList'));

// 参数设置（主任+）
const ParameterList = lazy(() => import('@/pages/Parameters/ParameterList'));

// 统计分析（教师+）
const Statistics = lazy(() => import('@/pages/Statistics'));

// 用户管理（管理员）
const UserList = lazy(() => import('@/pages/Users/UserList'));

// 错误页面
const NotFound = lazy(() => import('@/pages/Error/NotFound'));
const Forbidden = lazy(() => import('@/pages/Error/Forbidden'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      // 论文管理
      {
        path: 'papers',
        children: [
          {
            path: 'list',
            element: <PaperList />,
          },
          {
            path: 'upload',
            element: <PaperUpload />,
          },
          {
            path: ':id',
            element: <PaperDetail />,
          },
        ],
      },
      // 检查
      {
        path: 'check',
        children: [
          {
            path: 'submit/:paperId',
            element: <CheckSubmit />,
          },
          {
            path: 'status/:taskId',
            element: <CheckStatus />,
          },
        ],
      },
      // 结果
      {
        path: 'results',
        children: [
          {
            index: true,
            element: <ResultList />,
          },
          {
            path: ':id',
            element: <ResultDetail />,
          },
        ],
      },
      // 模板管理（教师+）
      {
        path: 'templates',
        element: (
          <PrivateRoute requiredRoles={USER_ROLES.TEACHER}>
            <TemplateList />
          </PrivateRoute>
        ),
      },
      // 往届论文（教师+）
      {
        path: 'previous-papers',
        element: (
          <PrivateRoute requiredRoles={USER_ROLES.TEACHER}>
            <PreviousPaperList />
          </PrivateRoute>
        ),
      },
      // 参数设置（主任+）
      {
        path: 'parameters',
        element: (
          <PrivateRoute requiredRoles={USER_ROLES.DIRECTOR}>
            <ParameterList />
          </PrivateRoute>
        ),
      },
      // 统计分析（教师+）
      {
        path: 'statistics',
        element: (
          <PrivateRoute requiredRoles={USER_ROLES.TEACHER}>
            <Statistics />
          </PrivateRoute>
        ),
      },
      // 用户管理（管理员）
      {
        path: 'users',
        element: (
          <PrivateRoute requiredRoles={USER_ROLES.ADMIN}>
            <UserList />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
