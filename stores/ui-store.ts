// src/stores/ui-store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Modal states
  isSearchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Notifications count (example of data that comes from server but needs local state)
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  incrementNotificationCount: () => void;
  decrementNotificationCount: () => void;

  // Shopping cart preview (the actual cart data would be in React Query)
  isCartPreviewOpen: boolean;
  setCartPreviewOpen: (open: boolean) => void;

  // Recently viewed products (persisted locally)
  recentlyViewedProductIds: string[];
  addRecentlyViewed: (productId: string) => void;
  clearRecentlyViewed: () => void;

  // Filters state (for product listing)
  filters: {
    priceRange: [number, number];
    categories: string[];
    brands: string[];
    inStock: boolean;
  };
  setFilters: (filters: Partial<UIState["filters"]>) => void;
  resetFilters: () => void;
}

const defaultFilters = {
  priceRange: [0, 100000] as [number, number],
  categories: [],
  brands: [],
  inStock: true,
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Sidebar
        sidebarOpen: false,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        // Modals
        isSearchModalOpen: false,
        setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),

        // Theme
        theme: "system",
        setTheme: (theme) => set({ theme }),

        // Notifications
        notificationCount: 0,
        setNotificationCount: (count) => set({ notificationCount: count }),
        incrementNotificationCount: () =>
          set((state) => ({ notificationCount: state.notificationCount + 1 })),
        decrementNotificationCount: () =>
          set((state) => ({ notificationCount: Math.max(0, state.notificationCount - 1) })),

        // Cart preview
        isCartPreviewOpen: false,
        setCartPreviewOpen: (open) => set({ isCartPreviewOpen: open }),

        // Recently viewed
        recentlyViewedProductIds: [],
        addRecentlyViewed: (productId) =>
          set((state) => ({
            recentlyViewedProductIds: [
              productId,
              ...state.recentlyViewedProductIds.filter((id) => id !== productId),
            ].slice(0, 10), // Keep only last 10
          })),
        clearRecentlyViewed: () => set({ recentlyViewedProductIds: [] }),

        // Filters
        filters: defaultFilters,
        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          })),
        resetFilters: () => set({ filters: defaultFilters }),
      }),
      {
        name: "ui-store",
        partialize: (state) => ({
          theme: state.theme,
          recentlyViewedProductIds: state.recentlyViewedProductIds,
          filters: state.filters,
        }),
      }
    )
  )
);

// Example selectors
export const useTheme = () => useUIStore((state) => state.theme);
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen);
export const useCartPreview = () => useUIStore((state) => state.isCartPreviewOpen);
export const useFilters = () => useUIStore((state) => state.filters);
