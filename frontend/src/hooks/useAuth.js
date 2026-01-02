import { useSelector } from 'react-redux';

/**
 * 获取认证信息Hook
 */
export const useAuth = () => {
  const { token, user, loading, error } = useSelector((state) => state.auth);
  
  return {
    token,
    user,
    loading,
    error,
    isAuthenticated: !!token,
    role: user?.role,
  };
};
