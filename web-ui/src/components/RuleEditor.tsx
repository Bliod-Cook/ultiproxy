import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  Divider,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import type { ForwardingRule } from '../services/types';

interface RuleEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (rule: ForwardingRule) => void;
  rule?: ForwardingRule;
  mode: 'create' | 'edit';
}

const defaultRule: ForwardingRule = {
  name: '',
  path: '',
  target_urls: [''],
  load_balancing: 'round_robin',
  header_replacements: {},
  body_replacements: {},
};

export default function RuleEditor({ open, onClose, onSave, rule, mode }: RuleEditorProps) {
  const [formData, setFormData] = useState<ForwardingRule>(defaultRule);
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [newBodyKey, setNewBodyKey] = useState('');
  const [newBodyValue, setNewBodyValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rule && mode === 'edit') {
      setFormData(rule);
    } else {
      setFormData(defaultRule);
    }
    setErrors({});
  }, [rule, mode, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Rule name is required';
    }

    if (!formData.path.trim()) {
      newErrors.path = 'Path pattern is required';
    } else if (!formData.path.startsWith('/')) {
      newErrors.path = 'Path pattern must start with /';
    }

    if (formData.target_urls.length === 0 || !formData.target_urls[0]?.trim()) {
      newErrors.target_urls = 'At least one target URL is required';
    } else {
      for (const url of formData.target_urls) {
        if (url.trim()) {
          try {
            new URL(url);
          } catch {
            newErrors.target_urls = 'Invalid URL format';
            break;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const ruleToSave: ForwardingRule = {
      ...formData,
      target_urls: formData.target_urls.filter(url => url.trim()),
    };

    onSave(ruleToSave);
    onClose();
  };

  const updateFormData = (field: keyof ForwardingRule, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTargetUrl = () => {
    if (newTargetUrl.trim()) {
      updateFormData('target_urls', [...formData.target_urls, newTargetUrl.trim()]);
      setNewTargetUrl('');
    }
  };

  const removeTargetUrl = (index: number) => {
    updateFormData('target_urls', formData.target_urls.filter((_, i) => i !== index));
  };

  const addHeaderReplacement = () => {
    if (newHeaderKey && newHeaderValue) {
      updateFormData('header_replacements', {
        ...formData.header_replacements,
        [newHeaderKey]: {
          source: 'file' as const,
          path: newHeaderValue,
          split_by: 'line' as const,
        },
      });
      setNewHeaderKey('');
      setNewHeaderValue('');
    }
  };

  const removeHeaderReplacement = (key: string) => {
    const newReplacements = { ...formData.header_replacements };
    delete newReplacements[key];
    updateFormData('header_replacements', newReplacements);
  };

  const addBodyReplacement = () => {
    if (newBodyKey && newBodyValue) {
      updateFormData('body_replacements', {
        ...formData.body_replacements,
        [newBodyKey]: {
          source: 'file' as const,
          path: newBodyValue,
          split_by: 'line' as const,
        },
      });
      setNewBodyKey('');
      setNewBodyValue('');
    }
  };

  const removeBodyReplacement = (key: string) => {
    const newReplacements = { ...formData.body_replacements };
    delete newReplacements[key];
    updateFormData('body_replacements', newReplacements);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Create Forwarding Rule' : 'Edit Forwarding Rule'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* Basic Settings */}
          <Box>
            <Typography variant="h6" gutterBottom>Basic Settings</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Rule Name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                fullWidth
                required
              />
              
              <TextField
                label="Path Pattern"
                value={formData.path}
                onChange={(e) => updateFormData('path', e.target.value)}
                error={!!errors.path}
                helperText={errors.path || 'e.g., /api/*, /static/**'}
                fullWidth
                required
              />
              
              <FormControl fullWidth>
                <InputLabel>Load Balancing</InputLabel>
                <Select
                  value={formData.load_balancing}
                  label="Load Balancing"
                  onChange={(e) => updateFormData('load_balancing', e.target.value)}
                >
                  <MenuItem value="round_robin">Round Robin</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Divider />

          {/* Target URLs */}
          <Box>
            <Typography variant="h6" gutterBottom>Target URLs</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Add Target URL"
                value={newTargetUrl}
                onChange={(e) => setNewTargetUrl(e.target.value)}
                placeholder="http://backend:3000"
                sx={{ flex: 1 }}
                onKeyPress={(e) => e.key === 'Enter' && addTargetUrl()}
                error={!!errors.target_urls}
                helperText={errors.target_urls}
              />
              <IconButton onClick={addTargetUrl} disabled={!newTargetUrl.trim()}>
                <AddIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {formData.target_urls.map((url, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...formData.target_urls];
                      newUrls[index] = e.target.value;
                      updateFormData('target_urls', newUrls);
                    }}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <Button
                    onClick={() => removeTargetUrl(index)}
                    color="error"
                    size="small"
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider />

          {/* Header Replacements */}
          <Box>
            <Typography variant="h6" gutterBottom>Header Replacements</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Replace header values with content from files
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Header Name"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="File Path"
                value={newHeaderValue}
                onChange={(e) => setNewHeaderValue(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                placeholder="/path/to/file.txt"
              />
              <IconButton onClick={addHeaderReplacement} disabled={!newHeaderKey || !newHeaderValue}>
                <AddIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(formData.header_replacements || {}).map(([key, replacement]) => (
                <Chip
                  key={key}
                  label={`${key}: ${replacement.path || replacement.url || 'N/A'}`}
                  onDelete={() => removeHeaderReplacement(key)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* Body Replacements */}
          <Box>
            <Typography variant="h6" gutterBottom>Body Replacements</Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Replace body content with content from files
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Replacement Key"
                value={newBodyKey}
                onChange={(e) => setNewBodyKey(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                placeholder="{{key}}"
              />
              <TextField
                label="File Path"
                value={newBodyValue}
                onChange={(e) => setNewBodyValue(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                placeholder="/path/to/file.txt"
              />
              <IconButton onClick={addBodyReplacement} disabled={!newBodyKey || !newBodyValue}>
                <AddIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(formData.body_replacements || {}).map(([key, replacement]) => (
                <Chip
                  key={key}
                  label={`${key}: ${replacement.path || replacement.url || 'N/A'}`}
                  onDelete={() => removeBodyReplacement(key)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {Object.keys(errors).length > 0 && (
            <Alert severity="error">
              Please fix the validation errors above.
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === 'create' ? 'Create Rule' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}