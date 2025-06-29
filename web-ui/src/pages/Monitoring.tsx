import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useMonitoring } from '../hooks/useMonitoring';
import MetricsChart from '../components/charts/MetricsChart';
import GaugeChart from '../components/charts/GaugeChart';

function BackendHealthCard({ name, status, responseTime }: {
  name: string;
  status: 'up' | 'down';
  responseTime: number;
}) {
  const isHealthy = status === 'up';
  
  return (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      {isHealthy ? (
        <HealthyIcon color="success" />
      ) : (
        <ErrorIcon color="error" />
      )}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Response: {responseTime}ms
        </Typography>
      </Box>
      <Chip
        label={status.toUpperCase()}
        color={isHealthy ? 'success' : 'error'}
        size="small"
      />
    </Paper>
  );
}

function MetricCard({ title, value, unit, trend, color = 'primary' }: {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
        {value}
        {unit && <Typography variant="h6" component="span" sx={{ ml: 1, color: 'text.secondary' }}>{unit}</Typography>}
      </Typography>
      {trend && (
        <Typography 
          variant="body2" 
          color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
          sx={{ mt: 1 }}
        >
          {trend === 'up' ? '↗ Trending up' : trend === 'down' ? '↘ Trending down' : '→ Stable'}
        </Typography>
      )}
    </Paper>
  );
}

export default function Monitoring() {
  const { metrics, isLoading, isLive } = useMonitoring();

  // Mock data for demonstration
  const mockMetrics = {
    request_count: 15847,
    error_count: 89,
    avg_response_time: 142.5,
    cache_hit_ratio: 0.891,
    active_connections: 67,
    uptime_seconds: 186420,
    rule_metrics: {
      api_proxy: {
        request_count: 8934,
        error_count: 23,
        avg_response_time: 156.2,
        backend_health: {
          'backend1:8080': { status: 'up' as const, response_time: 145 },
          'backend2:8080': { status: 'up' as const, response_time: 167 },
        },
      },
      static_proxy: {
        request_count: 4521,
        error_count: 12,
        avg_response_time: 89.3,
        backend_health: {
          'cdn1.example.com': { status: 'up' as const, response_time: 78 },
          'cdn2.example.com': { status: 'down' as const, response_time: 0 },
        },
      },
      auth_proxy: {
        request_count: 2392,
        error_count: 54,
        avg_response_time: 234.7,
        backend_health: {
          'auth.example.com': { status: 'up' as const, response_time: 234 },
        },
      },
    },
  };

  const displayMetrics = metrics || mockMetrics;
  const errorRate = displayMetrics.request_count > 0 
    ? (displayMetrics.error_count / displayMetrics.request_count * 100) 
    : 0;

  // Mock time series data
  const requestData = [45, 52, 38, 65, 49, 75, 82, 68, 91, 76, 89, 94];
  const responseTimeData = [120, 135, 98, 156, 142, 178, 165, 149, 187, 163, 145, 142];
  const errorData = [2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 1, 2];
  const timeLabels = ['11:00', '11:05', '11:10', '11:15', '11:20', '11:25', '11:30', '11:35', '11:40', '11:45', '11:50', '11:55'];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Real-time Monitoring</Typography>
        {isLive && (
          <Chip
            icon={<HealthyIcon />}
            label="Live Data"
            color="success"
            variant="outlined"
          />
        )}
      </Box>

      {!metrics && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Backend not connected. Displaying mock data for demonstration.
        </Alert>
      )}

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <MetricCard
            title="Requests/min"
            value={Math.round(displayMetrics.request_count / 60)}
            trend="up"
            color="primary"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <MetricCard
            title="Error Rate"
            value={Number(errorRate.toFixed(2))}
            unit="%"
            trend={errorRate > 1 ? 'up' : 'stable'}
            color={errorRate > 1 ? 'error' : 'success'}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <MetricCard
            title="Avg Response"
            value={Number(displayMetrics.avg_response_time.toFixed(1))}
            unit="ms"
            trend="stable"
            color="info"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <MetricCard
            title="Active Connections"
            value={displayMetrics.active_connections}
            trend="up"
            color="warning"
          />
        </Box>
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 2, minWidth: 400 }}>
          <MetricsChart
            title="Requests per Minute"
            data={requestData}
            labels={timeLabels}
            color="#90caf9"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <GaugeChart
            title="CPU Usage"
            value={23}
            max={100}
            unit="%"
            color="#f48fb1"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 400 }}>
          <MetricsChart
            title="Response Time (ms)"
            data={responseTimeData}
            labels={timeLabels}
            color="#81c784"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 400 }}>
          <MetricsChart
            title="Error Count"
            data={errorData}
            labels={timeLabels}
            color="#ffb74d"
          />
        </Box>
      </Box>

      {/* Backend Health Status */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Backend Health Status
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Object.entries(displayMetrics.rule_metrics).map(([ruleName, ruleMetrics]) => (
          <Paper key={ruleName} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {ruleName} Backends
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(ruleMetrics.backend_health).map(([backendName, health]) => (
                <BackendHealthCard
                  key={backendName}
                  name={backendName}
                  status={health.status}
                  responseTime={health.response_time}
                />
              ))}
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography variant="body2">
                Requests: {ruleMetrics.request_count.toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Errors: {ruleMetrics.error_count}
              </Typography>
              <Typography variant="body2">
                Avg Response: {ruleMetrics.avg_response_time.toFixed(1)}ms
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}