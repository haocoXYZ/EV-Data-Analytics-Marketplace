import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import {
  Card, Table, Tag, Space, Button, Input, Modal, Form, message, Select,
  Drawer, Descriptions, Typography, Popconfirm, Tabs, Checkbox, Empty, Tooltip
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  listCustomers, setCustomerStatus, deleteCustomer, saveCustomer,
  // 🔐 Customer security & notify
  listCustomerSessions, revokeAllCustomerSessions,
  requireCustomerPasswordReset, resetCustomer2FA,
  listCustomerNotifyLogs, sendCustomerNotification,
  // ⭐️ KYC & moderation cho Customer
  approveCustomerKyc, suspendCustomer, getCustomer,
  // 🔒 Block login theo email (dùng chung)
  isAccountBlocked, blockAccount, unblockAccount,
} from '../api/admin'
import type { Customer, CustomerStatus } from '../types/admin'

const { Text } = Typography

// —— helper: tag màu cho status
const statusTag = (s: CustomerStatus) =>
  s === 'new'       ? <Tag color="blue">new</Tag> :
  s === 'pending'   ? <Tag color="gold">pending</Tag> :
  s === 'kyc'       ? <Tag color="green">kyc</Tag> :
                      <Tag color="red">suspended</Tag>

// —— helper: có KYC hay chưa (dựa trên một vài field cá nhân)
function hasKyc(c?: Customer) {
  const k = (c as any)?.kyc
  if (!k) return false
  return Boolean(
    k.fullName || k.dob || k.nationalId || k.address ||
    k.phone || k.bankAccount || k.bankName
  )
}

// —— UI types cho bảng phiên & log
type CustomerSession = { id: string; device: string; ip?: string; ua?: string; lastSeen?: string }
type NotifyLog = { id: string; channels: string[]; title: string; body: string; createdAt: string }

