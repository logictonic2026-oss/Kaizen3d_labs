import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../supabase'

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLE = {
  pending:    { bg: 'rgba(234,179,8,0.1)',  text: '#eab308', border: 'rgba(234,179,8,0.3)'  },
  processing: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  shipped:    { bg: 'rgba(168,85,247,0.1)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
  delivered:  { bg: 'rgba(34,197,94,0.1)',  text: '#22c55e', border: 'rgba(34,197,94,0.3)'  },
  cancelled:  { bg: 'rgba(239,68,68,0.1)',  text: '#ef4444', border: 'rgba(239,68,68,0.3)'  },
}

// ── Status selector ────────────────────────────────────────────────────────────
function StatusSelect({ order, onUpdated }) {
  const [value,   setValue]   = useState(order.status)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  const handleChange = async (e) => {
    const newStatus = e.target.value
    setValue(newStatus)
    setSaving(true)
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
    setSaving(false)
    if (!error) { setSaved(true); onUpdated(order.id, newStatus); setTimeout(() => setSaved(false), 1500) }
  }

  const sc = STATUS_STYLE[value] || STATUS_STYLE.pending

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <select
        value={value}
        onChange={handleChange}
        disabled={saving}
        style={{
          padding: '0.3rem 0.6rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
          background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
          cursor: 'pointer', outline: 'none', textTransform: 'capitalize',
        }}
      >
        {STATUSES.map(s => <option key={s} value={s} style={{ background: '#111118', color: '#e2e8f0', textTransform: 'capitalize' }}>{s}</option>)}
      </select>
      {saved && <span style={{ color: '#22c55e', fontSize: '0.75rem' }}>✓</span>}
      {saving && <span style={{ width: 12, height: 12, border: '2px solid rgba(99,102,241,0.3)', borderTop: '2px solid #6366f1', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />}
    </div>
  )
}

// ── Expandable order row ──────────────────────────────────────────────────────
function OrderRow({ order, onUpdated }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <tr
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#475569', fontFamily: 'monospace' }}>
          #{order.id.slice(0, 8).toUpperCase()}
        </td>
        <td style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>{order.customer_name}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{order.customer_email}</div>
        </td>
        <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0' }}>
          {formatINR(order.total)}
        </td>
        <td style={{ padding: '1rem 1.25rem' }} onClick={e => e.stopPropagation()}>
          <StatusSelect order={order} onUpdated={onUpdated} />
        </td>
        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#64748b' }}>
          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </td>
        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: '#6366f1' }}>
          {open ? '▲ Hide' : '▼ Details'}
        </td>
      </tr>

      {/* Expanded details row */}
      {open && (
        <tr style={{ background: 'rgba(99,102,241,0.03)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <td colSpan={6} style={{ padding: '1rem 1.25rem 1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Shipping Address</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  {order.shipping_address}<br />
                  {order.shipping_city}, {order.shipping_state} — {order.shipping_zip}<br />
                  {order.shipping_country}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Contact</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  📞 {order.customer_phone}<br />
                  ✉ {order.customer_email}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Payment</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  Method: {order.payment_method}<br />
                  Subtotal: {formatINR(order.subtotal)}<br />
                  {order.discount_amount > 0 && <>Discount: -{formatINR(order.discount_amount)}<br /></>}
                  <strong style={{ color: '#e2e8f0' }}>Total: {formatINR(order.total)}</strong>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ── Main Orders Page ──────────────────────────────────────────────────────────
export default function AdminOrders() {
  const [orders,    setOrders]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  const handleUpdated = (id, status) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = !search || o.customer_name.toLowerCase().includes(search.toLowerCase()) || o.customer_email.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  // Count by status
  const counts = STATUSES.reduce((acc, s) => { acc[s] = orders.filter(o => o.status === s).length; return acc }, {})

  return (
    <AdminLayout title="Orders">
      {/* Status pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[['all', 'All', orders.length], ...STATUSES.map(s => [s, s, counts[s]])].map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              padding: '0.4rem 1rem', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600,
              cursor: 'pointer', border: filter === val ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
              background: filter === val ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === val ? '#818cf8' : '#64748b',
              transition: 'all 0.15s', textTransform: 'capitalize',
            }}
          >
            {label} <span style={{ opacity: 0.7 }}>({count})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 320, marginBottom: '1.5rem' }}>
        <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569' }}>⌕</span>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '0.625rem 1rem 0.625rem 2.25rem', borderRadius: 10,
            background: '#111118', border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#475569' }}>
            No orders {filter !== 'all' ? `with status "${filter}"` : ''} yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Order ID', 'Customer', 'Total', 'Status', 'Date', ''].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <OrderRow key={order.id} order={order} onUpdated={handleUpdated} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#334155' }}>
        💡 Click an order row to see full details. Use the dropdown to update shipping status.
      </p>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  )
}
