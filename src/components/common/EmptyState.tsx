import React from 'react';
import { CalendarX, Search } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'calendar' | 'search' | React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'No matches or data match your current query or filter criteria.',
  icon = 'calendar',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-2xl border border-surface-container-high text-center shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mb-4 shadow-inner">
        {icon === 'calendar' ? (
          <CalendarX className="w-7 h-7 text-outline" />
        ) : icon === 'search' ? (
          <Search className="w-7 h-7 text-outline" />
        ) : (
          icon
        )}
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-1.5">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
};
