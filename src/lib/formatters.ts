// USD 단위를 compact 형식(예: $74.9B)으로 보여주기 위한 포매터를 미리 생성해둔다.
const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
});

/**
 * 가격 숫자를 USD 통화 형식으로 변환한다.
 * 값이 없으면 '--'를 반환한다.
 */
export function formatPrice(value?: number | null) {
  if (value === null || value === undefined) {
    return '--';
  }

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: value >= 1 ? 2 : 2,
    maximumFractionDigits: value >= 1 ? 2 : 6,
  };

  return new Intl.NumberFormat('en-US', options).format(value);
}

/**
 * 큰 금액(거래량, 시가총액 등)을 compact USD 형식으로 변환한다.
 * 예: 74_950_000_000 -> $74.95B
 */
export function formatCompactCurrency(value?: number | null) {
  if (value === null || value === undefined) {
    return '--';
  }

  return compactCurrencyFormatter.format(value);
}

/**
 * 24시간 변동률을 +2.91% 같은 문자열로 만들어준다.
 */
export function formatPercentage(value?: number | null) {
  if (value === null || value === undefined) {
    return '--';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * 코인 심볼을 항상 대문자로 표시한다. (btc -> BTC)
 */
export function formatSymbol(symbol: string) {
  return symbol.toUpperCase();
}

