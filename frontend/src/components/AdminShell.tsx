import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Dropdown, Avatar, Input, theme, Drawer, List, Typography } from 'antd'
import {
  AppstoreOutlined, ThunderboltOutlined, FileProtectOutlined,
  BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, UserOutlined,
  SearchOutlined, DatabaseOutlined, ProfileOutlined, CreditCardOutlined, BarChartOutlined,
  DollarOutlined, ShopOutlined, TeamOutlined, HomeOutlined, DollarCircleOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import { getWalletBalance } from '../services/provider'

type Role = 'admin' | 'provider' | 'consumer' | null
const { Header, Sider, Content } = Layout
const { Text } = Typography
const HEADER_H = 56
const SIDER_KEY = 'ui.sider.collapsed'

type MenuItem = Required<Parameters<typeof Menu>[0]>['items'][number]

function flattenKeys(items: any[] = []): string[] {
  const out: string[] = []
  for (const it of items) {
    if (!it) continue
    if ('key' in it && typeof (it as any).key === 'string') out.push((it as any).key as string)
    if ('children' in it && Array.isArray((it as any).children)) out.push(...flattenKeys((it as any).children))
  }
  return out
}

const TITLE_MAP: Record<string, string> = {
  '/': 'Home',
  '/admin': 'Admin',
  '/admin/dashboard': 'Dashboard',
  '/admin/pricing': 'Pricing',
  '/admin/payouts': 'Payouts',
  '/admin/wallets': 'Wallets',                 // 👈 thêm breadcrumb
  '/moderator/review': 'Moderation',
  '/admin/providers': 'Providers',
  '/admin/providers/approvals': 'Approvals',
  '/admin/customers': 'Customers',
  '/catalog': 'Catalog',
  '/provider': 'Provider',
  '/provider/dashboard': 'Dashboard',
  '/provider/new': 'New Dataset',
  '/provider/datasets': 'My Datasets',
  '/provider/earnings': 'Earnings',
  '/provider/wallet': 'Wallet',
}

function buildMenu(role: Role): MenuItem[] {
  if (role === 'admin') {
    return [
      { key: '/admin/dashboard', icon: <AppstoreOutlined />, label: <Link to="/admin/dashboard">Dashboard</Link> },
      { key: '/admin/providers', icon: <ShopOutlined />, label: <Link to="/admin/providers">Providers</Link> },
      { key: '/admin/customers', icon: <TeamOutlined />, label: <Link to="/admin/customers">Customers</Link> },
      { type: 'divider' as any },
      { key: '/admin/pricing',  icon: <DollarOutlined />,     label: <Link to="/admin/pricing">Pricing</Link> },
      { key: '/admin/payouts',  icon: <CreditCardOutlined />, label: <Link to="/admin/payouts">Payouts</Link> },
      { key: '/admin/wallets',  icon: <DollarOutlined />,     label: <Link to="/admin/wallets">Wallets</Link> }, // 👈 thêm menu
      { key: '/moderator/review', icon: <FileProtectOutlined />, label: <Link to="/moderator/review">Moderation</Link> },
      { type: 'divider' as any },
      { key: '/catalog', icon: <DatabaseOutlined />, label: <Link to="/catalog">Catalog</Link> },
    ]
  }

  if (role === 'provider') {
    return [
      { key: '/provider/dashboard', icon: <BarChartOutlined />,   label: <Link to="/provider/dashboard">Dashboard</Link> },
      { key: '/provider/new',       icon: <ThunderboltOutlined />,label: <Link to="/provider/new">New Dataset</Link> },
      { key: '/provider/datasets',  icon: <DatabaseOutlined />,   label: <Link to="/provider/datasets">My Datasets</Link> },
      { key: '/provider/earnings',  icon: <DollarOutlined />,     label: <Link to="/provider/earnings">Earnings</Link> },
      { key: '/provider/wallet',    icon: <DollarCircleOutlined />, label: <Link to="/provider/wallet">Wallet</Link> },
    ]
  }

  // guest / consumer
  return [
    { key: '/',             icon: <HomeOutlined />,         label: <Link to="/">Home</Link> },
    { key: '/catalog',      icon: <DatabaseOutlined />,     label: <Link to="/catalog">Catalog</Link> },
    { key: '/my-purchases', icon: <CreditCardOutlined />,   label: <Link to="/my-purchases">My Purchases</Link> },
  ]
}

function useBreadcrumb(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  const paths: { path: string; label: string }[] = []
  let acc = ''
  for (const p of parts) {
    acc += '/' + p
    paths.push({ path: acc, label: TITLE_MAP[acc] ?? p })
  }
  if (paths.length === 0) paths.push({ path: '/', label: TITLE_MAP['/'] })
  return paths
}

export default function AdminShell({ children }: { children?: React.ReactNode }) {
  const { token } = theme.useToken()
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem(SIDER_KEY) === '1')
  const [openDrawer, setOpenDrawer] = useState(false)

  // ---- ví trên topbar (chỉ cho provider) ----
  const [walletLoading, setWalletLoading] = useState(false)
  const [walletAvailable, setWalletAvailable] = useState<number | null>(null)
  useEffect(() => {
    let mounted = true
    if (user?.role === 'provider') {
      ;(async () => {
        setWalletLoading(true)
        try {
          const b = await getWalletBalance()
          if (mounted) setWalletAvailable(b?.availableUsd ?? 0)
        } finally {
          if (mounted) setWalletLoading(false)
        }
      })()
    } else {
      setWalletAvailable(null)
    }
    return () => { mounted = false }
  }, [user?.role])
  const nfUsd0 = useMemo(
    () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    []
  )
  // --------------------------------------------

  const items = buildMenu(user?.role ?? null)
  const routeKeys = flattenKeys(items)
  const activeKey = routeKeys.find(k => location.pathname.startsWith(k)) || ''

  const crumbs = useBreadcrumb(location.pathname)
  useEffect(() => {
    const last = crumbs[crumbs.length - 1]
    document.title = `${last?.label ?? 'App'} · EV DATA`
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const headerStyle: React.CSSProperties = {
    height: HEADER_H,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    background: token.colorBgContainer,
    borderBottom: `1px solid ${token.colorBorder}`,
    position: 'sticky',
    top: 0,
    zIndex: 5,
  }

  const notifications = useMemo(
    () => [
      { title: 'Dataset mới được thêm', meta: '2 giờ trước · VinFast Charging Network' },
      { title: 'Provider đăng ký', meta: '5 giờ trước · GreenFleet Solutions' },
      { title: 'Đơn mua mới', meta: '1 ngày trước · Công ty ABC' },
    ],
    []
  )

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={(v) => { setCollapsed(v); localStorage.setItem(SIDER_KEY, v ? '1' : '0') }}
        width={240}
        style={{ background: token.colorBgContainer, borderRight: `1px solid ${token.colorBorder}` }}
      >
        <div style={{ height: HEADER_H, display: 'flex', alignItems: 'center', padding: '0 12px' }}>
          <Link
            to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'provider' ? '/provider/dashboard' : '/'}
            className="font-semibold"
          >
            {collapsed ? 'EV' : 'EV DATA'}
          </Link>
        </div>
        <Menu mode="inline" selectedKeys={[activeKey]} items={items} style={{ borderRight: 0 }} />
      </Sider>

      <Layout style={{ background: token.colorBgLayout }}>
        <Header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 360 }}>
            <Button
              size="small"
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => {
                const v = !collapsed
                setCollapsed(v)
                localStorage.setItem(SIDER_KEY, v ? '1' : '0')
              }}
            />
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm kiếm… (gõ pricing/providers/customers...)"
              onPressEnter={(e) => {
                const q = String((e.target as HTMLInputElement).value || '').toLowerCase()
                const hit = routeKeys.find(k => k.toLowerCase().includes(q))
                if (hit) navigate(hit)
              }}
              style={{ width: 320 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap' }}>
            {user?.role === 'provider' && (
              <Button
                type="text"
                size="small"
                icon={<DollarCircleOutlined />}
                loading={walletLoading}
                onClick={() => navigate('/provider/wallet')}
                style={{ padding: '0 6px' }}
              >
                {walletAvailable == null ? '—' : nfUsd0.format(walletAvailable)}
              </Button>
            )}

            <Button type="text" size="small" icon={<BellOutlined />} onClick={() => setOpenDrawer(true)} />
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', icon: <ProfileOutlined />, label: 'Hồ sơ' },
                  { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
                ],
                onClick: ({ key }) => key === 'logout' && logout(),
              }}
              trigger={['click']}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                  <div style={{ fontWeight: 600 }}>{user?.name || user?.email}</div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>{user?.role ?? 'guest'}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ background: 'transparent' }}>
          {/* Breadcrumbs */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '8px 16px 0 16px' }}>
            <div style={{ display: 'flex', gap: 8, fontSize: 12, opacity: 0.75 }}>
              {useBreadcrumb(location.pathname).map((c, i, arr) => (
                <span key={c.path}>
                  {i > 0 && <span style={{ margin: '0 6px' }}>/</span>}
                  {i < arr.length - 1 ? <Link to={c.path}>{c.label}</Link> : <Text strong>{c.label}</Text>}
                </span>
              ))}
            </div>
          </div>

          {/* Page content */}
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16, minHeight: `calc(100vh - ${HEADER_H}px)` }}>
            {children ?? <Outlet />}
          </div>
        </Content>
      </Layout>

      {/* Notifications Drawer */}
      <Drawer title="Thông báo" width={360} placement="right" onClose={() => setOpenDrawer(false)} open={openDrawer}>
        <List
          dataSource={[
            { title: 'Dataset mới được thêm', meta: '2 giờ trước · VinFast Charging Network' },
            { title: 'Provider đăng ký', meta: '5 giờ trước · GreenFleet Solutions' },
            { title: 'Đơn mua mới', meta: '1 ngày trước · Công ty ABC' },
          ]}
          renderItem={(it) => (
            <List.Item>
              <List.Item.Meta title={it.title} description={<span style={{ opacity: 0.7 }}>{it.meta}</span>} />
            </List.Item>
          )}
        />
      </Drawer>
    </Layout>
  )
}
