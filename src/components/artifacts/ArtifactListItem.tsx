import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Gem, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Artifact } from '@/types/artifact';
import { useArtifactStore } from '@/store/artifactStore';

interface ArtifactListItemProps {
  artifact: Artifact;
}

export const ArtifactListItem: React.FC<ArtifactListItemProps> = ({ artifact }) => {
  const { addToCompare, removeFromCompare, isInCompare } = useArtifactStore();

  // Defensive checks for invalid artifact data
  if (!artifact || !artifact.id) {
    return null;
  }

  const hasImage = artifact.images && artifact.images.length > 0 && artifact.images[0];
  const inCompare = isInCompare(artifact.id);

  const handleCompareToggle = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inCompare) {
      removeFromCompare(artifact.id);
    } else {
      addToCompare(artifact);
    }
  };

  return (
    <Link 
      to={`/artifact/${artifact.id}`}
      className="group block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-museum-gold/30 transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-stretch p-4 gap-5">
        {/* Image Section */}
        <div className="w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
          {hasImage ? (
            <img
              src={artifact.images![0]}
              alt={artifact.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gem className="h-12 w-12 text-museum-gold/30" />
            </div>
          )}
          
          {/* Category badge overlay */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm shadow-sm">
              {artifact.category}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 flex flex-col py-1">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-museum-gold-dark transition-colors line-clamp-1">
                {artifact.name}
              </h3>
              {artifact.nameEn && (
                <p className="text-sm text-gray-500 italic">{artifact.nameEn}</p>
              )}
            </div>
            
            {/* Compare button */}
            <Button
              variant={inCompare ? "default" : "outline"}
              size="sm"
              onClick={handleCompareToggle}
              className={`flex-shrink-0 ${
                inCompare 
                  ? 'bg-museum-gold hover:bg-museum-gold-dark text-white' 
                  : 'border-dashed border-gray-300 text-gray-600 hover:border-museum-gold hover:text-museum-gold-dark'
              }`}
              title={inCompare ? '从对比中移除' : '加入对比'}
            >
              {inCompare ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  已选
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  对比
                </>
              )}
            </Button>
          </div>

          {/* Meta info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2 text-museum-gold flex-shrink-0" />
              <span className="truncate">{artifact.era}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-museum-gold flex-shrink-0" />
              <span className="truncate">{artifact.region}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Gem className="h-4 w-4 mr-2 text-museum-gold flex-shrink-0" />
              <span className="truncate">{artifact.material}</span>
            </div>

            {artifact.museum && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="truncate">🏛️ {artifact.museum}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mt-auto">
            {artifact.description}
          </p>

          {/* Tags */}
          {artifact.tags && artifact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
              {artifact.tags.slice(0, 4).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs border-gray-200 text-gray-600 hover:border-museum-gold hover:text-museum-gold-dark"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
