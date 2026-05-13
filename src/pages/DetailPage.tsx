import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Gem, Landmark as LandmarkIcon,
  ExternalLink, Share2, Heart, Plus, Check,
  Network, GitBranch, MessageCircle, ThumbsUp, Send,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';
import { mockApi } from '@/mock/handlers';
import { useUserStore } from '@/store/userStore';
import { useArtifactStore } from '@/store/artifactStore';
import type { Artifact } from '@/types/artifact';
import type { Comment as CommentType, Reply } from '@/types/user';

interface TripleRelation {
  subject: string;
  predicate: string;
  object: string;
}

export const DetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [recommendations, setRecommendations] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [imageZoomed, setImageZoomed] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);

  const { addToCompare, removeFromCompare, isInCompare } = useArtifactStore();
  const {
    isAuthenticated,
    currentUser,
    isArtifactCollected,
    toggleCollectArtifact,
    addBrowseHistory,
    comments,
    fetchComments,
    addComment,
    addReply,
    likeComment,
  } = useUserStore();
  const inCompare = id ? isInCompare(id) : false;
  const isCollected = id ? isArtifactCollected(id) : false;

  // Generate knowledge graph triples for the artifact
  const generateTriples = (art: Artifact): TripleRelation[] => {
    if (!art) return [];

    const triples: TripleRelation[] = [
      { subject: art.name, predicate: '属于', object: art.region },
      { subject: art.name, predicate: '类型为', object: art.category },
      { subject: art.name, predicate: '材质是', object: art.material },
      { subject: art.name, predicate: '年代', object: art.era },
    ];

    if (art.museum) {
      triples.push({ subject: art.name, predicate: '收藏于', object: art.museum });
    }
    
    if (art.location) {
      triples.push({ subject: art.museum || art.name, predicate: '位于', object: art.location });
    }

    triples.push({ 
      subject: art.name, 
      predicate: '尺寸', 
      object: `${art.dimensions.height}×${art.dimensions.width}${art.dimensions.depth ? `×${art.dimensions.depth}` : ''} cm` 
    });

    // Add tag relations
    art.tags.slice(0, 3).forEach(tag => {
      triples.push({ subject: art.name, predicate: '标签', object: tag });
    });

    return triples;
  };

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      if (!id) return;

      try {
        setLoading(true);
        
        const [artifactData, recommendationsData] = await Promise.all([
          mockApi.getArtifactById(id),
          mockApi.getRecommendations(id, 4)
        ]);

        setArtifact(artifactData);
        setRecommendations(recommendationsData);

        // 记录浏览历史
        if (artifactData && isAuthenticated) {
          addBrowseHistory(
            artifactData.id,
            artifactData.name,
            artifactData.images[0] || '',
            artifactData.category
          );
        }

        // 加载评论
        await fetchComments(id);
      } catch (error) {
        console.error('Failed to load artifact details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="museum-container py-8">
        <Skeleton className="h-10 w-32 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-20 h-20 rounded-lg" />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-4/6" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="museum-container py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">文物未找到</h2>
        <p className="text-gray-600 mb-6">抱歉，您查找的文物不存在或已被移除</p>
        <Link to="/browse">
          <Button>返回文物列表</Button>
        </Link>
      </div>
    );
  }

  const triples = generateTriples(artifact);

  const handleCompareToggle = (): void => {
    if (!id || !artifact) return;
    
    if (inCompare) {
      removeFromCompare(id);
    } else {
      addToCompare(artifact);
    }
  };

  const handleCollectToggle = (): void => {
    if (!id || !artifact) return;
    if (!isAuthenticated) {
      // 未登录，跳转到登录页
      window.location.href = '/login';
      return;
    }
    toggleCollectArtifact(
      artifact.id,
      artifact.name,
      artifact.images[0] || '',
      artifact.category,
      artifact.era,
      artifact.region
    );
  };

  const handleAddComment = async (): Promise<void> => {
    if (!id || !commentText.trim() || !isAuthenticated) return;
    setCommentSubmitting(true);
    addComment({ artifactId: id, content: commentText.trim() });
    setCommentText('');
    setCommentSubmitting(false);
  };

  const handleAddReply = async (commentId: string): Promise<void> => {
    const text = replyText[commentId]?.trim();
    if (!id || !text || !isAuthenticated) return;
    addReply({ commentId, content: text });
    setReplyText((prev) => ({ ...prev, [commentId]: '' }));
  };

  const artifactComments: CommentType[] = id ? (comments[id] || []) : [];

  const formatCommentTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="museum-container py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link 
          to="/browse"
          className="inline-flex items-center text-sm text-gray-600 hover:text-museum-gold-dark transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          返回文物列表
        </Link>

        {/* Compare button */}
        <Button
          variant={inCompare ? "default" : "outline"}
          size="sm"
          onClick={handleCompareToggle}
          className={
            inCompare 
              ? 'bg-museum-gold hover:bg-museum-gold-dark text-white' 
              : 'border-dashed border-gray-300'
          }
        >
          {inCompare ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              已加入对比
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              加入对比
            </>
          )}
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Image Gallery */}
        <div className="space-y-4">
          {/* Main Image with Zoom */}
          <div 
            className={`relative aspect-square bg-white rounded-xl shadow-lg overflow-hidden group cursor-zoom-in ${
              imageZoomed ? 'fixed inset-0 z-50 bg-black/90 p-8' : ''
            }`}
            onClick={() => setImageZoomed(!imageZoomed)}
          >
            {artifact.images[selectedImageIndex] ? (
              <img
                src={artifact.images[selectedImageIndex]}
                alt={`${artifact.name} - 图片 ${selectedImageIndex + 1}`}
                className={`w-full h-full object-contain transition-transform duration-300 ${
                  imageZoomed ? 'max-w-4xl max-h-screen mx-auto' : ''
                }`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-museum-gold/5 to-museum-gold/10">
                <Gem className="h-24 w-24 text-museum-gold/30" />
              </div>
            )}

            {!imageZoomed && artifact.images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {selectedImageIndex + 1} / {artifact.images.length}
                <span className="ml-2 opacity-75">| 点击放大</span>
              </div>
            )}

            {imageZoomed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageZoomed(false);
                }}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg"
              >
                ✕ 关闭
              </button>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {artifact.images.length > 1 && !imageZoomed && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {artifact.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedImageIndex
                      ? 'border-museum-gold shadow-md scale-105'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${artifact.name} 缩略图 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Information */}
        <div className="space-y-6">
          {/* Title & Category */}
          <div>
            <Badge variant="secondary" className="mb-3 bg-museum-gold/10 text-museum-gold-dark border-museum-gold/20">
              {artifact.category}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
              {artifact.name}
            </h1>
            
            {artifact.nameEn && (
              <p className="text-xl text-gray-500 italic">{artifact.nameEn}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={isCollected ? "default" : "outline"}
              size="sm"
              onClick={handleCollectToggle}
              className={`gap-2 ${
                isCollected
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'hover:border-red-300 hover:text-red-500'
              }`}
            >
              <Heart className={`h-4 w-4 ${isCollected ? 'fill-current' : ''}`} />
              {isCollected ? '已收藏' : '收藏'}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              if (id) {
                navigator.clipboard.writeText(window.location.href).catch(() => {});
                alert('链接已复制到剪贴板');
              }
            }}>
              <Share2 className="h-4 w-4" />
              分享
            </Button>
            {artifact.museum && (
              <Button size="sm" className="gap-2 bg-museum-gold hover:bg-museum-gold-dark">
                <ExternalLink className="h-4 w-4" />
                访问博物馆官网
              </Button>
            )}
          </div>

          {/* Key Info Cards - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-gray-200 hover:border-museum-gold/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-museum-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">年代</p>
                    <p className="font-semibold text-gray-900 mt-1">{artifact.era}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-museum-gold/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-museum-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">地区/文明</p>
                    <p className="font-semibold text-gray-900 mt-1">{artifact.region}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-museum-gold/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Gem className="h-5 w-5 text-museum-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">材质</p>
                    <p className="font-semibold text-gray-900 mt-1">{artifact.material}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-museum-gold/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <LandmarkIcon className="h-5 w-5 text-museum-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">尺寸</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {artifact.dimensions.height} × {artifact.dimensions.width}
                      {artifact.dimensions.depth ? ` × ${artifact.dimensions.depth}` : ''} cm
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Museum Location */}
          {(artifact.museum || artifact.location) && (
            <Card className="border-l-4 border-l-museum-gold bg-gradient-to-r from-museum-gold/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <LandmarkIcon className="h-5 w-5 text-museum-gold-dark mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">现藏于</p>
                    {artifact.museum && (
                      <p className="font-semibold text-gray-900 mt-1">{artifact.museum}</p>
                    )}
                    {artifact.location && (
                      <p className="text-sm text-gray-600 mt-0.5">{artifact.location}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              描述
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">
              {artifact.description}
            </p>
          </div>

          {/* Historical Background */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">历史背景</h2>
            <p className="text-gray-700 leading-relaxed text-base">
              {artifact.history}
            </p>
          </div>

          {/* Knowledge Graph Triples Section */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Network className="h-5 w-5 text-museum-gold" />
              知识图谱三元组
            </h2>
            
            <Card className="bg-gradient-to-br from-gray-50 to-white border-museum-gold/20">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {triples.map((triple, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 text-sm animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Subject */}
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded min-w-[80px] text-right">
                        {triple.subject.length > 12 
                          ? triple.subject.substring(0, 12) + '...' 
                          : triple.subject}
                      </span>
                      
                      {/* Predicate (arrow) */}
                      <span className="text-museum-gold-dark font-medium flex-shrink-0">
                        <GitBranch className="h-4 w-4 inline mr-1" />
                        {triple.predicate}
                        →
                      </span>
                      
                      {/* Object */}
                      <span className="text-green-700 bg-green-50 px-2 py-1 rounded flex-1">
                        {triple.object}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
                  共 {triples.length} 条三元组关系 · 基于知识图谱结构化展示
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">标签</h3>
            <div className="flex flex-wrap gap-2">
              {artifact.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="hover:border-museum-gold hover:text-museum-gold-dark cursor-pointer"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-museum-gold" />
              评论 ({artifactComments.length})
            </h3>

            {/* Comment Input */}
            {isAuthenticated ? (
              <div className="flex gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-museum-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-museum-gold-dark">
                    {(currentUser?.nickname || currentUser?.username || '?')[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <Input
                      placeholder="写下你的评论..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      className="flex-1"
                      disabled={commentSubmitting}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || commentSubmitting}
                      className="bg-museum-gold hover:bg-museum-gold-dark text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500 mb-2">登录后即可发表评论</p>
                <Link to="/login">
                  <Button size="sm" variant="outline" className="gap-2">
                    <LogIn className="h-4 w-4" />
                    立即登录
                  </Button>
                </Link>
              </div>
            )}

            {/* Comment List */}
            {artifactComments.length > 0 ? (
              <div className="space-y-4">
                {artifactComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-museum-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-museum-gold-dark">
                        {(comment.username || '?')[0]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {comment.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatCommentTime(comment.createdAt)}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                        {comment.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => likeComment(comment.id)}
                          className={`inline-flex items-center gap-1 text-xs transition-colors ${
                            currentUser && comment.likedBy.includes(currentUser.id)
                              ? 'text-museum-gold'
                              : 'text-gray-400 hover:text-museum-gold'
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {comment.likes > 0 && <span>{comment.likes}</span>}
                        </button>
                        <button
                          onClick={() =>
                            setShowReplies((prev) => ({
                              ...prev,
                              [comment.id]: !prev[comment.id],
                            }))
                          }
                          className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          {comment.replies.length > 0
                            ? `${comment.replies.length} 条回复`
                            : '回复'}
                        </button>
                      </div>

                      {/* Reply Input */}
                      {showReplies[comment.id] && (
                        <div className="mt-3 space-y-3">
                          {/* Existing Replies */}
                          {comment.replies.map((reply: Reply) => (
                            <div key={reply.id} className="flex gap-2 pl-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-blue-600">
                                  {(reply.username || '?')[0]}
                                </span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-700">
                                    {reply.username}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatCommentTime(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 mt-0.5">{reply.content}</p>
                              </div>
                            </div>
                          ))}

                          {/* Reply Form */}
                          {isAuthenticated && (
                            <div className="flex gap-2 items-center">
                              <Input
                                placeholder="写下回复..."
                                value={replyText[comment.id] || ''}
                                onChange={(e) =>
                                  setReplyText((prev) => ({
                                    ...prev,
                                    [comment.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddReply(comment.id);
                                  }
                                }}
                                className="flex-1 text-sm h-8"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddReply(comment.id)}
                                disabled={!replyText[comment.id]?.trim()}
                                className="h-8 bg-museum-gold hover:bg-museum-gold-dark text-white"
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无评论，来发表第一条评论吧</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-16 pt-12 border-t border-gray-200">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              相关文物推荐
            </h2>
            <p className="text-gray-600">
              基于<strong>同朝代</strong>、<strong>同材质</strong>、<strong>同文明</strong>、<strong>同博物馆</strong>智能推荐
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map(recArtifact => (
              <ArtifactCard key={recArtifact.id} artifact={recArtifact} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
