import { Layout, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

const AppHeader = () => {
  return (
    <Header style={{ background: '#0f172a', padding: '0 16px', borderBottom: '1px solid #334155' }}>
      <div className="flex items-center justify-between h-full">
        <h1 className="text-xl font-bold text-white">UltiProxy Dashboard</h1>
        <div>
          <Avatar icon={<UserOutlined />} />
        </div>
      </div>
    </Header>
  );
};

export default AppHeader;