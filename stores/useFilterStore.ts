import { create } from 'zustand';
import type { PlaceType } from '@/types/database';

interface FilterState {
  activeTypes: PlaceType[];
  searchKeyword: string;
  minRating: number;
  toggleType: (type: PlaceType) => void;
  setSearchKeyword: (keyword: string) => void;
  setMinRating: (rating: number) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  activeTypes: ['restaurant', 'accommodation', 'attraction', 'subway'],
  searchKeyword: '',
  minRating: 0,
  toggleType: (type) =>
    set((state) => ({
      activeTypes: state.activeTypes.includes(type)
        ? state.activeTypes.filter((t) => t !== type)
        : [...state.activeTypes, type],
    })),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setMinRating: (rating) => set({ minRating: rating }),
  resetFilters: () =>
    set({
      activeTypes: ['restaurant', 'accommodation', 'attraction', 'subway'],
      searchKeyword: '',
      minRating: 0,
    }),
}));