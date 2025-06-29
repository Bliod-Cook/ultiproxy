import { Box, Paper, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

interface MetricsChartProps {
  title: string;
  data: number[];
  labels: string[];
  color?: string;
}

export default function MetricsChart({ title, data, labels, color = '#90caf9' }: MetricsChartProps) {
  return (
    <Paper sx={{ p: 2, height: 300 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: 250 }}>
        <LineChart
          xAxis={[{ data: labels.map((_, index) => index), scaleType: 'point' }]}
          series={[
            {
              data,
              color,
              curve: 'linear',
            },
          ]}
          width={undefined}
          height={250}
        />
      </Box>
    </Paper>
  );
}