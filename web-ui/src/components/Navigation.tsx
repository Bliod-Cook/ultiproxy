import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RuleIcon from '@mui/icons-material/Rule';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';

const drawerWidth = 240;

const navigationItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Forwarding Rules', icon: <RuleIcon />, path: '/rules' },
  { text: 'Monitoring', icon: <MonitorHeartIcon />, path: '/monitoring' },
  { text: 'Configuration', icon: <SettingsIcon />, path: '/config' },
  { text: 'Logs', icon: <DescriptionIcon />, path: '/logs' },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          UltiProxy
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}