import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { Save as SaveIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useState } from 'react';

interface ProxyConfig {
  listen_port: number;
  max_connections: number;
  timeout_seconds: number;
  enable_logging: boolean;
  log_level: 'debug' | 'info' | 'warn' | 'error';
  enable_metrics: boolean;
  metrics_port: number;
  enable_cors: boolean;
  cors_origins: string[];
  rate_limit: {
    enabled: boolean;
    requests_per_minute: number;
    burst_size: number;
  };
  ssl: {
    enabled: boolean;
    cert_path: string;
    key_path: string;
    redirect_http: boolean;
  };
  cache: {
    enabled: boolean;
    max_size_mb: number;
    ttl_seconds: number;
  };
}

const defaultConfig: ProxyConfig = {
  listen_port: 8080,
  max_connections: 1000,
  timeout_seconds: 30,
  enable_logging: true,
  log_level: 'info',
  enable_metrics: true,
  metrics_port: 9090,
  enable_cors: false,
  cors_origins: [],
  rate_limit: {
    enabled: false,
    requests_per_minute: 100,
    burst_size: 10,
  },
  ssl: {
    enabled: false,
    cert_path: '',
    key_path: '',
    redirect_http: false,
  },
  cache: {
    enabled: false,
    max_size_mb: 100,
    ttl_seconds: 300,
  },
};

export default function Config() {
  const [config, setConfig] = useState<ProxyConfig>(defaultConfig);
  const [corsOrigin, setCorsOrigin] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSave = () => {
    setSnackbar({
      open: true,
      message: 'Configuration saved successfully! (Demo mode)',
      severity: 'success'
    });
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setSnackbar({
      open: true,
      message: 'Configuration reset to default values.',
      severity: 'success'
    });
  };

  const addCorsOrigin = () => {
    if (corsOrigin && !config.cors_origins.includes(corsOrigin)) {
      setConfig({
        ...config,
        cors_origins: [...config.cors_origins, corsOrigin]
      });
      setCorsOrigin('');
    }
  };

  const removeCorsOrigin = (origin: string) => {
    setConfig({
      ...config,
      cors_origins: config.cors_origins.filter(o => o !== origin)
    });
  };

  const updateConfig = (path: string, value: unknown) => {
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: Record<string, unknown> = newConfig as Record<string, unknown>;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
    
    setConfig(newConfig);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Configuration</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Backend not connected. Configuration changes will not be persisted.
      </Alert>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Basic Settings */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Listen Port"
                  type="number"
                  value={config.listen_port}
                  onChange={(e) => updateConfig('listen_port', parseInt(e.target.value))}
                  fullWidth
                />
                <TextField
                  label="Max Connections"
                  type="number"
                  value={config.max_connections}
                  onChange={(e) => updateConfig('max_connections', parseInt(e.target.value))}
                  fullWidth
                />
                <TextField
                  label="Timeout (seconds)"
                  type="number"
                  value={config.timeout_seconds}
                  onChange={(e) => updateConfig('timeout_seconds', parseInt(e.target.value))}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Log Level</InputLabel>
                  <Select
                    value={config.log_level}
                    label="Log Level"
                    onChange={(e) => updateConfig('log_level', e.target.value)}
                  >
                    <MenuItem value="debug">Debug</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warn">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enable_logging}
                      onChange={(e) => updateConfig('enable_logging', e.target.checked)}
                    />
                  }
                  label="Enable Logging"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enable_metrics}
                      onChange={(e) => updateConfig('enable_metrics', e.target.checked)}
                    />
                  }
                  label="Enable Metrics"
                />
                {config.enable_metrics && (
                  <TextField
                    label="Metrics Port"
                    type="number"
                    value={config.metrics_port}
                    onChange={(e) => updateConfig('metrics_port', parseInt(e.target.value))}
                    size="small"
                    sx={{ ml: 4, mt: 1 }}
                  />
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.enable_cors}
                      onChange={(e) => updateConfig('enable_cors', e.target.checked)}
                    />
                  }
                  label="Enable CORS"
                />
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* CORS Configuration */}
        {config.enable_cors && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              CORS Origins
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Add Origin"
                value={corsOrigin}
                onChange={(e) => setCorsOrigin(e.target.value)}
                placeholder="https://example.com"
                sx={{ flex: 1 }}
                onKeyPress={(e) => e.key === 'Enter' && addCorsOrigin()}
              />
              <Button variant="outlined" onClick={addCorsOrigin}>
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {config.cors_origins.map((origin) => (
                <Chip
                  key={origin}
                  label={origin}
                  onDelete={() => removeCorsOrigin(origin)}
                />
              ))}
            </Box>
          </Paper>
        )}

        {/* Rate Limiting & SSL */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Rate Limiting
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.rate_limit.enabled}
                      onChange={(e) => updateConfig('rate_limit.enabled', e.target.checked)}
                    />
                  }
                  label="Enable Rate Limiting"
                />
                {config.rate_limit.enabled && (
                  <>
                    <TextField
                      label="Requests per Minute"
                      type="number"
                      value={config.rate_limit.requests_per_minute}
                      onChange={(e) => updateConfig('rate_limit.requests_per_minute', parseInt(e.target.value))}
                      fullWidth
                    />
                    <TextField
                      label="Burst Size"
                      type="number"
                      value={config.rate_limit.burst_size}
                      onChange={(e) => updateConfig('rate_limit.burst_size', parseInt(e.target.value))}
                      fullWidth
                    />
                  </>
                )}
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                SSL/TLS
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.ssl.enabled}
                      onChange={(e) => updateConfig('ssl.enabled', e.target.checked)}
                    />
                  }
                  label="Enable SSL/TLS"
                />
                {config.ssl.enabled && (
                  <>
                    <TextField
                      label="Certificate Path"
                      value={config.ssl.cert_path}
                      onChange={(e) => updateConfig('ssl.cert_path', e.target.value)}
                      fullWidth
                      placeholder="/path/to/cert.pem"
                    />
                    <TextField
                      label="Private Key Path"
                      value={config.ssl.key_path}
                      onChange={(e) => updateConfig('ssl.key_path', e.target.value)}
                      fullWidth
                      placeholder="/path/to/key.pem"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.ssl.redirect_http}
                          onChange={(e) => updateConfig('ssl.redirect_http', e.target.checked)}
                        />
                      }
                      label="Redirect HTTP to HTTPS"
                    />
                  </>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Cache Configuration */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Response Cache
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.cache.enabled}
                  onChange={(e) => updateConfig('cache.enabled', e.target.checked)}
                />
              }
              label="Enable Response Caching"
            />
            {config.cache.enabled && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Max Cache Size (MB)"
                  type="number"
                  value={config.cache.max_size_mb}
                  onChange={(e) => updateConfig('cache.max_size_mb', parseInt(e.target.value))}
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <TextField
                  label="TTL (seconds)"
                  type="number"
                  value={config.cache.ttl_seconds}
                  onChange={(e) => updateConfig('cache.ttl_seconds', parseInt(e.target.value))}
                  sx={{ flex: 1, minWidth: 200 }}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}