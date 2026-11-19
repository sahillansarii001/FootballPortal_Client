import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading tournament data...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container mb-3 shadow-inner">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">{message}</p>
      <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Connecting to official match feed</span>
    </div>
  );
};
