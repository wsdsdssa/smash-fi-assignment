'use client';

import { Search } from 'lucide-react';
import { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search something... (BTC, Bitcoin, B...)',
  className,
}: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const triggerSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    triggerSearch();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      triggerSearch();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full items-center gap-3 rounded-full bg-surface px-5 py-3 text-text shadow-inner shadow-black/40 focus-within:ring-2 focus-within:ring-accent/60',
        className,
      )}
    >
      <button
        type="submit"
        className="flex size-5 shrink-0 items-center justify-center text-text-muted transition-colors hover:text-text"
        aria-label="Search"
      >
        <Search className="size-5" aria-hidden />
      </button>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-text placeholder:text-text-muted focus:outline-none"
      />
    </form>
  );
}

