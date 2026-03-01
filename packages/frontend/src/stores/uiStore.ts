import { create } from 'zustand';

type ToastType = 'success' | 'warning' | 'info' | 'danger';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface UiState {
  sidebarCollapsed: boolean;
  toasts: Toast[];
  toggleSidebar: () => void;
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toasts: [],

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  addToast: (type, message) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    // 3초 후 자동 제거
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
