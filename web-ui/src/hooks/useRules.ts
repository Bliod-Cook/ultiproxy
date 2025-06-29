import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { ForwardingRule } from '../services/types';

export function useRules() {
  return useQuery({
    queryKey: ['rules'],
    queryFn: api.getRules,
  });
}

export function useCreateRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useUpdateRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ name, rule }: { name: string; rule: ForwardingRule }) => 
      api.updateRule(name, rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useDeleteRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}