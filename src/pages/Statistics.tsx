import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { visualizationService, StatisticsData } from '@/services/visualizationService';

const Statistics: React.FC = () => {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const stats = await visualizationService.getStatistics();
      console.log('统计数据:', stats); // 调试：打印数据
      setData(stats);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // 类型占比饼图配置
  const typePieOption = {
    title: { text: '文物类型分布', left: 'center', top: 5 },
    tooltip: { trigger: 'item', formatter: '{b}: {d}% ({c}件)' },
    legend: { orient: 'vertical', left: 'left', top: 30 },
    series: [
      {
        type: 'pie',
        radius: '55%',
        center: ['50%', '55%'],
        data: data?.typeDistribution || [],
        emphasis: { scale: true },
        label: { show: true, formatter: '{b}: {d}%' },
      },
    ],
  };

  // 博物馆藏量排行饼图 - 修复版
  const museumPieOption = {
    title: { text: '博物馆藏量排行', left: 'center', top: 5 },
    tooltip: { trigger: 'item', formatter: '{b}: {d}% ({c}件)' },
    legend: { orient: 'vertical', left: 'left', top: 30 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '55%'],
        data: data?.museumDistribution.map(item => ({
          name: item.museum,
          value: item.count,
        })) || [],
        label: { show: true, formatter: '{b}' },
        emphasis: { scale: true },
      },
    ],
  };

  // 朝代分布柱状图配置
  const dynastyBarOption = {
    title: { text: '各朝代文物数量分布', left: 'center', top: 5 },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'category', data: data?.dynastyDistribution.map(d => d.dynasty) || [], name: '朝代' },
    yAxis: { type: 'value', name: '文物数量（件）' },
    series: [
      {
        name: '文物数量',
        type: 'bar',
        data: data?.dynastyDistribution.map(d => d.count) || [],
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#5470c6' },
        label: { show: true, position: 'top' },
      },
    ],
    grid: { containLabel: true, top: 60, bottom: 20 },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">加载统计数据中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">统计分析看板</h1>
        <p className="text-gray-500">文物数据宏观视角分析</p>
      </div>

      {/* 总览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">文物总数</div>
          <div className="text-3xl font-bold text-blue-600">{data?.totalArtifacts?.toLocaleString()}</div>
          <div className="text-gray-400 text-xs mt-2">件</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">博物馆数量</div>
          <div className="text-3xl font-bold text-green-600">{data?.museumDistribution?.length || 0}</div>
          <div className="text-gray-400 text-xs mt-2">家</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">文物类型</div>
          <div className="text-3xl font-bold text-purple-600">{data?.typeDistribution?.length || 0}</div>
          <div className="text-gray-400 text-xs mt-2">类</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-gray-500 text-sm">历史朝代</div>
          <div className="text-3xl font-bold text-orange-600">{data?.dynastyDistribution?.length || 0}</div>
          <div className="text-gray-400 text-xs mt-2">个</div>
        </div>
      </div>

      {/* 图表区域 - 两列布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4" style={{ minHeight: 450 }}>
          <ReactECharts option={typePieOption} style={{ height: 400 }} />
        </div>
        <div className="bg-white rounded-lg shadow p-4" style={{ minHeight: 450 }}>
          <ReactECharts option={museumPieOption} style={{ height: 400 }} />
        </div>
        <div className="bg-white rounded-lg shadow p-4 lg:col-span-2" style={{ minHeight: 450 }}>
          <ReactECharts option={dynastyBarOption} style={{ height: 400 }} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;