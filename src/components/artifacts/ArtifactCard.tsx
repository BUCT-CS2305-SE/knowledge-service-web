import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Gem } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Artifact } from '@/types/artifact';

interface ArtifactCardProps {
  artifact: Artifact;
  variant?: 'default' | 'compact';
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact, variant = 'default' }) => {
  // Defensive check for invalid artifact data
  if (!artifact || !artifact.id) {
    return null;
  }

  const hasImage = artifact.images && artifact.images.length > 0 && artifact.images[0];
  const hasNameEn = artifact.nameEn && artifact.nameEn.trim().length > 0;

  if (variant === 'compact') {
    return (
      <Link to={`/artifact/${artifact.id}`}>
        <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border-0 shadow-md">
          <div className="flex items-center space-x-4 p-4">
            {/* Image */}
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {hasImage ? (
                <img
                  src={artifact.images![0]}
                  alt={artifact.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-museum-gold/10">
                  <Gem className="h-8 w-8 text-museum-gold/40" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-museum-gold-dark transition-colors line-clamp-1">
                {artifact.name}
              </h3>
              {artifact.nameEn && (
                <p className="text-xs text-gray-500 mt-0.5">{artifact.nameEn}</p>
              )}
              
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                <span className="flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {artifact.era}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {artifact.region}
                </span>
              </div>

              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                {artifact.description}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/artifact/${artifact.id}`} className="group block">
      <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden bg-white border-0 shadow-md h-full flex flex-col">
        {/* Image Section - Priority Display */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {hasImage ? (
            <img
              src={artifact.images![0]}
              alt={artifact.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-museum-gold/5 to-museum-gold/10">
              <Gem className="h-16 w-16 text-museum-gold/30" />
            </div>
          )}

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Quick Info Badge */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <Badge 
              variant="secondary" 
              className="bg-white/90 backdrop-blur-sm text-gray-800 font-medium shadow-sm"
            >
              {artifact.category}
            </Badge>
          </div>

          {/* View Details Text on Hover */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-sm font-medium">查看详情 →</p>
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-museum-gold-dark transition-colors line-clamp-2 leading-tight">
            {artifact.name}
          </h3>
          
          {/* English Name */}
          {artifact.nameEn && (
            <p className="text-sm text-gray-500 italic mb-3">{artifact.nameEn}</p>
          )}

          {/* Meta Information */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-gray-700">
              <Calendar className="h-4 w-4 mr-2 text-museum-gold flex-shrink-0" />
              <span>{artifact.era}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-700">
              <MapPin className="h-4 w-4 mr-2 text-museum-gold flex-shrink-0" />
              <span>{artifact.region}</span>
            </div>

            <div className="flex items-center text-sm text-gray-700">
              <Gem className="h-4 w-4 mr-2 text-museum-gold flex-shrink-0" />
              <span className="truncate">{artifact.material}</span>
            </div>
          </div>

          {/* Description Preview */}
          <p className="text-sm text-gray-600 line-clamp-3 mt-auto pt-3 border-t border-gray-100">
            {artifact.description}
          </p>

          {/* Tags */}
          {artifact.tags && artifact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {artifact.tags.slice(0, 3).map(tag => (
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
        </CardContent>
      </Card>
    </Link>
  );
};
