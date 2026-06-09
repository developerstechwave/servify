import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './app/app';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary:    'rgba(101, 16, 127, 1)',
          colorBgContainer: 'rgba(255, 255, 255, 1)',
          borderRadius:    8,
          fontFamily:      'Inter, sans-serif',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);
