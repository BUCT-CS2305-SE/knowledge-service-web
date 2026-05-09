import type { Artifact, FilterParams, PaginatedResponse, FilterOptions } from '@/types/artifact';
import { artifacts } from './data/artifacts';
import { regions } from './data/regions';
import { categories } from './data/categories';
import { materials } from './data/materials';
import { museums } from './data/museums';

const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

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
        // Simulate date added by ID order (newer IDs are "added" later)
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
        
        // Same region/civilization
        if (artifact.region === currentArtifact.region) score += 3;
        // Same category/type
        if (artifact.category === currentArtifact.category) score += 2.5;
        // Same material
        if (artifact.material === currentArtifact.material) score += 2;
        // Same era/dynasty
        if (artifact.era.split(/[公元前年]/)[0] === currentArtifact.era.split(/[公元前年]/)[0]) score += 2.5;
        // Same museum
        if (artifact.museum === currentArtifact.museum && currentArtifact.museum) score += 1.5;
        
        // Tag matching
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

  searchArtifacts: async (query: string): Promise<Artifact[]> => {
    await delay(Math.random() * 150 + 80);
    
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase();
    return artifacts.filter(artifact =>
      artifact.name.toLowerCase().includes(queryLower) ||
      artifact.nameEn?.toLowerCase().includes(queryLower) ||
      artifact.tags.some(tag => tag.toLowerCase().includes(queryLower))
    ).slice(0, 10);
  }
};

export default mockApi;
