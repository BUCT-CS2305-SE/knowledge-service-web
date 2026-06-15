// =====================================================
// 可视化服务层
// 综合演示数据（涵盖多博物馆、多朝代、多类型）
// 基于知识图谱子系统提供的971条芝加哥艺术博物馆真实数据
// + 硬编码补充数据确保演示效果全面
// =====================================================

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

// ===== 综合演示数据 =====
// 基于知识图谱子系统 5441 条真实数据 + 补充数据构建

const mockStatistics: StatisticsData = {
  totalArtifacts: 5441,
  typeDistribution: [
    { name: '陶瓷器', value: 1612 },
    { name: '绘画', value: 1045 },
    { name: '雕塑', value: 720 },
    { name: '纺织品', value: 580 },
    { name: '金属工艺', value: 440 },
    { name: '版画', value: 320 },
    { name: '玉器', value: 280 },
    { name: '书法', value: 215 },
    { name: '漆器', value: 130 },
    { name: '其他', value: 99 },
  ],
  dynastyDistribution: [
    { dynasty: '清朝', count: 1820 },
    { dynasty: '明朝', count: 950 },
    { dynasty: '宋朝', count: 680 },
    { dynasty: '唐朝', count: 520 },
    { dynasty: '汉朝', count: 340 },
    { dynasty: '元朝', count: 290 },
    { dynasty: '商朝', count: 180 },
    { dynasty: '周朝', count: 160 },
    { dynasty: '其他', count: 501 },
  ],
  museumDistribution: [
    { museum: '普林斯顿大学艺术博物馆', count: 3570 },
    { museum: '芝加哥艺术博物馆', count: 1000 },
    { museum: '布鲁克林博物馆', count: 720 },
    { museum: '大英博物馆', count: 100 },
    { museum: '大都会艺术博物馆', count: 49 },
    { museum: '布鲁克林植物园', count: 2 },
  ],
};

// 知识图谱演示数据（中文节点 + 真实关系）
const mockKnowledgeGraph: KnowledgeGraphData = {
  nodes: [
    { id: 'artifact_1', name: '青花瓷瓶', type: 'Artifact', category: '瓷器', symbolSize: 50 },
    { id: 'artifact_2', name: '山水图', type: 'Artifact', category: '绘画', symbolSize: 45 },
    { id: 'artifact_3', name: '鎏金铜佛像', type: 'Artifact', category: '雕塑', symbolSize: 45 },
    { id: 'artifact_4', name: '刺绣龙袍', type: 'Artifact', category: '纺织品', symbolSize: 40 },
    { id: 'artifact_5', name: '青铜礼器', type: 'Artifact', category: '金属工艺', symbolSize: 45 },
    { id: 'museum_1', name: '芝加哥艺术博物馆', type: 'Museum', category: '博物馆', symbolSize: 40 },
    { id: 'museum_2', name: '普林斯顿大学艺术博物馆', type: 'Museum', category: '博物馆', symbolSize: 40 },
    { id: 'museum_3', name: '布鲁克林博物馆', type: 'Museum', category: '博物馆', symbolSize: 40 },
    { id: 'dynasty_1', name: '清朝', type: 'Dynasty', category: '朝代', symbolSize: 35 },
    { id: 'dynasty_2', name: '明朝', type: 'Dynasty', category: '朝代', symbolSize: 35 },
    { id: 'dynasty_3', name: '宋朝', type: 'Dynasty', category: '朝代', symbolSize: 35 },
    { id: 'dynasty_4', name: '唐朝', type: 'Dynasty', category: '朝代', symbolSize: 35 },
    { id: 'type_1', name: '陶瓷器', type: 'Type', category: '类型', symbolSize: 30 },
    { id: 'type_2', name: '绘画', type: 'Type', category: '类型', symbolSize: 30 },
    { id: 'type_3', name: '雕塑', type: 'Type', category: '类型', symbolSize: 30 },
    { id: 'type_4', name: '纺织品', type: 'Type', category: '类型', symbolSize: 30 },
    { id: 'material_1', name: '青花瓷', type: 'Material', category: '材质', symbolSize: 30 },
    { id: 'material_2', name: '丝绸刺绣', type: 'Material', category: '材质', symbolSize: 30 },
    { id: 'material_3', name: '鎏金铜', type: 'Material', category: '材质', symbolSize: 30 },
    { id: 'location_1', name: '景德镇', type: 'Location', category: '地点', symbolSize: 30 },
    { id: 'location_2', name: '中国', type: 'Location', category: '地点', symbolSize: 35 },
  ],
  links: [
    { source: 'artifact_1', target: 'museum_1', relation: '收藏于' },
    { source: 'artifact_1', target: 'dynasty_2', relation: '创作于' },
    { source: 'artifact_1', target: 'type_1', relation: '类型为' },
    { source: 'artifact_1', target: 'material_1', relation: '材质为' },
    { source: 'artifact_1', target: 'location_1', relation: '出土于' },
    { source: 'artifact_2', target: 'museum_2', relation: '收藏于' },
    { source: 'artifact_2', target: 'dynasty_3', relation: '创作于' },
    { source: 'artifact_2', target: 'type_2', relation: '类型为' },
    { source: 'artifact_3', target: 'museum_3', relation: '收藏于' },
    { source: 'artifact_3', target: 'dynasty_4', relation: '创作于' },
    { source: 'artifact_3', target: 'type_3', relation: '类型为' },
    { source: 'artifact_3', target: 'material_3', relation: '材质为' },
    { source: 'artifact_4', target: 'museum_1', relation: '收藏于' },
    { source: 'artifact_4', target: 'dynasty_1', relation: '创作于' },
    { source: 'artifact_4', target: 'type_4', relation: '类型为' },
    { source: 'artifact_4', target: 'material_2', relation: '材质为' },
    { source: 'artifact_5', target: 'museum_2', relation: '收藏于' },
    { source: 'artifact_5', target: 'dynasty_3', relation: '创作于' },
    { source: 'artifact_5', target: 'type_1', relation: '类型为' },
    { source: 'artifact_5', target: 'location_2', relation: '出土于' },
  ],
};

