import { Typography } from 'antd';

const { Title } = Typography;

const ContentSources = () => {
  return (
    <div>
      <Title>Content Sources</Title>
      <p className="text-gray-400">Manage content sources and their caches here. You'll be able to view statistics and clear caches.</p>
    </div>
  );
};

export default ContentSources;