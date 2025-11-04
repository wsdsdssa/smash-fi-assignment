'use client';

import { useQuery } from '@tanstack/react-query';
import type { Coin, SortDirection, SortKey } from '@/lib/types';

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

async function fetchCoins(
  sortKey: SortKey,
  direction: SortDirection,
  searchTerm: string,
): Promise<Coin[]> {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('per_page', '20');
  url.searchParams.set('page', '1');
  url.searchParams.set('sparkline', 'false');

  if (searchTerm) {
    const searchUrl = new URL('https://api.coingecko.com/api/v3/search');
    searchUrl.searchParams.set('query', searchTerm);

    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!searchResponse.ok) {
      throw new Error('Failed to search coins');
    }

    const searchData: { coins?: { id: string }[] } = await searchResponse.json();
    const ids = searchData.coins?.map((coin) => coin.id).slice(0, 20) ?? [];

    if (ids.length === 0) {
      return [];
    }

    url.searchParams.set('ids', ids.join(','));

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

  return response.json();
}

export function useCoins(sortKey: SortKey, direction: SortDirection, searchTerm: string) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return useQuery<Coin[]>({
    queryKey: ['coins', sortKey, direction, normalizedSearch],
    queryFn: () => fetchCoins(sortKey, direction, normalizedSearch),
    staleTime: 1000 * 60 * 5,
  });
}