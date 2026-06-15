import type {
  Artifact,
  FilterParams,
  PaginatedResponse,
  FilterOptions,
} from '@/types/artifact';

// ===== API 配置 =====
// 文物数据 API: https://se-cs2305.yazs.top (5441条文物, 6个博物馆)
// 开发环境走 Vite 代理 (避免跨域)，生产环境直接请求
const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://se-cs2305.yazs.top/api';
const FETCH_TIMEOUT_MS = 10000;

// Token 存储 key（与 userStore 保持一致）
const AUTH_TOKEN_KEY = 'auth_token';

/** 获取当前存储的认证 token */
function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/** 触发全局 401 未授权事件 */
function triggerUnauthorized(): void {
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));
}

// ===== API Service 接口定义 =====

export interface StatisticsData {
  totalArtifacts: number;
  typeDistribution: { name: string; value: number }[];
  dynastyDistribution: { dynasty: string; count: number }[];
  museumDistribution: { museum: string; count: number }[];
}

export interface AdvancedSearchParams {
  title?: string;
  type?: string;
  museum?: string;
  material?: string;
  location?: string;
  period?: string;
  period_from?: number;
  period_to?: number;
  page?: number;
  page_size?: number;
}

export interface CompareResult {
  artifacts: Artifact[];
  comparison?: Record<string, Record<string, string>>;
}

export interface GraphData {
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    category?: string;
    symbolSize?: number;
  }>;
  links: Array<{
    source: string;
    target: string;
    relation: string;
  }>;
}

export interface TimelineItem {
  dynasty: string;
  period: string;
  startYear: number;
  endYear: number;
  count: number;
  artifactIds: string[];
}

export interface GeoLocation {
  name: string;
  city: string;
  country: string;
  longitude: number;
  latitude: number;
  collectionCount: number;
}

interface IArtifactService {
  getArtifacts: (params: FilterParams) => Promise<PaginatedResponse<Artifact>>;
  getArtifactById: (id: string) => Promise<Artifact | null>;
  getRelatedArtifacts: (artifactId: string, limit?: number) => Promise<Artifact[]>;
  getFilterOptions: () => Promise<FilterOptions>;
  searchArtifacts: (query: string, page?: number, pageSize?: number) => Promise<PaginatedResponse<Artifact>>;
  getStatistics: () => Promise<StatisticsData>;
}

// ===== knowledge-graph-subsystem API 响应类型 =====

interface ApiArtifactListItem {
  id: number | string;
  name: string;
  thumbnail_url: string;
  period: string;
  museum: { name: string; location: string };
  lang?: string;
}

interface ApiListResponse {
  page: number;
  page_size: number;
  total: number;
  data: ApiArtifactListItem[];
  lang?: string;
}

interface ApiI18n {
  title_zh?: string;
  title_en?: string;
  period_zh?: string;
  period_en?: string;
  type_zh?: string;
  type_en?: string;
  material_zh?: string;
  material_en?: string;
  description_zh?: string;
  description_en?: string;
}

interface ApiArtifactDetail {
  id: number | string;
  name: string;
  period: string;
  type: string;
  material: string;
  description: string;
  dimensions: string;
  museum: string;
  location: string;
  detail_url: string;
  image_url: string;
  image_path: string;
  credit_line: string;
  accession_number: string;
  crawl_date: string;
  image_original_url: string;
  image_thumbnail_url: string;
  lang?: string;
  i18n?: ApiI18n;
  related_entities?: Array<{ relation: string; name: string; type: string }>;
}

interface ApiStatsSummary {
  total_artifacts: number;
  top_types: Array<{ name: string; count: number }>;
  top_museums: Array<{ name: string; count: number }>;
  top_periods: Array<{ name: string; count: number }>;
}

interface ApiStatsDistribution {
  total_artifacts: number;
  types: Array<{ name: string; count: number }>;
  museums: Array<{ name: string; count: number }>;
  periods: Array<{ name: string; count: number }>;
  materials?: Array<{ name: string; count: number }>;
}

