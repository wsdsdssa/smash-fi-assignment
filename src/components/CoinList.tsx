'use client';

import { useMemo } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { Coin, SortDirection, SortKey } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CoinItem } from '@/components/CoinItem';

type CoinListProps = {
  coins: Coin[];
  favoriteCoins: Coin[];
  searchTerm: string;
  activeTab: 'all' | 'favorites';
  onToggleFavorite: (coin: Coin) => void;
  isFavorite: (coinId: string) => boolean;
  sortKey: SortKey;
  direction: SortDirection;
  onSortChange: (key: SortKey) => void;
};

const sortOptions: { key: SortKey; label: string; align?: string }[] = [
  { key: 'current_price', label: 'Price', align: 'text-right' },
  { key: 'price_change_percentage_24h', label: '24h Change', align: 'text-right' },
  { key: 'total_volume', label: '24h Volume', align: 'text-right' },
  { key: 'market_cap', label: 'Market Cap', align: 'text-right' },
];

const CLIENT_SORT_KEYS: SortKey[] = ['current_price', 'price_change_percentage_24h'];

export function CoinList({
  coins,
  favoriteCoins,
  searchTerm,
  activeTab,
  onToggleFavorite,
  isFavorite,
  sortKey,
  direction,
  onSortChange,
}: CoinListProps) {
  const handleSortChange = (key: SortKey) => {
    onSortChange(key);
  };

  const dataSource = useMemo(() => {
    if (activeTab !== 'favorites') {
      return coins;
    }

    const map = new Map<string, Coin>();

    favoriteCoins.forEach((coin) => {
      map.set(coin.id, coin);
    });

    coins.forEach((coin) => {
      if (map.has(coin.id)) {
        map.set(coin.id, { ...map.get(coin.id)!, ...coin });
      }
    });

    return Array.from(map.values());
  }, [activeTab, coins, favoriteCoins]);

  const filteredCoins = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return dataSource.filter((coin) => {
      const matchesSearch = normalizedSearch
        ? coin.name.toLowerCase().includes(normalizedSearch) ||
          coin.symbol.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesSearch;
    });
  }, [dataSource, searchTerm]);

  const shouldClientSort = useMemo(() => {
    if (activeTab === 'favorites') {
      return true;
    }

    return CLIENT_SORT_KEYS.includes(sortKey);
  }, [activeTab, sortKey]);

  const sortedCoins = useMemo(() => {
    if (!shouldClientSort) {
      return filteredCoins;
    }

    return [...filteredCoins].sort((a, b) => {
      const firstValue = a[sortKey] ?? 0;
      const secondValue = b[sortKey] ?? 0;

      if (typeof firstValue === 'number' && typeof secondValue === 'number') {
        return direction === 'asc'
          ? firstValue - secondValue
          : secondValue - firstValue;
      }

      return 0;
    });
  }, [filteredCoins, sortKey, direction, shouldClientSort]);

  const displayCoins = shouldClientSort ? sortedCoins : filteredCoins;

  if (displayCoins.length === 0) {
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
            <th className="px-4 pb-4 font-medium">Name</th>
            {sortOptions.map((option) => {
              const isActive = option.key === sortKey;
              return (
                <th
                  key={option.key}
                  className={cn('px-4 pb-4 font-medium', option.align)}
                >
                  <button
                    type="button"
                    onClick={() => handleSortChange(option.key)}
                    className={cn(
                      'cursor-pointer group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-text-muted transition-colors hover:text-text',
                      option.align === 'text-right' && 'ml-auto justify-end',
                      isActive && 'bg-white/5 text-text',
                    )}
                  >
                    {option.label}
                    <span className="text-text-muted">
                      {isActive ? (
                        direction === 'asc' ? (
                          <ArrowUp className="size-4" />
                        ) : (
                          <ArrowDown className="size-4" />
                        )
                      ) : (
                        <ArrowDown className="size-4 opacity-30 transition-opacity group-hover:opacity-60" />
                      )}
                    </span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {displayCoins.map((coin) => (
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

