// src/pages/AdminDashboard.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import {
  Row, Col, Card, Statistic, Typography, Space, Button, List, Tag
} from 'antd'
import {
  BarChartOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  CheckSquareOutlined,
  SettingOutlined,
  DollarOutlined,
  SearchOutlined,
} from '@ant-design/icons'

type ActivityStatus = 'pending' | 'approved' | 'completed'
interface Activity {
  action: string
  user: string
  time: string
  status: ActivityStatus
}

export default function AdminDashboard() {
  const { Title, Paragraph } = Typography

  const stats = [
    { label: 'Tổng Datasets', value: 10, change: '+2 tháng này', icon: <BarChartOutlined /> },
    { label: 'Providers', value: 5, change: '+1 tháng này', icon: <TeamOutlined /> },
    { label: 'Consumers', value: 127, change: '+23 tháng này', icon: <ShoppingCartOutlined /> },
    { label: 'Doanh thu', value: 12847, change: '+15% tháng này', icon: <DollarCircleOutlined />, prefix: '$' },
  ]

  const activities: Activity[] = [
    { action: 'Dataset mới được thêm', user: 'VinFast Charging Network', time: '2 giờ trước', status: 'pending' },
    { action: 'Provider đăng ký', user: 'GreenFleet Solutions', time: '5 giờ trước', status: 'approved' },
    { action: 'Consumer mua data', user: 'Công ty ABC', time: '1 ngày trước', status: 'completed' },
    { action: 'Payout request', user: 'TechEV Analytics', time: '2 ngày trước', status: 'pending' },
  ]

  const statusTag = (s: ActivityStatus) => {
    if (s === 'pending') return <Tag color="gold">pending</Tag>
    if (s === 'approved') return <Tag color="green">approved</Tag>
    return <Tag color="blue">completed</Tag>
  }

  return (
    <DashboardLayout>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>Admin Dashboard</Title>
          <Paragraph type="secondary" style={{ margin: 0 }}>
            Tổng quan hệ thống EV Data Marketplace
          </Paragraph>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]}>
          {stats.map((s, i) => (
            <Col xs={24} md={12} lg={6} key={i}>
              <Card>
                <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 24, opacity: 0.7 }}>{s.icon}</div>
                </Space>
                <div style={{ marginTop: 8 }}>
                  <div style={{ opacity: 0.7, marginBottom: 4 }}>{s.label}</div>
                  <Statistic
                    value={s.value}
                    prefix={s.prefix}
                    valueStyle={{ fontWeight: 700 }}
                  />
                  <div style={{ color: '#16a34a', marginTop: 4, fontSize: 12 }}>{s.change}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Link to="/moderator/review">
                <Button block size="large" icon={<CheckSquareOutlined />}>
                  Review Datasets
                </Button>
              </Link>
            </Col>
            <Col xs={12} md={6}>
              <Link to="/admin/pricing">
                <Button block size="large" icon={<DollarOutlined />}>
                  Manage Pricing
                </Button>
              </Link>
            </Col>
            <Col xs={12} md={6}>
              <Link to="/admin/payouts">
                <Button block size="large" icon={<DollarCircleOutlined />}>
                  Process Payouts
                </Button>
              </Link>
            </Col>
            <Col xs={12} md={6}>
              <Link to="/catalog">
                <Button block size="large" icon={<SearchOutlined />}>
                  View Catalog
                </Button>
              </Link>
            </Col>
          </Row>
        </Card>

        {/* Recent Activities */}
        <Card title="Hoạt động gần đây">
          <List
            itemLayout="horizontal"
            dataSource={activities}
            renderItem={(item) => (
              <List.Item actions={[statusTag(item.status)]}>
                <List.Item.Meta
                  title={<span style={{ fontWeight: 600 }}>{item.action}</span>}
                  description={
                    <span style={{ opacity: 0.75 }}>
                      {item.user} · {item.time}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </DashboardLayout>
  )
}
