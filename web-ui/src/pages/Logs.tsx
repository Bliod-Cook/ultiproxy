import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Download as DownloadIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
  request_id?: string;
}

const mockLogs: LogEntry[] = [
  {
    timestamp: '2024-01-15T10:30:15.123Z',
    level: 'info',
    message: 'Server started on port 8080',
    source: 'server',
  },
  {
    timestamp: '2024-01-15T10:30:16.456Z',
    level: 'info',
    message: 'Forwarding rule loaded: api_proxy -> http://backend:3000',
    source: 'config',
  },
  {
    timestamp: '2024-01-15T10:30:45.789Z',
    level: 'info',
    message: 'Incoming request: GET /api/users',
    source: 'proxy',
    request_id: 'req_123456',
  },
  {
    timestamp: '2024-01-15T10:30:45.892Z',
    level: 'debug',
    message: 'Forwarding to backend: http://backend:3000/api/users',
    source: 'proxy',
    request_id: 'req_123456',
  },
  {
    timestamp: '2024-01-15T10:30:46.123Z',
    level: 'info',
    message: 'Response received: 200 OK (234ms)',
    source: 'proxy',
    request_id: 'req_123456',
  },
  {
    timestamp: '2024-01-15T10:31:12.456Z',
    level: 'warn',
    message: 'Backend response time high: 1.2s for /api/slow-endpoint',
    source: 'monitor',
    request_id: 'req_789012',
  },
  {
    timestamp: '2024-01-15T10:31:45.789Z',
    level: 'error',
    message: 'Backend connection failed: Connection refused',
    source: 'proxy',
    request_id: 'req_345678',
  },
  {
    timestamp: '2024-01-15T10:32:01.123Z',
    level: 'info',
    message: 'Rate limit applied: 100 requests/min exceeded',
    source: 'ratelimit',
  },
];

const levelColors = {
  debug: '#90a4ae',
  info: '#42a5f5',
  warn: '#ffa726',
  error: '#ef5350',
};

const levelPriority = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Simulate real-time log streaming
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const newLog: LogEntry = {
        timestamp: new Date().toISOString(),
        level: ['debug', 'info', 'warn', 'error'][Math.floor(Math.random() * 4)] as LogEntry['level'],
        message: [
          'Processing request to /api/data',
          'Cache hit for key: user_session_abc123',
          'Database query executed in 45ms',
          'WebSocket connection established',
          'Rate limit check passed',
          'SSL certificate validated',
          'Backend health check: OK',
          'Memory usage: 67%',
        ][Math.floor(Math.random() * 8)],
        source: ['proxy', 'cache', 'db', 'websocket', 'ratelimit', 'ssl', 'monitor'][Math.floor(Math.random() * 7)],
        request_id: Math.random() > 0.5 ? `req_${Math.random().toString(36).substr(2, 6)}` : undefined,
      };

      setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100 logs
    }, 2000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  // Filter logs
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.request_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      const minLevel = levelPriority[levelFilter as keyof typeof levelPriority];
      filtered = filtered.filter(log => levelPriority[log.level] >= minLevel);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter, sourceFilter]);

  const clearLogs = () => {
    setLogs([]);
    setFilteredLogs([]);
  };

  const downloadLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp}] ${log.level.toUpperCase()} ${log.source || 'unknown'}: ${log.message}${log.request_id ? ` (${log.request_id})` : ''}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultiproxy-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const uniqueSources = Array.from(new Set(logs.map(log => log.source).filter(Boolean)));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Logs Viewer</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setIsPaused(!isPaused)}
            color={isPaused ? 'primary' : 'default'}
            title={isPaused ? 'Resume streaming' : 'Pause streaming'}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadLogs}
            disabled={filteredLogs.length === 0}
          >
            Download
          </Button>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearLogs}
            color="error"
          >
            Clear
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Real-time log streaming from UltiProxy. {isPaused ? 'Streaming paused.' : 'Live updates enabled.'}
      </Alert>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Search logs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={levelFilter}
              label="Level"
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="debug">Debug+</MenuItem>
              <MenuItem value="info">Info+</MenuItem>
              <MenuItem value="warn">Warn+</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={sourceFilter}
              label="Source"
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <MenuItem value="all">All Sources</MenuItem>
              {uniqueSources.map(source => (
                <MenuItem key={source} value={source}>{source}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                size="small"
              />
            }
            label="Auto-scroll"
          />

          <Typography variant="body2" color="text.secondary">
            {filteredLogs.length} / {logs.length} logs
          </Typography>
        </Box>
      </Paper>

      {/* Logs Display */}
      <Paper sx={{ height: 600, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box
          ref={logsContainerRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 1,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          }}
        >
          {filteredLogs.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Typography>No logs match the current filters</Typography>
            </Box>
          ) : (
            filteredLogs.map((log, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  py: 0.5,
                  px: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                  borderLeft: `3px solid ${levelColors[log.level]}`,
                  ml: 1,
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    color: '#888',
                    minWidth: 80,
                    fontSize: '0.75rem',
                  }}
                >
                  {formatTimestamp(log.timestamp)}
                </Typography>
                
                <Chip
                  label={log.level.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor: levelColors[log.level],
                    color: 'white',
                    fontWeight: 'bold',
                    minWidth: 60,
                    fontSize: '0.7rem',
                    height: 20,
                  }}
                />
                
                {log.source && (
                  <Chip
                    label={log.source}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: '#555',
                      color: '#aaa',
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                )}
                
                <Typography
                  component="span"
                  sx={{
                    flex: 1,
                    wordBreak: 'break-word',
                    color: '#fff',
                  }}
                >
                  {log.message}
                </Typography>
                
                {log.request_id && (
                  <Typography
                    component="span"
                    sx={{
                      color: '#888',
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                    }}
                  >
                    {log.request_id}
                  </Typography>
                )}
              </Box>
            ))
          )}
          <div ref={logsEndRef} />
        </Box>
      </Paper>
    </Box>
  );
}