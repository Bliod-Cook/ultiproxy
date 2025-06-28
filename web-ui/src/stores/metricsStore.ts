import {create} from 'zustand';
import { getMetrics } from '../services/api';
import type { SystemMetrics } from '../types/api';
import { useUiStore } from './uiStore';

interface MetricsState {
  metrics: SystemMetrics | null;
  fetchMetrics: () => Promise<void>;
  setMetrics: (metrics: SystemMetrics) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  metrics: null,
  fetchMetrics: async () => {
    useUiStore.getState().setLoading(true);
    try {
      const response = await getMetrics();
      if (response.success && response.data) {
        set({ metrics: response.data });
      } else {
        throw new Error(response.error || 'Failed to fetch metrics');
      }
    } catch (error: any) {
      useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
      useUiStore.getState().setLoading(false);
    }
  },
  setMetrics: (metrics) => set({ metrics }),
}));