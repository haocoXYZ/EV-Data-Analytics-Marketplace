// src/main.tsx hoặc src/index.tsx
import './styles/visible-text-fix.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { AuthProvider } from './contexts/AuthContext'
import Routes from './routes'
import 'antd/dist/reset.css'
import './index.css'

const router = createBrowserRouter(Routes)

const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          colorBgLayout: '#f5f7fb',     // nền tổng thể dịu
          colorBgContainer: '#ffffff',  // nền card/khung
          borderRadiusLG: 12,
        },
        components: {
          Layout: { headerBg: '#ffffff', siderBg: '#ffffff' },
        },
      }}
    >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>
)
