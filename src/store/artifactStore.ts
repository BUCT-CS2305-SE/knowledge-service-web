import { create } from 'zustand';
import type { Artifact, FilterParams } from '@/types/artifact';
import type { ViewMode, SortOption, FilterState } from '@/types/filter';
import { artifactService } from '@/services/artifactService';

interface ArtifactStore {
  // State
  artifacts: Artifact[];
  currentArtifact: Artifact | null;
  recommendations: Artifact[];
  total: number;
  
  // UI State
  viewMode: ViewMode;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  
  // Filter State
  filters: FilterState;
  
  // Compare State
  compareList: Artifact[];
  
  // Loading states
  loading: boolean;
  error: string | null;

  // Actions - Artifacts
  fetchArtifacts: () => Promise<void>;
  fetchArtifactById: (id: string) => Promise<void>;
  fetchRecommendations: (id: string) => Promise<void>;
  
  // Actions - UI
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (option: SortOption) => void;
  toggleSortOrder: () => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  
  // Actions - Filters
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  clearFilter: <K extends keyof FilterState>(key: K) => void;
  
  // Actions - Compare
  addToCompare: (artifact: Artifact) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const initialFilters: FilterState = {
  region: null,
  category: null,
  material: null,
  era: null,
  museum: null,
  search: '',
};

export const useArtifactStore = create<ArtifactStore>((set, get) => ({
  // Initial State
  artifacts: [],
  currentArtifact: null,
  recommendations: [],
  total: 0,
  
  viewMode: 'card',
  sortBy: 'name' as const,
  sortOrder: 'asc',
  currentPage: 1,
  pageSize: 12,
  searchQuery: '',
  
  filters: { ...initialFilters },
  compareList: [],
  
  loading: false,
  error: null,

  // Fetch Artifacts with filters and pagination
  fetchArtifacts: async () => {
    const { filters, currentPage, pageSize, sortBy, sortOrder, searchQuery } = get();

    try {
      set({ loading: true, error: null });

      // API ignores period param — apply era client-side
      const needsClientFilter = (filters.era && filters.era !== 'all');

      // Fetch larger batch when client-side filtering so we have enough data
      const fetchSize = needsClientFilter ? 200 : pageSize;
      const fetchPage = needsClientFilter ? 1 : currentPage;

      const params: FilterParams = {
        page: fetchPage,
        size: fetchSize,
        sortBy,
        sortOrder,
        search: searchQuery || undefined,
      };

      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.museum && filters.museum !== 'all') {
        params.museum = filters.museum;
      }
      // era is NOT passed to API — filtered client-side below

      const response = await artifactService.getArtifacts(params);

      let filteredData = response.data;

      // Client-side era filter: match dynasty in period field (handles mixed EN/ZH)
      if (filters.era && filters.era !== 'all') {
        const eraValue = filters.era;
        // Map English dynasty keys to Chinese equivalents for matching
        const ZH_MAP: Record<string, string> = {
          'Qing dynasty': '清朝', 'Ming dynasty': '明朝', 'Tang dynasty': '唐朝',
          'Song dynasty': '宋朝', 'Han dynasty': '汉朝', 'Yuan dynasty': '元朝',
          'Zhou dynasty': '周朝', 'Shang dynasty': '商朝', 'Qin dynasty': '秦朝',
        };
        const eraLower = eraValue.toLowerCase();
        const zhName = ZH_MAP[eraValue] || '';
        filteredData = filteredData.filter(a => {
          const aEra = a.era.toLowerCase();
          return aEra.startsWith(eraLower) || (zhName && a.era.includes(zhName));
        });
      }

      // Client-side pagination when using client-side filters
      const filteredTotal = filteredData.length;
      const startIdx = needsClientFilter ? (currentPage - 1) * pageSize : 0;
      const endIdx = needsClientFilter ? startIdx + pageSize : filteredData.length;
      const pagedData = needsClientFilter ? filteredData.slice(startIdx, endIdx) : filteredData;

      set({
        artifacts: pagedData,
        total: needsClientFilter ? filteredTotal : response.total,
        loading: false,
      });
    } catch (error) {
      set({
        error: '加载文物数据失败，请重试',
        loading: false,
      });
      console.error('Failed to fetch artifacts:', error);
    }
  },

  // Fetch single artifact detail
  fetchArtifactById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const artifact = await artifactService.getArtifactById(id);
      
      set({
        currentArtifact: artifact || null,
        loading: false,
      });
    } catch (error) {
      set({
        error: '加载文物详情失败',
        loading: false,
      });
      console.error('Failed to fetch artifact:', error);
    }
  },

  // Fetch recommendations for an artifact
  fetchRecommendations: async (id: string) => {
    try {
      const recommendations = await artifactService.getRelatedArtifacts(id, 4);
      set({ recommendations });
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      set({ recommendations: [] });
    }
  },

  // UI Actions
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  setSortBy: (option) => {
    set({ sortBy: option, currentPage: 1 });
    get().fetchArtifacts();
  },

  toggleSortOrder: () => {
    const newOrder = get().sortOrder === 'asc' ? 'desc' : 'asc';
    set({ sortOrder: newOrder, currentPage: 1 });
    get().fetchArtifacts();
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().fetchArtifacts();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchArtifacts();
  },

  // Filter Actions
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      currentPage: 1,
    }));
    get().fetchArtifacts();
  },

  resetFilters: () => {
    set({ filters: { ...initialFilters }, currentPage: 1 });
    get().fetchArtifacts();
  },

  clearFilter: <K extends keyof FilterState>(key: K) => {
    set((state) => ({
      filters: { ...state.filters, [key]: initialFilters[key] },
      currentPage: 1,
    }));
    get().fetchArtifacts();
  },

  // Compare Actions
  addToCompare: (artifact) => {
    set((state) => {
      if (state.compareList.length >= 3) {
        return state; // Max 3 items
      }
      if (state.compareList.some(item => item.id === artifact.id)) {
        return state; // Already in list
      }
      return { compareList: [...state.compareList, artifact] };
    });
  },

  removeFromCompare: (id) => {
    set((state) => ({
      compareList: state.compareList.filter(item => item.id !== id),
    }));
  },

  clearCompare: () => {
    set({ compareList: [] });
  },

  isInCompare: (id) => {
    return get().compareList.some(item => item.id === id);
  },
}));
