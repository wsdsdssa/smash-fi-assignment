export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  total_volume: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
};

export type SortKey =
  | 'current_price'
  | 'price_change_percentage_24h'
  | 'total_volume'
  | 'market_cap';

export type SortDirection = 'asc' | 'desc';

export type Tab = {
  id: string;
  label: string;
};