import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useUserStore } from '@/store/userStore';

function App() {
  // 监听全局 401 未授权事件（由 artifactService 在收到 401 时触发）
  useEffect(() => {
    const handleUnauthorized = (): void => {
      const { isAuthenticated, logout } = useUserStore.getState();
      if (isAuthenticated) {
        logout();
      }
      // 无论之前是否登录，都重定向到登录页（避免已登录页除外）
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
