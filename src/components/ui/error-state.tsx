import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = '出错了',
  message = '加载失败，请重试',
  onRetry,
  className = '',
}) => (
  <div className={`text-center py-12 px-4 ${className}`}>
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
      <AlertTriangle className="h-8 w-8 text-red-500" />
    </div>
    
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
    
    {onRetry && (
      <Button 
        variant="outline" 
        onClick={onRetry}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        重试
      </Button>
    )}
  </div>
);
