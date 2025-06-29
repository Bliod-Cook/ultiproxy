import { Box, Paper, Typography } from '@mui/material';
import { Gauge } from '@mui/x-charts/Gauge';

interface GaugeChartProps {
  title: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
}

export default function GaugeChart({ title, value, max, unit = '', color = '#90caf9' }: GaugeChartProps) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center', height: 250 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 180 }}>
        <Gauge
          width={150}
          height={150}
          value={value}
          valueMax={max}
          text={`${value}${unit}`}
          sx={{
            '& .MuiGauge-valueText': {
              fontSize: 16,
              fontWeight: 'bold',
            },
            '& .MuiGauge-valueArc': {
              fill: color,
            },
          }}
        />
      </Box>
    </Paper>
  );
}