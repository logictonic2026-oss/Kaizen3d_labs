import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, setIsCheckoutOpen, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart()

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
              position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000
            }}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px',
              backgroundColor: 'var(--matte-black)', borderLeft: '1px solid var(--graphite)',
              zIndex: 1001, display: 'flex', flexDirection: 'column', padding: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', m: 0 }}>Your Cart</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ color: 'var(--silver-grey)', fontSize: '1.5rem' }}>&times;</button>
            </div>

            {cartItems.length === 0 && status !== 'success' ? (
              <p style={{ color: 'var(--silver-grey)', textAlign: 'center', marginTop: '2rem' }}>Your cart is empty.</p>
            ) : status === 'success' ? (
              <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--cobalt-blue)' }}>
                <h3>Order Received!</h3>
                <p style={{ color: 'var(--warm-white)', marginTop: '1rem' }}>We have received your order details and will contact you shortly to finalize payment and shipping.</p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem' }}>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--graphite)' }}>
                      <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} style={{ color: '#ff4444', fontSize: '0.8rem' }}>Remove</button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: 'var(--silver-grey)', fontSize: '0.9rem' }}>{item.price}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--graphite)', padding: '2px 8px', borderRadius: '4px' }}>
                            <button onClick={() => updateQuantity(item.id, -1)} style={{ color: 'var(--warm-white)' }}>-</button>
                            <span style={{ fontSize: '0.9rem' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} style={{ color: 'var(--warm-white)' }}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--graphite)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    className="btn btn--primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1rem' }}
                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true) }}
                  >
                    Proceed to Checkout →
                  </button>
                  <p style={{ textAlign: 'center', color: 'var(--steel-grey)', fontSize: '0.75rem', marginTop: '0.75rem' }}>🔒 Secure checkout</p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
