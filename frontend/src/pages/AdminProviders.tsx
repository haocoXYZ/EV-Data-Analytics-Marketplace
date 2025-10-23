import '../styles/antd-link-focus-fix.css'
import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import {
  Card, Table, Tag, Space, Button, Input, Select, Modal, Form, message,
  Drawer, Descriptions, Typography, Tooltip, Tabs, Checkbox, Empty
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  listProviders, setProviderStatus, deleteProvider, saveProvider,
  getProvider, saveProviderKyc, approveProviderKyc, suspendProvider,
  isAccountBlocked, blockAccount, unblockAccount,
  // 🔐 bảo mật + thông báo (mock API)
  listProviderSessions, revokeAllProviderSessions,
  requireProviderPasswordReset, resetProvider2FA,
  ProviderNotifyLogs, sendProviderNotification, // <-- đổi tên import ở đây
} from '../api/admin'
import type { Provider, ProviderStatus, ProviderKyc } from '../types/admin'

const { Text } = Typography

const statusTag = (s: ProviderStatus) =>
  s === 'new'     ? <Tag color="blue">new</Tag> :
  s === 'pending' ? <Tag color="gold">pending</Tag> :
  s === 'kyc'     ? <Tag color="green">kyc</Tag> :
                    <Tag color="red">suspended</Tag>

function hasKyc(p?: Provider) {
  const k = p?.kyc
  if (!k) return false
  return Boolean(
    k.company || k.legalName || k.businessRegNo || k.taxCode ||
    k.address || k.representative || k.phone || k.bankAccount || k.bankName
  )
}

// —— local UI types cho tab bảo mật/thông báo
type ProviderSession = { id: string; device: string; ip?: string; ua?: string; lastSeen?: string }
type NotifyLog = { id: string; channels: string[]; title: string; body: string; createdAt: string }

