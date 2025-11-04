'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Coin } from '@/lib/types';

type FavoriteStore = {
  favorites: Record<string, Coin>;
  favoriteIds: string[];
  addFavorite: (coin: Coin) => void;
  removeFavorite: (coinId: string) => void;
  isFavorite: (coinId: string) => boolean;
};

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: {},
      favoriteIds: [],
      addFavorite: (coin) =>
        set((state) => {
          const isExisting = Boolean(state.favorites[coin.id]);
          const updatedFavorites = {
            ...state.favorites,
            [coin.id]: { ...state.favorites[coin.id], ...coin },
          };

          return {
            favorites: updatedFavorites,
            favoriteIds: isExisting
              ? state.favoriteIds
              : [...state.favoriteIds, coin.id],
          };
        }),
      removeFavorite: (coinId) =>
        set((state) => {
          if (!state.favorites[coinId]) {
            return state;
          }

          const updatedFavorites = { ...state.favorites };
          delete updatedFavorites[coinId];
          return {
            favorites: updatedFavorites,
            favoriteIds: state.favoriteIds.filter((id) => id !== coinId),
          };
        }),
      isFavorite: (coinId) => Boolean(get().favorites[coinId]),
    }),
    {
      name: 'favorite-coins',
      partialize: (state) => ({
        favorites: state.favorites,
        favoriteIds: state.favoriteIds,
      }),
    },
  ),
);