export default function AdminCustomers() {
  const [rows, setRows] = useState<Customer[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<CustomerStatus | 'all'>('all')

  // Create
  const [openNew, setOpenNew] = useState(false)
  const [form] = Form.useForm()

  // View
  const [viewId, setViewId] = useState<string | null>(null)
  const viewData = useMemo(() => rows.find(r => r.id === viewId) || null, [rows, viewId])

  // 🔐 Tabs + data
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'notify'>('info')
  const [sessions, setSessions] = useState<CustomerSession[]>([])
  const [notifyLogs, setNotifyLogs] = useState<NotifyLog[]>([])
  const [notifyForm] = Form.useForm<{ channels: string[]; title: string; body: string }>()

  // Suspend modal (nhập lý do)
  const [suspendId, setSuspendId] = useState<string | null>(null)
  const [suspendForm] = Form.useForm<{ reason: string }>()

  const load = async () => setRows(await listCustomers())
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!viewId) {
      setSessions([])
      setNotifyLogs([])
      return
    }
    (async () => {
      setSessions(await listCustomerSessions(viewId))
      setNotifyLogs(await listCustomerNotifyLogs(viewId))
      notifyForm.setFieldsValue({ channels: ['email'], title: '', body: '' })
      setActiveTab('info')
    })()
  }, [viewId])

  const filtered = useMemo(() => rows.filter(r =>
    (!q ||
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.email.toLowerCase().includes(q.toLowerCase()) ||
      (r.org || '').toLowerCase().includes(q.toLowerCase())
    ) && (status === 'all' || r.status === status)
  ), [rows, q, status])

  const columns: ColumnsType<Customer> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, r) => (
        <Button type="link" onClick={() => setViewId(r.id)} style={{ padding: 0 }}>
          {r.name}
        </Button>
      )
    },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'Org', dataIndex: 'org', key: 'org', ellipsis: true },
    { title: 'Purchases', dataIndex: 'purchases', key: 'purchases', width: 110 },
    { title: 'Spent', dataIndex: 'spent', key: 'spent', render: (v) => `$${v.toFixed(2)}`, width: 120 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 220,
      render: (_: CustomerStatus, r) => {
        const lastReject = [...(r.messages || [])].reverse().find(m => m.type === 'rejection')
        const st = r.status === 'suspended' && lastReject?.content
          ? <Tooltip title={lastReject.content}>{statusTag(r.status)}</Tooltip>
          : statusTag(r.status)
        const blocked = isAccountBlocked(r.email)
        return (
          <>
            {st}
            {blocked && <Tag color="magenta" style={{ marginLeft: 8 }}>blocked</Tag>}
          </>
        )
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 780,
      render: (_, r) => {
        const blocked = isAccountBlocked(r.email)
        return (
          <Space size="small" wrap>
            <Button size="small" onClick={() => setViewId(r.id)}>View</Button>

            {r.status === 'new' && (
              <Popconfirm
                title="Delete customer?"
                description={`Xóa ${r.name}? Hành động này không thể hoàn tác.`}
                okText="Delete"
                okButtonProps={{ danger: true }}
                onConfirm={async () => { await deleteCustomer(r.id); message.success('Deleted'); load() }}
              >
                <Button size="small" type="link" danger>Delete</Button>
              </Popconfirm>
            )}

            {r.status === 'pending' && (
              <>
                <Button
                  size="small"
                  type="primary"
                  disabled={!hasKyc(r)}
                  onClick={async () => {
                    await approveCustomerKyc(r.id)
                    message.success('Approved KYC'); load()
                  }}
                >
                  Approve KYC
                </Button>
                <Button size="small" danger onClick={() => { setSuspendId(r.id); suspendForm.resetFields() }}>
                  Suspend
                </Button>
              </>
            )}

            {r.status === 'kyc' && (
              <Button size="small" danger onClick={() => { setSuspendId(r.id); suspendForm.resetFields() }}>
                Suspend
              </Button>
            )}

            {r.status === 'suspended' && (
              <Button size="small" onClick={async () => {
                await setCustomerStatus(r.id, 'new')
                message.success('Unsuspended → new'); load()
              }}>
                Unsuspend
              </Button>
            )}

            {!blocked ? (
              <Button size="small" danger onClick={async () => {
                await blockAccount(r.email)
                message.success('Đã khóa đăng nhập (blocked)'); await load()
              }}>
                Block login
              </Button>
            ) : (
              <Button size="small" onClick={async () => {
                await unblockAccount(r.email)
                message.success('Đã mở khóa đăng nhập'); await load()
              }}>
                Unblock login
              </Button>
            )}
          </Space>
        )
      }
    }
  ]

  // Create customer (mặc định vào trạng thái new)
  const onCreate = async () => {
    const v = await form.validateFields()
    const c: Customer = {
      id: 'cus_' + Math.random().toString(36).slice(2, 8),
      name: v.name,
      email: v.email,
      org: v.org,
      purchases: 0,
      spent: 0,
      status: 'new', // ⭐️ theo flow 4 trạng thái
      createdAt: new Date().toISOString(),
    }
    await saveCustomer(c)
    message.success('Created customer')
    setOpenNew(false); form.resetFields(); load()
  }

  // ======= Drawer Tabs =======
  const InfoTab = viewData ? (
    <>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="Status">
          {statusTag(viewData.status)}
          {isAccountBlocked(viewData.email) && <Tag color="magenta" style={{ marginLeft: 8 }}>blocked</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Name">{viewData.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{viewData.email}</Descriptions.Item>
        <Descriptions.Item label="Organization">{viewData.org || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Purchases">{viewData.purchases}</Descriptions.Item>
        <Descriptions.Item label="Spent">{`$${viewData.spent.toFixed(2)}`}</Descriptions.Item>

        {/* KYC cá nhân */}
        <Descriptions.Item label="Full name">{(viewData as any).kyc?.fullName || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="DOB">{(viewData as any).kyc?.dob || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="National ID">{(viewData as any).kyc?.nationalId || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Address">{(viewData as any).kyc?.address || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Phone">{(viewData as any).kyc?.phone || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Bank">{(viewData as any).kyc?.bankName || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Bank Account">{(viewData as any).kyc?.bankAccount || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Documents">
          {(viewData as any).kyc?.documents?.length
            ? (viewData as any).kyc.documents.map((d: any, i: number) => <div key={i}>• {d.label}</div>)
            : <Text type="secondary">—</Text>}
        </Descriptions.Item>

        <Descriptions.Item label="Created at">{new Date(viewData.createdAt).toLocaleString()}</Descriptions.Item>
      </Descriptions>

      {/* Timeline messages nếu có */}
      {viewData?.messages?.length ? (
        <div style={{ marginTop: 16 }}>
          <Text strong>Messages to customer</Text>
          <div style={{ marginTop: 8 }}>
            {[...viewData.messages].reverse().map(m => (
              <div key={m.id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Tag color={m.type === 'rejection' ? 'red' : 'blue'} style={{ marginRight: 8 }}>{m.type}</Tag>
                <Text>{m.content}</Text>
                <div style={{ opacity: .6, fontSize: 12 }}>{new Date(m.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  ) : null

  const SecurityTab = (
    <div>
      <Space wrap>
        <Button onClick={async () => {
          if (!viewId) return
          await requireCustomerPasswordReset(viewId)
          message.success('Đã buộc đổi mật khẩu lần đăng nhập kế tiếp')
        }}>
          Buộc đổi mật khẩu
        </Button>
        <Button onClick={async () => {
          if (!viewId) return
          await resetCustomer2FA(viewId)
          message.success('Đã reset 2FA')
        }}>
          Reset 2FA
        </Button>
        <Button danger onClick={async () => {
          if (!viewId) return
          await revokeAllCustomerSessions(viewId)
          setSessions(await listCustomerSessions(viewId))
          message.success('Đã thu hồi tất cả phiên')
        }}>
          Thu hồi tất cả phiên
        </Button>
      </Space>

      <div style={{ marginTop: 16 }}>
        <Table<CustomerSession>
          rowKey="id"
          dataSource={sessions}
          size="small"
          columns={[
            { title: 'Thiết bị', dataIndex: 'device', key: 'device' },
            { title: 'IP', dataIndex: 'ip', key: 'ip', width: 120 },
            { title: 'User-Agent', dataIndex: 'ua', key: 'ua' },
            { title: 'Lần cuối', dataIndex: 'lastSeen', key: 'lastSeen', width: 180 },
          ]}
          locale={{ emptyText: <Empty description="No data" /> }}
        />
      </div>
    </div>
  )

  const NotifyTab = (
    <div>
      <Form form={notifyForm} layout="vertical" initialValues={{ channels: ['email'] }}>
        <Form.Item label="Kênh" name="channels">
          <Checkbox.Group>
            <Space wrap>
              <Checkbox value="email">Email</Checkbox>
              <Checkbox value="fcm">FCM</Checkbox>
              <Checkbox value="zalo">Zalo</Checkbox>
              <Checkbox value="inapp">In-app</Checkbox>
            </Space>
          </Checkbox.Group>
        </Form.Item>
        <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}>
          <Input placeholder="Thông báo tới khách hàng" />
        </Form.Item>
        <Form.Item label="Nội dung" name="body" rules={[{ required: true }]}>
          <Input.TextArea rows={5} placeholder="Nhập nội dung..." />
        </Form.Item>
        <Button type="primary" onClick={async () => {
          if (!viewId) return
          const v = await notifyForm.validateFields()
          await sendCustomerNotification(viewId, v.channels, v.title, v.body)
          message.success('Đã gửi thông báo')
          notifyForm.resetFields()
          setNotifyLogs(await listCustomerNotifyLogs(viewId))
        }}>
          Gửi thông báo
        </Button>
      </Form>

      <div style={{ marginTop: 16 }}>
        <Text strong>Lịch sử gửi</Text>
        <Table<NotifyLog>
          rowKey="id"
          dataSource={notifyLogs.slice().reverse()}
          size="small"
          columns={[
            { title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt', width: 180,
              render: (t: string) => new Date(t).toLocaleString() },
            { title: 'Kênh', dataIndex: 'channels', key: 'channels', width: 180,
              render: (chs: string[]) => chs.join(', ') },
            { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
          ]}
          locale={{ emptyText: <Empty description="No data" /> }}
        />
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <Card
        title="Customers"
        extra={
          <Space wrap>
            <Input placeholder="Tìm name/email/org" value={q} onChange={e => setQ(e.target.value)} style={{ width: 240 }} />
            <Select
              value={status}
              onChange={v => setStatus(v)}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'new', label: 'New' },
                { value: 'pending', label: 'Pending' },
                { value: 'kyc', label: 'KYC' },
                { value: 'suspended', label: 'Suspended' },
              ]}
              style={{ width: 160 }}
            />
            <Button type="primary" onClick={() => setOpenNew(true)}>New Customer</Button>
          </Space>
        }
      >
        <Table<Customer>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 'max-content' }}
          className="table-nowrap"
        />
        <style>{`
          .table-nowrap .ant-table-cell { white-space: nowrap; }
          .table-nowrap .ant-table-thead > tr > th { white-space: nowrap; }
        `}</style>
      </Card>

      {/* Drawer: View + Tabs */}
      <Drawer
        title={viewData ? `Customer · ${viewData.name}` : 'Customer'}
        open={!!viewId}
        width={680}
        onClose={() => setViewId(null)}
        extra={viewData && (
          <Space wrap>
            {viewData.status === 'pending' && (
              <>
                <Button
                  type="primary"
                  disabled={!hasKyc(viewData)}
                  onClick={async () => {
                    await approveCustomerKyc(viewData.id)
                    message.success('Approved KYC')
                    await load()
                  }}
                >
                  Approve KYC
                </Button>
                <Button danger onClick={() => { setSuspendId(viewData.id); suspendForm.resetFields() }}>
                  Suspend
                </Button>
              </>
            )}

            {viewData.status === 'kyc' && (
              <Button danger onClick={() => { setSuspendId(viewData.id); suspendForm.resetFields() }}>
                Suspend
              </Button>
            )}

            {viewData.status === 'suspended' && (
              <Button onClick={async () => {
                await setCustomerStatus(viewData.id, 'new')
                message.success('Unsuspended → new')
                await load()
              }}>
                Unsuspend
              </Button>
            )}

            {!isAccountBlocked(viewData.email) ? (
              <Button danger onClick={async () => {
                await blockAccount(viewData.email)
                message.success('Đã khóa đăng nhập (blocked)')
                await load()
              }}>
                Block login
              </Button>
            ) : (
              <Button onClick={async () => {
                await unblockAccount(viewData.email)
                message.success('Đã mở khóa đăng nhập')
                await load()
              }}>
                Unblock login
              </Button>
            )}
          </Space>
        )}
      >
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as any)}>
          <Tabs.TabPane tab="Thông tin" key="info">{InfoTab}</Tabs.TabPane>
          <Tabs.TabPane tab="Bảo mật & Phiên" key="security">{SecurityTab}</Tabs.TabPane>
          <Tabs.TabPane tab="Gửi thông báo" key="notify">{NotifyTab}</Tabs.TabPane>
        </Tabs>
      </Drawer>

      {/* Modal: New */}
      <Modal title="New Customer" open={openNew} onCancel={() => setOpenNew(false)} onOk={onCreate} okText="Create">
        <Form layout="vertical" form={form}>
          <Form.Item name="name"  label="Name"  rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="org"   label="Organization"><Input /></Form.Item>
        </Form>
      </Modal>

      {/* Suspend with reason */}
      <Modal
        title="Suspend customer"
        open={!!suspendId}
        onCancel={() => setSuspendId(null)}
        okText="Confirm suspend"
        onOk={async () => {
          const { reason } = await suspendForm.validateFields()
          await suspendCustomer(suspendId!, reason)
          message.success('Đã suspend và lưu lý do')
          const curId = suspendId!
          setSuspendId(null)
          await load()
          if (viewId === curId) {
            // refresh data hiển thị
            const cur = await getCustomer(curId)
            if (!cur) setViewId(null)
          }
        }}
      >
        <Form layout="vertical" form={suspendForm}>
          <Form.Item
            name="reason"
            label="Lý do suspend"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <Input.TextArea rows={4} placeholder="Ví dụ: Hồ sơ không hợp lệ / vi phạm điều khoản..." />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  )
}
