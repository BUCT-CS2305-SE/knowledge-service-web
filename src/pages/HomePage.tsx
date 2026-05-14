import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Landmark, BookOpen, Globe, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';
import { mockApi } from '@/mock/handlers';
import { useUserStore } from '@/store/userStore';
import type { Artifact } from '@/types/artifact';

export const HomePage: React.FC = () => {
  const [featuredArtifacts, setFeaturedArtifacts] = useState<Artifact[]>([]);
  const [recommendedArtifacts, setRecommendedArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);

  const { isAuthenticated, browseHistory, collectionItems } = useUserStore();

  useEffect(() => {
    const loadFeatured = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await mockApi.getArtifacts({
          page: 1,
          size: 4
        });
        setFeaturedArtifacts(response.data);
      } catch (error) {
        console.error('Failed to load featured artifacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  // 个性化推荐：基于浏览记录和收藏记录
  useEffect(() => {
    const loadRecommendations = async (): Promise<void> => {
      if (!isAuthenticated) return;

      try {
        setLoadingRecommendations(true);

        // 收集用户兴趣类别
        const interestCategories = new Set<string>();
        browseHistory.forEach((h) => interestCategories.add(h.artifactCategory));
        collectionItems.forEach((item) => interestCategories.add(item.artifactCategory));

        if (interestCategories.size === 0) {
          setLoadingRecommendations(false);
          return;
        }

        // 获取所有文物，筛选匹配用户兴趣的
        const response = await mockApi.getArtifacts({ page: 1, size: 50 });
        const allArtifacts = response.data;

        // 过滤掉已浏览和已收藏的文物
        const browsedIds = new Set(browseHistory.map((h) => h.artifactId));
        const collectedIds = new Set(collectionItems.map((item) => item.artifactId));
        const seenIds = new Set([...browsedIds, ...collectedIds]);

        const recommendations = allArtifacts
          .filter((artifact) => interestCategories.has(artifact.category))
          .filter((artifact) => !seenIds.has(artifact.id))
          .slice(0, 4);

        setRecommendedArtifacts(recommendations);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, [isAuthenticated, browseHistory, collectionItems]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-museum-dark via-gray-900 to-museum-darker text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a961' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        <div className="museum-container relative py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-museum-gold/10 border border-museum-gold/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-museum-gold" />
              <span className="text-sm text-museum-gold font-medium">探索世界文明瑰宝</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              海外文物知识
              <span className="block text-museum-gold mt-2">服务系统</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
              踏上穿越时空的旅程，发现来自世界各地的珍贵文物。
              从古埃及的金字塔到中国的兵马俑，从希腊的雕塑到文艺复兴的杰作，
              每一件文物都诉说着人类文明的辉煌故事。
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/browse">
                <Button size="lg" className="bg-museum-gold hover:bg-museum-gold-dark text-white font-semibold px-8 py-3 text-base">
                  开始探索
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-white/10 px-8 py-3 text-base">
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="museum-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              探索世界文化遗产
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              我们汇集了世界各大博物馆的珍贵文物，为您提供沉浸式的文化体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-museum-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-museum-gold-dark" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">全球文物</h3>
              <p className="text-gray-600">
                收录来自古埃及、古希腊、中国、罗马等文明的代表性文物，
                覆盖亚洲、欧洲、非洲、美洲等地区。
              </p>
            </div>

            <div className="text-center p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-museum-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Landmark className="h-8 w-8 text-museum-gold-dark" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">权威资料</h3>
              <p className="text-gray-600">
                每件文物都配有详细的历史背景、制作工艺、收藏信息等，
                帮助您深入了解其文化价值。
              </p>
            </div>

            <div className="text-center p-8 rounded-xl hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-16 h-16 bg-museum-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-museum-gold-dark" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">知识图谱</h3>
              <p className="text-gray-600">
                基于知识图谱技术，展示文物之间的关联关系，
                发现隐藏在历史背后的联系与故事。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artifacts Section */}
      <section className="py-16 md:py-24 bg-museum-cream-light">
        <div className="museum-container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                精选文物
              </h2>
              <p className="text-lg text-gray-600">
                探索我们精心挑选的世界级珍宝
              </p>
            </div>
            
            <Link to="/browse" className="hidden md:block">
              <Button variant="outline" className="border-museum-gold text-museum-gold-dark hover:bg-museum-gold hover:text-white">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {featuredArtifacts.map(artifact => (
                  <ArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </div>

              <div className="text-center md:hidden">
                <Link to="/browse">
                  <Button variant="outline" className="border-museum-gold text-museum-gold-dark hover:bg-museum-gold hover:text-white w-full sm:w-auto">
                    查看全部文物
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Personalized Recommendations Section */}
      {isAuthenticated && (
        <section className="py-16 md:py-24 bg-white">
          <div className="museum-container">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-museum-gold" />
                  猜你喜欢
                </h2>
                <p className="text-lg text-gray-600">
                  基于你的浏览和收藏记录，为你推荐这些文物
                </p>
              </div>
              <Link to="/browse" className="hidden md:block">
                <Button variant="outline" className="border-museum-gold text-museum-gold-dark hover:bg-museum-gold hover:text-white">
                  更多推荐
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-museum-cream-light rounded-lg shadow-md overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendedArtifacts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {recommendedArtifacts.map((artifact) => (
                    <ArtifactCard key={artifact.id} artifact={artifact} />
                  ))}
                </div>
                <div className="text-center md:hidden">
                  <Link to="/browse">
                    <Button variant="outline" className="border-museum-gold text-museum-gold-dark hover:bg-museum-gold hover:text-white w-full sm:w-auto">
                      更多推荐
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-museum-cream-light rounded-xl">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">浏览更多文物，我们会为你推荐感兴趣的藏品</p>
                <Link to="/browse">
                  <Button className="bg-museum-gold hover:bg-museum-gold-dark text-white mt-3">
                    开始探索
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-museum-dark text-white">
        <div className="museum-container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            开始您的文物探索之旅
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            无论您是历史爱好者、学生还是研究人员，我们的系统都能为您提供丰富的文物知识和独特的探索体验。
          </p>
          <Link to="/browse">
            <Button size="lg" className="bg-museum-gold hover:bg-museum-gold-dark text-white font-semibold px-10 py-4 text-lg">
              立即浏览文物库
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
