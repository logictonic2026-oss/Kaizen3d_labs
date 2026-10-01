import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart()
  const navigate = useNavigate()

  const formatINR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const handleCheckout = () => {
    setIsCartOpen(false)
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            style={{
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 1000,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '420px',
              backgroundColor: 'var(--matte-black)',
              borderLeft: '1px solid var(--graphite)',
              zIndex: 1001, display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.5rem 2rem', borderBottom: '1px solid var(--graphite)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0 }}>
                  Your Cart
                </h2>
                {cartItems.length > 0 && (
                  <span style={{
                    background: 'var(--cobalt-blue)', color: '#fff', fontSize: '0.75rem',
                    fontWeight: 700, width: 22, height: 22, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {cartItems.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                style={{ color: 'var(--silver-grey)', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {/* Items */}
            {cartItems.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--silver-grey)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                <p style={{ fontWeight: 500 }}>Your cart is empty</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={{ marginTop: '1rem', color: 'var(--cobalt-blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline' }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 2rem' }}>
                  {cartItems.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', gap: '1rem', marginBottom: '1.25rem',
                      paddingBottom: '1.25rem', borderBottom: '1px solid var(--graphite)',
                    }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                        background: 'var(--graphite)', flexShrink: 0,
                      }}>
                        {item.image
                          ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.875rem', margin: '0 0 4px', fontWeight: 600, color: 'var(--warm-white)' }}>{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{ color: '#ff4444', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                          >
                            Remove
                          </button>
                        </div>
                        {item.subtitle && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--silver-grey)', margin: '0 0 8px' }}>{item.subtitle}</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--cobalt-blue)', fontWeight: 700, fontSize: '0.9rem' }}>
                            {formatINR(item.price * item.quantity)}
                          </span>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: 'var(--graphite)', padding: '3px 10px', borderRadius: '6px',
                          }}>
                            <button onClick={() => updateQuantity(item.id, -1)} style={{ color: 'var(--warm-white)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>−</button>
                            <span style={{ fontSize: '0.9rem', minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)}  style={{ color: 'var(--warm-white)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--graphite)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <span style={{ color: 'var(--silver-grey)' }}>Subtotal</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatINR(cartTotal)}</span>
                  </div>
                  <button
                    className="btn btn--primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout →
                  </button>
                  <p style={{ textAlign: 'center', color: 'var(--silver-grey)', fontSize: '0.72rem', marginTop: '0.75rem' }}>
                    🔒 Secure checkout &nbsp;·&nbsp; Free shipping on all orders
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