interface ApiFiltersResponse {
  type?: Array<{ name: string; count: number }>;
  museum?: Array<{ name: string; count: number }>;
  period?: Array<{ name: string; count: number }>;
  material?: Array<{ name: string; count: number }>;
  location?: Array<{ name: string; count: number }>;
}

interface ApiGraphTimelineItem {
  name: string;
  count: number;
}

interface ApiGraphGeoItem {
  name: string;
  location: string;
  count: number;
}

interface ApiGraphTimelineResponse {
  data: ApiGraphTimelineItem[];
  lang?: string;
}

interface ApiGraphGeoResponse {
  data: ApiGraphGeoItem[];
}

interface ApiGraphNeighborNode {
  id: string;
  name: string;
  category: string;
  props?: Record<string, string>;
}

interface ApiGraphNeighborLink {
  source: string;
  target: string;
  relation: string;
}

interface ApiGraphNeighborsResponse {
  nodes: ApiGraphNeighborNode[];
  links: ApiGraphNeighborLink[];
  lang?: string;
}

interface ApiRelatedItem {
  id: number | string;
  name: string;
  thumbnail_url: string;
  period: string;
  museum: { name: string; location: string };
  score?: number;
}

interface ApiRelatedResponse {
  data: ApiRelatedItem[];
}

interface ApiCompareResponse {
  artifacts: ApiArtifactDetail[];
  comparison?: Record<string, Record<string, string>>;
}

// ===== 数据映射函数 =====

function mapListItemToArtifact(item: ApiArtifactListItem): Artifact {
  return {
    id: String(item.id),
    name: item.name || '',
    nameEn: item.name || '',
    era: item.period || '',
    region: item.museum?.name
      ? `${item.museum.name} 藏品`
      : '中国艺术藏品',
    category: '其他',  // 列表接口不返回 type，需详情获取
    material: '',       // 列表接口不返回 material
    dimensions: { height: 0, width: 0 },
    description: '',
    history: '',
    images: item.thumbnail_url
      ? [resolveImageUrl(item.thumbnail_url)]
      : [],
    museum: item.museum?.name || '',
    location: item.museum?.location || '',
    detailUrl: '',
    tags: [
      '中国艺术',
      item.museum?.name || '',
    ].filter(Boolean) as string[],
  };
}

function mapDetailToArtifact(detail: ApiArtifactDetail): Artifact {
  // 优先使用 i18n 中的中文数据
  const i18n = detail.i18n;
  const nameZh = i18n?.title_zh || detail.name || '';
  const nameEn = i18n?.title_en || detail.name || '';
  const periodZh = i18n?.period_zh || detail.period || '';
  const typeZh = i18n?.type_zh || detail.type || '其他';
  const materialZh = i18n?.material_zh || detail.material || '';

  const images: string[] = [];
  // 只保留不同来源的图片，避免重复
  if (detail.image_url && (detail.image_url.startsWith('http://') || detail.image_url.startsWith('https://'))) {
    images.push(detail.image_url);
  }
  // image_original_url 和 image_thumbnail_url 指向同一张图，只保留 original
  if (detail.image_original_url) {
    const resolved = resolveImageUrl(detail.image_original_url);
    if (!images.includes(resolved)) images.push(resolved);
  }

  return {
    id: String(detail.id),
    name: nameZh,
    nameEn: nameEn !== nameZh ? nameEn : '',
    era: periodZh,
    region: detail.museum
      ? `${detail.museum} 藏品`
      : '中国艺术藏品',
    category: typeZh,
    material: materialZh,
    dimensions: parseDimensionString(detail.dimensions),
    description: i18n?.description_zh || detail.description || '',
    history: detail.credit_line || '',
    images,
    museum: detail.museum || '',
    location: detail.location || '',
    detailUrl: detail.detail_url || '',
    tags: [
      typeZh,
      '中国艺术',
      detail.museum,
      ...extractPeriodTags(periodZh),
    ].filter(Boolean) as string[],
  };
}

