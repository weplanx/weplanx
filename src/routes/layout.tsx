import { Outlet } from '@modern-js/runtime/router';
import { Layout, ConfigProvider } from 'antd';
import '@common/styles/common.css';

export default () => {
  return (
    <ConfigProvider>
      <Layout style={{ height: '100%', overflow: 'hidden' }}>
        <Outlet />
      </Layout>
    </ConfigProvider>
  );
};
