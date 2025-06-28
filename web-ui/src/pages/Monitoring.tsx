import { Typography } from 'antd';

const { Title } = Typography;

const Monitoring = () => {
  return (
    <div>
      <Title>Monitoring</Title>
      <p className="text-gray-400">This page will display real-time monitoring data, including metrics charts and backend health status.</p>
    </div>
  );
};

export default Monitoring;