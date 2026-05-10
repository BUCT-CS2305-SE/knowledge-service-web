import React, { useState, useEffect } from 'react';
import { Search, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';
import { mockApi } from '@/mock/handlers';
import type { Artifact } from '@/types/artifact';

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // 加载搜索历史
  useEffect(() => {
    try {
      const saved = localStorage.getItem('searchHistory');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSearch = async (searchKeyword?: string) => {
    const kw = (searchKeyword || keyword).trim();
    if (!kw) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await mockApi.fullTextSearch(kw);
      setResults(data);

      // 更新搜索历史
      setSearchHistory(prev => {
        const newHistory = [kw, ...prev.filter(h => h !== kw)].slice(0, 8);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
        return newHistory;
      });
    } catch (err) {
      setError('搜索失败，请重试');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = (item: string) => {
    const newHistory = searchHistory.filter(h => h !== item);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (results.length === 0) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
      filename = 'search-results.json';
      mimeType = 'application/json';
    } else {
      const headers = ['名称', '年代', '地区', '材质', '类别', '博物馆', '描述'];
      const rows = results.map(r => [
        r.name,
        r.era,
        r.region,
        r.material,
        r.category,
        r.museum || '',
        (r.description || '').replace(/"/g, '""'),
      ]);
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      content = '\uFEFF' + csvContent;
      filename = 'search-results.csv';
      mimeType = 'text/csv;charset=utf-8';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="museum-container py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          文物搜索
        </h1>
        <p className="text-lg text-gray-600">
          按名称、博物馆、年代、材质等关键词快速检索文物
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-4"
        >
          <Input
            type="text"
            placeholder="输入文物名称、博物馆、年代等关键词..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1 text-lg py-6"
          />
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="px-8 bg-museum-gold hover:bg-museum-gold-dark text-white"
          >
            <Search className="h-5 w-5 mr-2" />
            搜索
          </Button>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">搜索历史：</span>
            {searchHistory.map((item, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200 flex items-center gap-1"
              >
                <span onClick={() => {
                  setKeyword(item);
                  handleSearch(item);
                }}>
                  {item}
                </span>
                <X
                  className="h-3 w-3 ml-1 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearHistory(item);
                  }}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-museum-gold border-t-transparent" />
          <p className="mt-4 text-gray-500">正在搜索...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-lg border border-red-200">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => handleSearch()}>
            重试
          </Button>
        </div>
      ) : results.length > 0 ? (
        <>
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <p className="text-gray-600">
              找到 <span className="font-semibold text-museum-gold-dark">{results.length}</span> 件相关文物
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                导出 CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                <Download className="h-4 w-4 mr-2" />
                导出 JSON
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(artifact => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        </>
      ) : hasSearched ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">未找到相关文物</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            尝试使用其他关键词，或检查输入是否正确
          </p>
          <Button variant="outline" size="lg" onClick={() => {
            setKeyword('');
            setResults([]);
            setHasSearched(false);
          }}>
            清除搜索
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default SearchPage;