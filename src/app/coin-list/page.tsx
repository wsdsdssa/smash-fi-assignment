'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CoinList } from '@/components/CoinList';
import { SearchBar } from '@/components/SearchBar';
import { Tabs } from '@/components/Tabs';
import { useCoins } from '@/hooks/useCoins';
import type { Coin, SortDirection, SortKey, Tab } from '@/lib/types';
import { useFavoriteStore } from '@/store/favoriteStore';

// 화면 상단 탭 정의 (All / My favorite)
const tabs: Tab[] = [
  { id: 'all', label: 'All' },
  { id: 'favorites', label: 'My favorite' },
];

type TabId = (typeof tabs)[number]['id'];

export default function CoinListPage() {
  // 현재 선택된 탭과 검색어 상태를 관리한다.
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('current_price');
  const [direction, setDirection] = useState<SortDirection>('desc');

  // 코인 데이터는 선택한 정렬 기준에 맞게 React Query로 불러온다.
  const {
    coins,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useCoins(sortKey, direction, searchQuery);
  const handleSortChange = (key: SortKey) => {
    if (sortKey === key) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('desc');
    }
  };

  
  // 즐겨찾기 상태(Zustand)에서 필요한 값과 액션을 꺼내온다.
  const favoriteIds = useFavoriteStore((state) => state.favoriteIds);
  const favoriteMap = useFavoriteStore((state) => state.favorites);
  const addFavorite = useFavoriteStore((state) => state.addFavorite);
  const removeFavorite = useFavoriteStore((state) => state.removeFavorite);
  const isFavorite = useFavoriteStore((state) => state.isFavorite);

  const favoriteCoins = useMemo(
    () =>
      favoriteIds
        .map((id) => favoriteMap[id])
        .filter((coin): coin is Coin => Boolean(coin)),
    [favoriteIds, favoriteMap],
  );

  // 즐겨찾기 토글 시 상태 업데이트와 토스트를 보여준다.
  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setSearchInput('');
    setSearchQuery('');
  };

  const handleToggleFavorite = (coin: Coin) => {
    if (isFavorite(coin.id)) {
      removeFavorite(coin.id);
      toast.success('Successfully deleted!');
    } else {
      addFavorite(coin);
      toast.success('Successfully added!');
    }
  };

  return (
    <main className="min-h-screen bg-background pb-16 pt-12">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 text-text">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-text">Coin List</h1>
          </div>
        </header>

        {/* 탭 전환 버튼 */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

        {/* 검색 입력 */}
        <SearchBar value={searchInput} onChange={setSearchInput} onSearch={handleSearch} />

        {/* 로딩 상태 표시 */}
        {isLoading && (
          <div className="flex h-[360px] items-center justify-center rounded-3xl border border-white/5 bg-surface/80 text-text-muted shadow-glow">
            Loading...
          </div>
        )}

        {/* 에러 상태 표시 */}
        {isError && (
          <div className="flex h-[360px] items-center justify-center rounded-3xl border border-white/5 bg-surface/80 text-text-muted shadow-glow">
            Failed to load coins
          </div>
        )}

        {/* 데이터가 정상적으로 로드되었을 때 리스트 렌더링 */}
        {!isLoading && !isError && (
          <CoinList
            coins={coins}
            favoriteCoins={favoriteCoins}
            searchTerm={searchQuery}
            activeTab={activeTab}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={isFavorite}
            sortKey={sortKey}
            direction={direction}
            onSortChange={handleSortChange}
            hasMore={activeTab === 'all' && hasNextPage}
            isLoadingMore={isFetchingNextPage}
            onLoadMore={activeTab === 'all' && hasNextPage ? fetchNextPage : undefined}
          />
        )}
      </section>
    </main>
  );
}

