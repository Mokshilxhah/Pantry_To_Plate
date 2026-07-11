import { create } from 'zustand';

export const usePantryStore = create(
  (set, get) => ({
    items: [],
    categories: [],
    activeCategory: 'ALL',
    searchQuery: '',
    isLoading: false,

    setItems: (itemsOrUpdater) =>
      set((state) => {
        const next =
          typeof itemsOrUpdater === 'function'
            ? itemsOrUpdater(state.items)
            : itemsOrUpdater;
        return { items: Array.isArray(next) ? next : [] };
      }),

    setActiveCategory: (cat) => set({ activeCategory: cat }),
    setSearchQuery: (q) => set({ searchQuery: q }),
  })
);
