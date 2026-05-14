import type { 
  Artifact, 
  FilterParams, 
  PaginatedResponse, 
  FilterOptions 
} from '@/types/artifact';
import { mockApi } from '@/mock/handlers';

// API Service 接口定义
interface IArtifactService {
  getArtifacts: (params: FilterParams) => Promise<PaginatedResponse<Artifact>>;
  getArtifactById: (id: string) => Promise<Artifact | null>;
  getRelatedArtifacts: (artifactId: string, limit?: number) => Promise<Artifact[]>;
  getFilterOptions: () => Promise<FilterOptions>;
}

// 开发环境使用 Mock API
const isDev = import.meta.env.DEV;

class ArtifactService implements IArtifactService {
  
  async getArtifacts(params: FilterParams): Promise<PaginatedResponse<Artifact>> {
    try {
      // TODO: 后期替换为真实 API 调用
      // const response = await apiClient.get('/artifacts', { params });
      // return response.data;
      
      if (isDev) {
        const result = await mockApi.getArtifacts(params);
        return result;
      }
      
      throw new Error('Production API not configured');
    } catch (error) {
      console.error('[ArtifactService] Failed to fetch artifacts:', error);
      throw error;
    }
  }

  async getArtifactById(id: string): Promise<Artifact | null> {
    try {
      if (!id) {
        throw new Error('Artifact ID is required');
      }

      // TODO: 后期替换为真实 API 调用
      // const response = await apiClient.get(`/artifacts/${id}`);
      // return response.data;
      
      if (isDev) {
        const result = await mockApi.getArtifactById(id);
        return result;
      }
      
      throw new Error('Production API not configured');
    } catch (error) {
      console.error(`[ArtifactService] Failed to fetch artifact ${id}:`, error);
      throw error;
    }
  }

  async getRelatedArtifacts(artifactId: string, limit: number = 6): Promise<Artifact[]> {
    try {
      if (!artifactId) {
        throw new Error('Artifact ID is required for recommendations');
      }

      // TODO: 后期替换为真实 API 调用
      // const response = await apiClient.get(`/artifacts/${artifactId}/recommendations`, {
      //   params: { limit }
      // });
      // return response.data;
      
      if (isDev) {
        const result = await mockApi.getRecommendations(artifactId, limit);
        return result;
      }
      
      throw new Error('Production API not configured');
    } catch (error) {
      console.error(`[ArtifactService] Failed to fetch recommendations for ${artifactId}:`, error);
      throw error;
    }
  }

  async getFilterOptions(): Promise<FilterOptions> {
    try {
      // TODO: 后期替换为真实 API 调用
      // const response = await apiClient.get('/filters/options');
      // return response.data;
      
      if (isDev) {
        const result = await mockApi.getFilterOptions();
        return result;
      }
      
      throw new Error('Production API not configured');
    } catch (error) {
      console.error('[ArtifactService] Failed to fetch filter options:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const artifactService = new ArtifactService();

// 类型导出
export type { IArtifactService };
