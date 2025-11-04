'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavoriteStore = {
  favorites: string[];
  addFavorite: (coinId: string) => void;
  removeFavorite: (coinId: string) => void;
  isFavorite: (coinId: string) => boolean;
};

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (coinId) =>
        set((state) =>
          state.favorites.includes(coinId)
            ? state
            : { favorites: [...state.favorites, coinId] },
        ),
      removeFavorite: (coinId) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== coinId),
        })),
      isFavorite: (coinId) => get().favorites.includes(coinId),
    }),
    {
      name: 'favorite-coins',
      partialize: (state) => ({ favorites: state.favorites }),
    },
  ),
);

