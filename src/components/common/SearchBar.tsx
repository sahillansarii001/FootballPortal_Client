import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search team, player or venue...',
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-12 py-2.5 bg-surface text-on-surface font-body-md text-body-md placeholder:text-outline border border-surface-container-high rounded-xl focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container/20 transition-all shadow-inner"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-bold text-on-surface-variant bg-surface-container rounded border border-surface-container-high pointer-events-none">
        ⌘K
      </span>
    </div>
  );
};
