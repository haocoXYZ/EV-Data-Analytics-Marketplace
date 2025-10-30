// src/pages/ProviderWallet.tsx
import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Card, Row, Col, Space, Typography, Statistic, Table, Tag, Button, Modal, InputNumber, Form, DatePicker, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import {
  getWalletBalance, getWalletTransactions, requestPayout
} from '../services/provider'
import type { WalletBalance, WalletTransaction, WalletTxnType } from '../types/provider'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function ProviderWallet() {
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [txns, setTxns] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [amount, setAmount] = useState<number | null>(null)
  const [filterRange, setFilterRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
  const [types, setTypes] = useState<WalletTxnType[]>([])

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const [b, t] = await Promise.all([getWalletBalance(), getWalletTransactions({})])
        setBalance(b)
        setTxns(t)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filteredTxns = useMemo(() => {
    return txns.filter(t => {
      const okType = types.length ? types.includes(t.type) : true
      const okDate = filterRange
        ? dayjs(t.createdAt).isAfter(filterRange[0].startOf('day')) &&
          dayjs(t.createdAt).isBefore(filterRange[1].endOf('day'))
        : true
      return okType && okDate
    })
  }, [txns, types, filterRange])

  const typeTag = (t: WalletTxnType) =>
    t === 'credit_sale' ? <Tag color="green">Sale</Tag> :
    t === 'debit_refund' ? <Tag color="red">Refund</Tag> :
    t === 'debit_payout' ? <Tag color="blue">Payout</Tag> :
    <Tag>Adjust</Tag>

  const statusTag = (s: WalletTransaction['status']) =>
    s === 'pending' ? <Tag color="gold">pending</Tag> :
    s === 'available' ? <Tag color="green">available</Tag> :
    s === 'settled' ? <Tag color="blue">settled</Tag> :
    <Tag color="red">reversed</Tag>

  const nf = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })

  const columns: ColumnsType<WalletTransaction> = [
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      render: (t: WalletTxnType) => typeTag(t),
      filters: [
        { text: 'Sale', value: 'credit_sale' },
        { text: 'Refund', value: 'debit_refund' },
        { text: 'Payout', value: 'debit_payout' },
        { text: 'Adjustment', value: 'adjustment' },
      ],
      onFilter: (value, record) => record.type === String(value) as WalletTxnType,
    },
    { title: 'Amount', dataIndex: 'amountUsd', key: 'amountUsd', align: 'right', render: (v: number) => nf.format(v) },
    { title: 'Status', dataIndex: 'status', key: 'status', align: 'center', render: statusTag },
    { title: 'Order', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Payout', dataIndex: 'payoutId', key: 'payoutId' },
    { title: 'Note', dataIndex: 'note', key: 'note', ellipsis: true },
  ]

  const canRequest = (balance?.availableUsd ?? 0) > 0

  const submitPayout = async () => {
    if (!amount || amount <= 0) return
    setLoading(true)
    try {
      await requestPayout(amount)
      // refresh lại số dư & giao dịch
      const [b, t] = await Promise.all([getWalletBalance(), getWalletTransactions({})])
      setBalance(b); setTxns(t)
      setPayoutOpen(false); setAmount(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>Ví của nhà cung cấp</Title>
          <Text type="secondary">Tiền bán hàng sẽ vào ví, trừ phí nền tảng. Có thể yêu cầu rút về phương thức payout.</Text>
        </div>

        {/* Balances */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}><Statistic title="Available" value={nf.format(balance?.availableUsd ?? 0)} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}><Statistic title="Pending" value={nf.format(balance?.pendingUsd ?? 0)} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}><Statistic title="On Hold" value={nf.format(balance?.onHoldUsd ?? 0)} /></Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card loading={loading}><Statistic title="Lifetime Earnings" value={nf.format(balance?.lifetimeEarningsUsd ?? 0)} /></Card>
          </Col>
        </Row>

        {/* Filters + Actions */}
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Space>
              <RangePicker onChange={(v) => setFilterRange(v as any)} />
              <Select
                mode="multiple"
                placeholder="Loại giao dịch"
                style={{ minWidth: 240 }}
                onChange={(vals) => setTypes(vals as WalletTxnType[])}
                options={[
                  { label: 'Sale', value: 'credit_sale' },
                  { label: 'Refund', value: 'debit_refund' },
                  { label: 'Payout', value: 'debit_payout' },
                  { label: 'Adjustment', value: 'adjustment' },
                ]}
              />
            </Space>
            <Button type="primary" onClick={() => setPayoutOpen(true)} disabled={!canRequest}>
              Request Payout
            </Button>
          </Space>
        </Card>

        {/* Transactions */}
        <Card title="Lịch sử giao dịch">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredTxns}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </Card>

        {/* Payout Modal */}
        <Modal
          open={payoutOpen}
          onCancel={() => setPayoutOpen(false)}
          title="Yêu cầu rút tiền"
          onOk={submitPayout}
          okButtonProps={{ disabled: !amount || amount <= 0 || (balance?.availableUsd ?? 0) < (amount ?? 0) }}
          confirmLoading={loading}
        >
          <Form layout="vertical">
            <Form.Item label="Số tiền (USD)">
              <InputNumber
                min={1}
                precision={2}
                style={{ width: '100%' }}
                value={amount ?? undefined}
                onChange={(v) => setAmount(Number(v))}
              />
            </Form.Item>
            <Text type="secondary">
              Số dư có thể rút: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                .format(balance?.availableUsd ?? 0)}
            </Text>
          </Form>
        </Modal>
      </Space>
    </DashboardLayout>
  )
}