function parseDimensionString(dimStr: string): { height: number; width: number; depth?: number } {
  const result: { height: number; width: number; depth?: number } = { height: 0, width: 0 };
  if (!dimStr) return result;

  const hMatch = dimStr.match(/H:?\s*([\d.]+)/i);
  const wMatch = dimStr.match(/W:?\s*([\d.]+)/i);
  const dMatch = dimStr.match(/D:?\s*([\d.]+)/i);

  if (hMatch) result.height = parseFloat(hMatch[1]);
  if (wMatch) result.width = parseFloat(wMatch[1]);
  if (dMatch) result.depth = parseFloat(dMatch[1]);

  if (result.height === 0 && result.width === 0) {
    const cmPart = dimStr.split('(')[0] || dimStr;
    const numbers = cmPart.match(/[\d]+\.?[\d]*/g);
    if (numbers) {
      const nums = numbers.map(Number);
      if (nums.length >= 3) {
        result.height = nums[0];
        result.width = nums[1];
        result.depth = nums[2];
      } else if (nums.length === 2) {
        result.height = Math.max(nums[0], nums[1]);
        result.width = Math.min(nums[0], nums[1]);
      } else if (nums.length === 1) {
        result.height = nums[0];
        result.width = nums[0];
      }
    }
  }
  return result;
}

function extractPeriodTags(period: string): string[] {
  const tags: string[] = [];
  if (!period) return tags;
  // 中文朝代
  const zhMatch = period.match(/([^\s]+朝)/);
  if (zhMatch) tags.push(zhMatch[1]);
  // 英文朝代
  const enMatch = period.match(/([A-Z][a-z]+)\s+(dynasty|Dynasty)/);
  if (enMatch) tags.push(enMatch[1] + ' Dynasty');
  return tags;
}

function resolveImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // API 相对路径（如 /api/images/123/original）
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${url}`;
}

// ===== 真实 API 服务实现 =====

class RealApiService {
  private async fetch<T>(endpoint: string, params?: Record<string, string>, init?: RequestInit): Promise<T> {
    const base = API_BASE_URL.startsWith('http') ? undefined : window.location.origin;
    const url = new URL(`${API_BASE_URL}${endpoint}`, base);

    url.searchParams.set('lang', 'zh');
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value);
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      // 构建请求头，附加认证 token
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string> || {}),
      };
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url.toString(), {
        headers,
        signal: controller.signal,
        ...init,
      });

      // 401 未授权 — 触发全局事件，通知用户重新登录
      if (response.status === 401) {
        triggerUnauthorized();
        throw new Error('未登录或登录已过期，请重新登录');
      }

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (contentType.startsWith('image/')) {
        const blob = await response.blob();
        return URL.createObjectURL(blob) as unknown as T;
      }
      return response.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`请求超时 (${FETCH_TIMEOUT_MS / 1000}s): ${url.toString()}`);
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ===== 文物 CRUD =====

  async getArtifacts(params: FilterParams): Promise<PaginatedResponse<Artifact>> {
    const queryParams: Record<string, string> = {
      page: String(params.page),
      page_size: String(params.size),
      sort_by: params.sortBy || 'name',
      order: params.sortOrder || 'asc',
    };

    // Only pass filters that the API actually supports (type, museum)
    if (params.category && params.category !== 'all') queryParams.type = params.category;
    if (params.museum && params.museum !== 'all') queryParams.museum = params.museum;
    // era, material are filtered client-side (API ignores these params); location/region not supported
    if (params.search && params.search.trim()) {
      return this.searchArtifacts(params.search, params.page, params.size);
    }

    const response = await this.fetch<ApiListResponse>('/artifacts', queryParams);
    return {
      code: 200,
      data: (response.data || []).map(mapListItemToArtifact),
      total: response.total || 0,
      page: response.page || params.page,
      size: response.page_size || params.size,
    };
  }

  async getArtifactById(id: string): Promise<Artifact | null> {
    try {
      const detail = await this.fetch<ApiArtifactDetail>(`/artifacts/${id}`);
      if (!detail || !detail.name) return null;
      return mapDetailToArtifact(detail);
    } catch (error) {
      console.error(`[RealApi] Failed to fetch artifact ${id}:`, error);
      return null;
    }
  }

  async getArtifactProperty(id: string, prop: string): Promise<string> {
    try {
      const result = await this.fetch<{ id: string; prop: string; value: string }>(
        `/artifacts/${id}/property`, { prop }
      );
      return result?.value || '';
    } catch {
      return '';
    }
  }

  // ===== 搜索 =====

  async searchArtifacts(query: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Artifact>> {
    const response = await this.fetch<ApiListResponse>('/search', {
      q: query,
      page: String(page),
      page_size: String(pageSize),
    });
    return {
      code: 200,
      data: (response.data || []).map(mapListItemToArtifact),
      total: response.total || 0,
      page: response.page || page,
      size: response.page_size || pageSize,
    };
  }

  async advancedSearch(params: AdvancedSearchParams): Promise<PaginatedResponse<Artifact>> {
    const queryParams: Record<string, string> = {
      page: String(params.page || 1),
      page_size: String(params.page_size || 20),
    };
    if (params.title) queryParams.title = params.title;
    if (params.type) queryParams.type = params.type;
    if (params.museum) queryParams.museum = params.museum;
    if (params.material) queryParams.material = params.material;
    if (params.location) queryParams.location = params.location;
    if (params.period) queryParams.period = params.period;
    if (params.period_from !== undefined) queryParams.period_from = String(params.period_from);
    if (params.period_to !== undefined) queryParams.period_to = String(params.period_to);

    const response = await this.fetch<ApiListResponse>('/search/advanced', queryParams);
    return {
      code: 200,
      data: (response.data || []).map(mapListItemToArtifact),
      total: response.total || 0,
      page: response.page || (params.page || 1),
      size: response.page_size || (params.page_size || 20),
    };
  }

  async exportSearch(params: { q?: string; type?: string; museum?: string; period?: string; format?: 'csv' | 'json' }): Promise<Blob> {
    const queryParams: Record<string, string> = {
      format: params.format || 'json',
      limit: '1000',
    };
    if (params.q) queryParams.q = params.q;
    if (params.type) queryParams.type = params.type;
    if (params.museum) queryParams.museum = params.museum;
    if (params.period) queryParams.period = params.period;

    const url = new URL(`${API_BASE_URL}/search/export`, API_BASE_URL.startsWith('http') ? undefined : window.location.origin);
    url.searchParams.set('lang', 'zh');
    Object.entries(queryParams).forEach(([k, v]) => url.searchParams.append(k, v));

    const response = await fetch(url.toString(), {
      headers: (() => {
        const h: Record<string, string> = {};
        const t = getAuthToken();
        if (t) h['Authorization'] = `Bearer ${t}`;
        return h;
      })(),
    });
    return response.blob();
  }

  async getFilterOptions(): Promise<FilterOptions> {
    try {
      const filters = await this.fetch<ApiFiltersResponse>('/filters', { top: '50' });

      // Map dynasty names: English dynasty name → Chinese display label
      // Pattern: match period values like "Qing dynasty (c. 1644)" or "汉朝（公元前206年）"
      const DYNASTY_DEFS: { key: string; label: string; patterns: RegExp[] }[] = [
        { key: 'Qing dynasty', label: '清朝', patterns: [/Qing dynasty/i, /清朝/] },
        { key: 'Ming dynasty', label: '明朝', patterns: [/Ming dynasty/i, /明朝/] },
        { key: 'Tang dynasty', label: '唐朝', patterns: [/Tang dynasty/i, /唐朝/] },
        { key: 'Song dynasty', label: '宋朝', patterns: [/Song dynasty/i, /宋朝/] },
        { key: 'Han dynasty',  label: '汉朝', patterns: [/Han dynasty/i, /汉朝/] },
        { key: 'Yuan dynasty', label: '元朝', patterns: [/Yuan dynasty/i, /元朝/] },
        { key: 'Zhou dynasty', label: '周朝', patterns: [/Zhou dynasty/i, /周朝/] },
        { key: 'Shang dynasty', label: '商朝', patterns: [/Shang dynasty/i, /商朝/] },
        { key: 'Qin dynasty',  label: '秦朝', patterns: [/Qin dynasty/i, /秦朝/] },
      ];

      const dynastyCounts: Record<string, number> = {};
      (filters.period || []).forEach(p => {
        for (const def of DYNASTY_DEFS) {
          if (def.patterns.some(pat => pat.test(p.name))) {
            dynastyCounts[def.key] = (dynastyCounts[def.key] || 0) + p.count;
            break;
          }
        }
      });

      const eraOptions = Object.entries(dynastyCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([key, count]) => {
          const def = DYNASTY_DEFS.find(d => d.key === key)!;
          return { key, label: def.label, count };
        });

      return {
        regions: (filters.location || []).map(l => ({ value: l.name, label: l.name, count: l.count })),
        categories: (filters.type || []).map(t => ({ value: t.name, label: t.name, count: t.count })),
        materials: (filters.material || []).map(m => ({ value: m.name, label: m.name, count: m.count })),
        museums: (filters.museum || []).map(m => ({ value: m.name, label: m.name, count: m.count })),
        eras: eraOptions.map(e => ({ value: e.key, label: e.label, count: e.count })),
      };
    } catch {
      // API 不可用，返回空选项
      return { regions: [], categories: [], materials: [], museums: [], eras: [] };
    }
  }

  // ===== 统计 =====

  async getStatsSummary(): Promise<ApiStatsSummary> {
    return this.fetch<ApiStatsSummary>('/stats/summary');
  }

  async getStatsDistribution(): Promise<StatisticsData> {
    try {
      const dist = await this.fetch<ApiStatsDistribution>('/stats/distribution');
      return {
        totalArtifacts: dist.total_artifacts || 0,
        typeDistribution: (dist.types || []).map(t => ({ name: t.name, value: t.count })),
        dynastyDistribution: (dist.periods || []).map(p => ({ dynasty: p.name, count: p.count })),
        museumDistribution: (dist.museums || []).map(m => ({ museum: m.name, count: m.count })),
      };
    } catch {
      // fallback to summary
      return this.getStatistics();
    }
  }

  async getStatistics(): Promise<StatisticsData> {
    const stats = await this.fetch<ApiStatsSummary>('/stats/summary');
    return {
      totalArtifacts: stats.total_artifacts || 0,
      typeDistribution: (stats.top_types || []).map(t => ({ name: t.name, value: t.count })),
      dynastyDistribution: (stats.top_periods || []).map(p => ({ dynasty: p.name, count: p.count })),
      museumDistribution: (stats.top_museums || []).map(m => ({ museum: m.name, count: m.count })),
    };
  }

  // ===== 推荐与对比 =====

  async getRelatedArtifacts(artifactId: string, limit: number = 6, strategy: string = 'mixed'): Promise<Artifact[]> {
    try {
      const response = await this.fetch<ApiRelatedResponse>(
        `/artifacts/${artifactId}/related`,
        { top_k: String(limit), strategy }
      );
      return (response.data || []).map(mapListItemToArtifact);
    } catch {
      return [];
    }
  }

  async compareArtifacts(ids: string[]): Promise<CompareResult> {
    try {
      const response = await this.fetch<ApiCompareResponse>('/artifacts/compare', {}, {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
      return {
        artifacts: (response.artifacts || []).map(mapDetailToArtifact),
        comparison: response.comparison,
      };
    } catch {
      return { artifacts: [] };
    }
  }

  // ===== 知识图谱 =====

 async getGraphNeighbors(objectId: string, depth: number = 1, limit: number = 50): Promise<GraphData> {
    try {
        const response = await this.fetch<ApiGraphNeighborsResponse>(
            `/graph/neighbors/${objectId}`,
            { depth: String(depth), limit: String(limit) }
        );

        const nodes = (response.nodes || []).map(n => {
            let imageUrl = '';
            if (n.props && n.props.image_url) {
                imageUrl = n.props.image_url;
            }
            return {
                id: n.id,
                name: n.name,
                type: n.category,
                category: n.category,
                symbolSize: n.category === 'Artifact' ? 50 : n.category === 'Museum' ? 40 : 30,
                imageUrl: imageUrl,  // ← 必须要有这一行
            };
        });

        return {
            nodes: nodes,
            links: (response.links || []).map(l => ({
                source: l.source,
                target: l.target,
                relation: l.relation,
            })),
        };
    } catch (error) {
        console.error('Failed to fetch graph neighbors:', error);
        return { nodes: [], links: [] };
    }
}

  async getGraphTimeline(topPeriods: number = 20): Promise<TimelineItem[]> {
    try {
      const response = await this.fetch<ApiGraphTimelineResponse>('/graph/timeline', {
        top_periods: String(topPeriods),
      });
      const items = response.data || [];

      // 年代映射
      const yearMap: Record<string, { startYear: number; endYear: number }> = {
        '商朝': { startYear: -1600, endYear: -1046 },
        '周朝': { startYear: -1046, endYear: -256 },
        '秦朝': { startYear: -221, endYear: -206 },
        '汉朝': { startYear: -206, endYear: 220 },
        '唐朝': { startYear: 618, endYear: 907 },
        '宋朝': { startYear: 960, endYear: 1279 },
        '元朝': { startYear: 1271, endYear: 1368 },
        '明朝': { startYear: 1368, endYear: 1644 },
        '清朝': { startYear: 1644, endYear: 1911 },
      };

      return items.map(item => {
        const years = yearMap[item.name] || { startYear: 0, endYear: 0 };
        return {
          dynasty: item.name,
          period: item.name,
          startYear: years.startYear,
          endYear: years.endYear,
          count: item.count,
          artifactIds: [],
        };
      });
    } catch {
      return [];
    }
  }

  async getGraphGeo(): Promise<GeoLocation[]> {
    try {
      const response = await this.fetch<ApiGraphGeoResponse>('/graph/geo');
      const items = response.data || [];

      const coordMap: Record<string, { city: string; country: string; lat: number; lng: number }> = {
        'Art Institute of Chicago': { city: '芝加哥', country: '美国', lat: 41.8796, lng: -87.6236 },
        'Princeton University Art Museum': { city: '普林斯顿', country: '美国', lat: 40.3431, lng: -74.6554 },
        'Brooklyn Museum': { city: '布鲁克林', country: '美国', lat: 40.6712, lng: -73.9637 },
        'British Museum': { city: '伦敦', country: '英国', lat: 51.5194, lng: -0.1278 },
        'Metropolitan Museum of Art': { city: '纽约', country: '美国', lat: 40.7794, lng: -73.9632 },
        'Brooklyn Botanic Garden': { city: '布鲁克林', country: '美国', lat: 40.6694, lng: -73.9632 },
      };

      return items.map(item => {
        const coord = coordMap[item.name] || {
          city: item.location?.split(',')[0] || '',
          country: item.location?.split(',')[1]?.trim() || item.location || '',
          lat: 0, lng: 0,
        };
        return {
          name: item.name,
          city: coord.city,
          country: coord.country,
          longitude: coord.lng,
          latitude: coord.lat,
          collectionCount: item.count,
        };
      });
    } catch {
      return [];
    }
  }

  async getGraphPath(src: string, dst: string, maxDepth: number = 4): Promise<GraphData> {
    try {
      return await this.fetch<GraphData>('/graph/path', {
        src, dst, max_depth: String(maxDepth),
      });
    } catch {
      return { nodes: [], links: [] };
    }
  }

  // ===== 图片搜索 =====

  async searchByImage(file: File, topK: number = 20): Promise<Artifact[]> {
    const formData = new FormData();
    formData.append('file', file);

    const url = new URL(`${API_BASE_URL}/image-search`, API_BASE_URL.startsWith('http') ? undefined : window.location.origin);
    url.searchParams.set('lang', 'zh');
    url.searchParams.set('top_k', String(topK));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      // 附加认证 token
      const imgHeaders: Record<string, string> = {};
      const imgToken = getAuthToken();
      if (imgToken) {
        imgHeaders['Authorization'] = `Bearer ${imgToken}`;
      }
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: imgHeaders,
        body: formData,
        signal: controller.signal,
      });
      if (!response.ok) return [];
      const data = await response.json() as ApiListResponse;
      return (data.data || []).map(mapListItemToArtifact);
    } catch {
      return [];
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async searchByImageText(text: string, topK: number = 20): Promise<Artifact[]> {
    try {
      const url = new URL(`${API_BASE_URL}/image-search/text`, API_BASE_URL.startsWith('http') ? undefined : window.location.origin);
      url.searchParams.set('lang', 'zh');
      url.searchParams.set('top_k', String(topK));

      // 附加认证 token
      const txtHeaders: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      const txtToken = getAuthToken();
      if (txtToken) {
        txtHeaders['Authorization'] = `Bearer ${txtToken}`;
      }
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: txtHeaders,
        body: new URLSearchParams({ text }),
      });
      if (!response.ok) return [];
      const data = await response.json() as ApiListResponse;
      return (data.data || []).map(mapListItemToArtifact);
    } catch {
      return [];
    }
  }

  async searchSimilarById(objectId: string, topK: number = 10): Promise<Artifact[]> {
    try {
      const response = await this.fetch<ApiListResponse>(`/image-search/by-id/${objectId}`, {
        top_k: String(topK),
      });
      return (response.data || []).map(mapListItemToArtifact);
    } catch {
      return [];
    }
  }

  // ===== QA =====

  async qaQuery(intent: string, params: Record<string, string>): Promise<unknown> {
    return this.fetch('/qa/query', {}, {
      method: 'POST',
      body: JSON.stringify({ intent, params }),
    });
  }

  async qaIntents(): Promise<string[]> {
    try {
      const result = await this.fetch<{ intents: string[] }>('/qa/intents');
      return result?.intents || [];
    } catch {
      return [];
    }
  }

  async qaGrounding(objectId: string): Promise<Record<string, unknown>> {
    return this.fetch(`/qa/grounding/${objectId}`);
  }

  // ===== 健康检查 =====

  async healthCheck(): Promise<boolean> {
    try {
      await this.fetch('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// ===== ArtifactService 统一入口 =====

class ArtifactService implements IArtifactService {
  realApi: RealApiService = new RealApiService();

  async getArtifacts(params: FilterParams): Promise<PaginatedResponse<Artifact>> {
    return this.realApi.getArtifacts(params);
  }

  async getArtifactById(id: string): Promise<Artifact | null> {
    if (!id) throw new Error('Artifact ID is required');
    return this.realApi.getArtifactById(id);
  }

  async getRelatedArtifacts(artifactId: string, limit: number = 6): Promise<Artifact[]> {
    if (!artifactId) throw new Error('Artifact ID is required');
    return this.realApi.getRelatedArtifacts(artifactId, limit);
  }

  async getFilterOptions(): Promise<FilterOptions> {
    return this.realApi.getFilterOptions();
  }

  async searchArtifacts(query: string, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Artifact>> {
    const trimmed = query.trim();
    if (!trimmed) {
      return { code: 200, data: [], total: 0, page: 1, size: pageSize };
    }
    return this.realApi.searchArtifacts(trimmed, page, pageSize);
  }

  async advancedSearch(params: AdvancedSearchParams): Promise<PaginatedResponse<Artifact>> {
    return this.realApi.advancedSearch(params);
  }

  async getStatistics(): Promise<StatisticsData> {
    return this.realApi.getStatsDistribution();
  }

  async compareArtifacts(ids: string[]): Promise<CompareResult> {
    if (ids.length < 2) return { artifacts: [] };
    return this.realApi.compareArtifacts(ids);
  }

  async exportSearch(params: { q?: string; type?: string; museum?: string; period?: string; format?: 'csv' | 'json' }): Promise<Blob | null> {
    return this.realApi.exportSearch(params);
  }

  async healthCheck(): Promise<boolean> {
    return this.realApi.healthCheck();
  }
}

// 导出单例实例
export const artifactService = new ArtifactService();

// 导出 RealApiService 实例供 visualizationService 直接使用
export const realApiService = artifactService.realApi;

// 类型导出
export type { IArtifactService };
