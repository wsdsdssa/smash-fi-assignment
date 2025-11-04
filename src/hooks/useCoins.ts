'use client';

import { useQuery } from '@tanstack/react-query';
import type { Coin, SortDirection, SortKey } from '@/lib/types';

const ORDER_MAP: Record<SortKey, { asc: string; desc: string }> = {
  total_volume: {
    asc: 'volume_asc',
    desc: 'volume_desc',
  },
  market_cap: {
    asc: 'market_cap_asc',
    desc: 'market_cap_desc',
  },
  current_price: {
    asc: '',
    desc: ''
  },
  price_change_percentage_24h: {
    asc: '',
    desc: ''
  }
};

async function fetchCoins(sortKey: SortKey, direction: SortDirection): Promise<Coin[]> {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
  url.searchParams.set('vs_currency', 'usd');
  const order = ORDER_MAP[sortKey]?.[direction] ?? 'market_cap_desc';
  url.searchParams.set('order', order);
  url.searchParams.set('per_page', '20');
  url.searchParams.set('page', '1');
  url.searchParams.set('sparkline', 'false');

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

export function useCoins(sortKey: SortKey, direction: SortDirection) {
  return useQuery<Coin[]>({
    queryKey: ['coins', sortKey, direction],
    queryFn: () => fetchCoins(sortKey, direction),
    staleTime: 1000 * 60 * 5,
  });
}