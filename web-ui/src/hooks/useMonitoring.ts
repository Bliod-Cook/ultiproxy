import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { webSocketService } from '../services/websocket';
import type { SystemMetrics } from '../services/types';

export function useMonitoring() {
  const [liveMetrics, setLiveMetrics] = useState<SystemMetrics | null>(null);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: api.getMetrics,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  useEffect(() => {
    const handleMetricsUpdate = (data: unknown) => {
      if (data && typeof data === 'object') {
        setLiveMetrics(data as SystemMetrics);
      }
    };

    webSocketService.subscribe('metrics_update', handleMetricsUpdate);

    return () => {
      webSocketService.unsubscribe('metrics_update');
    };
  }, []);

  return {
    metrics: liveMetrics || metrics,
    health,
    isLoading,
    isLive: !!liveMetrics,
  };
}