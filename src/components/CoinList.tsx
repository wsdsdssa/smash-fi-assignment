'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
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

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'current_price', label: 'Price' },
  { key: 'price_change_percentage_24h', label: '24h Change' },
  { key: 'total_volume', label: '24h Volume' },
  { key: 'market_cap', label: 'Market Cap' },
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
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useEffect(() => {
    const updateScrollMargin = () => {
      if (!containerRef.current) {
        return;
      }

      setScrollMargin(containerRef.current.offsetTop);
    };

    updateScrollMargin();
    window.addEventListener('resize', updateScrollMargin);

    return () => {
      window.removeEventListener('resize', updateScrollMargin);
    };
  }, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: displayCoins.length,
    getScrollElement: () => document.documentElement,
    estimateSize: () => 76,
    overscan: 12,
    scrollMargin,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    if (activeTab !== 'all') {
      return;
    }

    const sentinel = loadMoreRef.current;

    if (!sentinel || !hasMore || !onLoadMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '320px',
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [activeTab, hasMore, onLoadMore, isLoadingMore]);

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
        <div className="grid grid-cols-[240px_minmax(140px,180px)_repeat(3,minmax(140px,1fr))] items-center text-xs uppercase tracking-[0.2em] text-text-muted">
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
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {virtualItems.map((virtualRow) => {
          const coin = displayCoins[virtualRow.index];
          const translateY = virtualRow.start - scrollMargin;
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
                transform: `translateY(${translateY}px)`,
                willChange: 'transform',
              }}
            />
          );
        })}
      </div>
      {activeTab === 'all' ? (
        <div className="flex flex-col items-center justify-center py-4 text-sm text-text-muted">
          {hasMore ? <div ref={loadMoreRef} className="h-6" aria-hidden /> : <span>End of list</span>}
          {isLoadingMore && <span className="mt-2">Loading more...</span>}
        </div>
      ) : null}
    </div>
  );
}

