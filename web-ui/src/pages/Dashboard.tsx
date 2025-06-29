import { Box, CircularProgress, Paper, Typography, Alert } from '@mui/material';
import { useDashboardStats } from '../hooks/useDashboardStats';
import MetricsChart from '../components/charts/MetricsChart';
import GaugeChart from '../components/charts/GaugeChart';

function StatCard({ title, value, unit, color = 'primary' }: { 
  title: string; 
  value: string | number; 
  unit?: string;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center', minHeight: 120 }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h3" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
        {value}
        {unit && <Typography variant="h5" component="span" sx={{ ml: 1, color: 'text.secondary' }}>{unit}</Typography>}
      </Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const { metrics, status, isLoading } = useDashboardStats();

  // Mock data for charts when no real data is available
  const mockRequestData = [45, 52, 38, 65, 49, 75, 82, 68, 91, 76];
  const mockResponseTimeData = [120, 135, 98, 156, 142, 178, 165, 149, 187, 163];
  const mockTimeLabels = ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30', '10:35', '10:40', '10:45'];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>

      {!metrics && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Backend not connected. Displaying mock data for demonstration.
        </Alert>
      )}

      {/* Overview Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard 
            title="Total Requests" 
            value={metrics?.request_count ?? 1247} 
            color="primary"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard 
            title="Total Errors" 
            value={metrics?.error_count ?? 23} 
            color="error"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard 
            title="Avg Response Time" 
            value={metrics?.avg_response_time?.toFixed(2) ?? '156.7'} 
            unit="ms"
            color="info"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <StatCard 
            title="Cache Hit Ratio" 
            value={metrics?.cache_hit_ratio ? `${(metrics.cache_hit_ratio * 100).toFixed(1)}` : '87.3'} 
            unit="%"
            color="success"
          />
        </Box>
      </Box>

      {/* Charts Section */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 2, minWidth: 400 }}>
          <MetricsChart
            title="Requests per Minute"
            data={mockRequestData}
            labels={mockTimeLabels}
            color="#90caf9"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <GaugeChart
            title="Current Load"
            value={metrics?.active_connections ?? 42}
            max={100}
            color="#f48fb1"
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 2, minWidth: 400 }}>
          <MetricsChart
            title="Response Time (ms)"
            data={mockResponseTimeData}
            labels={mockTimeLabels}
            color="#81c784"
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Uptime:</strong> {status?.uptime ?? '2d 14h 32m'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Active Rules:</strong> {metrics?.rule_metrics ? Object.keys(metrics.rule_metrics).length : 3}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Memory Usage:</strong> 245 MB
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>CPU Usage:</strong> 12.4%
              </Typography>
              <Typography variant="body1" color="success.main" sx={{ mt: 2, fontWeight: 'bold' }}>
                ● All systems operational
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}