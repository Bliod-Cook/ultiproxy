import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useDashboardStats() {
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: api.getMetrics,
  });

  const { data: status, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['status'],
    queryFn: api.getStatus,
  });

  return {
    metrics,
    status,
    isLoading: isLoadingMetrics || isLoadingStatus,
  };
}