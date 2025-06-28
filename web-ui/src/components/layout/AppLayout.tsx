import { Layout } from 'antd';
import Sidebar from './Sidebar';
import AppHeader from './Header';

const { Content } = Layout;

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <AppHeader />
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#0f172a' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;