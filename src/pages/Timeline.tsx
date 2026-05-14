import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { visualizationService, TimelineData } from '@/services/visualizationService';
import { useNavigate } from 'react-router-dom';

const Timeline: React.FC = () => {
  const [timelineData, setTimelineData] = useState<TimelineData[]>([]);
  const [filteredData, setFilteredData] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'line' | 'bar'>('line');
  const [dateRange, setDateRange] = useState<{ start: number | null; end: number | null }>({ start: null, end: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await visualizationService.getTimeline();
      setTimelineData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  // 自定义筛选函数
  const filterByDateRange = (startYear: number | null, endYear: number | null) => {
    setDateRange({ start: startYear, end: endYear });
    let filtered = timelineData;
    if (startYear !== null) {
      filtered = filtered.filter(item => item.endYear >= startYear);
    }
    if (endYear !== null) {
      filtered = filtered.filter(item => item.startYear <= endYear);
    }
    setFilteredData(filtered);
  };

  // 重置筛选
  const resetFilter = () => {
    setDateRange({ start: null, end: null });
    setFilteredData(timelineData);
  };

  // 按朝代筛选
  const filterByDynasty = (dynasty: string) => {
    if (dynasty) {
      const filtered = timelineData.filter(t => t.dynasty === dynasty);
      setFilteredData(filtered);
      setDateRange({ start: null, end: null });
    } else {
      setFilteredData(timelineData);
    }
  };

  // 点击时间轴节点跳转到文物列表
  const handleTimelineClick = (params: any) => {
    if (params.componentType === 'series' && params.data) {
      const dynasty = params.data.name;
      navigate(`/browse?dynasty=${encodeURIComponent(dynasty)}`);
    }
  };

  // 时间轴图表配置（折线图）
  const lineOption = {
    title: { text: '中国历代文物分布时间轴', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        const timelineItem = filteredData.find(t => t.dynasty === data.name);
        return `${data.name}<br/>${timelineItem?.period}<br/>文物数量: ${data.value} 件<br/>点击查看详情`;
      }
    },
    xAxis: { type: 'category', name: '朝代', data: filteredData.map(t => t.dynasty) },
    yAxis: { type: 'value', name: '文物数量（件）' },
    series: [
      {
        name: '文物数量',
        type: 'line',
        data: filteredData.map(t => t.count),
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: { width: 3, color: '#5470c6' },
        areaStyle: { opacity: 0.3, color: '#5470c6' },
        itemStyle: { color: '#ee6666', borderColor: '#fff', borderWidth: 2 },
      },
    ],
    grid: { containLabel: true, bottom: 30 },
  };

  // 柱状图配置
  const barOption = {
    title: { text: '各朝代文物数量分布', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0];
        const timelineItem = filteredData.find(t => t.dynasty === data.name);
        return `${data.name}<br/>${timelineItem?.period}<br/>文物数量: ${data.value} 件`;
      }
    },
    xAxis: { type: 'category', data: filteredData.map(t => t.dynasty), name: '朝代' },
    yAxis: { type: 'value', name: '文物数量（件）' },
    series: [
      {
        type: 'bar',
        data: filteredData.map(t => t.count),
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#5470c6' },
        label: { show: true, position: 'top' },
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-gray-500">加载时间轴数据中...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">文物时间轴</h1>
        <p className="text-gray-500">按历史朝代浏览文物分布，点击节点跳转查看</p>
      </div>

      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-medium text-gray-700">筛选方式：</span>

          {/* 快速朝代筛选 */}
          <select
            onChange={(e) => filterByDynasty(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="">全部朝代</option>
            {timelineData.map(t => (
              <option key={t.dynasty} value={t.dynasty}>{t.dynasty}</option>
            ))}
          </select>

          <span className="text-gray-400">|</span>

          {/* 自定义时间段筛选 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">自定义年份：</span>
            <input
              type="number"
              placeholder="起始年份"
              value={dateRange.start ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null;
                filterByDateRange(val, dateRange.end);
              }}
              className="w-28 px-2 py-1 border rounded text-sm"
            />
            <span>—</span>
            <input
              type="number"
              placeholder="结束年份"
              value={dateRange.end ?? ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null;
                filterByDateRange(dateRange.start, val);
              }}
              className="w-28 px-2 py-1 border rounded text-sm"
            />
            <button
              onClick={resetFilter}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              重置
            </button>
          </div>
        </div>

        {/* 显示当前筛选状态 */}
        {(dateRange.start !== null || dateRange.end !== null) && (
          <div className="mt-2 text-xs text-blue-500">
            当前筛选：{dateRange.start ? `${dateRange.start}年 之后` : ''} {dateRange.end ? `${dateRange.end}年 之前` : ''}
          </div>
        )}
      </div>

      {/* 视图切换 */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="text-sm text-gray-500 mb-2">📊 视图切换</div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewType('line')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewType === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            折线图（时间轴）
          </button>
          <button
            onClick={() => setViewType('bar')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewType === 'bar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            柱状图
          </button>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="bg-white rounded-lg shadow p-4">
        <ReactECharts
          option={viewType === 'line' ? lineOption : barOption}
          style={{ height: 500 }}
          onEvents={{ click: handleTimelineClick }}
        />
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-600">
          💡 提示：点击图表上的数据点，可跳转查看该朝代的文物列表
        </div>
      </div>

      {/* 朝代详细信息表格 */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">朝代</th>
              <th className="px-4 py-2 text-left">时间跨度</th>
              <th className="px-4 py-2 text-left">文物数量</th>
              <th className="px-4 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.dynasty} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{item.dynasty}</td>
                <td className="px-4 py-2 text-gray-500">{item.period}</td>
                <td className="px-4 py-2">{item.count} 件</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => navigate(`/browse?dynasty=${encodeURIComponent(item.dynasty)}`)}
                    className="text-blue-500 hover:underline"
                  >
                    查看文物 →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            没有找到符合条件的文物数据
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;