import { create } from 'zustand';

interface UIState {
  theme: 'light';
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  theme: 'light',
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// Always force light mode on load — remove any stored dark class
export const initializeTheme = () => {
  if (typeof window !== 'undefined') {
    // Clear any persisted dark theme
    localStorage.removeItem('medcare-ui-store');
    window.document.body.classList.remove('dark');
    window.document.documentElement.classList.remove('dark');
  }
};
