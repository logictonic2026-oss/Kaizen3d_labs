import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { supabase } from '../supabase'

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function OrderTracking() {
  const { isTrackOrderOpen, setIsTrackOrderOpen } = useCart()
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg('')
    setOrders([])

    try {
      // Fetch orders matching the email, along with their order_items
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('customer_email', email)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
      setStatus('success')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to fetch orders')
      setStatus('error')
    }
  }

  const getStatusBadge = (statusStr) => {
    switch (statusStr.toLowerCase()) {
      case 'pending': return <span style={{ background: 'rgba(234,179,8,0.2)', color: '#eab308', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Pending</span>
      case 'processing': return <span style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Processing</span>
      case 'shipped': return <span style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Shipped</span>
      case 'delivered': return <span style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Delivered</span>
      case 'cancelled': return <span style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Cancelled</span>
      default: return <span style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{statusStr}</span>
    }
  }

  return (
    <AnimatePresence>
      {isTrackOrderOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTrackOrderOpen(false)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 3000
            }}
          />
          
          {/* Drawer / Modal */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: '10vh', left: '50%', transform: 'translateX(-50%)',
              width: '90%', maxWidth: '600px', maxHeight: '80vh',
              backgroundColor: 'var(--graphite)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', zIndex: 3001, display: 'flex', flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', margin: 0 }}>Track Your Orders</h2>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--silver-grey)', fontSize: '0.85rem' }}>Enter your billing email to view past purchases.</p>
              </div>
              <button onClick={() => setIsTrackOrderOpen(false)} style={{ color: 'var(--silver-grey)', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={{
                    flex: 1, padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)',
                    color: 'var(--warm-white)', fontSize: '0.9rem', outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--cobalt-blue)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="submit" className="btn btn--primary" disabled={status === 'loading'} style={{ minWidth: '100px', justifyContent: 'center' }}>
                  {status === 'loading' ? 'Searching...' : 'Find Orders'}
                </button>
              </form>

              {status === 'error' && (
                <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  ⚠ {errorMsg}
                </div>
              )}

              {status === 'success' && orders.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--silver-grey)', padding: '2rem 0' }}>
                  No orders found for <strong>{email}</strong>.
                </div>
              )}

              {status === 'success' && orders.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {orders.map((order) => (
                    <div key={order.id} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--silver-grey)', letterSpacing: '0.05em', marginBottom: '4px' }}>
                            ORDER #{order.id.split('-')[0].toUpperCase()}
                          </div>
                          <div style={{ fontSize: '0.85rem' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ marginBottom: '6px' }}>{getStatusBadge(order.status)}</div>
                          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--cobalt-blue)' }}>{formatINR(order.total)}</div>
                        </div>
                      </div>
                      
                      <div style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--silver-grey)', marginBottom: '0.75rem', fontWeight: 600 }}>ITEMS ({order.order_items?.length || 0})</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {order.order_items?.map((item) => (
                            <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.product_name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }} />
                              )}
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.product_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--silver-grey)' }}>Qty: {item.quantity} × {formatINR(item.price_at_purchase)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
