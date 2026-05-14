import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';
import { ArtifactListItem } from '@/components/artifacts/ArtifactListItem';
import { FilterPanel } from '@/components/artifacts/FilterPanel';
import { SortControl } from '@/components/artifacts/SortControl';
import { useArtifactStore } from '@/store/artifactStore';

export const BrowsePage: React.FC = () => {
  const {
    artifacts,
    total,
    loading,
    viewMode,
    currentPage,
    pageSize,
    searchQuery,
    compareList,
    fetchArtifacts,
    setViewMode,
    setCurrentPage,
    setSearchQuery,
  } = useArtifactStore();

  // Load artifacts on mount and when filters change
  useEffect(() => {
    fetchArtifacts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setSearchQuery(searchQuery);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="museum-container py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          文物浏览
        </h1>
        <p className="text-lg text-gray-600">
          探索世界各地的珍贵文物，共收录 <span className="font-semibold text-museum-gold-dark">{total}</span> 件藏品
        </p>
      </div>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Filter Panel (Desktop) */}
        <div className="hidden lg:block">
          <FilterPanel />
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar + Mobile Filter Toggle */}
              <div className="w-full lg:max-w-md flex items-center gap-3">
                <form onSubmit={handleSearch} className="flex-1">
                  <Input
                    type="text"
                    placeholder="搜索文物名称、年代、材质..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </form>
                
                {/* Mobile filter button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="lg:hidden flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  筛选
                </Button>
              </div>

              <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('card')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'card'
                        ? 'bg-white shadow-sm text-museum-gold-dark'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    aria-label="卡片视图"
                    title="卡片视图"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-museum-gold-dark'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    aria-label="列表视图"
                    title="列表视图"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort Control */}
                <SortControl />

                {/* Compare button (when items selected) */}
                {compareList.length > 0 && (
                  <Link to="/compare">
                    <Button size="sm" className="bg-museum-gold hover:bg-museum-gold-dark text-white">
                      对比 ({compareList.length})
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          {loading && artifacts.length === 0 ? (
            /* Loading Skeleton */
            <div className={`grid gap-6 ${
              viewMode === 'card'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: pageSize }).map((_, i) => (
                viewMode === 'card' ? (
                  <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                    <Skeleton className="aspect-[4/3]" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ) : (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse flex gap-4">
                    <Skeleton className="w-40 h-32 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                      <div className="grid grid-cols-4 gap-2">
                        {[1,2,3,4].map(j => (
                          <Skeleton key={j} className="h-4" />
                        ))}
                      </div>
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : artifacts.length > 0 ? (
            /* Artifacts Display */
            <>
              <div className={`grid gap-6 ${
                viewMode === 'card'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {artifacts.map(artifact =>
                  viewMode === 'card' ? (
                    <ArtifactCard key={artifact.id} artifact={artifact} />
                  ) : (
                    <ArtifactListItem key={artifact.id} artifact={artifact} />
                  )
                )}
              </div>

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="mt-10 flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    上一页
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                      let pageNum: number;
                      
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i < 5 ? i + 1 : totalPages;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = i < 2 ? i + 1 : totalPages - (6 - i);
                      } else {
                        pageNum = i < 3 
                          ? i + 1 
                          : i === 3 
                            ? currentPage - 1 
                            : i === 4 
                              ? currentPage 
                              : totalPages;
                      }

                      if (pageNum === 'ellipsis' || (i === 3 && totalPages > 7 && currentPage > 4 && currentPage < totalPages - 3)) {
                        return <span key={i} className="px-2 text-gray-400">...</span>;
                      }

                      return (
                        <Button
                          key={pageNum as number}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum as number)}
                          className={currentPage === pageNum ? 'bg-museum-gold hover:bg-museum-gold-dark' : ''}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
              <div className="text-gray-400 mb-4 inline-block">
                <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">未找到相关文物</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                尝试调整搜索条件或清除部分筛选器，探索更多珍贵文物
              </p>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  // This will be handled by store's resetFilters
                  window.location.reload();
                }}
              >
                重置所有条件
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
