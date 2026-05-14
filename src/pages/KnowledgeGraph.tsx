import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { visualizationService, KnowledgeGraphData } from '@/services/visualizationService';

const KnowledgeGraph: React.FC = () => {
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await visualizationService.getKnowledgeGraph();
      setGraphData(data);
    } catch (error) {
      console.error('Failed to fetch knowledge graph:', error);
    } finally {
      setLoading(false);
    }
  };

  // 力导向图配置
  const graphOption = {
    title: { text: '文物知识图谱关系图', left: 'center' },
    tooltip: { trigger: 'item', formatter: (params: any) => `${params.data.name}<br/>类型: ${params.data.type}` },
    series: [
      {
        type: 'graph',
        layout: 'force',
        force: { repulsion: 500, edgeLength: 150, gravity: 0.1, friction: 0.1 },
        roam: true,
        draggable: true,
        data: graphData?.nodes || [],
        links: graphData?.links || [],
        categories: [
          { name: '文物', itemStyle: { color: '#5470c6' } },
          { name: '博物馆', itemStyle: { color: '#fac858' } },
          { name: '朝代', itemStyle: { color: '#ee6666' } },
          { name: '艺术家', itemStyle: { color: '#73c0de' } },
          { name: '地点', itemStyle: { color: '#3ba272' } },
          { name: '类型', itemStyle: { color: '#fc8452' } },
          { name: '材质', itemStyle: { color: '#9a60b4' } },
        ],
        label: { show: true, position: 'right', fontSize: 12 },
        emphasis: { focus: 'adjacency' },
        lineStyle: { color: 'source', curveness: 0.3, type: 'solid' },
        edgeSymbol: ['none', 'arrow'],
        edgeLabel: { show: true, formatter: (params: any) => params.data.relation, fontSize: 10 },
      },
    ],
  };

  const handleChartClick = (params: any) => {
    if (params.dataType === 'node') {
      setSelectedNode(params.data);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">加载知识图谱中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">知识图谱关系图</h1>
        <p className="text-gray-500">探索文物实体之间的关联关系</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 图谱区域 */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-4">
          <ReactECharts
            option={graphOption}
            style={{ height: 600 }}
            onEvents={{ click: handleChartClick }}
          />
          <div className="mt-2 text-sm text-gray-400 text-center">
            💡 提示：可拖拽节点调整位置，点击节点查看详情，滚动缩放视图
          </div>
        </div>

        {/* 节点详情面板 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3 pb-2 border-b">节点详情</h3>
          {selectedNode ? (
            <div className="space-y-2">
              <div><span className="text-gray-500">名称：</span><span className="font-medium">{selectedNode.name}</span></div>
              <div><span className="text-gray-500">类型：</span><span>{selectedNode.type}</span></div>
              {selectedNode.category && <div><span className="text-gray-500">分类：</span><span>{selectedNode.category}</span></div>}
              <div><span className="text-gray-500">ID：</span><span className="text-xs text-gray-400">{selectedNode.id}</span></div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">点击图谱中的节点查看详情</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;