import { Typography } from 'antd';

const { Title } = Typography;

const Dashboard = () => {
  return (
    <div>
      <Title>Dashboard</Title>
      <p className="text-gray-400">Welcome to the UltiProxy management dashboard. Real-time metrics and system status will be displayed here.</p>
    </div>
  );
};

export default Dashboard;