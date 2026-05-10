import React, { useState } from 'react';
import { Search, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';
import { mockApi } from '@/mock/handlers';
import type { AdvancedSearchParams } from '@/mock/handlers';
import type { Artifact } from '@/types/artifact';

const CATEGORIES = [
  '石雕铭文',
  '丧葬用品',
  '雕塑',
  '圆雕',
  '肖像油画',
  '陶塑',
  '建筑构件',
  '纪念碑',
  '青铜礼器',
  '纪念碑式雕塑',
  '手稿文献',
  '佛教艺术',
];

const MATERIALS = [
  '花岗闪长岩',
  '黄金',
  '大理石',
  '杨木板油画',
  '陶土',
  '青铜',
  '铜',
  '羊皮纸',
  '矿物颜料',
];

const REGIONS = [
  '古埃及',
  '古希腊',
  '意大利文艺复兴',
  '意大利',
  '中国',
  '古蜀文明',
  '英国',
  '美国',
  '古代近东',
];

const AdvancedSearchPage: React.FC = () => {
  const [params, setParams] = useState<AdvancedSearchParams>({
    keyword: '',
    category: '',
    materials: [],
    museum: '',
    region: '',
  });
  const [results, setResults] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const toggleMaterial = (material: string) => {
    setParams(prev => ({
      ...prev,
      materials: prev.materials?.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...(prev.materials || []), material],
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await mockApi.advancedSearch(params);
      setResults(data);
    } catch (err) {
      console.error('Advanced search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParams({ keyword: '', category: '', materials: [], museum: '', region: '' });
    setResults([]);
    setHasSearched(false);
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (results.length === 0) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
      filename = 'advanced-search-results.json';
      mimeType = 'application/json';
    } else {
      const headers = ['名称', '年代', '地区', '材质', '类别', '博物馆', '尺寸'];
      const rows = results.map(r => [
        r.name,
        r.era,
        r.region,
        r.material,
        r.category,
        r.museum || '',
        `${r.dimensions?.height || '?'}×${r.dimensions?.width || '?'}${r.dimensions?.depth ? '×' + r.dimensions.depth : ''} cm`,
      ]);
      const csvContent = '\uFEFF' + [headers, ...rows]
        .map(row => row.map(c => `"${c}"`).join(','))
        .join('\n');
      content = csvContent;
      filename = 'advanced-search-results.csv';
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
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">高级查询</h1>
        <p className="text-lg text-gray-600">多维度组合筛选，精准查找文物</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Filter Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">查询条件</h2>

            <div className="space-y-5">
              {/* Keyword */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">关键词</label>
                <Input
                  placeholder="在名称和描述中搜索..."
                  value={params.keyword || ''}
                  onChange={(e) => setParams({ ...params, keyword: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">文物类型</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-museum-gold focus:border-transparent"
                  value={params.category || ''}
                  onChange={(e) => setParams({ ...params, category: e.target.value })}
                >
                  <option value="">全部类型</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Materials - 用 button 代替 Badge，保证可点击 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">材质（可多选）</label>
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map(mat => {
                    const isSelected = params.materials?.includes(mat);
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => toggleMaterial(mat)}
                        className={`
                          inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold
                          transition-colors focus:outline-none focus:ring-2 focus:ring-museum-gold
                          ${isSelected
                            ? 'border-transparent bg-museum-gold text-white hover:bg-museum-gold-dark'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                          }
                        `}
                      >
                        {mat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">地区/文明</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-museum-gold focus:border-transparent"
                  value={params.region || ''}
                  onChange={(e) => setParams({ ...params, region: e.target.value })}
                >
                  <option value="">全部地区</option>
                  {REGIONS.map(reg => (
                    <option key={reg} value={reg}>{reg}</option>
                  ))}
                </select>
              </div>

              {/* Museum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">收藏博物馆</label>
                <Input
                  placeholder="输入博物馆名称..."
                  value={params.museum || ''}
                  onChange={(e) => setParams({ ...params, museum: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-museum-gold hover:bg-museum-gold-dark text-white"
                  onClick={handleSearch}
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
                  找到 <span className="font-semibold text-museum-gold-dark">{results.length}</span> 件文物
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {results.map(artifact => (
                  <ArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </div>
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