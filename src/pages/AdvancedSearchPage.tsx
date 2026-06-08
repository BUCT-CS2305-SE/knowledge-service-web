import React, { useState, useEffect } from 'react';
import { Search, Download, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';
import { artifactService } from '@/services/artifactService';
import type { AdvancedSearchParams } from '@/services/artifactService';
import type { Artifact, FilterOptions } from '@/types/artifact';

const PAGE_SIZE = 20;

const AdvancedSearchPage: React.FC = () => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [params, setParams] = useState<AdvancedSearchParams>({
    title: '',
    type: '',
    museum: '',
    period: '',
    period_from: undefined,
    period_to: undefined,
    page: 1,
    page_size: PAGE_SIZE,
  });
  const [results, setResults] = useState<Artifact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load filter options from API
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const options = await artifactService.getFilterOptions();
        setFilterOptions(options);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    loadOptions();
  }, []);

  const updateParam = <K extends keyof AdvancedSearchParams>(key: K, value: AdvancedSearchParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = async (page: number = 1) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const searchParams: AdvancedSearchParams = {
        ...params,
        page,
        page_size: PAGE_SIZE,
      };
      // Clean empty values
      if (!searchParams.title) searchParams.title = undefined;
      if (!searchParams.type) searchParams.type = undefined;
      if (!searchParams.museum) searchParams.museum = undefined;
      if (!searchParams.period) searchParams.period = undefined;

      const response = await artifactService.advancedSearch(searchParams);
      setResults(response.data);
      setTotal(response.total);
      setParams(prev => ({ ...prev, page }));
    } catch (err) {
      console.error('Advanced search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    handleSearch(page);
  };

  const handleReset = () => {
    setParams({
      title: '',
      type: '',
      museum: '',
      period: '',
      period_from: undefined,
      period_to: undefined,
      page: 1,
      page_size: PAGE_SIZE,
    });
    setResults([]);
    setTotal(0);
    setHasSearched(false);
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (results.length === 0) return;
    let content: string; let filename: string; let mimeType: string;
    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
      filename = 'advanced-search-results.json';
      mimeType = 'application/json';
    } else {
      const headers = ['名称', '年代', '地区', '博物馆', '描述'];
      const rows = results.map(r => [
        r.name, r.era, r.region, r.museum || '',
        (r.description || '').replace(/"/g, '""'),
      ]);
      content = '﻿' + [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
      filename = 'advanced-search-results.csv';
      mimeType = 'text/csv;charset=utf-8';
    }
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="museum-container py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">高级查询</h1>
        <p className="text-lg text-gray-600">多维度组合筛选，精准查找文物</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Filter Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">查询条件</h2>
            <div className="space-y-5">
              {/* Keyword */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">关键词</label>
                <Input
                  placeholder="文物名称关键词..."
                  value={params.title || ''}
                  onChange={(e) => updateParam('title', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Type/Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">文物类型</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-museum-gold focus:border-transparent"
                  value={params.type || ''}
                  onChange={(e) => updateParam('type', e.target.value)}
                >
                  <option value="">全部类型</option>
                  {filterOptions?.categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label} ({cat.count})</option>
                  )) || <option value="">加载中...</option>}
                </select>
              </div>

              {/* Museum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">收藏博物馆</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-museum-gold focus:border-transparent"
                  value={params.museum || ''}
                  onChange={(e) => updateParam('museum', e.target.value)}
                >
                  <option value="">全部博物馆</option>
                  {filterOptions?.museums.map(m => (
                    <option key={m.value} value={m.value}>{m.label} ({m.count})</option>
                  )) || <option value="">加载中...</option>}
                </select>
              </div>

              {/* Era/Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">年代/时期</label>
                <Input
                  placeholder="如: Qing dynasty, 汉朝..."
                  value={params.period || ''}
                  onChange={(e) => updateParam('period', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="起始年份 (如: 618)"
                    value={params.period_from ?? ''}
                    onChange={(e) => updateParam('period_from', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1 text-sm"
                  />
                  <span className="text-gray-400 self-center">—</span>
                  <Input
                    type="number"
                    placeholder="结束年份 (如: 907)"
                    value={params.period_to ?? ''}
                    onChange={(e) => updateParam('period_to', e.target.value ? Number(e.target.value) : undefined)}
                    className="flex-1 text-sm"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">输入年份范围进行精确筛选（公元前用负数，如 -221）</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-museum-gold hover:bg-museum-gold-dark text-white"
                  onClick={() => handleSearch(1)}
                  disabled={loading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  搜索
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-museum-gold border-t-transparent" />
              <p className="mt-4 text-gray-500">正在查询...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  找到 <span className="font-semibold text-museum-gold-dark">{total}</span> 件文物
                  {totalPages > 1 && <span className="text-gray-400 text-sm ml-2">（第 {params.page || 1}/{totalPages} 页）</span>}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                    <Download className="h-4 w-4 mr-2" />导出 CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                    <Download className="h-4 w-4 mr-2" />导出 JSON
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {results.map(artifact => (
                  <ArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <Button variant="outline" onClick={() => handlePageChange(Math.max(1, (params.page || 1) - 1))} disabled={(params.page || 1) === 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" />上一页
                  </Button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                      const cp = params.page || 1;
                      let pageNum: number;
                      if (totalPages <= 7) { pageNum = i + 1; }
                      else if (cp <= 4) { pageNum = i < 5 ? i + 1 : totalPages; }
                      else if (cp >= totalPages - 3) { pageNum = i < 2 ? i + 1 : totalPages - (6 - i); }
                      else { pageNum = i < 3 ? i + 1 : i === 3 ? cp - 1 : i === 4 ? cp : totalPages; }
                      return (
                        <Button key={pageNum} variant={cp === pageNum ? "default" : "outline"} size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className={cp === pageNum ? 'bg-museum-gold hover:bg-museum-gold-dark' : ''}>
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button variant="outline" onClick={() => handlePageChange(Math.min(totalPages, (params.page || 1) + 1))} disabled={(params.page || 1) === totalPages}>
                    下一页<ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : hasSearched ? (
            <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
              <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">未找到匹配文物</h3>
              <p className="text-gray-500">尝试调整查询条件</p>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-200">
              <Search className="h-16 w-16 mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400">设置查询条件后点击搜索</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;
