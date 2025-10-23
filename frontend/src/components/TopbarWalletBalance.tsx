import React, { useEffect, useState } from 'react'
import { Button, Tooltip } from 'antd'
import { DollarCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getWalletBalance } from '../services/provider' // giữ nguyên đúng path services

export default function TopbarWalletBalance() {
  const [amount, setAmount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        const b = await getWalletBalance()
        if (mounted) setAmount(b?.availableUsd ?? 0)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const nf = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return (
    <Tooltip title="Số dư có thể rút • vào ví">
      <Button
        icon={<DollarCircleOutlined />}
        loading={loading}
        onClick={() => navigate('/provider/wallet')}
      >
        {amount == null ? '—' : nf.format(amount)}
      </Button>
    </Tooltip>
  )
}
