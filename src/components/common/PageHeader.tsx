import React from 'react';

interface PageHeaderProps {
  badge?: string;
  badgeIcon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  badge,
  badgeIcon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div className="flex flex-col gap-1.5">
        {badge && (
          <div className="flex items-center gap-1.5 text-primary-container font-label-caps text-label-caps uppercase tracking-widest font-bold">
            {badgeIcon}
            <span>{badge}</span>
          </div>
        )}
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">
          {title}
        </h1>
        {description && (
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
