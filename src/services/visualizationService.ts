// 统计分析数据类型
export interface StatisticsData {
  totalArtifacts: number;
  typeDistribution: { name: string; value: number }[];
  dynastyDistribution: { dynasty: string; count: number }[];
  museumDistribution: { museum: string; count: number }[];
}

// 知识图谱节点和边
export interface GraphNode {
  id: string;
  name: string;
  type: string;
  category?: string;
  symbolSize?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  relation: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// 时间轴数据
export interface TimelineData {
  dynasty: string;
  period: string;
  startYear: number;
  endYear: number;
  count: number;
  artifactIds: string[];
}

// 地理分布数据
export interface MuseumLocation {
  name: string;
  city: string;
  country: string;
  longitude: number;
  latitude: number;
  collectionCount: number;
}

// Mock 数据 - 统计分析
const mockStatistics: StatisticsData = {
  totalArtifacts: 5230,
  typeDistribution: [
    { name: '陶瓷', value: 2100 },
    { name: '绘画', value: 1500 },
    { name: '青铜器', value: 800 },
    { name: '玉器', value: 450 },
    { name: '书法', value: 380 },
    { name: '其他', value: 0 },
  ],
  dynastyDistribution: [
    { dynasty: '唐代', count: 1200 },
    { dynasty: '宋代', count: 980 },
    { dynasty: '明代', count: 850 },
    { dynasty: '清代', count: 720 },
    { dynasty: '元代', count: 340 },
    { dynasty: '汉代', count: 290 },
  ],
  museumDistribution: [
    { museum: '大都会艺术博物馆', count: 1850 },
    { museum: '克利夫兰艺术博物馆', count: 980 },
    { museum: '波士顿美术馆', count: 760 },
    { museum: '芝加哥艺术博物馆', count: 540 },
    { museum: '旧金山亚洲艺术博物馆', count: 410 },
  ],
};

// Mock 数据 - 知识图谱
const mockKnowledgeGraph: KnowledgeGraphData = {
  nodes: [
    { id: 'artifact_1', name: '青花瓷瓶', type: 'Artifact', category: '瓷器', symbolSize: 50 },
    { id: 'museum_1', name: '大都会艺术博物馆', type: 'Museum', category: '博物馆', symbolSize: 40 },
    { id: 'dynasty_1', name: '明代', type: 'Dynasty', category: '朝代', symbolSize: 35 },
    { id: 'artist_1', name: '唐寅', type: 'Artist', category: '艺术家', symbolSize: 35 },
    { id: 'location_1', name: '景德镇', type: 'Location', category: '地点', symbolSize: 30 },
    { id: 'type_1', name: '瓷器', type: 'Type', category: '类型', symbolSize: 30 },
    { id: 'material_1', name: '青花', type: 'Material', category: '材质', symbolSize: 30 },
    { id: 'artifact_2', name: '山水图', type: 'Artifact', category: '绘画', symbolSize: 45 },
    { id: 'artist_2', name: '范宽', type: 'Artist', category: '艺术家', symbolSize: 35 },
    { id: 'dynasty_2', name: '宋代', type: 'Dynasty', category: '朝代', symbolSize: 35 },
  ],
  links: [
    { source: 'artifact_1', target: 'museum_1', relation: '收藏于' },
    { source: 'artifact_1', target: 'dynasty_1', relation: '创作于' },
    { source: 'artifact_1', target: 'type_1', relation: '类型为' },
    { source: 'artifact_1', target: 'material_1', relation: '材质为' },
    { source: 'artifact_1', target: 'location_1', relation: '出土于' },
    { source: 'artifact_2', target: 'museum_1', relation: '收藏于' },
    { source: 'artifact_2', target: 'dynasty_2', relation: '创作于' },
    { source: 'artifact_2', target: 'artist_2', relation: '作者为' },
  ],
};

// Mock 数据 - 时间轴
const mockTimeline: TimelineData[] = [
  { dynasty: '汉代', period: '公元前202年-公元220年', startYear: -202, endYear: 220, count: 290, artifactIds: ['han_1', 'han_2'] },
  { dynasty: '唐代', period: '618年-907年', startYear: 618, endYear: 907, count: 1200, artifactIds: ['tang_1', 'tang_2'] },
  { dynasty: '宋代', period: '960年-1279年', startYear: 960, endYear: 1279, count: 980, artifactIds: ['song_1', 'song_2'] },
  { dynasty: '元代', period: '1271年-1368年', startYear: 1271, endYear: 1368, count: 340, artifactIds: ['yuan_1', 'yuan_2'] },
  { dynasty: '明代', period: '1368年-1644年', startYear: 1368, endYear: 1644, count: 850, artifactIds: ['ming_1', 'ming_2'] },
  { dynasty: '清代', period: '1636年-1912年', startYear: 1636, endYear: 1912, count: 720, artifactIds: ['qing_1', 'qing_2'] },
];

// Mock 数据 - 地理分布
const mockMuseumLocations: MuseumLocation[] = [
  { name: '大都会艺术博物馆', city: '纽约', country: '美国', longitude: -73.9632, latitude: 40.7794, collectionCount: 1850 },
  { name: '克利夫兰艺术博物馆', city: '克利夫兰', country: '美国', longitude: -81.6123, latitude: 41.5082, collectionCount: 980 },
  { name: '波士顿美术馆', city: '波士顿', country: '美国', longitude: -71.0940, latitude: 42.3393, collectionCount: 760 },
  { name: '芝加哥艺术博物馆', city: '芝加哥', country: '美国', longitude: -87.6236, latitude: 41.8796, collectionCount: 540 },
  { name: '旧金山亚洲艺术博物馆', city: '旧金山', country: '美国', longitude: -122.4167, latitude: 37.7749, collectionCount: 410 },
  { name: '大英博物馆', city: '伦敦', country: '英国', longitude: -0.1278, latitude: 51.5194, collectionCount: 2300 },
  { name: '吉美博物馆', city: '巴黎', country: '法国', longitude: 2.2932, latitude: 48.8648, collectionCount: 680 },
];

// API 服务类
class VisualizationService {
  async getStatistics(): Promise<StatisticsData> {
    // TODO: 替换为真实 API 调用
    // const response = await apiClient.get('/visualization/statistics');
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => resolve(mockStatistics), 300);
    });
  }

  async getKnowledgeGraph(artifactId?: string): Promise<KnowledgeGraphData> {
    // TODO: 替换为真实 API 调用
    // const params = artifactId ? { artifactId } : {};
    // const response = await apiClient.get('/visualization/knowledge-graph', { params });
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => resolve(mockKnowledgeGraph), 300);
    });
  }

  async getTimeline(dynasty?: string): Promise<TimelineData[]> {
    // TODO: 替换为真实 API 调用
    // const params = dynasty ? { dynasty } : {};
    // const response = await apiClient.get('/visualization/timeline', { params });
    // return response.data;

    return new Promise((resolve) => {
      let data = mockTimeline;
      if (dynasty) {
        data = data.filter(item => item.dynasty === dynasty);
      }
      setTimeout(() => resolve(data), 300);
    });
  }

  async getMuseumLocations(): Promise<MuseumLocation[]> {
    // TODO: 替换为真实 API 调用
    // const response = await apiClient.get('/visualization/map');
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMuseumLocations), 300);
    });
  }
}

export const visualizationService = new VisualizationService();