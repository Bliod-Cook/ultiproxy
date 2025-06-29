import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useRules, useDeleteRule } from '../hooks/useRules';
import RuleEditor from '../components/RuleEditor';
import type { ForwardingRule } from '../services/types';

// Mock data for demonstration
const mockRules: ForwardingRule[] = [
  {
    name: 'api_proxy',
    path: '/api/*',
    target_urls: ['http://backend1:8080', 'http://backend2:8080'],
    load_balancing: 'round_robin',
    header_replacements: {
      'X-Custom-Header': {
        source: 'file',
        path: './headers/custom.txt',
        split_by: 'line',
        cache_ttl: 300,
      },
    },
  },
  {
    name: 'static_proxy',
    path: '/static/*',
    target_urls: ['http://cdn1.example.com', 'http://cdn2.example.com'],
    load_balancing: 'round_robin',
  },
  {
    name: 'auth_proxy',
    path: '/auth/*',
    target_urls: ['http://auth.example.com'],
    load_balancing: 'round_robin',
    body_replacements: {
      '{{API_KEY}}': {
        source: 'file',
        path: './keys/api_keys.txt',
        split_by: 'line',
        cache_ttl: 600,
      },
    },
  },
];

export default function Rules() {
  const { data: rules, isLoading, error } = useRules();
  const deleteRule = useDeleteRule();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ForwardingRule | undefined>(undefined);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  const displayRules = rules || mockRules;

  const handleDelete = async (ruleName: string) => {
    if (window.confirm(`Are you sure you want to delete rule "${ruleName}"?`)) {
      try {
        await deleteRule.mutateAsync(ruleName);
      } catch (error) {
        console.error('Failed to delete rule:', error);
      }
    }
  };

  const handleEdit = (rule: ForwardingRule) => {
    setEditingRule(rule);
    setEditorMode('edit');
    setEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingRule(undefined);
    setEditorMode('create');
    setEditorOpen(true);
  };

  const handleSaveRule = (rule: ForwardingRule) => {
    console.log('Saving rule:', rule);
    // TODO: Implement actual save logic
    setEditorOpen(false);
  };

  const handleTest = (rule: ForwardingRule) => {
    console.log('Testing rule:', rule.name);
    // TODO: Implement rule testing
  };

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
        <Typography variant="h4">Forwarding Rules</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Add New Rule
        </Button>
      </Box>

      {!rules && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Backend not connected. Displaying mock data for demonstration.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load rules: {error.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Path Pattern</strong></TableCell>
              <TableCell><strong>Target URLs</strong></TableCell>
              <TableCell><strong>Load Balancing</strong></TableCell>
              <TableCell><strong>Features</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayRules.map((rule) => (
              <TableRow key={rule.name} hover>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {rule.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={rule.path} variant="outlined" size="small" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {rule.target_urls.map((url, index) => (
                      <Typography key={index} variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {url}
                      </Typography>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={rule.load_balancing} 
                    color="primary" 
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {rule.header_replacements && (
                      <Chip label="Headers" color="info" size="small" />
                    )}
                    {rule.body_replacements && (
                      <Chip label="Body" color="warning" size="small" />
                    )}
                    {!rule.header_replacements && !rule.body_replacements && (
                      <Typography variant="body2" color="text.secondary">
                        None
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleTest(rule)}
                      title="Test Rule"
                    >
                      <TestIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(rule)}
                      title="Edit Rule"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(rule.name)}
                      title="Delete Rule"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {displayRules.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No forwarding rules configured
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Click "Add New Rule" to create your first forwarding rule
          </Typography>
        </Box>
      )}

      <RuleEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={handleSaveRule}
        rule={editingRule}
        mode={editorMode}
      />
    </Box>
  );
}