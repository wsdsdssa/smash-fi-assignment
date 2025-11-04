'use client';

import Image from 'next/image';
import { Star } from 'lucide-react';
import { formatCompactCurrency, formatPercentage, formatPrice, formatSymbol } from '@/lib/formatters';
import type { Coin } from '@/lib/types';
import { cn } from '@/lib/utils';

type CoinItemProps = {
  coin: Coin;
  isFavorite: boolean;
  onToggleFavorite: (coin: Coin) => void;
};

export function CoinItem({ coin, isFavorite, onToggleFavorite }: CoinItemProps) {
  const priceChangePositive = coin.price_change_percentage_24h >= 0;
  const formattedPrice = formatPrice(coin.current_price);
  const headlinePrice = formattedPrice.replace(/^[^\d-]+/, '');

  return (
    <tr className="group border-b border-white/5 text-sm text-text last:border-b-0">
      <td className="whitespace-nowrap py-4 pr-4">
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
      </td>
      <td className="min-w-[200px] py-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-full bg-muted">
            <Image src={coin.image} alt={coin.name} fill sizes="36px" className="object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-text">{formatSymbol(coin.symbol)}</span>
            <span className="text-xs text-text-muted">{coin.name}</span>
          </div>
        </div>
      </td>
      <td className="py-4 pr-4">
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-text">{headlinePrice}</span>
          <span className="text-xs text-text-muted">{formattedPrice}</span>
        </div>
      </td>
      <td className="py-4 pr-4">
        <span
          className={cn(
            'font-medium',
            priceChangePositive ? 'text-emerald-400' : 'text-rose-400',
          )}
        >
          {formatPercentage(coin.price_change_percentage_24h)}
        </span>
      </td>
      <td className="py-4 pr-4">
        <span>{formatCompactCurrency(coin.total_volume)}</span>
      </td>
      <td className="py-4 pr-4">
        <span>{formatCompactCurrency(coin.market_cap)}</span>
      </td>
    </tr>
  );
}

