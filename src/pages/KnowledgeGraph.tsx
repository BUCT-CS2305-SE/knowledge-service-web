import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Search, Network, Download, MessageCircle, ChevronLeft, ChevronRight, ExternalLink, MapPin, Calendar, Package, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthImage } from '@/components/ui/auth-image';
import { ArtifactCard } from '@/components/artifacts/ArtifactCard';
import { realApiService, artifactService, type GraphData } from '@/services/artifactService';
import type { Artifact } from '@/types/artifact';

type TabType = 'graph' | 'nlq';

// 朝代关键词映射（用于自然语言解析）
const DYNASTY_KEYWORDS: Record<string, string> = {
  '唐朝': 'Tang', '唐代': 'Tang', '唐': 'Tang',
  '宋朝': 'Song', '宋代': 'Song', '宋': 'Song',
  '元朝': 'Yuan', '元代': 'Yuan', '元': 'Yuan',
  '明朝': 'Ming', '明代': 'Ming', '明': 'Ming',
  '清朝': 'Qing', '清代': 'Qing', '清': 'Qing',
  '汉朝': 'Han', '汉代': 'Han', '汉': 'Han',
  '商朝': 'Shang', '商代': 'Shang', '商': 'Shang',
  '周朝': 'Zhou', '周代': 'Zhou', '周': 'Zhou',
  '秦朝': 'Qin', '秦代': 'Qin', '秦': 'Qin',
};

// 类型关键词映射
const TYPE_KEYWORDS: Record<string, string> = {
  '瓷器': '陶瓷', '陶瓷': '陶瓷', '瓷': '陶瓷',
  '雕塑': '雕塑', '雕像': '雕塑',
  '绘画': '绘画', '画': '绘画',
  '青铜': '青铜', '青铜器': '青铜',
  '玉器': '玉器', '玉': '玉器',
  '纺织': '纺织', '纺织品': '纺织', '丝绸': '纺织',
  '家具': '家具', '家具陈设': '家具陈设',
  '照片': '照片', '摄影': '照片',
  '绘图': '绘图', '素描': '绘图',
};

const PAGE_SIZE = 12;

