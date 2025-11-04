'use client';

import { Search } from 'lucide-react';
import { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search something... (BTC, Bitcoin, B...)',
  className,
}: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-full bg-surface px-5 py-3 text-text shadow-inner shadow-black/40 focus-within:ring-2 focus-within:ring-accent/60',
        className,
      )}
    >
      <Search className="size-5 text-text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
      />
    </div>
  );
}

