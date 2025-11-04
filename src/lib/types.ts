export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
  market_cap_rank?: number;
};

export type SortKey =
  | 'current_price'
  | 'price_change_percentage_24h'
  | 'total_volume'
  | 'market_cap';

