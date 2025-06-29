import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { webSocketService } from './services/websocket';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rules from './pages/Rules';
import Monitoring from './pages/Monitoring';
import Config from './pages/Config';
import Logs from './pages/Logs';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    webSocketService.connect();
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="rules" element={<Rules />} />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="config" element={<Config />} />
            <Route path="logs" element={<Logs />} />
          </Route>
        </Routes>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
