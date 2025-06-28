import { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  SwapOutlined,
  SettingOutlined,
  AreaChartOutlined,
  BoxPlotOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/rules', icon: <SwapOutlined />, label: 'Forwarding Rules' },
    { key: '/configuration', icon: <SettingOutlined />, label: 'Configuration' },
    { key: '/monitoring', icon: <AreaChartOutlined />, label: 'Monitoring' },
    { key: '/content-sources', icon: <BoxPlotOutlined />, label: 'Content Sources' },
    { key: '/system-status', icon: <HeartOutlined />, label: 'System Status' },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
      <div className="h-8 m-4 bg-gray-700 text-white flex items-center justify-center font-bold text-lg">
        UP
      </div>
      <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
        {menuItems.map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
                <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;