const KnowledgeGraph: React.FC = () => {
  // ===== 图谱浏览状态 =====
  const [activeTab, setActiveTab] = useState<TabType>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artifact[]>([]);
  const [searching, setSearching] = useState(false);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ===== 自然语言查询状态 =====
  const [nlqInput, setNlqInput] = useState('');
  const [nlqResults, setNlqResults] = useState<Artifact[]>([]);
  const [nlqTotal, setNlqTotal] = useState(0);
  const [nlqPage, setNlqPage] = useState(1);
  const [nlqLoading, setNlqLoading] = useState(false);
  const [nlqSearched, setNlqSearched] = useState(false);
  const [nlqParsed, setNlqParsed] = useState('');

  // ===== 图谱搜索 =====
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true); setError(null);
    try {
      const response = await realApiService.searchArtifacts(searchQuery.trim(), 1, 10);
      setSearchResults(response.data);
    } catch (err) { setError('搜索失败'); }
    finally { setSearching(false); }
  };

  const handleSelectArtifact = async (artifact: Artifact) => {
    setSelectedArtifact(artifact); setSearchResults([]); setSearchQuery('');
    setLoading(true); setError(null);
    try {
      const data = await realApiService.getGraphNeighbors(artifact.id, 1, 50);
      setGraphData(data); setSelectedNode(null);
    } catch (err) { setError('加载知识图谱失败'); setGraphData(null); }
    finally { setLoading(false); }
  };

  // ===== 导出功能 =====
  const handleExportGraph = (format: 'csv' | 'json') => {
    if (!graphData || !graphData.nodes.length) return;
    let content: string; let filename: string; let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(graphData, null, 2);
      filename = 'knowledge-graph.json';
      mimeType = 'application/json';
    } else {
      const nodeHeaders = ['ID', 'Name', 'Type', 'Category'];
      const nodeRows = graphData.nodes.map(n => [n.id, n.name, n.type || '', n.category || '']);
      const linkHeaders = ['Source', 'Target', 'Relation'];
      const linkRows = graphData.links.map(l => [l.source, l.target, l.relation || '']);
      content = '﻿Nodes\n' + [nodeHeaders, ...nodeRows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
        + '\n\nLinks\n' + [linkHeaders, ...linkRows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      filename = 'knowledge-graph.csv';
      mimeType = 'text/csv;charset=utf-8';
    }
    downloadBlob(content, filename, mimeType);
  };

  const handleExportResults = (results: Artifact[], format: 'csv' | 'json', prefix: string) => {
    if (!results.length) return;
    let content: string; let filename: string; let mimeType: string;
    if (format === 'json') {
      content = JSON.stringify(results, null, 2);
      filename = `${prefix}-results.json`;
      mimeType = 'application/json';
    } else {
      const headers = ['名称', '年代', '地区', '博物馆', '描述'];
      const rows = results.map(r => [r.name, r.era, r.region, r.museum || '', (r.description || '').replace(/"/g, '""')]);
      content = '﻿' + [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
      filename = `${prefix}-results.csv`;
      mimeType = 'text/csv;charset=utf-8';
    }
    downloadBlob(content, filename, mimeType);
  };

  const downloadBlob = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ===== 自然语言查询 =====
  const parseNLQuery = (input: string): { period?: string; type?: string; museum?: string; keyword?: string } => {
    const result: { period?: string; type?: string; museum?: string; keyword?: string } = {};

    for (const [zhDynasty, enDynasty] of Object.entries(DYNASTY_KEYWORDS)) {
      if (input.includes(zhDynasty)) { result.period = enDynasty; break; }
    }
    for (const [zhType, realType] of Object.entries(TYPE_KEYWORDS)) {
      if (input.includes(zhType)) { result.type = realType; break; }
    }
    const museumPatterns = ['大都会', '大英博物馆', '普林斯顿', '芝加哥', '布鲁克林', 'British Museum', 'Metropolitan'];
    for (const m of museumPatterns) {
      if (input.includes(m)) {
        if (m === '大都会') result.museum = 'Metropolitan Museum of Art';
        else if (m === '大英博物馆' || m === 'British Museum') result.museum = 'British Museum';
        else if (m === '普林斯顿') result.museum = 'Princeton University Art Museum';
        else if (m === '芝加哥') result.museum = 'Art Institute of Chicago';
        else if (m === '布鲁克林') result.museum = 'Brooklyn Museum';
        else result.museum = m;
        break;
      }
    }

    if (!result.period && !result.type && !result.museum) {
      result.keyword = input;
    }

    return result;
  };

  const handleNLQSearch = async (page: number = 1) => {
    if (!nlqInput.trim()) return;
    const parsed = parseNLQuery(nlqInput.trim());
    setNlqLoading(true); setNlqSearched(true);

    const parts: string[] = [];
    if (parsed.period) parts.push(`Period: ${parsed.period}`);
    if (parsed.type) parts.push(`Type: ${parsed.type}`);
    if (parsed.museum) parts.push(`Museum: ${parsed.museum}`);
    setNlqParsed(parts.length > 0 ? 'Parsed: ' + parts.join(', ') : '');

    try {
      let response;
      if (parsed.keyword && !parsed.period && !parsed.type && !parsed.museum) {
        response = await realApiService.searchArtifacts(parsed.keyword, page, PAGE_SIZE);
      } else {
        response = await artifactService.advancedSearch({
          period: parsed.period,
          type: parsed.type,
          museum: parsed.museum,
          page, page_size: PAGE_SIZE,
        });
      }
      setNlqResults(response.data); setNlqTotal(response.total); setNlqPage(page);
    } catch (err) { console.error('NLQ failed:', err); }
    finally { setNlqLoading(false); }
  };

  // ===== ECharts 配置 =====
  const graphOption = graphData ? {
    title: { text: selectedArtifact ? `"${selectedArtifact.name}" 的知识图谱` : '文物知识图谱', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: (params: any) => params.dataType === 'edge' ? params.data.relation || '' : `${params.data.name}<br/>Type: ${params.data.type || params.data.category || '?'}` },
    series: [{
      type: 'graph', layout: 'force',
      force: { repulsion: 500, edgeLength: 150, gravity: 0.1, friction: 0.1 },
      roam: true, draggable: true,
      data: graphData.nodes.map(node => ({
        ...node,
        symbol: node.imageUrl ? `image://${node.imageUrl}` : 'circle',
        symbolSize: node.imageUrl ? 50 : (node.symbolSize || 35),
      })),
      links: graphData.links.map((l: any) => ({ ...l, label: { show: true, formatter: l.relation } })),
      categories: [
        { name: 'Artifact', itemStyle: { color: '#5470c6' } },
        { name: 'Museum', itemStyle: { color: '#fac858' } },
        { name: 'Dynasty', itemStyle: { color: '#ee6666' } },
        { name: 'Artist', itemStyle: { color: '#73c0de' } },
        { name: 'Location', itemStyle: { color: '#3ba272' } },
        { name: 'Material', itemStyle: { color: '#fc8452' } },
      ],
      label: { show: true, position: 'right', fontSize: 11, formatter: (p: any) => p.name.length > 15 ? p.name.substring(0, 14) + '...' : p.name },
      emphasis: { focus: 'adjacency' },
      lineStyle: { color: 'source', curveness: 0.3 },
      edgeSymbol: ['none', 'arrow'],
      edgeLabel: { show: true, formatter: (p: any) => p.data.relation || '', fontSize: 9 },
    }],
  } : undefined;

  const handleChartClick = (params: any) => {
    if (params.dataType === 'node') setSelectedNode(params.data);
  };

  // ===== 分页控件 =====
  const renderPagination = (currentPage: number, total: number, onPageChange: (p: number) => void) => {
    const totalPages = Math.ceil(total / PAGE_SIZE);
    if (totalPages <= 1) return null;
    return (
      <div className="mt-6 flex justify-center items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4 mr-1" />上一页
        </Button>
        <span className="text-sm text-gray-500">{currentPage} / {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
          下一页<ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  // ===== 标签页切换 =====
  const tabs: { key: TabType; label: string; icon: React.ReactNode; desc: string }[] = [
    { key: 'graph', label: '图谱浏览', icon: <Network className="h-4 w-4" />, desc: '搜索文物探索关联关系图' },
    { key: 'nlq', label: '自然语言查询', icon: <MessageCircle className="h-4 w-4" />, desc: '用自然语言描述查询条件' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="museum-container py-8 md:py-12 px-4 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Network className="h-8 w-8 text-amber-600" />
            <span className="bg-gradient-to-r from-amber-700 to-amber-500 bg-clip-text text-transparent">知识图谱查询</span>
          </h1>
          <p className="text-lg text-gray-600">探索文物实体关联关系，支持图谱浏览、结构化查询与自然语言查询</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(null); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ===== TAB 1: 图谱浏览 ===== */}
        {activeTab === 'graph' && (
          <>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
              <div className="flex gap-4">
                <Input type="text" placeholder="输入文物名称搜索以探索其知识图谱..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 text-lg py-6 border-gray-200 focus:border-amber-400 focus:ring-amber-400" />
                <Button size="lg" disabled={searching} onClick={handleSearch} className="px-8 bg-amber-600 hover:bg-amber-700 text-white">
                  <Search className="h-5 w-5 mr-2" />搜索
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-4 border rounded-lg divide-y max-h-96 overflow-y-auto">
                  {searchResults.map(artifact => (
                    <div key={artifact.id} className="p-3 hover:bg-amber-50 cursor-pointer flex items-center gap-4 transition-colors" onClick={() => handleSelectArtifact(artifact)}>
                      {artifact.images[0] && <AuthImage src={artifact.images[0]} alt="" className="w-12 h-12 object-cover rounded flex-shrink-0" errorFallback={<div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0" />} />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{artifact.name}</p>
                        <p className="text-sm text-gray-500">{artifact.era} · {artifact.museum}</p>
                      </div>
                      <span className="text-xs text-amber-600 font-medium">选择 →</span>
                    </div>
                  ))}
                </div>
              )}
              {searching && <p className="mt-4 text-gray-400 text-center">搜索中...</p>}
            </div>

            {error && (
              <div className="text-center py-8 bg-white rounded-lg border border-red-200 mb-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button variant="outline" onClick={() => setError(null)}>关闭</Button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-96 bg-white rounded-xl shadow-md border">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mb-4" />
                  <p className="text-gray-500">加载知识图谱中...</p>
                </div>
              </div>
            ) : graphData && graphData.nodes.length > 0 ? (
              <>
                <div className="flex justify-end gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={() => handleExportGraph('csv')} className="border-gray-200 hover:border-amber-400">
                    <Download className="h-4 w-4 mr-2" />导出 CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExportGraph('json')} className="border-gray-200 hover:border-amber-400">
                    <Download className="h-4 w-4 mr-2" />导出 JSON
                  </Button>
                </div>
                {/* 实体类型图例 - 根据当前图谱动态生成 */}
                  {graphData && graphData.nodes.length > 0 && (
                     <div className="bg-gray-50 rounded-lg p-3 mb-4">
    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
      实体类型图例
    </h4>
    <div className="flex flex-wrap gap-4">
      {(() => {
        // 统计各类型节点数量
        const typeCountMap = new Map<string, number>();
        graphData.nodes.forEach(node => {
          const type = node.category || node.type || '未知';
          if (type && type !== '未知') {
            typeCountMap.set(type, (typeCountMap.get(type) || 0) + 1);
          }
        });

        // 类型名称映射（英文 -> 中文）
        const typeNameMap: Record<string, string> = {
          'Artifact': '文物',
          'Museum': '博物馆',
          'Dynasty': '朝代',
          'Period': '朝代',
          'Artist': '艺术家',
          'Location': '地点',
          'Material': '材质',
          'Type': '类型',
        };

        // 类型颜色映射
        const typeColorMap: Record<string, string> = {
          'Artifact': '#5470c6',
          'Museum': '#fac858',
          'Dynasty': '#ee6666',
          'Period': '#ee6666',
          'Artist': '#73c0de',
          'Location': '#3ba272',
          'Material': '#fc8452',
          'Type': '#9a60b4',
        };

        // 转换为数组并排序（文物放前面）
        const types = Array.from(typeCountMap.keys()).sort((a, b) => {
          if (a === 'Artifact') return -1;
          if (b === 'Artifact') return 1;
          return 0;
        });

        return types.map(type => {
          const count = typeCountMap.get(type) || 0;
          const displayName = typeNameMap[type] || type;
          const color = typeColorMap[type] || '#999';
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-700">{displayName}</span>
              <span className="text-xs text-gray-400">({count})</span>
            </div>
               );
               });
                })()}
                </div>
               </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* 图谱区域 */}
                  <div className="lg:col-span-3 bg-white rounded-xl shadow-md border border-gray-100 p-4">
                    <ReactECharts option={graphOption} style={{ height: 600 }} onEvents={{ click: handleChartClick }} />
                    <div className="mt-3 text-sm text-gray-400 text-center bg-gray-50 py-2 rounded-lg">
                      💡 提示：拖动节点查看布局，点击节点查看详情，滚动缩放图谱 | 节点数: {graphData.nodes.length} | 关系数: {graphData.links.length}
                    </div>
                  </div>

                  {/* 右侧节点详情区域 - 美化版 */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        节点详情
                      </h3>
                    </div>
                    <div className="p-4 max-h-[600px] overflow-y-auto">
                      {selectedNode ? (
                        <div className="space-y-4">
                          {/* 图片区域 */}
                          {(selectedNode.category === 'Artifact' || selectedNode.type === 'Artifact') &&
                           (selectedNode.props?.image_url || selectedNode.imageUrl) && (
                            <div className="relative group">
                              <AuthImage
                                src={selectedNode.props?.image_url || selectedNode.imageUrl}
                                alt={selectedNode.name}
                                className="w-full rounded-lg shadow-md border border-gray-200 object-contain max-h-48 bg-gray-50"
                                errorFallback={
                                  <div className="w-full h-32 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300">无图片</div>
                                }
                              />
                              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a href={selectedNode.props?.image_url || selectedNode.imageUrl} target="_blank" rel="noopener noreferrer" className="bg-black/50 text-white p-1 rounded-full">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          )}

                          {/* 基本信息卡片 */}
                          <div className="bg-amber-50/50 rounded-lg p-3 space-y-2 border border-amber-100">
                            <div className="flex items-start gap-2">
                              <span className="text-amber-600 mt-0.5">🏺</span>
                              <div className="flex-1">
                                <div className="text-xs text-amber-600 font-medium">文物名称</div>
                                <div className="font-semibold text-gray-800 break-words">{selectedNode.name}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">📌</span>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500">类型</div>
                                <div className="text-gray-700">{selectedNode.category || selectedNode.type || '未知'}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">🆔</span>
                              <div className="flex-1">
                                <div className="text-xs text-gray-500">ID</div>
                                <div className="text-gray-500 text-xs font-mono break-all">{selectedNode.id}</div>
                              </div>
                            </div>
                          </div>

                          {/* 详细信息区域 */}
                          {(selectedNode.category === 'Artifact' || selectedNode.type === 'Artifact') && selectedNode.props && (
                            <div className="border-t border-gray-100 pt-3">
                              <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1">
                                <Ruler className="h-3 w-3" /> 详细信息
                              </h4>
                              <div className="space-y-2">
                                {selectedNode.props.title_en && (
                                  <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-xs text-gray-500">英文名</div>
                                    <div className="text-sm text-gray-700 break-words">{selectedNode.props.title_en}</div>
                                  </div>
                                )}
                                {selectedNode.props.dimensions && (
                                  <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-xs text-gray-500">尺寸</div>
                                    <div className="text-sm text-gray-700">{selectedNode.props.dimensions}</div>
                                  </div>
                                )}
                                {selectedNode.props.accession_number && (
                                  <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-xs text-gray-500">编号</div>
                                    <div className="text-sm text-gray-700 font-mono">{selectedNode.props.accession_number}</div>
                                  </div>
                                )}
                                {selectedNode.props.quality_score && (
                                  <div className="bg-gray-50 rounded-lg p-2">
                                    <div className="text-xs text-gray-500">质量评分</div>
                                    <div className="text-sm text-gray-700">⭐ {selectedNode.props.quality_score}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* 博物馆信息 */}
                          {(selectedNode.category === 'Museum' || selectedNode.type === 'Museum') && selectedNode.props && (
                            <div className="border-t border-gray-100 pt-3">
                              <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> 位置信息
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="text-xs text-gray-500">所在地</div>
                                <div className="text-sm text-gray-700">{selectedNode.props.location || '未知'}</div>
                              </div>
                            </div>
                          )}

                          {/* 朝代/时期信息 */}
                          {(selectedNode.category === 'Period' || selectedNode.category === 'Dynasty' ||
                            selectedNode.type === 'Period' || selectedNode.type === 'Dynasty') && selectedNode.props && (
                            <div className="border-t border-gray-100 pt-3">
                              <h4 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> 时期信息
                              </h4>
                              {selectedNode.props.era && (
                                <div className="bg-gray-50 rounded-lg p-2">
                                  <div className="text-xs text-gray-500">所属时期</div>
                                  <div className="text-sm text-gray-700">{selectedNode.props.era}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Network className="h-8 w-8 text-gray-300" />
                          </div>
                          <p className="text-gray-500 font-medium">点击节点查看详情</p>
                          <p className="text-xs text-gray-400 mt-1">点击图谱中的文物或实体节点</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : selectedArtifact && !loading ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
                <Network className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无图谱数据</h3>
                <p className="text-gray-500">请尝试搜索其他文物</p>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
                <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">搜索文物以探索其知识图谱</p>
              </div>
            )}
          </>
        )}

        {/* ===== TAB 2: 自然语言查询 ===== */}
        {activeTab === 'nlq' && (
          <>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-amber-600" />自然语言查询
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                输入自然语言描述，系统自动解析为查询条件。支持如"唐朝的瓷器"、"大英博物馆的绘画"、"明朝所有文物"等句式。
              </p>
              <div className="flex gap-4">
                <Input type="text" placeholder="e.g. 查询唐朝的所有瓷器..." value={nlqInput}
                  onChange={(e) => setNlqInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNLQSearch()}
                  className="flex-1 text-lg py-6 border-gray-200 focus:border-amber-400 focus:ring-amber-400" />
                <Button size="lg" disabled={nlqLoading} onClick={() => handleNLQSearch(1)} className="px-8 bg-amber-600 hover:bg-amber-700 text-white">
                  <Search className="h-5 w-5 mr-2" />查询
                </Button>
              </div>
              {nlqParsed && <p className="mt-3 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">{nlqParsed}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                {['唐朝的陶瓷', '大英博物馆的绘画', '明朝所有文物', '清朝的雕塑', '普林斯顿的青铜器'].map((ex, i) => (
                  <button key={i} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                    onClick={() => { setNlqInput(ex); setTimeout(() => handleNLQSearch(1), 50); }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {nlqLoading ? (
              <div className="text-center py-16"><div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent" /><p className="mt-4 text-gray-500">查询中...</p></div>
            ) : nlqResults.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">找到 <span className="font-semibold text-amber-600">{nlqTotal}</span> 件文物</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExportResults(nlqResults, 'csv', 'nlq')} className="border-gray-200 hover:border-amber-400"><Download className="h-4 w-4 mr-2" />CSV</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportResults(nlqResults, 'json', 'nlq')} className="border-gray-200 hover:border-amber-400"><Download className="h-4 w-4 mr-2" />JSON</Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {nlqResults.map(a => <ArtifactCard key={a.id} artifact={a} />)}
                </div>
                {renderPagination(nlqPage, nlqTotal, handleNLQSearch)}
              </>
            ) : nlqSearched ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
                <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">未找到结果</h3>
                <p className="text-gray-500">请尝试其他查询条件</p>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
                <MessageCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">输入自然语言查询条件</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeGraph;
