'use client';

import { type CSSProperties } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { formatCompactCurrency, formatPercentage, formatPrice, formatSymbol } from '@/lib/formatters';
import type { Coin } from '@/lib/types';
import { cn } from '@/lib/utils';

type CoinItemProps = {
  coin: Coin;
  isFavorite: boolean;
  onToggleFavorite: (coin: Coin) => void;
  style?: CSSProperties;
};

const rowColumnsClass =
  'grid grid-cols-[80px_minmax(200px,1.3fr)_repeat(4,minmax(140px,1fr))] items-center';

export function CoinItem({ coin, isFavorite, onToggleFavorite, style }: CoinItemProps) {
  const priceChangePositive = (coin.price_change_percentage_24h ?? 0) >= 0;
  const formattedPrice = formatPrice(coin.current_price ?? 0);
  const headlinePrice = formattedPrice.replace(/^[^\d-]+/, '');

  return (
    <div
      className={cn(
        rowColumnsClass,
        'group border-b border-white/5 px-4 py-4 text-sm text-text last:border-b-0 transition-colors hover:bg-white/5/30',
      )}
      style={style}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onToggleFavorite(coin)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={cn(
            'flex size-8 items-center justify-center rounded-full transition-colors hover:bg-white/10',
            isFavorite ? 'text-amber-400' : 'text-text-muted',
          )}
        >
          <Star className={cn('size-5 transition-colors', isFavorite && 'fill-current')} />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted">
            <Image src={coin.image} alt={coin.name} fill sizes="36px" className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-text">{formatSymbol(coin.symbol)}</span>
            <span className="text-xs text-text-muted">{coin.name}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col text-right">
        <span className="text-lg font-semibold text-text">{headlinePrice}</span>
        <span className="text-xs text-text-muted">{formattedPrice}</span>
      </div>
      <div className="text-right">
        <span
          className={cn(
            'font-medium',
            priceChangePositive ? 'text-emerald-400' : 'text-rose-400',
          )}
        >
          {formatPercentage(coin.price_change_percentage_24h)}
        </span>
      </div>
      <div className="text-right">
        <span>{formatCompactCurrency(coin.total_volume)}</span>
      </div>
      <div className="text-right">
        <span>{formatCompactCurrency(coin.market_cap)}</span>
      </div>
    </div>
  );
}

