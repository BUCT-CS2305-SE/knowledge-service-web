import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useArtifactStore } from '@/store/artifactStore';
import type { SortOption } from '@/types/filter';

interface SortOptionItem {
  value: SortOption;
  label: string;
}

const sortOptions: SortOptionItem[] = [
  { value: 'name', label: '名称' },
  { value: 'era', label: '年代' },
  { value: 'region', label: '地区' },
  { value: 'dateAdded', label: '更新时间' },
];

export const SortControl: React.FC = () => {
  const { sortBy, sortOrder, setSortBy, toggleSortOrder } = useArtifactStore();

  const currentLabel = sortOptions.find(opt => opt.value === sortBy)?.label || '排序';

  return (
    <div className="flex items-center gap-2">
      {/* Sort dropdown */}
      <div className="relative group">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-gray-300 hover:border-museum-gold hover:text-museum-gold-dark"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLabel}</span>
        </Button>
        
        {/* Dropdown menu */}
        <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                sortBy === option.value
                  ? 'bg-museum-gold/10 text-museum-gold-dark font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
              {sortBy === option.value && (
                <span className="float-right">
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sort order toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortOrder}
        className="border-gray-300 hover:border-museum-gold hover:text-museum-gold-dark p-2"
        title={sortOrder === 'asc' ? '升序 → 点击切换降序' : '降序 → 点击切换升序'}
      >
        {sortOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
