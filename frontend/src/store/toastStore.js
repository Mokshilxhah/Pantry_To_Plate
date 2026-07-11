import { create } from 'zustand';

const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration,
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // Convenience methods
  success: (message, duration = 3000) => {
    return get().addToast(message, 'success', duration);
  },

  error: (message, duration = 4000) => {
    return get().addToast(message, 'error', duration);
  },

  warning: (message, duration = 3500) => {
    return get().addToast(message, 'warning', duration);
  },

  info: (message, duration = 3000) => {
    return get().addToast(message, 'info', duration);
  },
}));

export default useToastStore;
