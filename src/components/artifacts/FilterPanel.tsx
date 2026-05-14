import React from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useArtifactStore } from '@/store/artifactStore';
import { mockApi } from '@/mock/handlers';
import type { FilterOption } from '@/types/artifact';

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValue: string | null;
  onFilterChange: (value: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  title, 
  options, 
  selectedValue, 
  onFilterChange 
}) => {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        {title}
      </h4>
      <div className="space-y-2">
        {/* All option */}
        <button
          onClick={() => onFilterChange('all')}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
            !selectedValue || selectedValue === 'all'
              ? 'bg-museum-gold text-white font-medium shadow-md'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          全部
        </button>
        
        {/* Other options */}
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between items-center ${
              selectedValue === option.value
                ? 'bg-museum-gold/10 text-museum-gold-dark border-l-2 border-museum-gold font-medium'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const FilterPanel: React.FC = () => {
  const {
    filters,
    setFilter,
    resetFilters,
    clearFilter,
    total,
  } = useArtifactStore();

  const [filterOptions, setFilterOptions] = React.useState<{
    regions: FilterOption[];
    categories: FilterOption[];
    materials: FilterOption[];
    museums: FilterOption[];
    eras: FilterOption[];
  } | null>(null);

  // Load filter options on mount
  React.useEffect(() => {
    const loadOptions = async (): Promise<void> => {
      try {
        const options = await mockApi.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };
    
    loadOptions();
  }, []);

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(
    value => value !== null && value !== '' && value !== 'all'
  ).length;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-museum-gold" />
            <h3 className="text-lg font-bold text-gray-900">筛选</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Active filters badge */}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-museum-gold/10 text-museum-gold-dark">
                {activeFiltersCount}
              </Badge>
            )}
            
            {/* Reset button */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-gray-500 hover:text-red-600 h-8 w-8 p-0"
                title="重置所有筛选"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-6 pb-4 border-b border-gray-200">
          找到 <span className="font-semibold text-gray-900">{total}</span> 件文物
        </p>

        {/* Loading state */}
        {!filterOptions ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-9 bg-gray-100 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Filter sections */
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <FilterSection
              title="地区/文明"
              options={filterOptions.regions}
              selectedValue={filters.region}
              onFilterChange={(value) => setFilter('region', value)}
            />

            <FilterSection
              title="文物类型"
              options={filterOptions.categories}
              selectedValue={filters.category}
              onFilterChange={(value) => setFilter('category', value)}
            />

            <FilterSection
              title="材质"
              options={filterOptions.materials}
              selectedValue={filters.material}
              onFilterChange={(value) => setFilter('material', value)}
            />

            <FilterSection
              title="年代"
              options={filterOptions.eras}
              selectedValue={filters.era}
              onFilterChange={(value) => setFilter('era', value)}
            />

            <FilterSection
              title="博物馆"
              options={filterOptions.museums}
              selectedValue={filters.museum}
              onFilterChange={(value) => setFilter('museum', value)}
            />
          </div>
        )}

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              已选条件
            </p>
            <div className="flex flex-wrap gap-2">
              {filters.region && filters.region !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-50 hover:text-red-700 pr-1"
                  onClick={() => clearFilter('region')}
                >
                  地区: {filterOptions?.regions.find(r => r.value === filters.region)?.label || filters.region}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              
              {filters.category && filters.category !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-50 hover:text-red-700 pr-1"
                  onClick={() => clearFilter('category')}
                >
                  类型: {filterOptions?.categories.find(c => c.value === filters.category)?.label || filters.category}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}

              {filters.material && filters.material !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-50 hover:text-red-700 pr-1"
                  onClick={() => clearFilter('material')}
                >
                  材质: {filterOptions?.materials.find(m => m.value === filters.material)?.label || filters.material}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}

              {filters.era && filters.era !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-50 hover:text-red-700 pr-1"
                  onClick={() => clearFilter('era')}
                >
                  年代: {filters.era}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}

              {filters.museum && filters.museum !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-red-50 hover:text-red-700 pr-1"
                  onClick={() => clearFilter('museum')}
                >
                  博物馆: {filterOptions?.museums.find(m => m.value === filters.museum)?.label || filters.museum}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
