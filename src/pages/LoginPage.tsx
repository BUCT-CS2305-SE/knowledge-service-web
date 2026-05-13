import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/userStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, authLoading, authError, clearAuthError } = useUserStore();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!username.trim()) {
      setLocalError('请输入用户名或邮箱');
      return;
    }
    if (!password) {
      setLocalError('请输入密码');
      return;
    }

    const success = await login({ username: username.trim(), password });
    if (success) {
      navigate('/');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-museum-cream-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 返回首页链接 */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-museum-gold-dark transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回首页
          </Link>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-12 h-12 bg-museum-gold/10 rounded-full flex items-center justify-center">
              <Landmark className="h-6 w-6 text-museum-gold-dark" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">欢迎回来</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              登录您的账号以继续探索文物世界
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 错误提示 */}
              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {displayError}
                </div>
              )}

              {/* 用户名 */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                  用户名 / 邮箱
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入用户名或邮箱"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  autoComplete="username"
                  disabled={authLoading}
                />
              </div>

              {/* 密码 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10"
                    autoComplete="current-password"
                    disabled={authLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* 登录按钮 */}
              <Button
                type="submit"
                className="w-full bg-museum-gold hover:bg-museum-gold-dark text-white font-semibold py-2.5"
                disabled={authLoading}
              >
                {authLoading ? '登录中...' : '登 录'}
              </Button>

              {/* 注册链接 */}
              <p className="text-center text-sm text-gray-500">
                还没有账号？{' '}
                <Link
                  to="/register"
                  className="text-museum-gold-dark hover:text-museum-gold font-medium transition-colors"
                >
                  立即注册
                </Link>
              </p>

              {/* 测试账号提示 */}
              <div className="mt-4 p-3 bg-museum-cream rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1 font-medium">测试账号</p>
                <p className="text-xs text-gray-400">
                  用户名：admin &nbsp;|&nbsp; 密码：123456
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
