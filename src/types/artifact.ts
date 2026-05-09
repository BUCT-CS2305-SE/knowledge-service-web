export interface Artifact {
  id: string;
  name: string;
  nameEn?: string;
  era: string;
  region: string;
  category: string;
  material: string;
  dimensions: {
    height: number;
    width: number;
    depth?: number;
  };
  description: string;
  history: string;
  images: string[];
  museum?: string;
  location?: string;
  tags: string[];
}

export interface FilterParams {
  page: number;
  size: number;
  region?: string;
  category?: string;
  material?: string;
  era?: string;
  museum?: string;
  search?: string;
  sortBy?: 'name' | 'era' | 'region' | 'dateAdded';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  code: number;
  data: T[];
  total: number;
  page: number;
  size: number;
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterOptions {
  regions: FilterOption[];
  categories: FilterOption[];
  materials: FilterOption[];
  eras: FilterOption[];
  museums: FilterOption[];
}
