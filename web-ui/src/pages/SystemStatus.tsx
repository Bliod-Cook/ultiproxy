import { Typography } from 'antd';

const { Title } = Typography;

const SystemStatus = () => {
  return (
    <div>
      <Title>System Status</Title>
      <p className="text-gray-400">This page will display the overall system health, version information, and status of various components.</p>
    </div>
  );
};

export default SystemStatus;