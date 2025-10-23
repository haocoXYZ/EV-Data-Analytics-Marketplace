import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Card, Row, Col, Space, Typography, Statistic, Table, DatePicker, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { EarningRecord } from '../types/provider'
import { getEarnings } from '../services/provider'
const { Title } = Typography
const { RangePicker } = DatePicker

export default function ProviderEarnings() {
  const [data, setData] = useState<EarningRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState<any>(null)
  const [datasetId, setDatasetId] = useState<string | undefined>(undefined)

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const rows = await getEarnings({ from: range?.[0]?.toISOString() ?? new Date(Date.now()-30*864e5).toISOString(), to: range?.[1]?.toISOString() ?? new Date().toISOString(), datasetId })
        setData(rows)
      } finally { setLoading(false) }
    })()
  }, [range, datasetId])

  const gross = data.reduce((s,r)=>s+r.grossUsd,0)
  const net = data.reduce((s,r)=>s+r.netUsd,0)

  const columns: ColumnsType<EarningRecord> = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Order', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Dataset', dataIndex: 'datasetName', key: 'datasetName' },
    { title: 'Gross', dataIndex: 'grossUsd', key: 'grossUsd', align: 'right', render: (v:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v) },
    { title: 'Fee', dataIndex: 'feeUsd', key: 'feeUsd', align: 'right', render: (v:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v) },
    { title: 'Net', dataIndex: 'netUsd', key: 'netUsd', align: 'right', render: (v:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(v) },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Coupon', dataIndex: 'couponCode', key: 'couponCode' },
  ]

  return (
    <DashboardLayout>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Title level={2} style={{ margin: 0 }}>Earnings</Title>

        <Row gutter={[16,16]}>
          <Col xs={24} md={6}><Card><Statistic title="Gross (range)" value={new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(gross)}/></Card></Col>
          <Col xs={24} md={6}><Card><Statistic title="Net (range)" value={new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(net)}/></Card></Col>
        </Row>

        <Card>
          <Space style={{ marginBottom: 12, flexWrap:'wrap' }}>
            <RangePicker onChange={(v)=>setRange(v)} />
            <Select allowClear placeholder="Dataset" onChange={(v)=>setDatasetId(v)} style={{ minWidth: 220 }} />
          </Space>
          <Table rowKey="id" loading={loading} columns={columns} dataSource={data} pagination={{ pageSize: 10, showSizeChanger: false }} />
        </Card>
      </Space>
    </DashboardLayout>
  )
}
