import {create} from 'zustand';

interface UiState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  notification: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null;
  setNotification: (notification: UiState['notification']) => void;
  clearNotification: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
  notification: null,
  setNotification: (notification) => set({ notification }),
  clearNotification: () => set({ notification: null }),
}));