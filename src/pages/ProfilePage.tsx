import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  Heart,
  Clock,
  Edit3,
  Camera,
  LogOut,
  ArrowLeft,
  Save,
  X,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/userStore';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isAuthenticated,
    collectionItems,
    browseHistory,
    updateProfile,
    changePassword,
    logout,
  } = useUserStore();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editNickname, setEditNickname] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (currentUser) {
      setEditNickname(currentUser.nickname || '');
      setEditBio(currentUser.bio || '');
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-museum-cream-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">请先登录</p>
          <Link to="/login">
            <Button className="bg-museum-gold hover:bg-museum-gold-dark text-white">
              前往登录
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (): Promise<void> => {
    setSaving(true);
    await updateProfile({
      nickname: editNickname,
      bio: editBio,
    });
    setSaving(false);
    setIsEditing(false);
  };

  const handleChangePassword = async (): Promise<void> => {
    if (!oldPassword || !newPassword) {
      setPasswordMsg('请填写完整信息');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg('新密码至少需要6位');
      return;
    }
    setSaving(true);
    const success = await changePassword(oldPassword, newPassword);
    setSaving(false);
    if (success) {
      setPasswordMsg('密码修改成功');
      setOldPassword('');
      setNewPassword('');
      setShowPasswordChange(false);
      setTimeout(() => setPasswordMsg(null), 3000);
    } else {
      setPasswordMsg('密码修改失败');
    }
  };

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-museum-cream-light">
      <div className="museum-container py-8">
        {/* 返回导航 */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm text-gray-500 hover:text-museum-gold-dark transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：个人信息卡片 */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-0 overflow-hidden">
              {/* 头像区域 */}
              <div className="bg-gradient-to-br from-museum-dark via-gray-800 to-museum-darker p-8 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="头像"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-museum-gold/20 border-4 border-white/20 flex items-center justify-center">
                      <User className="h-10 w-10 text-museum-gold" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      // 模拟头像上传——使用一个预设头像
                      const avatars = [
                        'https://placehold.co/200x200/c9a961/ffffff?text=头像',
                        'https://placehold.co/200x200/4a90d9/ffffff?text=用户',
                        'https://placehold.co/200x200/8b5cf6/ffffff?text=Avatar',
                      ];
                      const current = avatars.indexOf(currentUser.avatar);
                      const next = (current + 1) % avatars.length;
                      updateProfile({ avatar: avatars[next] });
                    }}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-museum-gold hover:bg-museum-gold-dark rounded-full flex items-center justify-center transition-colors"
                    title="更换头像"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {currentUser.nickname || currentUser.username}
                </h2>
                <p className="text-gray-400 text-sm">@{currentUser.username}</p>
              </div>

              <CardContent className="p-6">
                {/* 基础信息 */}
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{currentUser.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">
                      注册于 {formatDate(currentUser.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Edit3 className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">
                      {currentUser.bio || '这个人很懒，还没有填写简介...'}
                    </span>
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <Link
                    to="/collections"
                    className="text-center p-3 rounded-lg bg-museum-gold/5 hover:bg-museum-gold/10 transition-colors"
                  >
                    <Heart className="h-5 w-5 text-museum-gold-dark mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-800">{collectionItems.length}</p>
                    <p className="text-xs text-gray-500">收藏</p>
                  </Link>
                  <Link
                    to="/history"
                    className="text-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Clock className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-800">{browseHistory.length}</p>
                    <p className="text-xs text-gray-500">浏览记录</p>
                  </Link>
                </div>

                {/* 操作按钮 */}
                <div className="mt-6 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    编辑资料
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    修改密码
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    退出登录
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：编辑区域和快捷入口 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 编辑个人信息 */}
            {isEditing && (
              <Card className="shadow-md border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">编辑个人资料</CardTitle>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      昵称
                    </label>
                    <Input
                      value={editNickname}
                      onChange={(e) => setEditNickname(e.target.value)}
                      placeholder="设置您的昵称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      个人简介
                    </label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="介绍一下自己..."
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-museum-gold/50 focus:border-museum-gold resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-museum-gold hover:bg-museum-gold-dark text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? '保存中...' : '保存'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-gray-300"
                    >
                      取消
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 修改密码 */}
            {showPasswordChange && (
              <Card className="shadow-md border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">修改密码</CardTitle>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordMsg(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {passwordMsg && (
                    <div
                      className={`rounded-lg px-4 py-3 text-sm ${
                        passwordMsg.includes('成功')
                          ? 'bg-green-50 border border-green-200 text-green-700'
                          : 'bg-red-50 border border-red-200 text-red-700'
                      }`}
                    >
                      {passwordMsg}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      旧密码
                    </label>
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="输入旧密码"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      新密码
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="至少6位"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="bg-museum-gold hover:bg-museum-gold-dark text-white"
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {saving ? '修改中...' : '确认修改'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 快捷入口 */}
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-lg">快捷入口</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/collections"
                    className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-museum-gold/50 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mr-3">
                      <Heart className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">我的收藏</p>
                      <p className="text-xs text-gray-500">{collectionItems.length} 件文物</p>
                    </div>
                  </Link>

                  <Link
                    to="/history"
                    className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">浏览记录</p>
                      <p className="text-xs text-gray-500">{browseHistory.length} 条记录</p>
                    </div>
                  </Link>

                  <Link
                    to="/browse"
                    className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-museum-gold/50 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">浏览文物</p>
                      <p className="text-xs text-gray-500">探索文物库</p>
                    </div>
                  </Link>

                  <Link
                    to="/compare"
                    className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                      <BookOpen className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">文物对比</p>
                      <p className="text-xs text-gray-500">对比查看文物</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
