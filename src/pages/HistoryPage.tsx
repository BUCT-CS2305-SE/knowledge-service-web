import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Trash2, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/store/userStore';
import type { BrowseHistory } from '@/types/user';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, browseHistory, clearBrowseHistory } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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

  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return '刚刚';
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      if (days < 7) return `${days}天前`;

      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  const handleClearAll = (): void => {
    const confirmed = window.confirm('确定要清空所有浏览记录吗？此操作不可撤销。');
    if (confirmed) {
      clearBrowseHistory();
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

        {/* 标题栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              浏览记录
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              共 {browseHistory.length} 条记录
            </p>
          </div>
          {browseHistory.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="mt-3 sm:mt-0 border-red-300 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              清空记录
            </Button>
          )}
        </div>

        {/* 浏览记录列表 */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="text-base">最近浏览</CardTitle>
          </CardHeader>
          <CardContent>
            {browseHistory.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">暂无浏览记录</p>
                <p className="text-sm text-gray-400 mb-4">
                  开始浏览文物，记录将会自动保存到这里
                </p>
                <Link to="/browse">
                  <Button className="bg-museum-gold hover:bg-museum-gold-dark text-white">
                    浏览文物
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {browseHistory.map((record: BrowseHistory) => (
                  <Link
                    key={record.id}
                    to={`/artifact/${record.artifactId}`}
                    className="flex items-center p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                  >
                    {/* 缩略图 */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {record.artifactImage ? (
                        <img
                          src={record.artifactImage}
                          alt={record.artifactName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-museum-gold-dark transition-colors truncate">
                          {record.artifactName}
                        </p>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {formatTime(record.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                          {record.artifactCategory}
                        </span>
                      </div>
                    </div>

                    {/* 箭头 */}
                    <div className="ml-3 text-gray-300 group-hover:text-museum-gold transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
