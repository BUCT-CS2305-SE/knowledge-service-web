import React from 'react';
import { Landmark } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-museum-dark text-gray-400 mt-auto">
      <div className="museum-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Landmark className="h-8 w-8 text-museum-gold" />
              <span className="text-white font-bold text-lg">海外文物知识服务系统</span>
            </div>
            <p className="text-sm leading-relaxed">
              探索世界各地的珍贵文物，了解人类文明的璀璨历史。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">快速导航</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/browse" className="hover:text-museum-gold transition-colors">文物浏览</a></li>
              <li><a href="#" className="hover:text-museum-gold transition-colors">关于我们</a></li>
              <li><a href="#" className="hover:text-museum-gold transition-colors">联系方式</a></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">项目信息</h3>
            <ul className="space-y-2 text-sm">
              <li>软件工程课程项目</li>
              <li>数据浏览模块</li>
              <li>版本 1.0.0</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>© {currentYear} 海外文物知识服务系统. 仅供教学使用.</p>
        </div>
      </div>
    </footer>
  );
};
