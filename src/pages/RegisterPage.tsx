import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/userStore';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, authLoading, authError, clearAuthError } = useUserStore();

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    // 输入验证
    if (!username.trim()) {
      setLocalError('请输入用户名');
      return;
    }
    if (username.trim().length < 3) {
      setLocalError('用户名至少需要3个字符');
      return;
    }
    if (username.trim().length > 20) {
      setLocalError('用户名不能超过20个字符');
      return;
    }
    if (!email.trim()) {
      setLocalError('请输入邮箱');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('请输入有效的邮箱地址');
      return;
    }
    if (!password) {
      setLocalError('请输入密码');
      return;
    }
    if (password.length < 6) {
      setLocalError('密码长度不能少于6位');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }

    const success = await register({
      username: username.trim(),
      email: email.trim(),
      password,
      nickname: nickname.trim() || undefined,
    });

    if (success) {
      navigate('/');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-museum-cream-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
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
            <CardTitle className="text-2xl font-bold text-gray-900">创建账号</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              注册以开启您的文物探索之旅
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {displayError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                  {displayError}
                </div>
              )}

              {/* 用户名 */}
              <div>
                <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                  用户名 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="reg-username"
                  type="text"
                  placeholder="3-20个字符"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  autoComplete="username"
                  disabled={authLoading}
                />
              </div>

              {/* 昵称 */}
              <div>
                <label htmlFor="reg-nickname" className="block text-sm font-medium text-gray-700 mb-1.5">
                  昵称
                </label>
                <Input
                  id="reg-nickname"
                  type="text"
                  placeholder="用于展示的名称"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full"
                  disabled={authLoading}
                />
              </div>

              {/* 邮箱 */}
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  邮箱 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="example@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  autoComplete="email"
                  disabled={authLoading}
                />
              </div>

              {/* 密码 */}
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  密码 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="至少6位"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10"
                    autoComplete="new-password"
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

              {/* 确认密码 */}
              <div>
                <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
                  确认密码 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                  autoComplete="new-password"
                  disabled={authLoading}
                />
              </div>

              {/* 注册按钮 */}
              <Button
                type="submit"
                className="w-full bg-museum-gold hover:bg-museum-gold-dark text-white font-semibold py-2.5"
                disabled={authLoading}
              >
                {authLoading ? '注册中...' : '注 册'}
              </Button>

              {/* 登录链接 */}
              <p className="text-center text-sm text-gray-500">
                已有账号？{' '}
                <Link
                  to="/login"
                  className="text-museum-gold-dark hover:text-museum-gold font-medium transition-colors"
                >
                  立即登录
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
