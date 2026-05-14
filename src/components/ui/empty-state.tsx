import React from 'react';
import { FileQuestion, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div className={`text-center py-16 px-4 ${className}`}>
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
      {icon || <FileQuestion className="h-10 w-10 text-gray-400" />}
    </div>
    
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    
    {description && (
      <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
    )}
    
    {action && (
      <Button onClick={action.onClick} variant="outline" size="lg">
        {action.label}
      </Button>
    )}
  </div>
);
