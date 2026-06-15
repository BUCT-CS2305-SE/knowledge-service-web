import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 路由鉴权守卫组件
 *
 * 包裹需要登录才能访问的页面。
 * 未登录时自动跳转到 /login，并携带当前路径作为 redirect 参数，
 * 登录成功后可以自动跳回原页面。
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      // 编码当前路径，登录成功后回跳
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirect}`, { replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname, location.search]);

  if (!isAuthenticated) {
    // 未登录时不渲染子页面内容（即将跳转）
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
