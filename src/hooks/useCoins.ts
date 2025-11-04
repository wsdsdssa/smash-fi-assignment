'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Coin, SortDirection, SortKey } from '@/lib/types';

const PER_PAGE = 200;

const ORDER_MAP: Partial<Record<SortKey, { asc: string; desc: string }>> = {
  total_volume: {
    asc: 'volume_asc',
    desc: 'volume_desc',
  },
  market_cap: {
    asc: 'market_cap_asc',
    desc: 'market_cap_desc',
  },
};

type FetchCoinsArgs = {
  sortKey: SortKey;
  direction: SortDirection;
  searchTerm: string;
  page: number;
};

type FetchCoinsResult = {
  coins: Coin[];
  page: number;
  totalAvailable?: number;
};

async function fetchCoins({
  sortKey,
  direction,
  searchTerm,
  page,
}: FetchCoinsArgs): Promise<FetchCoinsResult> {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('per_page', PER_PAGE.toString());
  url.searchParams.set('page', page.toString());
  url.searchParams.set('sparkline', 'false');

  let totalAvailable: number | undefined;

  if (searchTerm) {
    const searchUrl = new URL('https://api.coingecko.com/api/v3/search');
    searchUrl.searchParams.set('query', searchTerm);

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: { Accept: 'application/json' },
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to search coins');
    }

    const searchData: { coins?: { id: string }[] } = await searchResponse.json();
    const ids = searchData.coins?.map((coin) => coin.id) ?? [];
    totalAvailable = ids.length;

    const start = (page - 1) * PER_PAGE;
    const slice = ids.slice(start, start + PER_PAGE);

    if (slice.length === 0) {
      return { coins: [], page, totalAvailable };
    }

    url.searchParams.set('ids', slice.join(','));

    const order = ORDER_MAP[sortKey]?.[direction];
    if (order) {
      url.searchParams.set('order', order);
    }
  } else {
    const order = ORDER_MAP[sortKey]?.[direction] ?? 'market_cap_desc';
    url.searchParams.set('order', order);
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 0 },
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch coins');
  }

  const coins: Coin[] = await response.json();

  return {
    coins,
    page,
    totalAvailable,
  };
}

export function useCoins(sortKey: SortKey, direction: SortDirection, searchTerm = '') {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const query = useInfiniteQuery<FetchCoinsResult>({
    queryKey: ['coins', sortKey, direction, normalizedSearch],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      fetchCoins({
        sortKey,
        direction,
        searchTerm: normalizedSearch,
        page: Number(pageParam) || 1,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.totalAvailable !== undefined) {
        return lastPage.page * PER_PAGE < lastPage.totalAvailable
          ? lastPage.page + 1
          : undefined;
      }

      return lastPage.coins.length === PER_PAGE ? lastPage.page + 1 : undefined;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const coins = useMemo(() => {
    if (!query.data?.pages) {
      return [] as Coin[];
    }

    const seen = new Set<string>();
    const merged: Coin[] = [];

    query.data.pages.forEach((page) => {
      page.coins.forEach((coin) => {
        if (!seen.has(coin.id)) {
          seen.add(coin.id);
          merged.push(coin);
        }
      });
    });

    return merged;
  }, [query.data]);

  return {
    coins,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage ?? false,
    isFetchingNextPage: query.isFetchingNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    error: query.error,
  };
}