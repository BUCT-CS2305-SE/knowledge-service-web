export type ViewMode = 'card' | 'list';

export type SortOption = 'name' | 'era' | 'region' | 'dateAdded';

export interface FilterState {
  region: string | null;
  category: string | null;
  material: string | null;
  era: string | null;
  museum: string | null;
  search: string;
}
