import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, notification } from 'antd';
import { useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Rules from './pages/Rules';
import Configuration from './pages/Configuration';
import Monitoring from './pages/Monitoring';
import ContentSources from './pages/ContentSources';
import SystemStatus from './pages/SystemStatus';
import { useUiStore } from './stores/uiStore';
import { webSocketService } from './services/websocket';

function App() {
  const { notification: appNotification, clearNotification } = useUiStore();
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    webSocketService.connect();
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (appNotification) {
      api[appNotification.type]({
        message: appNotification.message,
        placement: 'topRight',
      });
      clearNotification();
    }
  }, [appNotification, api, clearNotification]);

  return (
    <>
      {contextHolder}
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/configuration" element={<Configuration />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/content-sources" element={<ContentSources />} />
            <Route path="/system-status" element={<SystemStatus />} />
          </Routes>
        </AppLayout>
      </Router>
    </>
  );
}

export default App;