import { Typography } from 'antd';

const { Title } = Typography;

const Configuration = () => {
  return (
    <div>
      <Title>Configuration</Title>
      <p className="text-gray-400">View and edit the main proxy configuration here. You can also reload the configuration from the file.</p>
    </div>
  );
};

export default Configuration;