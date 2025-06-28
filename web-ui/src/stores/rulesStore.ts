import {create} from 'zustand';
import {
  listRules,
  createRule as apiCreateRule,
  updateRule as apiUpdateRule,
  deleteRule as apiDeleteRule,
  testRule as apiTestRule,
} from '../services/api';
import type { ForwardingRule, RuleTestRequest, RuleTestResult } from '../types/api';
import { useUiStore } from './uiStore';

interface RulesState {
  rules: ForwardingRule[];
  fetchRules: () => Promise<void>;
  createRule: (rule: ForwardingRule) => Promise<void>;
  updateRule: (name: string, rule: ForwardingRule) => Promise<void>;
  deleteRule: (name: string) => Promise<void>;
  testRule: (name: string, data: RuleTestRequest) => Promise<RuleTestResult | undefined>;
}

export const useRulesStore = create<RulesState>((set) => ({
  rules: [],
  fetchRules: async () => {
    useUiStore.getState().setLoading(true);
    try {
      const response = await listRules();
      if (response.success && response.data) {
        set({ rules: response.data });
      } else {
        throw new Error(response.error || 'Failed to fetch rules');
      }
    } catch (error: any) {
      useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
      useUiStore.getState().setLoading(false);
    }
  },
  createRule: async (rule) => {
    useUiStore.getState().setLoading(true);
    try {
      const response = await apiCreateRule(rule);
      if (response.success) {
        useUiStore.getState().setNotification({ message: 'Rule created successfully', type: 'success' });
        await useRulesStore.getState().fetchRules();
      } else {
        throw new Error(response.error || 'Failed to create rule');
      }
    } catch (error: any) {
      useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
      useUiStore.getState().setLoading(false);
    }
  },
  updateRule: async (name, rule) => {
    useUiStore.getState().setLoading(true);
    try {
      const response = await apiUpdateRule(name, rule);
      if (response.success) {
        useUiStore.getState().setNotification({ message: 'Rule updated successfully', type: 'success' });
        await useRulesStore.getState().fetchRules();
      } else {
        throw new Error(response.error || 'Failed to update rule');
      }
    } catch (error: any) {
      useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
      useUiStore.getState().setLoading(false);
    }
  },
  deleteRule: async (name) => {
    useUiStore.getState().setLoading(true);
    try {
      const response = await apiDeleteRule(name);
      if (response.success) {
        useUiStore.getState().setNotification({ message: 'Rule deleted successfully', type: 'success' });
        await useRulesStore.getState().fetchRules();
      } else {
        throw new Error(response.error || 'Failed to delete rule');
      }
    } catch (error: any) {
      useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
      useUiStore.getState().setLoading(false);
    }
  },
  testRule: async (name, data) => {
    useUiStore.getState().setLoading(true);
    try {
        const response = await apiTestRule(name, data);
        if (response.success && response.data) {
            return response.data;
        } else {
            throw new Error(response.error || 'Failed to test rule');
        }
    } catch (error: any) {
        useUiStore.getState().setNotification({ message: error.message, type: 'error' });
    } finally {
        useUiStore.getState().setLoading(false);
    }
  },
}));