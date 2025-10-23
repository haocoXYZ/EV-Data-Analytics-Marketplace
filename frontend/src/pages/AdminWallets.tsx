import React, { useEffect, useMemo, useState } from 'react'
import {
  Button, Card, Drawer, Form, Input, InputNumber, Modal, Select,
  Space, Table, Tag, Typography, message, Checkbox
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DollarOutlined, OrderedListOutlined, EditOutlined } from '@ant-design/icons'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import {
  listWallets, getLedger, adjustWallet,
  type Wallet, type Role, type AdjustPayload, type LedgerEntry
} from '../api/wallets'

const { Title, Text } = Typography

export default function AdminWallets() {
  const { user } = useAuth()
  const [role, setRole] = useState<Role | 'all'>('all')
  const [query, setQuery] = useState<string>('')

  const [data, setData] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(false)

  const [adjusting, setAdjusting] = useState<Wallet | null>(null)
  const [ledgerUser, setLedgerUser] = useState<Wallet | null>(null)
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [adjForm] = Form.useForm<AdjustPayload & { notify?: boolean }>()

  // formatter tiền tệ dùng chung
  const fmtUsd = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    []
  )

  async function reload() {
    setLoading(true)
    try {
      const rows = await listWallets(role === 'all' ? undefined : role, query)
      setData(rows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [role, query]) // eslint-disable-line react-hooks/exhaustive-deps

  const columns: ColumnsType<Wallet> = useMemo(
    () => [
      { title: 'User', dataIndex: 'userId', key: 'userId' },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (r: Role) => <Tag color={r === 'provider' ? 'blue' : 'purple'}>{r}</Tag>,
      },
      {
        title: 'Available',
        dataIndex: 'availableUsd',
        key: 'availableUsd',
        align: 'right',
        render: (v: number) => fmtUsd.format(v),
      },
      {
        title: 'Pending',
        dataIndex: 'pendingUsd',
        key: 'pendingUsd',
        align: 'right',
        render: (v: number) => fmtUsd.format(v),
      },
      {
        title: 'On Hold',
        dataIndex: 'onHoldUsd',
        key: 'onHoldUsd',
        align: 'right',
        render: (v: number) => fmtUsd.format(v),
      },
      {
        title: 'Lifetime',
        key: 'lifetime',
        align: 'right',
        render: (_: unknown, rec: Wallet) =>
          rec.role === 'provider'
            ? fmtUsd.format(rec.lifetimeEarningsUsd || 0)
            : fmtUsd.format(rec.lifetimeSpendUsd || 0),
      },
      {
        title: 'Actions',
        key: 'actions',
        align: 'center',
        render: (_: unknown, rec: Wallet) => (
          <Space size="small">
            <Button icon={<EditOutlined />} onClick={() => { setAdjusting(rec); adjForm.resetFields() }}>
              Adjust
            </Button>
            <Button
              icon={<OrderedListOutlined />}
              onClick={async () => {
                setLedgerUser(rec)
                setLedger(await getLedger(rec.userId))
              }}
            >
              Ledger
            </Button>
          </Space>
        ),
      },
    ],
    [fmtUsd, adjForm]
  )

  async function submitAdjust() {
    const payload = await adjForm.validateFields()
    if (!adjusting) return
    try {
      await adjustWallet(
        adjusting.userId,
        {
          bucket: payload.bucket,
          direction: payload.direction,
          amountUsd: payload.amountUsd,
          reason: payload.reason,
          note: payload.note,
          notify: payload.notify,
        },
        user?.email || user?.name || 'admin'
      )
      message.success('Đã điều chỉnh & lưu lịch sử')
      setAdjusting(null)
      reload()
    } catch (e: any) {
      message.error(e?.message || 'Adjust failed')
    }
  }

  return (
    <DashboardLayout>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <div>
          <Title level={2} style={{ marginBottom: 0 }}>Wallets</Title>
          <Text type="secondary">Quản trị số dư ví của customer & provider. Mọi điều chỉnh đều ghi vào lịch sử.</Text>
        </div>

        <Card>
          <Space wrap>
            <Select<Role | 'all'>
              value={role}
              style={{ width: 160 }}
              onChange={setRole}
              options={[
                { value: 'all', label: 'All roles' },
                { value: 'provider', label: 'Providers' },
                { value: 'consumer', label: 'Customers' },
              ]}
            />
            <Input
              placeholder="Tìm theo userId..."
              style={{ width: 240 }}
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              allowClear
            />
            <Button icon={<DollarOutlined />} onClick={reload}>Refresh</Button>
          </Space>

          <Table
            style={{ marginTop: 12 }}
            rowKey="userId"
            loading={loading}
            dataSource={data}
            columns={columns}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </Space>

      {/* Adjust Modal */}
      <Modal
        title={<>Adjust balance — <Text code>{adjusting?.userId}</Text></>}
        open={!!adjusting}
        onCancel={() => setAdjusting(null)}
        onOk={submitAdjust}
        okText="Save adjust"
      >
        <Form
          form={adjForm}
          layout="vertical"
          initialValues={{ direction: 'credit', bucket: 'available', reason: 'correction', notify: true }}
        >
          <Form.Item name="direction" label="Direction" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'credit', label: 'Credit (+)' },
                { value: 'debit', label: 'Debit (−)' },
              ]}
            />
          </Form.Item>
          <Form.Item name="bucket" label="Bucket" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'available', label: 'Available' },
                { value: 'pending', label: 'Pending' },
                { value: 'onHold', label: 'On Hold' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="amountUsd"
            label="Amount (USD)"
            rules={[{ required: true, type: 'number', min: 0.01 }]}
          >
            <InputNumber style={{ width: '100%' }} step={1} precision={2} />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'correction', label: 'Correction' },
                { value: 'refund', label: 'Refund' },
                { value: 'promo', label: 'Promo/Credit' },
                { value: 'penalty', label: 'Penalty' },
                { value: 'manual', label: 'Manual' },
              ]}
            />
          </Form.Item>
          <Form.Item name="note" label="Internal note">
            <Input.TextArea rows={3} placeholder="ghi chú nội bộ / reference id..." />
          </Form.Item>
          <Form.Item name="notify" valuePropName="checked">
            <Checkbox>Notify user</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Ledger Drawer */}
      <Drawer
        title={<>Ledger — <Text code>{ledgerUser?.userId}</Text></>}
        open={!!ledgerUser}
        width={720}
        onClose={() => setLedgerUser(null)}
      >
        <Table
          size="small"
          rowKey="id"
          dataSource={ledger}
          pagination={{ pageSize: 12 }}
          columns={[
            { title: 'Time', dataIndex: 'ts', render: (v: string) => new Date(v).toLocaleString() },
            { title: 'Admin', dataIndex: 'adminId' },
            { title: 'Bucket', dataIndex: ['delta', 'bucket'] },
            { title: 'Dir', dataIndex: ['delta', 'direction'] },
            {
              title: 'Amount',
              dataIndex: ['delta', 'amountUsd'],
              align: 'right',
              render: (v: number) => fmtUsd.format(v),
            },
            { title: 'Reason', dataIndex: 'reason' },
            { title: 'Note', dataIndex: 'note', ellipsis: true },
            {
              title: 'Prev → Next',
              render: (_: unknown, r: LedgerEntry) => (
                <Text type="secondary">
                  {r.prev.availableUsd}/{r.prev.pendingUsd}/{r.prev.onHoldUsd}
                  {' '}→{' '}
                  {r.next.availableUsd}/{r.next.pendingUsd}/{r.next.onHoldUsd}
                </Text>
              ),
            },
          ]}
        />
      </Drawer>
    </DashboardLayout>
  )
}
