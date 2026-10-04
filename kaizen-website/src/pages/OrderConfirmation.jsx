import React, { useEffect, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import { Reveal } from '../components/animations'

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('id')
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      navigate('/shop')
      return
    }

    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single()

      if (!error && data) {
        setOrder(data)
      }
      setLoading(false)
    }

    fetchOrder()
  }, [orderId, navigate])

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <h2>Order not found</h2>
        <Link to="/shop" style={{ color: '#3b82f6', textDecoration: 'none', marginTop: '1rem' }}>Return to Shop</Link>
      </div>
    )
  }

  const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const isOnline = order.payment_method === 'razorpay'
  const isPaid = order.payment_status === 'paid'
  const awaitingOnline = isOnline && !isPaid

  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1.5rem' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              width: 80, height: 80, background: 'rgba(34,197,94,0.1)', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              border: '2px solid rgba(34,197,94,0.2)'
            }}>
              <span style={{ fontSize: '2.5rem' }}>{awaitingOnline ? '⏳' : '🎉'}</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#e2e8f0' }}>
              {awaitingOnline ? 'Confirming Payment…' : 'Order Confirmed!'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
              Thank you for your purchase, {order.customer_name.split(' ')[0]}.
            </p>
            {isOnline && isPaid && order.razorpay_payment_id && (
              <p style={{ color: '#22c55e', fontSize: '0.8rem', margin: '0.75rem 0 0', fontWeight: 600 }}>
                ✓ Payment received · Ref {order.razorpay_payment_id}
              </p>
            )}
            {awaitingOnline && (
              <p style={{ color: '#eab308', fontSize: '0.8rem', margin: '0.75rem 0 0' }}>
                We're waiting for confirmation from Razorpay. This usually takes a few seconds — refresh shortly.
              </p>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden', marginBottom: '2rem'
          }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 4 }}>Order Number</div>
                  <div style={{ fontSize: '1rem', color: '#e2e8f0', fontWeight: 600 }}>#{order.id.slice(0,8).toUpperCase()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 4 }}>Date</div>
                  <div style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.order_items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📦</div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 600 }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0' }}>
                    {formatINR(item.price_at_purchase * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                <span>Subtotal</span><span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#22c55e' }}>
                  <span>Discount {order.promo_code && `(${order.promo_code})`}</span><span>− {formatINR(order.discount_amount)}</span>
                </div>
              )}
              {Number(order.shipping_cost) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                  <span>Delivery</span><span>+{formatINR(order.shipping_cost)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', marginTop: '0.5rem' }}>
                <span>{isPaid ? 'Total Paid' : 'Total'}</span><span>{formatINR(order.total)}</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Link to={`/track-order?id=${order.id}`} className="btn btn--primary" style={{ display: 'flex', justifyContent: 'center', padding: '1rem', textDecoration: 'none' }}>
              Track Order
            </Link>
            <Link to="/shop" style={{ 
              display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px', color: '#e2e8f0', textDecoration: 'none', fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              Continue Shopping
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
