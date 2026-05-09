import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Landmark, Search, Menu, X } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: '首页' },
    { path: '/browse', label: '文物浏览' },
  ];

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
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
            <button 
              className="p-2 rounded-lg hover:bg-museum-darker transition-colors"
              aria-label="搜索"
            >
              <Search className="h-5 w-5" />
            </button>

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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
