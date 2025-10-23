import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Card, Row, Col, Space, Typography, Table, Tag, Select, DatePicker, Input, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { ProviderDataset, DatasetStatus } from '../types/provider'
import { getMyDatasets } from '../services/provider'
const { Title } = Typography
const { RangePicker } = DatePicker

export default function ProviderDatasets() {
  const [data, setData] = useState<ProviderDataset[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<DatasetStatus[]>([])
  const [category, setCategory] = useState<string[]>([])
  const [q, setQ] = useState('')
  const [range, setRange] = useState<any>(null)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const items = await getMyDatasets({ status, category, q, updatedFrom: range?.[0]?.toISOString(), updatedTo: range?.[1]?.toISOString() })
        setData(items)
      } finally { setLoading(false) }
    })()
  }, [status, category, q, range])

  const columns: ColumnsType<ProviderDataset> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Price', dataIndex: 'priceUsd', key: 'priceUsd', align: 'right', render: (v: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v) },
    { title: 'Status', dataIndex: 'status', key: 'status', align: 'center', render: (s: DatasetStatus) =>
      s==='active'?<Tag color="green">active</Tag>:s==='pending'?<Tag color="gold">pending</Tag>:
      s==='draft'?<Tag>draft</Tag>:s==='suspended'?<Tag color="red">suspended</Tag>:<Tag color="red">rejected</Tag> },
    { title: 'Updated', dataIndex: 'updatedAt', key: 'updatedAt' },
    { title: 'Version', dataIndex: 'currentVersionId', key: 'currentVersionId' },
  ]

  return (
    <DashboardLayout>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Title level={2} style={{ margin: 0 }}>My Datasets</Title>

        <Card>
          <Row gutter={[12,12]}>
            <Col xs={24} md={6}><Select mode="multiple" placeholder="Status" onChange={(v)=>setStatus(v as DatasetStatus[])} options={[
              {label:'draft',value:'draft'},{label:'pending',value:'pending'},{label:'active',value:'active'},{label:'suspended',value:'suspended'},{label:'rejected',value:'rejected'}
            ]} style={{width:'100%'}}/></Col>
            <Col xs={24} md={6}><Select mode="multiple" placeholder="Category" onChange={(v)=>setCategory(v as string[])} style={{width:'100%'}}/></Col>
            <Col xs={24} md={8}><RangePicker onChange={(v)=>setRange(v)} style={{width:'100%'}}/></Col>
            <Col xs={24} md={4}><Input placeholder="Search..." value={q} onChange={(e)=>setQ(e.target.value)}/></Col>
          </Row>
        </Card>

        <Card>
          <Table rowKey="id" loading={loading} columns={columns} dataSource={data} pagination={{pageSize:10, showSizeChanger:false}} />
        </Card>
      </Space>
    </DashboardLayout>
  )
}
