import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Landmark, Search, Menu, X, User, ChevronDown, LogOut, Settings, Heart, Clock } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const location = useLocation();
  const { currentUser, isAuthenticated, logout } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/browse', label: '文物浏览' },
    { path: '/statistics', label: '统计分析' },
    { path: '/knowledge-graph', label: '知识图谱' },
    { path: '/timeline', label: '时间轴' },
    { path: '/map', label: '地理分布' },
  ];

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = (): void => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <header className="bg-museum-dark text-white sticky top-0 z-50 shadow-lg">
      <div className="museum-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <Landmark className="h-8 w-8 text-museum-gold" />
            <div>
              <h1 className="text-xl font-bold tracking-wide">海外文物知识</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Overseas Artifacts Knowledge System</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 pb-1 border-b-2 ${
                  isActive(link.path)
                    ? 'text-museum-gold border-museum-gold'
                    : 'text-gray-300 border-transparent hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Link
              to="/search"
              className="p-2 rounded-lg hover:bg-museum-darker transition-colors"
              aria-label="搜索"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* 用户区域 */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-museum-darker transition-colors"
                >
                  {/* 头像 */}
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt="头像"
                      className="w-8 h-8 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-museum-gold/20 border border-white/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-museum-gold" />
                    </div>
                  )}
                  <span className="hidden lg:block text-sm text-gray-200">
                    {currentUser.nickname || currentUser.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden lg:block" />
                </button>

                {/* 下拉菜单 */}
                {showUserMenu && (
                  <>
                    {/* 点击外部关闭 */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                      {/* 用户信息 */}
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">
                          {currentUser.nickname || currentUser.username}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{currentUser.email}</p>
                      </div>

                      {/* 菜单项 */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-400" />
                          个人中心
                        </Link>
                        <Link
                          to="/collections"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Heart className="h-4 w-4 mr-3 text-gray-400" />
                          我的收藏
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Clock className="h-4 w-4 mr-3 text-gray-400" />
                          浏览记录
                        </Link>
                      </div>

                      {/* 退出登录 */}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          退出登录
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-museum-gold/10 border border-museum-gold/30 text-museum-gold text-sm font-medium hover:bg-museum-gold/20 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>登录</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-lg hover:bg-museum-darker transition-colors"
              aria-label="菜单"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-700">
            <div className="space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onMenuToggle}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-museum-gold/10 text-museum-gold'
                      : 'text-gray-300 hover:bg-museum-darker'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* 移动端：登录/用户入口 */}
              <div className="border-t border-gray-700 pt-2 mt-2">
                {isAuthenticated && currentUser ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={onMenuToggle}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-museum-darker"
                    >
                      个人中心
                    </Link>
                    <Link
                      to="/collections"
                      onClick={onMenuToggle}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-museum-darker"
                    >
                      我的收藏
                    </Link>
                    <Link
                      to="/history"
                      onClick={onMenuToggle}
                      className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-museum-darker"
                    >
                      浏览记录
                    </Link>
                    <button
                      onClick={() => {
                        onMenuToggle?.();
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-museum-darker"
                    >
                      退出登录
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={onMenuToggle}
                    className="block px-4 py-2 rounded-lg text-sm font-medium text-museum-gold hover:bg-museum-darker"
                  >
                    登录 / 注册
                  </Link>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