export default function AdminProviders() {
  const [rows, setRows] = useState<Provider[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<ProviderStatus | 'all'>('all')

  // Create provider
  const [openNew, setOpenNew] = useState(false)
  const [form] = Form.useForm()

  // View / edit
  const [viewId, setViewId] = useState<string | null>(null)
  const [viewData, setViewData] = useState<Provider | null>(null)
  const [openEditKyc, setOpenEditKyc] = useState(false)
  const [kycForm] = Form.useForm<ProviderKyc>()

  // Suspend modal (nhập lý do)
  const [suspendId, setSuspendId] = useState<string | null>(null)
  const [suspendForm] = Form.useForm<{ reason: string }>()

  // 🔐 Tabs trong Drawer
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'notify'>('info')
  const [sessions, setSessions] = useState<ProviderSession[]>([])
  const [notifyLogs, setNotifyLogs] = useState<NotifyLog[]>([])
  const [notifyForm] = Form.useForm<{ channels: string[]; title: string; body: string }>()

  const load = async () => setRows(await listProviders())
  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!viewId) {
      setViewData(null)
      setSessions([])
      setNotifyLogs([])
      return
    }
    (async () => {
      setViewData((await getProvider(viewId)) || null)
      setSessions(await listProviderSessions(viewId))
      setNotifyLogs(await ProviderNotifyLogs(viewId)) // <-- dùng tên mới
      notifyForm.setFieldsValue({ channels: ['email'], title: '', body: '' })
      setActiveTab('info')
    })()
  }, [viewId])

  const filtered = useMemo(
    () => rows.filter(r => {
      const hitQ = !q
        || r.company.toLowerCase().includes(q.toLowerCase())
        || r.email.toLowerCase().includes(q.toLowerCase())
      const hitStatus = status === 'all' ? true : r.status === status
      return hitQ && hitStatus
    }),
    [rows, q, status]
  )

  const columns: ColumnsType<Provider> = [
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (_: any, r) => (
        <Button type="link" onClick={() => setViewId(r.id)} style={{ padding: 0 }}>
          {r.company}
        </Button>
      )
    },
    { title: 'Contact', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'Datasets', dataIndex: 'datasets', key: 'datasets', width: 110 },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: (v) => `$${v.toFixed(2)}`, width: 120 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 220,
      render: (_: ProviderStatus, r) => {
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
              <Button size="small" type="link" danger onClick={async () => { await deleteProvider(r.id); load() }}>
                Delete
              </Button>
            )}

            {r.status === 'pending' && (
              <>
                <Button
                  size="small"
                  type="primary"
                  disabled={!hasKyc(r)}
                  onClick={async () => {
                    await approveProviderKyc(r.id)
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
                await setProviderStatus(r.id, 'new')
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

  // Create provider
  const onCreate = async () => {
    const v = await form.validateFields()
    const p: Provider = {
      id: 'prov_' + Math.random().toString(36).slice(2, 8),
      name: v.contact, email: v.email, company: v.company,
      datasets: 0, revenue: 0, status: 'new', createdAt: new Date().toISOString(),
      kyc: { company: v.company, representative: v.contact, phone: v.phone },
    }
    await saveProvider(p)
    message.success('Created provider')
    setOpenNew(false); form.resetFields(); load()
  }

  const onSaveKyc = async () => {
    const data = await kycForm.validateFields()
    if (!viewId) return
    await saveProviderKyc(viewId, data)
    message.success('Saved KYC')
    setOpenEditKyc(false)
    setViewData((await getProvider(viewId)) || null)
    load()
  }

  // ——— Fragments cho 3 tab trong Drawer
  const InfoTab = viewData ? (
    <>
      <Descriptions column={1} size="small" bordered>
        <Descriptions.Item label="Status">
          {statusTag(viewData.status)}
          {isAccountBlocked(viewData.email) && <Tag color="magenta" style={{ marginLeft: 8 }}>blocked</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Company">{viewData.kyc?.company || viewData.company}</Descriptions.Item>
        <Descriptions.Item label="Legal Name">{viewData.kyc?.legalName || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Business Reg No.">{viewData.kyc?.businessRegNo || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Tax Code">{viewData.kyc?.taxCode || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Address">{viewData.kyc?.address || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Representative">{viewData.kyc?.representative || viewData.name}</Descriptions.Item>
        <Descriptions.Item label="Phone">{viewData.kyc?.phone || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Bank">{viewData.kyc?.bankName || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Bank Account">{viewData.kyc?.bankAccount || <Text type="secondary">—</Text>}</Descriptions.Item>
        <Descriptions.Item label="Documents">
          {viewData.kyc?.documents?.length
            ? viewData.kyc.documents.map((d, i) => <div key={i}>• {d.label}</div>)
            : <Text type="secondary">—</Text>}
        </Descriptions.Item>
      </Descriptions>

      {viewData?.messages?.length ? (
        <div style={{ marginTop: 16 }}>
          <Text strong>Messages to provider</Text>
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
          await requireProviderPasswordReset(viewId)
          message.success('Đã buộc đổi mật khẩu ở lần đăng nhập kế tiếp')
        }}>
          Buộc đổi mật khẩu
        </Button>
        <Button onClick={async () => {
          if (!viewId) return
          await resetProvider2FA(viewId)
          message.success('Đã reset 2FA')
        }}>
          Reset 2FA
        </Button>
        <Button danger onClick={async () => {
          if (!viewId) return
          await revokeAllProviderSessions(viewId)
          setSessions(await listProviderSessions(viewId))
          message.success('Đã thu hồi tất cả phiên')
        }}>
          Thu hồi tất cả phiên
        </Button>
      </Space>

      <div style={{ marginTop: 16 }}>
        <Table<ProviderSession>
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
          <Input placeholder="Thông báo tới nhà cung cấp" />
        </Form.Item>
        <Form.Item label="Nội dung" name="body" rules={[{ required: true }]}>
          <Input.TextArea rows={5} placeholder="Nhập nội dung..." />
        </Form.Item>
        <Button type="primary" onClick={async () => {
          if (!viewId) return
          const v = await notifyForm.validateFields()
          await sendProviderNotification(viewId, v.channels, v.title, v.body)
          message.success('Đã gửi thông báo')
          notifyForm.resetFields()
          setNotifyLogs(await ProviderNotifyLogs(viewId)) // <-- dùng tên mới
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
        title="Providers (All-in-one)"
        extra={
          <Space>
            <Input
              placeholder="Tìm company/email"
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ width: 220 }}
            />
            <Select
              value={status}
              onChange={(v) => setStatus(v as any)}
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'new', label: 'New' },
                { value: 'pending', label: 'Pending' },
                { value: 'kyc', label: 'KYC' },
                { value: 'suspended', label: 'Suspended' },
              ]}
              style={{ width: 160 }}
            />
            <Button type="primary" onClick={() => setOpenNew(true)}>New Provider</Button>
          </Space>
        }
      >
        <Table<Provider>
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 'max-content' }}
          tableLayout="auto"
          className="table-nowrap"
        />
        <style>{`
          .table-nowrap .ant-table-cell { white-space: nowrap; }
          .table-nowrap .ant-table-thead > tr > th { white-space: nowrap; }
        `}</style>
      </Card>

      {/* Create provider */}
      <Modal
        title="New Provider"
        open={openNew}
        onCancel={() => setOpenNew(false)}
        onOk={onCreate}
        okText="Create"
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="company" label="Company" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="contact" label="Contact name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
        </Form>
      </Modal>

      {/* Suspend with reason */}
      <Modal
        title="Suspend provider"
        open={!!suspendId}
        onCancel={() => setSuspendId(null)}
        okText="Confirm suspend"
        onOk={async () => {
          const { reason } = await suspendForm.validateFields()
          await suspendProvider(suspendId!, reason)
          message.success('Đã suspend và lưu lý do')
          const curId = suspendId!
          setSuspendId(null)
          await load()
          if (viewId === curId) setViewData((await getProvider(curId)) || null)
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

      {/* Drawer chi tiết + Tabs */}
      <Drawer
        title={viewData ? `Provider · ${viewData.company}` : 'Provider'}
        width={680}
        open={!!viewId}
        onClose={() => setViewId(null)}
        extra={
          viewData && (
            <Space wrap>
              {viewData.status === 'pending' && (
                <>
                  <Button
                    type="primary"
                    disabled={!hasKyc(viewData)}
                    onClick={async () => {
                      await approveProviderKyc(viewData.id)
                      message.success('Approved KYC')
                      load(); setViewData({ ...viewData, status: 'kyc' })
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
                  await setProviderStatus(viewData.id, 'new')
                  message.success('Unsuspended → new')
                  load(); setViewData({ ...viewData, status: 'new' })
                }}>
                  Unsuspend
                </Button>
              )}

              {!isAccountBlocked(viewData.email) ? (
                <Button danger onClick={async () => {
                  await blockAccount(viewData.email)
                  message.success('Đã khóa đăng nhập (blocked)')
                  await load()
                  setViewData((await getProvider(viewData.id)) || null)
                }}>
                  Block login
                </Button>
              ) : (
                <Button onClick={async () => {
                  await unblockAccount(viewData.email)
                  message.success('Đã mở khóa đăng nhập')
                  await load()
                  setViewData((await getProvider(viewData.id)) || null)
                }}>
                  Unblock login
                </Button>
              )}

              <Button onClick={() => {
                kycForm.setFieldsValue(viewData?.kyc || { company: viewData?.company })
                setOpenEditKyc(true)
              }}>
                Edit KYC
              </Button>
            </Space>
          )
        }
      >
        {/* ✅ antd v5: dùng API items */}
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            { key: 'info', label: 'Thông tin', children: InfoTab },
            { key: 'security', label: 'Bảo mật & Phiên', children: SecurityTab },
            { key: 'notify', label: 'Gửi thông báo', children: NotifyTab },
          ]}
        />
      </Drawer>

      {/* Edit KYC modal */}
      <Modal
        title="Edit KYC"
        open={openEditKyc}
        onCancel={() => setOpenEditKyc(false)}
        onOk={onSaveKyc}
        okText="Save"
      >
        <Form layout="vertical" form={kycForm}>
          <Form.Item name="company" label="Company" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="legalName" label="Legal name"><Input /></Form.Item>
          <Form.Item name="businessRegNo" label="Business Reg No."><Input /></Form.Item>
          <Form.Item name="taxCode" label="Tax code"><Input /></Form.Item>
          <Form.Item name="address" label="Address"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="representative" label="Representative"><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="bankName" label="Bank"><Input /></Form.Item>
          <Form.Item name="bankAccount" label="Bank account"><Input /></Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  )
}
