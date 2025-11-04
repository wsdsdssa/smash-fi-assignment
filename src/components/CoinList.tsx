'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
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
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

const sortOptions: { key: SortKey; label: string; align?: string }[] = [
  { key: 'current_price', label: 'Price', align: 'justify-end' },
  { key: 'price_change_percentage_24h', label: '24h Change', align: 'justify-end' },
  { key: 'total_volume', label: '24h Volume', align: 'justify-end' },
  { key: 'market_cap', label: 'Market Cap', align: 'justify-end' },
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
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: CoinListProps) {
  const handleSortChange = (key: SortKey) => {
    onSortChange(key);
  };

  const dataSource = useMemo(() => {
    if (activeTab === 'favorites') {
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
    }

    const seen = new Set<string>();
    const ordered: Coin[] = [];

    coins.forEach((coin) => {
      if (!seen.has(coin.id)) {
        seen.add(coin.id);
        ordered.push(coin);
      }
    });

    return ordered;
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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  const windowVirtualizer = useWindowVirtualizer({
    count: displayCoins.length,
    estimateSize: () => 76,
    overscan: 12,
    scrollMargin,
    getScrollElement: () => window,
  });

  useEffect(() => {
    const updateScrollMargin = () => {
      if (!containerRef.current) {
        return;
      }

      const offset = containerRef.current.offsetTop;
      setScrollMargin(offset);
    };

    updateScrollMargin();
    window.addEventListener('resize', updateScrollMargin);

    return () => {
      window.removeEventListener('resize', updateScrollMargin);
    };
  }, []);

  const virtualItems = windowVirtualizer.getVirtualItems();
  const endIndex = virtualItems.length ? virtualItems[virtualItems.length - 1].index : -1;

  useEffect(() => {
    if (activeTab !== 'all') {
      return;
    }

    if (!hasMore || !onLoadMore || isLoadingMore) {
      return;
    }

    if (endIndex >= displayCoins.length - 5) {
      onLoadMore();
    }
  }, [activeTab, hasMore, onLoadMore, isLoadingMore, endIndex, displayCoins.length]);

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
    <div ref={containerRef} className="overflow-hidden rounded-3xl border border-white/5 bg-surface/80 shadow-glow">
      <div className="px-4 pb-4 pt-5">
        <div className="grid grid-cols-[80px_minmax(200px,1.3fr)_repeat(4,minmax(140px,1fr))] items-center text-xs uppercase tracking-[0.2em] text-text-muted">
          <span className="font-medium">Name</span>
          {sortOptions.map((option) => {
            const isActive = option.key === sortKey;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSortChange(option.key)}
                className={cn(
                  'group inline-flex items-center justify-end gap-2 rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-widest text-text-muted transition-colors hover:text-text',
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
            );
          })}
        </div>
      </div>
      <div style={{ height: windowVirtualizer.getTotalSize(), position: 'relative' }}>
        {virtualItems.map((virtualRow) => {
          const coin = displayCoins[virtualRow.index];
          return (
            <CoinItem
              key={coin.id}
              coin={coin}
              isFavorite={isFavorite(coin.id)}
              onToggleFavorite={onToggleFavorite}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                willChange: 'transform',
              }}
            />
          );
        })}
      </div>
      {activeTab === 'all' ? (
        <div className="flex flex-col items-center justify-center py-4 text-sm text-text-muted">
          {hasMore ? <span className="opacity-70">Scroll to load more</span> : <span>End of list</span>}
          {isLoadingMore && <span className="mt-2">Loading more...</span>}
        </div>
      ) : null}
    </div>
  );
}

