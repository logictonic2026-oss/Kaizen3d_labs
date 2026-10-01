import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../supabase'

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const STATUS_COLOR = {
  pending:    { bg: 'rgba(234,179,8,0.1)',  text: '#eab308', border: 'rgba(234,179,8,0.3)'  },
  processing: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  shipped:    { bg: 'rgba(168,85,247,0.1)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
  delivered:  { bg: 'rgba(34,197,94,0.1)',  text: '#22c55e', border: 'rgba(34,197,94,0.3)'  },
  cancelled:  { bg: 'rgba(239,68,68,0.1)',  text: '#ef4444', border: 'rgba(239,68,68,0.3)'  },
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: '#111118', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: '1.5rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 100, height: 100,
        borderRadius: '50%', background: accent, opacity: 0.08, filter: 'blur(20px)',
      }} />
      <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#e2e8f0', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: accent, marginTop: '0.5rem', fontWeight: 600 }}>{sub}</div>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState({ products: 0, active: 0, orders: 0, revenue: 0 })
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const [prodRes, orderRes] = await Promise.all([
        supabase.from('products').select('id, is_active', { count: 'exact' }),
        supabase.from('orders').select('id, customer_name, total, status, created_at').order('created_at', { ascending: false }).limit(8),
      ])

      const allProds  = prodRes.data || []
      const allOrders = orderRes.data || []

      setStats({
        products: allProds.length,
        active:   allProds.filter(p => p.is_active).length,
        orders:   allOrders.length,
        revenue:  allOrders.reduce((s, o) => s + Number(o.total || 0), 0),
      })
      setOrders(allOrders)
      setLoading(false)
    }
    fetchAll()
  }, [])

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <StatCard label="Total Products" value={stats.products} icon="◈" accent="#6366f1" sub={`${stats.active} active`} />
            <StatCard label="Total Orders"   value={stats.orders}   icon="◎" accent="#8b5cf6" />
            <StatCard label="Revenue"         value={formatINR(stats.revenue)} icon="₹" accent="#06b6d4" />
            <StatCard label="Hidden Products" value={stats.products - stats.active} icon="◌" accent="#f59e0b" sub="toggle to show" />
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <Link to="/admin/products/new" style={{
              padding: '0.625rem 1.25rem', borderRadius: 10, textDecoration: 'none',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontSize: '0.875rem', fontWeight: 600,
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            }}>
              + Add Product
            </Link>
            <Link to="/admin/products" style={{
              padding: '0.625rem 1.25rem', borderRadius: 10, textDecoration: 'none',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600,
            }}>
              Manage Products
            </Link>
            <Link to="/admin/orders" style={{
              padding: '0.625rem 1.25rem', borderRadius: 10, textDecoration: 'none',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600,
            }}>
              View Orders
            </Link>
          </div>

          {/* Recent Orders */}
          <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '0.925rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Recent Orders</h2>
              <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none' }}>View all →</Link>
            </div>
            {orders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>
                No orders yet
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Customer', 'Total', 'Status', 'Date'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const sc = STATUS_COLOR[order.status] || STATUS_COLOR.pending
                      return (
                        <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500 }}>{order.customer_name}</td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 600 }}>{formatINR(order.total)}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{
                              padding: '0.25rem 0.625rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                              background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, textTransform: 'capitalize',
                            }}>{order.status}</span>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
                            {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  )
}
