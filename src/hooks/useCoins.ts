'use client';

import { useQuery } from '@tanstack/react-query';
import type { Coin } from '@/lib/types';

async function fetchCoins(): Promise<Coin[]> {
  const url = new URL('https://api.coingecko.com/api/v3/coins/markets');
  url.searchParams.set('vs_currency', 'usd');
  url.searchParams.set('order', 'market_cap_desc');
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

export function useCoins() {
  return useQuery<Coin[]>({
    queryKey: ['coins'],
    queryFn: fetchCoins,
    staleTime: 1000 * 60 * 5,
  });
}