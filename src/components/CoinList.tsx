'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Coin, SortKey } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CoinItem } from '@/components/CoinItem';

type SortDirection = 'asc' | 'desc';

type CoinListProps = {
  coins: Coin[];
  favorites: string[];
  searchTerm: string;
  activeTab: 'all' | 'favorites';
  onToggleFavorite: (coin: Coin) => void;
  isFavorite: (coinId: string) => boolean;
};

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'current_price', label: 'Price' },
  { key: 'price_change_percentage_24h', label: '24h Change' },
  { key: 'total_volume', label: '24h Volume' },
  { key: 'market_cap', label: 'Market Cap' },
];

export function CoinList({
  coins,
  favorites,
  searchTerm,
  activeTab,
  onToggleFavorite,
  isFavorite,
}: CoinListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('current_price');
  const [direction, setDirection] = useState<SortDirection>('desc');

  const handleSortChange = (key: SortKey) => {
    setSortKey((currentKey) => {
      if (currentKey !== key) {
        setDirection('desc');
        return key;
      }

      setDirection((prevDirection) => (prevDirection === 'asc' ? 'desc' : 'asc'));
      return currentKey;
    });
  };

  const filteredCoins = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return coins.filter((coin) => {
      const matchesSearch = normalizedSearch
        ? coin.name.toLowerCase().includes(normalizedSearch) ||
          coin.symbol.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesFavorites =
        activeTab === 'favorites' ? favorites.includes(coin.id) : true;

      return matchesSearch && matchesFavorites;
    });
  }, [coins, favorites, searchTerm, activeTab]);

  const sortedCoins = useMemo(() => {
    return [...filteredCoins].sort((a, b) => {
      const first = direction === 'asc' ? a : b;
      const second = direction === 'asc' ? b : a;

      const firstValue = first[sortKey] ?? 0;
      const secondValue = second[sortKey] ?? 0;

      if (typeof firstValue === 'number' && typeof secondValue === 'number') {
        return firstValue - secondValue;
      }

      return 0;
    });
  }, [filteredCoins, direction, sortKey]);

  if (sortedCoins.length === 0) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-3xl border border-white/5 bg-surface/80 text-center text-sm text-text-muted shadow-glow">
        {activeTab === 'favorites'
          ? '즐겨찾기한 코인이 없습니다. ⭐ 버튼으로 추가해보세요.'
          : '검색 결과가 없습니다. 다른 키워드를 입력해보세요.'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/5 bg-surface/80 shadow-glow">
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.2em] text-text-muted">
            <th className="px-4 pb-4 font-medium">&nbsp;</th>
            <th className="px-4 pb-4 font-medium">Name</th>
            {sortOptions.map((option) => {
              const isActive = option.key === sortKey;
              return (
                <th key={option.key} className="px-4 pb-4 font-medium">
                  <button
                    type="button"
                    onClick={() => handleSortChange(option.key)}
                    className={cn(
                      'group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-text-muted transition-colors hover:text-text',
                      isActive && 'bg-white/5 text-text',
                    )}
                  >
                    {option.label}
                    <span className="text-text-muted">
                      {isActive ? (
                        direction === 'asc' ? (
                          <ChevronUp className="size-4" />
                        ) : (
                          <ChevronDown className="size-4" />
                        )
                      ) : (
                        <ChevronDown className="size-4 opacity-30 transition-opacity group-hover:opacity-60" />
                      )}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedCoins.map((coin) => (
            <CoinItem
              key={coin.id}
              coin={coin}
              isFavorite={isFavorite(coin.id)}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