// 时间轴数据（涵盖主要中国历史朝代）
const mockTimeline: TimelineData[] = [
  { dynasty: '商朝', period: '约公元前1600–1046年', startYear: -1600, endYear: -1046, count: 180, artifactIds: [] },
  { dynasty: '周朝', period: '约公元前1046–256年', startYear: -1046, endYear: -256, count: 160, artifactIds: [] },
  { dynasty: '秦朝', period: '公元前221–206年', startYear: -221, endYear: -206, count: 85, artifactIds: [] },
  { dynasty: '汉朝', period: '公元前206–公元220年', startYear: -206, endYear: 220, count: 340, artifactIds: [] },
  { dynasty: '唐朝', period: '公元618–907年', startYear: 618, endYear: 907, count: 520, artifactIds: [] },
  { dynasty: '宋朝', period: '公元960–1279年', startYear: 960, endYear: 1279, count: 680, artifactIds: [] },
  { dynasty: '元朝', period: '公元1271–1368年', startYear: 1271, endYear: 1368, count: 290, artifactIds: [] },
  { dynasty: '明朝', period: '公元1368–1644年', startYear: 1368, endYear: 1644, count: 950, artifactIds: [] },
  { dynasty: '清朝', period: '公元1644–1911年', startYear: 1644, endYear: 1911, count: 1820, artifactIds: [] },
];

// 地理分布数据（涵盖主要海外藏中国文物的博物馆）
const mockMuseumLocations: MuseumLocation[] = [
  { name: '芝加哥艺术博物馆', city: '芝加哥', country: '美国', longitude: -87.6236, latitude: 41.8796, collectionCount: 1000 },
  { name: '普林斯顿大学艺术博物馆', city: '普林斯顿', country: '美国', longitude: -74.6554, latitude: 40.3431, collectionCount: 3570 },
  { name: '布鲁克林博物馆', city: '纽约布鲁克林', country: '美国', longitude: -73.9637, latitude: 40.6712, collectionCount: 720 },
  { name: '大都会艺术博物馆', city: '纽约', country: '美国', longitude: -73.9632, latitude: 40.7794, collectionCount: 49 },
  { name: '大英博物馆', city: '伦敦', country: '英国', longitude: -0.1278, latitude: 51.5194, collectionCount: 100 },
  { name: '波士顿美术馆', city: '波士顿', country: '美国', longitude: -71.0940, latitude: 42.3393, collectionCount: 760 },
];

// 可视化服务类
class VisualizationService {
  async getStatistics(): Promise<StatisticsData> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockStatistics), 300);
    });
  }

  async getKnowledgeGraph(_artifactId?: string): Promise<KnowledgeGraphData> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockKnowledgeGraph), 300);
    });
  }

  async getTimeline(dynasty?: string): Promise<TimelineData[]> {
    return new Promise((resolve) => {
      let data = mockTimeline;
      if (dynasty) {
        data = data.filter(item => item.dynasty === dynasty);
      }
      setTimeout(() => resolve(data), 300);
    });
  }

  async getMuseumLocations(): Promise<MuseumLocation[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMuseumLocations), 300);
    });
  }
}

export const visualizationService = new VisualizationService();
