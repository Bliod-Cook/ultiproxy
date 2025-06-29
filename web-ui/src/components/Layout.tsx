import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const drawerWidth = 240;

export default function Layout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}