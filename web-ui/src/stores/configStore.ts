import {create} from 'zustand';
import {
  getConfig,
  updateConfig as apiUpdateConfig,
  reloadConfig as apiReloadConfig,
  validateConfig as apiValidateConfig,
} from '../services/api';
import type { Config, ConfigValidationResult } from '../types/api';
import { useUiStore } from './uiStore';

interface ConfigState {
  config: Config | null;
  fetchConfig: () => Promise<void>;
  updateConfig: (config: Config) => Promise<void>;
  reloadConfig: () => Promise<void>;
  validateConfig: (config: Config) => Promise<ConfigValidationResult | undefined>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  fetchConfig: async () => {
    useUiStore.getState().setLoading(true);
    try {
      const response = await getConfig();
      if (response.success && response.data) {
        set({ config: response.data });
      } else {
        throw new Error(response.error || 'Failed to fetch config');
      }
    } catch (error: any) {
      useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
      useUiStore.getState().setLoading(false);
    }
  },
  updateConfig: async (config) => {
    useUiStore.getState().setLoading(true);
    try {
      const response = await apiUpdateConfig(config);
      if (response.success && response.data) {
        set({ config: response.data });
        useUiStore.getState().setNotification({ message: 'Configuration updated successfully', type: 'success' });
      } else {
        throw new Error(response.error || 'Failed to update config');
      }
    } catch (error: any) {
      useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
      useUiStore.getState().setLoading(false);
    }
  },
  reloadConfig: async () => {
    useUiStore.getState().setLoading(true);
    try {
      const response = await apiReloadConfig();
      if (response.success) {
        useUiStore.getState().setNotification({ message: 'Configuration reloaded successfully', type: 'success' });
        await useConfigStore.getState().fetchConfig();
      } else {
        throw new Error(response.error || 'Failed to reload config');
      }
    } catch (error: any) {
      useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
      useUiStore.getState().setLoading(false);
    }
  },
  validateConfig: async (config) => {
    useUiStore.getState().setLoading(true);
    try {
      const response = await apiValidateConfig(config);
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to validate config');
      }
    } catch (error: any) {
      useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
      useUiStore.getState().setLoading(false);
    }
  }
}));