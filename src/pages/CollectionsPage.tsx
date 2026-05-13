import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Plus,
  FolderOpen,
  Trash2,
  Edit3,
  ArrowLeft,
  Bookmark,
  X,
  Check,
  FolderPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/store/userStore';
import type { CollectionGroup, CollectionItem } from '@/types/user';

export const CollectionsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    isAuthenticated,
    collectionGroups,
    collectionItems,
    fetchCollectionGroups,
    fetchCollectionItems,
    createCollectionGroup,
    deleteCollectionGroup,
    updateCollectionGroup,
    removeFromCollection,
    moveCollectionItem,
  } = useUserStore();

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState<string>('');
  const [editGroupDesc, setEditGroupDesc] = useState<string>('');
  const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // 确保数据加载
    const loadData = async (): Promise<void> => {
      await fetchCollectionGroups();
      await fetchCollectionItems();
    };
    loadData();
  }, [isAuthenticated, navigate, fetchCollectionGroups, fetchCollectionItems]);

  useEffect(() => {
    if (collectionGroups.length > 0 && !activeGroupId) {
      setActiveGroupId(collectionGroups[0].id);
    }
  }, [collectionGroups, activeGroupId]);

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

  // 筛选当前分组下的收藏项
  const filteredItems: CollectionItem[] = activeGroupId
    ? collectionItems.filter((item) => item.groupId === activeGroupId)
    : collectionItems;

  const activeGroup: CollectionGroup | undefined = collectionGroups.find(
    (g) => g.id === activeGroupId
  );

  const handleCreateGroup = async (): Promise<void> => {
    if (!newGroupName.trim()) return;
    await createCollectionGroup(newGroupName.trim(), newGroupDesc.trim());
    setNewGroupName('');
    setNewGroupDesc('');
    setShowCreateGroup(false);
    // 重新获取分组列表让新分组显示
    await fetchCollectionGroups();
  };

  const handleUpdateGroup = async (groupId: string): Promise<void> => {
    if (!editGroupName.trim()) return;
    await updateCollectionGroup(groupId, editGroupName.trim(), editGroupDesc.trim());
    setEditingGroup(null);
    await fetchCollectionGroups();
  };

  const handleDeleteGroup = async (groupId: string): Promise<void> => {
    const group = collectionGroups.find((g) => g.id === groupId);
    if (!group) return;
    const confirmed = window.confirm(`确定要删除分组"${group.name}"及其所有收藏吗？`);
    if (!confirmed) return;
    await deleteCollectionGroup(groupId);
    if (activeGroupId === groupId) {
      const remaining = collectionGroups.filter((g) => g.id !== groupId);
      setActiveGroupId(remaining.length > 0 ? remaining[0].id : null);
    }
    await fetchCollectionGroups();
  };

  const handleRemoveItem = (itemId: string): void => {
    removeFromCollection(itemId);
  };

  const handleMoveItem = (itemId: string, targetGroupId: string): void => {
    moveCollectionItem(itemId, targetGroupId);
    setShowMoveMenu(null);
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
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              我的收藏
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              共 {collectionItems.length} 件收藏文物
            </p>
          </div>
          <Button
            onClick={() => setShowCreateGroup(true)}
            className="mt-3 sm:mt-0 bg-museum-gold hover:bg-museum-gold-dark text-white"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            新建收藏夹
          </Button>
        </div>

        {/* 创建收藏夹表单 */}
        {showCreateGroup && (
          <Card className="shadow-md border-0 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">创建新收藏夹</h3>
                <button onClick={() => setShowCreateGroup(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="收藏夹名称"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
                <Input
                  placeholder="收藏夹描述（可选）"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim()}
                    className="bg-museum-gold hover:bg-museum-gold-dark text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    创建
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                    取消
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：分组列表 */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <FolderOpen className="h-5 w-5 text-museum-gold-dark mr-2" />
                  收藏夹 ({collectionGroups.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {collectionGroups.map((group) => (
                    <div key={group.id}>
                      {editingGroup === group.id ? (
                        <div className="p-3 space-y-2">
                          <Input
                            value={editGroupName}
                            onChange={(e) => setEditGroupName(e.target.value)}
                            placeholder="名称"
                            className="text-sm"
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleUpdateGroup(group.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingGroup(null)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveGroupId(group.id)}
                          className={`w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                            activeGroupId === group.id ? 'bg-museum-gold/5 border-l-2 border-museum-gold' : ''
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{group.name}</p>
                            <p className="text-xs text-gray-400">
                              {collectionItems.filter((i) => i.groupId === group.id).length} 件
                            </p>
                          </div>
                          <div className="flex items-center opacity-0 group-hover:opacity-100 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingGroup(group.id);
                                setEditGroupName(group.name);
                                setEditGroupDesc(group.description);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="编辑"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500"
                              title="删除"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </button>
                      )}
                    </div>
                  ))}
                  {collectionGroups.length === 0 && (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      暂无收藏夹
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：收藏文物列表 */}
          <div className="lg:col-span-3">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="text-base">
                  {activeGroup ? activeGroup.name : '全部收藏'}
                  <span className="text-sm text-gray-400 font-normal ml-2">
                    ({filteredItems.length} 件)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">该收藏夹为空</p>
                    <p className="text-sm text-gray-400 mb-4">
                      去文物浏览页面添加喜欢的文物吧
                    </p>
                    <Link to="/browse">
                      <Button className="bg-museum-gold hover:bg-museum-gold-dark text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        浏览文物
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start p-3 rounded-lg border border-gray-200 hover:border-museum-gold/30 hover:shadow-sm transition-all"
                      >
                        {/* 缩略图 */}
                        <Link
                          to={`/artifact/${item.artifactId}`}
                          className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"
                        >
                          {item.artifactImage ? (
                            <img
                              src={item.artifactImage}
                              alt={item.artifactName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Bookmark className="h-6 w-6" />
                            </div>
                          )}
                        </Link>

                        {/* 信息 */}
                        <div className="ml-3 flex-1 min-w-0">
                          <Link
                            to={`/artifact/${item.artifactId}`}
                            className="text-sm font-medium text-gray-800 hover:text-museum-gold-dark transition-colors line-clamp-1"
                          >
                            {item.artifactName}
                          </Link>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs px-1.5 py-0.5 bg-museum-gold/10 text-museum-gold-dark rounded">
                              {item.artifactCategory}
                            </span>
                            <span className="text-xs text-gray-400">{item.artifactEra}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            收藏于 {new Date(item.collectedAt).toLocaleDateString('zh-CN')}
                          </p>

                          {/* 操作 */}
                          <div className="flex items-center mt-2 space-x-2">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                            >
                              取消收藏
                            </button>
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setShowMoveMenu(showMoveMenu === item.id ? null : item.id)
                                }
                                className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                              >
                                移动到...
                              </button>
                              {showMoveMenu === item.id && (
                                <div className="absolute top-6 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[140px]">
                                  {collectionGroups
                                    .filter((g) => g.id !== item.groupId)
                                    .map((g) => (
                                      <button
                                        key={g.id}
                                        onClick={() => handleMoveItem(item.id, g.id)}
                                        className="block w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
                                      >
                                        {g.name}
                                      </button>
                                    ))}
                                  {collectionGroups.filter((g) => g.id !== item.groupId).length ===
                                    0 && (
                                    <p className="px-3 py-2 text-xs text-gray-400">
                                      无其他收藏夹
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
