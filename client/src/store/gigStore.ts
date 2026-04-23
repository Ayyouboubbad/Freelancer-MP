import { create } from 'zustand';
import type { Gig } from '../types';
import { gigAPI } from '../api';

interface GigFilters {
  category: string;
  minPrice: number | '';
  maxPrice: number | '';
  minRating: number | '';
  deliveryDays: number | '';
  sort: string;
  q: string;
}

interface GigState {
  gigs: Gig[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  filters: GigFilters;
  setFilters: (f: Partial<GigFilters>) => void;
  resetFilters: () => void;
  fetchGigs: (page?: number) => Promise<void>;
  searchGigs: (page?: number) => Promise<void>;
}

const defaultFilters: GigFilters = {
  category: '', minPrice: '', maxPrice: '', minRating: '',
  deliveryDays: '', sort: '-createdAt', q: '',
};

export const useGigStore = create<GigState>((set, get) => ({
  gigs: [], total: 0, page: 1, pages: 1, loading: false,
  filters: defaultFilters,

  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: defaultFilters, page: 1 }),

  fetchGigs: async (page = 1) => {
    set({ loading: true });
    try {
      const { filters } = get();
      const params: Record<string, unknown> = { page, limit: 12 };
      if (filters.category)    params.category    = filters.category;
      if (filters.minPrice)    params.minPrice    = filters.minPrice;
      if (filters.maxPrice)    params.maxPrice    = filters.maxPrice;
      if (filters.minRating)   params.minRating   = filters.minRating;
      if (filters.deliveryDays) params.deliveryDays = filters.deliveryDays;
      if (filters.sort)        params.sort        = filters.sort;

      const { data } = await gigAPI.getGigs(params);
      set({ gigs: data.gigs, total: data.total, page: data.page, pages: data.pages });
    } finally {
      set({ loading: false });
    }
  },

  searchGigs: async (page = 1) => {
    set({ loading: true });
    try {
      const { filters } = get();
      const params: Record<string, unknown> = { page, limit: 12, q: filters.q };
      if (filters.category) params.category = filters.category;
      if (filters.sort)     params.sort = filters.sort;

      const { data } = await gigAPI.searchGigs(params);
      set({ gigs: data.gigs, total: data.total, page: data.page, pages: data.pages });
    } finally {
      set({ loading: false });
    }
  },
}));
