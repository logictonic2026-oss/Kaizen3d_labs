import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { Reveal } from '../components/animations'

const STATUS_STEPS = [
  { id: 'pending',    label: 'Order Placed', icon: '📝' },
  { id: 'processing', label: 'Processing',   icon: '⚙️' },
  { id: 'shipped',    label: 'Shipped',      icon: '🚚' },
  { id: 'delivered',  label: 'Delivered',    icon: '✅' },
]

export default function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialId = searchParams.get('id') || ''

  const [inputId, setInputId] = useState(initialId)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId)
    }
  }, [initialId])

  const handleSearch = async (searchId) => {
    const idToSearch = searchId || inputId.trim()
    if (!idToSearch) return

    setLoading(true)
    setError('')
    setOrder(null)

    // Update URL without refreshing
    if (idToSearch !== searchParams.get('id')) {
      setSearchParams({ id: idToSearch })
    }

    try {
      // Allow searching by exact ID or short ID (first 8 chars)
      let query = supabase.from('orders').select('*, order_items(*)')
      
      // If it looks like a full UUID
      if (idToSearch.length === 36 && idToSearch.includes('-')) {
        query = query.eq('id', idToSearch)
      } else {
        // If it's a short ID, use like (this is less efficient but works for MVP)
        query = query.ilike('id', `${idToSearch}%`)
      }

      const { data, error: err } = await query.limit(1).single()

      if (err || !data) {
        setError('Order not found. Please check your Order ID and try again.')
      } else {
        setOrder(data)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIndex = (status) => {
    if (status === 'cancelled') return -1
    return STATUS_STEPS.findIndex(s => s.id === status)
  }

  const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 1.5rem' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, margin: '0 0 0.5rem', color: '#e2e8f0' }}>
              Track Your Order
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
              Enter your Order ID to check its current status.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '1.5rem', marginBottom: '2rem'
          }}>
            <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ display: 'flex', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Enter Order ID (e.g. A1B2C3D4)"
                value={inputId}
                onChange={e => setInputId(e.target.value)}
                style={{
                  flex: 1, padding: '1rem 1.25rem', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0', fontSize: '1rem', outline: 'none', fontFamily: 'inherit'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button
                type="submit"
                disabled={loading || !inputId.trim()}
                className="btn btn--primary"
                style={{ padding: '0 2rem', cursor: (loading || !inputId.trim()) ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </form>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '1rem', marginBottom: 0 }}>{error}</p>}
          </div>
        </Reveal>

        {order && (
          <Reveal delay={0.2}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', color: '#e2e8f0' }}>Order #{order.id.slice(0,8).toUpperCase()}</h2>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                </div>
                {order.status === 'cancelled' && (
                  <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Cancelled
                  </span>
                )}
              </div>

              {/* Status Timeline */}
              {order.status !== 'cancelled' && (
                <div style={{ padding: '3rem 2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Progress Bar Background */}
                    <div style={{ position: 'absolute', top: 20, left: '10%', right: '10%', height: 4, background: 'rgba(255,255,255,0.1)', zIndex: 1, borderRadius: 2 }} />
                    
                    {/* Progress Bar Active */}
                    <div style={{ 
                      position: 'absolute', top: 20, left: '10%', 
                      width: `${(Math.max(0, getStatusIndex(order.status)) / (STATUS_STEPS.length - 1)) * 80}%`, 
                      height: 4, background: '#3b82f6', zIndex: 2, borderRadius: 2,
                      transition: 'width 0.5s ease-in-out'
                    }} />

                    {STATUS_STEPS.map((step, idx) => {
                      const isActive = getStatusIndex(order.status) >= idx
                      const isCurrent = getStatusIndex(order.status) === idx
                      return (
                        <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '25%' }}>
                          <div style={{ 
                            width: 44, height: 44, borderRadius: '50%', 
                            background: isActive ? '#3b82f6' : '#1e293b',
                            border: `4px solid ${isActive ? '#1e293b' : '#0f172a'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.25rem', marginBottom: '0.75rem',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none',
                            transition: 'all 0.3s'
                          }}>
                            <span style={{ filter: isActive ? 'none' : 'grayscale(1) opacity(0.5)' }}>{step.icon}</span>
                          </div>
                          <div style={{ 
                            fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, 
                            color: isActive ? '#e2e8f0' : '#64748b', textAlign: 'center'
                          }}>
                            {step.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {order.status === 'shipped' && (
                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
                      Your order is on the way! It usually takes 2-4 business days to reach you.
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items in this order</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {order.order_items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span style={{ color: '#e2e8f0' }}>{item.quantity}x {item.product_name}</span>
                      <span style={{ color: '#94a3b8' }}>{formatINR(item.price_at_purchase * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  )
}
