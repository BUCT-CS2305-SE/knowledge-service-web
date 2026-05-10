import type { Artifact, FilterParams, PaginatedResponse, FilterOptions } from '@/types/artifact';
import { artifacts } from './data/artifacts';
import { regions } from './data/regions';
import { categories } from './data/categories';
import { materials } from './data/materials';
import { museums } from './data/museums';

const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// ===== 查询模块新增类型 =====
export interface AdvancedSearchParams {
  category?: string;
  materials?: string[];
  museum?: string;
  region?: string;
  keyword?: string;
}

export const mockApi = {
  getArtifacts: async (params: FilterParams): Promise<PaginatedResponse<Artifact>> => {
    await delay(Math.random() * 300 + 200);
    
    let filtered = [...artifacts];
    
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(artifact => 
        artifact.name.toLowerCase().includes(searchLower) ||
        artifact.nameEn?.toLowerCase().includes(searchLower) ||
        artifact.description.toLowerCase().includes(searchLower) ||
        artifact.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (params.region && params.region !== 'all') {
      filtered = filtered.filter(artifact => artifact.region === params.region);
    }
    
    if (params.category && params.category !== 'all') {
      filtered = filtered.filter(artifact => artifact.category === params.category);
    }
    
    if (params.material && params.material !== 'all') {
      filtered = filtered.filter(artifact => artifact.material === params.material);
    }
    
    if (params.era && params.era !== 'all') {
      filtered = filtered.filter(artifact => artifact.era.includes(params.era!));
    }
    
    if (params.museum && params.museum !== 'all') {
      filtered = filtered.filter(artifact => 
        artifact.museum?.toLowerCase().includes(params.museum!.toLowerCase())
      );
    }
    
    if (params.sortBy) {
      if (params.sortBy === 'dateAdded') {
        filtered.sort((a, b) => {
          const comparison = a.id.localeCompare(b.id);
          return params.sortOrder === 'desc' ? -comparison : comparison;
        });
      } else {
        filtered.sort((a, b) => {
          const aValue = a[params.sortBy!] as string;
          const bValue = b[params.sortBy!] as string;
          const comparison = aValue.localeCompare(bValue);
          return params.sortOrder === 'desc' ? -comparison : comparison;
        });
      }
    }
    
    const total = filtered.length;
    const start = (params.page - 1) * params.size;
    const paginatedData = filtered.slice(start, start + params.size);
    
    return {
      code: 200,
      data: paginatedData,
      total,
      page: params.page,
      size: params.size
    };
  },

  getArtifactById: async (id: string): Promise<Artifact | null> => {
    await delay(Math.random() * 200 + 100);
    
    const artifact = artifacts.find(a => a.id === id);
    return artifact || null;
  },

  getRecommendations: async (artifactId: string, limit: number = 6): Promise<Artifact[]> => {
    await delay(Math.random() * 150 + 100);
    
    const currentArtifact = artifacts.find(a => a.id === artifactId);
    if (!currentArtifact) return [];
    
    const scored = artifacts
      .filter(a => a.id !== artifactId)
      .map(artifact => {
        let score = 0;
        
        if (artifact.region === currentArtifact.region) score += 3;
        if (artifact.category === currentArtifact.category) score += 2.5;
        if (artifact.material === currentArtifact.material) score += 2;
        if (artifact.era.split(/[公元前年]/)[0] === currentArtifact.era.split(/[公元前年]/)[0]) score += 2.5;
        if (artifact.museum === currentArtifact.museum && currentArtifact.museum) score += 1.5;
        
        const commonTags = artifact.tags.filter(tag => 
          currentArtifact.tags.includes(tag)
        );
        score += commonTags.length * 1.5;
        
        return { artifact, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.artifact);
    
    return scored;
  },

  getFilterOptions: async (): Promise<FilterOptions> => {
    await delay(50);
    
    return {
      regions,
      categories,
      materials,
      museums,
      eras: [
        { value: 'ancient', label: '古代（公元前）' },
        { value: 'medieval', label: '中世纪' },
        { value: 'renaissance', label: '文艺复兴' },
        { value: 'modern', label: '近现代' },
      ]
    };
  },

  // 同事原有的简单搜索（保留）
  searchArtifacts: async (query: string): Promise<Artifact[]> => {
    await delay(Math.random() * 150 + 80);
    
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase();
    return artifacts.filter(artifact =>
      artifact.name.toLowerCase().includes(queryLower) ||
      artifact.nameEn?.toLowerCase().includes(queryLower) ||
      artifact.tags.some(tag => tag.toLowerCase().includes(queryLower))
    ).slice(0, 10);
  },

  // ==================== 查询模块新增方法 ====================

  /**
   * 全文搜索（搜索所有字段）
   */
  fullTextSearch: async (keyword: string): Promise<Artifact[]> => {
    await delay(300);
    const keywordLower = keyword.toLowerCase().trim();
    if (!keywordLower) return [];

    return artifacts.filter(artifact => {
      const searchFields = [
        artifact.name,
        artifact.nameEn,
        artifact.era,
        artifact.region,
        artifact.museum,
        artifact.description,
        artifact.category,
        artifact.material,
        ...artifact.tags,
      ].filter(Boolean) as string[];

      return searchFields.some(field =>
        field.toLowerCase().includes(keywordLower)
      );
    });
  },

  /**
   * 高级查询：多字段组合（模糊匹配版）
   */
  advancedSearch: async (params: AdvancedSearchParams): Promise<Artifact[]> => {
    await delay(500);

    return artifacts.filter(artifact => {
      const conditions: boolean[] = [];

      // 关键词（在名称和描述中搜索）
      if (params.keyword && params.keyword.trim()) {
        const kw = params.keyword.toLowerCase();
        conditions.push(
          artifact.name.toLowerCase().includes(kw) ||
          artifact.description.toLowerCase().includes(kw)
        );
      }

      // 文物类型（模糊匹配）
      if (params.category && params.category.trim()) {
        conditions.push(
          artifact.category.toLowerCase().includes(params.category.toLowerCase())
        );
      }

      // 材质（多选，模糊匹配）
      if (params.materials && params.materials.length > 0) {
        const match = params.materials.some(m =>
          artifact.material.toLowerCase().includes(m.toLowerCase())
        );
        conditions.push(match);
      }

      // 收藏博物馆（模糊匹配）
      if (params.museum && params.museum.trim()) {
        conditions.push(
          (artifact.museum || '').toLowerCase().includes(params.museum.toLowerCase())
        );
      }

      // 地区/文明（模糊匹配）
      if (params.region && params.region.trim()) {
        conditions.push(
          artifact.region.toLowerCase().includes(params.region.toLowerCase())
        );
      }

      return conditions.every(Boolean);
    });
  },

  /**
   * 知识图谱查询入口
   */
  knowledgeGraphQuery: async (query: {
    naturalLanguage?: string;
    structured?: Record<string, string>;
  }): Promise<{
    results: Artifact[];
    entities: string[];
    relations: Array<{ from: string; relation: string; to: string }>;
  }> => {
    await delay(600);

    if (query.naturalLanguage) {
      return mockApi.parseNaturalLanguage(query.naturalLanguage);
    }
    if (query.structured) {
      return mockApi.executeStructuredQuery(query.structured);
    }
    return { results: [], entities: [], relations: [] };
  },

  /**
   * 自然语言解析
   */
  parseNaturalLanguage: async (text: string): Promise<{
    results: Artifact[];
    entities: string[];
    relations: Array<{ from: string; relation: string; to: string }>;
  }> => {
    const result: {
      results: Artifact[];
      entities: string[];
      relations: Array<{ from: string; relation: string; to: string }>;
    } = {
      results: [],
      entities: [],
      relations: [],
    };

    const lowerText = text.toLowerCase();

    // 匹配材质
    const materialList = ['瓷器', '青铜', '石材', '黄金', '玉器', '陶器', '陶土', '绘画', '银器', '木器', '铜', '大理石'];
    for (const mat of materialList) {
      if (lowerText.includes(mat)) {
        result.entities.push(mat);
        result.results = artifacts.filter(a =>
          a.material?.includes(mat) || a.category?.includes(mat)
        );
        break;
      }
    }

    // 匹配朝代
    const dynasties = ['商', '周', '秦', '汉', '唐', '宋', '元', '明', '清', '春秋', '战国', '北魏'];
    for (const dynasty of dynasties) {
      if (text.includes(dynasty)) {
        const dynastyName = dynasty.length === 1 ? dynasty + '朝' : dynasty;
        result.entities.push(dynastyName);
        const matchedResults = artifacts.filter(a =>
          a.era?.includes(dynasty) || a.description?.includes(dynasty)
        );
        if (matchedResults.length > 0) {
          result.results = matchedResults;
          break;
        }
      }
    }

    // 匹配地区/文明
    const regionList = ['埃及', '希腊', '罗马', '中国', '日本', '印度', '巴比伦', '玛雅', '波斯', '英国', '美国', '意大利', '蜀'];
    for (const region of regionList) {
      if (lowerText.includes(region)) {
        result.entities.push(region);
        const matchedResults = artifacts.filter(a =>
          a.region?.includes(region) || a.name?.includes(region) || a.description?.includes(region)
        );
        if (matchedResults.length > 0) {
          result.results = matchedResults;
          break;
        }
      }
    }

    // 匹配博物馆
    if (lowerText.includes('博物馆')) {
      const idx = text.indexOf('博物馆');
      if (idx > 0) {
        const museumName = text.substring(0, idx).trim();
        if (museumName.length > 0 && museumName.length < 15) {
          result.entities.push(museumName + '博物馆');
          result.results = artifacts.filter(a =>
            (a.museum || '').toLowerCase().includes(museumName.toLowerCase())
          );
        }
      }
    }

    // 匹配"相关文物"类查询
    if (lowerText.includes('相关') || lowerText.includes('类似')) {
      const nameMatch = text.match(/与(.+?)相关/);
      if (nameMatch) {
        const artifactName = nameMatch[1].trim();
        result.entities.push(artifactName);
        const targetArtifact = artifacts.find(a =>
          a.name.toLowerCase().includes(artifactName.toLowerCase())
        );
        if (targetArtifact) {
          result.results = await mockApi.getRecommendations(targetArtifact.id, 6);
        }
      }
    }

    // 如果以上都没匹配到，做全文搜索
    if (result.results.length === 0) {
      result.results = artifacts.filter(a => {
        const searchFields = ['name', 'description', 'era', 'region', 'museum', 'category', 'material'];
        return searchFields.some(key => {
          const val = (a as any)[key] as string | undefined;
          return val?.toLowerCase().includes(lowerText);
        });
      });
      if (result.results.length > 0) {
        result.entities.push('全文匹配');
      }
    }

    // 生成关系数据
    if (result.results.length > 0) {
      const firstResult = result.results[0];
      result.relations = result.results.slice(1, 5).map(r => ({
        from: firstResult.name,
        relation: getRelation(firstResult, r),
        to: r.name,
      }));
    }

    return result;
  },

  /**
   * 结构化查询
   */
  executeStructuredQuery: async (query: Record<string, string>): Promise<{
    results: Artifact[];
    entities: string[];
    relations: Array<{ from: string; relation: string; to: string }>;
  }> => {
    const results = artifacts.filter(artifact => {
      if (query.entityType === 'artifact' && query.entityName) {
        return artifact.name?.toLowerCase().includes(query.entityName.toLowerCase());
      }
      if (query.entityType === 'region' && query.entityName) {
        return artifact.region?.toLowerCase().includes(query.entityName.toLowerCase());
      }
      if (query.entityType === 'material' && query.entityName) {
        return artifact.material?.toLowerCase().includes(query.entityName.toLowerCase());
      }
      if (query.entityType === 'category' && query.entityName) {
        return artifact.category?.toLowerCase().includes(query.entityName.toLowerCase());
      }
      return true;
    });

    return {
      results,
      entities: query.entityName ? [query.entityName] : [],
      relations: results.slice(1, 5).map(r => ({
        from: query.entityName || '',
        relation: query.relationType || 'related_to',
        to: r.name,
      })),
    };
  },
};

/**
 * 判断两个文物之间的关系类型
 */
function getRelation(a: Artifact, b: Artifact): string {
  const relations: string[] = [];
  if (a.region === b.region) relations.push('同一地区');
  if (a.category === b.category) relations.push('同一类型');
  if (a.material === b.material) relations.push('相同材质');
  if (a.museum === b.museum) relations.push('同一博物馆');
  return relations.length > 0 ? relations[0] : '相关文物';
}

export default mockApi;