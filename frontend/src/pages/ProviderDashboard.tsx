import React from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import {
  Row, Col, Card, Statistic, Typography, Space, Table, Tag
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  BarChartOutlined,
  DownloadOutlined,
  DollarCircleOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

// ===== Types =====
type ChangeType = 'up' | 'down' | 'neutral'
type TextTone = 'secondary' | 'success' | 'warning' | 'danger'

type StatItemKey = 'datasets' | 'downloads' | 'income' | 'payout'
type StatItem = {
  key: StatItemKey
  label: string
  value: number
  icon: React.ReactNode
  changeText: string
  changeType: ChangeType
}

type DatasetStatus = 'active' | 'pending' | 'suspended'
type Dataset = {
  id: string
  name: string
  downloads: number
  revenueUsd: number
  status: DatasetStatus
}

export default function ProviderDashboard() {
  const nfInt = new Intl.NumberFormat('en-US')
  const nfUsd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  const stats: StatItem[] = [
    { key: 'datasets', label: 'Datasets của tôi', value: 3, icon: <BarChartOutlined /> , changeText: 'Active', changeType: 'neutral' },
    { key: 'downloads', label: 'Tổng lượt tải', value: 2683, icon: <DownloadOutlined />, changeText: '+342 tháng này', changeType: 'up' },
    { key: 'income', label: 'Thu nhập tháng này', value: 1847, icon: <DollarCircleOutlined />, changeText: '+$342', changeType: 'up' },
    { key: 'payout', label: 'Pending Payout', value: 1294, icon: <FieldTimeOutlined />, changeText: 'Trả ngày 1', changeType: 'neutral' },
  ]

  const datasets: Dataset[] = [
    { id: 'ds-1', name: 'EV Charging Station Usage Data', downloads: 1247, revenueUsd: 873, status: 'active' },
    { id: 'ds-2', name: 'Battery Health Telemetry Dataset', downloads: 892, revenueUsd: 624, status: 'active' },
    { id: 'ds-3', name: 'Fleet Route Optimization Data', downloads: 534, revenueUsd: 374, status: 'active' },
  ]

  const changeColor = (type: ChangeType): TextTone | undefined => {
    if (type === 'up') return 'success'
    if (type === 'down') return 'danger'
    return 'secondary'
  }

  const statusTag = (s: DatasetStatus) => {
    if (s === 'active') return <Tag color="green">active</Tag>
    if (s === 'pending') return <Tag color="gold">pending</Tag>
    return <Tag color="red">{s}</Tag>
  }

  const columns: ColumnsType<Dataset> = [
    { title: 'Dataset Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Downloads',
      dataIndex: 'downloads',
      key: 'downloads',
      align: 'right',
      render: (v: number) => nfInt.format(v),
      sorter: (a: Dataset, b: Dataset) => a.downloads - b.downloads,
    },
    {
      title: 'Revenue (70%)',
      dataIndex: 'revenueUsd',
      key: 'revenueUsd',
      align: 'right',
      render: (v: number) => nfUsd0.format(v),
      sorter: (a: Dataset, b: Dataset) => a.revenueUsd - b.revenueUsd,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (s: DatasetStatus) => statusTag(s),
      filters: [
        { text: 'active', value: 'active' },
        { text: 'pending', value: 'pending' },
        { text: 'suspended', value: 'suspended' },
      ],
      onFilter: (value, record) => record.status === String(value),
    },
  ]

  return (
    <DashboardLayout>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>Provider Dashboard</Title>
          <Text type="secondary">Quản lý datasets và theo dõi thu nhập</Text>
        </div>

        {/* Stats */}
        <Row gutter={[16, 16]}>
          {stats.map((s) => (
            <Col xs={24} sm={12} lg={6} key={s.key}>
              <Card>
                <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <Text type="secondary">{s.label}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Statistic
                        value={
                          s.key === 'income' || s.key === 'payout'
                            ? nfUsd0.format(s.value)
                            : nfInt.format(s.value)
                        }
                      />
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Text type={changeColor(s.changeType)}>{s.changeText}</Text>
                    </div>
                  </div>
                  <div style={{ fontSize: 28, lineHeight: 1, opacity: 0.85 }}>
                    {s.icon}
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {/* My Datasets */}
        <Card title="Datasets của tôi">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={datasets}
            pagination={{ pageSize: 5, showSizeChanger: false }}
          />
        </Card>
      </Space>
    </DashboardLayout>
  )
}
