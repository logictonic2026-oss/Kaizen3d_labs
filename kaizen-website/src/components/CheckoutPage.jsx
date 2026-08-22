import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

// ─── Promo codes (simple client-side for now) ─────────────────────────────
const PROMO_CODES = {
  KAIZEN10: 0.10,   // 10% off
  LAUNCH20: 0.20,   // 20% off
  FRIEND15: 0.15,   // 15% off
}

// ─── Input component ─────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, required, placeholder, maxLength, pattern }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--silver-grey)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        pattern={pattern}
        style={{
          padding: '0.75rem 1rem',
          background: 'var(--graphite)',
          border: '1px solid transparent',
          borderRadius: 'var(--radius-md)',
          color: 'var(--warm-white)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'border-color 0.2s',
          fontFamily: 'var(--font-body)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--cobalt-blue)'}
        onBlur={e => e.target.style.borderColor = 'transparent'}
      />
    </div>
  )
}

// ─── Section Heading ─────────────────────────────────────────────────────
function SectionLabel({ num, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', marginTop: '1.75rem' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'var(--cobalt-blue)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
      }}>{num}</div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)', margin: 0 }}>{title}</h3>
    </div>
  )
}

export default function CheckoutPage() {
  const { isCheckoutOpen, setIsCheckoutOpen, cartItems, cartTotal, clearCart, setIsCartOpen } = useCart()

  // ─── Form State ─────────────────────────────────────────────────────────
  const [info, setInfo] = useState({ name: '', email: '', phone: '' })
  const [shipping, setShipping] = useState({ address: '', city: '', state: '', zip: '', country: '' })
  const [payMethod, setPayMethod] = useState('card')  // 'card' | 'upi' | 'cod'
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [upi, setUpi] = useState({ id: '' })
  const [promo, setPromo] = useState('')
  const [promoStatus, setPromoStatus] = useState(null)  // null | 'valid' | 'invalid'
  const [discount, setDiscount] = useState(0)
  const [status, setStatus] = useState('idle')  // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('')

  // ─── Promo Code ─────────────────────────────────────────────────────────
  const applyPromo = () => {
    const rate = PROMO_CODES[promo.toUpperCase().trim()]
    if (rate) {
      setDiscount(rate)
      setPromoStatus('valid')
    } else {
      setDiscount(0)
      setPromoStatus('invalid')
    }
  }

  const discountAmt = cartTotal * discount
  const finalTotal = cartTotal - discountAmt

  // ─── Format card number with spaces ─────────────────────────────────────
  const formatCardNum = (val) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4)
    if (cleaned.length > 2) return cleaned.slice(0, 2) + '/' + cleaned.slice(2)
    return cleaned
  }

  // ─── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const payload = {
        type: 'order',
        customer: info,
        shipping,
        paymentMethod: payMethod,
        promoCode: promo || 'None',
        discountPercent: `${(discount * 100).toFixed(0)}%`,
        items: cartItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
        subtotal: cartTotal.toFixed(2),
        discount: discountAmt.toFixed(2),
        total: finalTotal.toFixed(2),
        date: new Date().toISOString(),
      }
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'YOUR_GOOGLE_SCRIPT_URL'
      if (scriptUrl === 'YOUR_GOOGLE_SCRIPT_URL') throw new Error('Webhook URL is missing.')

      const res = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      })
      const result = await res.json()
      if (result.result === 'success') {
        setStatus('success')
        clearCart()
      } else {
        throw new Error(result.message || 'Submission failed')
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMsg(err.message)
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            overflowY: 'auto', display: 'flex', justifyContent: 'center', padding: '2rem 1rem'
          }}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 180 }}
            className="checkout__grid"
            style={{
              width: '100%', maxWidth: '960px',
              alignItems: 'start'
            }}
          >
            {/* ── LEFT: Form ─────────────────────────────────────────── */}
            {status !== 'success' ? (
              <div className="checkout__form-panel" style={{
                background: 'var(--graphite)', borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <div className="tag" style={{ marginBottom: '0.5rem' }}>Secure Checkout</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', margin: 0 }}>Complete Your Order</h2>
                  </div>
                  <button onClick={() => setIsCheckoutOpen(false)} style={{ color: 'var(--silver-grey)', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

                  {/* ── 1. Customer Info ───── */}
                  <SectionLabel num="1" title="Contact Information" />
                  <div className="checkout__form-row">
                    <Field label="Full Name" value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} required placeholder="Ravi Kumar" />
                    <Field label="Phone Number" type="tel" value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} required placeholder="+91 98765 43210" />
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <Field label="Email Address" type="email" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} required placeholder="ravi@example.com" />
                  </div>

                  {/* ── 2. Shipping ───── */}
                  <SectionLabel num="2" title="Shipping Address" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Field label="Street Address" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} required placeholder="12 MG Road, Apartment 4B" />
                    <div className="checkout__form-row">
                      <Field label="City" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} required placeholder="Bengaluru" />
                      <Field label="State" value={shipping.state} onChange={e => setShipping({ ...shipping, state: e.target.value })} required placeholder="Karnataka" />
                    </div>
                    <div className="checkout__form-row">
                      <Field label="Postal / ZIP Code" value={shipping.zip} onChange={e => setShipping({ ...shipping, zip: e.target.value })} required placeholder="560001" />
                      <Field label="Country" value={shipping.country} onChange={e => setShipping({ ...shipping, country: e.target.value })} required placeholder="India" />
                    </div>
                  </div>

                  {/* ── 3. Payment Method ───── */}
                  <SectionLabel num="3" title="Payment Method" />
                  <div className="checkout__payment-methods">
                    {[
                      { id: 'card', label: '💳 Card' },
                      { id: 'upi', label: '📲 UPI' },
                      { id: 'cod', label: '📦 Cash on Delivery' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPayMethod(opt.id)}
                        style={{
                          flex: 1, padding: '0.75rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem',
                          border: `2px solid ${payMethod === opt.id ? 'var(--cobalt-blue)' : 'var(--graphite)'}`,
                          background: payMethod === opt.id ? 'var(--cobalt-dim)' : 'rgba(255,255,255,0.04)',
                          color: payMethod === opt.id ? 'var(--cobalt-blue)' : 'var(--silver-grey)',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* ── Card Details ───── */}
                  <AnimatePresence mode="wait">
                    {payMethod === 'card' && (
                      <motion.div
                        key="card"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                      >
                        {/* Card Preview */}
                        <div style={{
                          background: 'linear-gradient(135deg, #1a2a6c, #3A6FF7)',
                          borderRadius: '12px', padding: '1.5rem',
                          fontFamily: 'monospace', fontSize: '1rem', color: 'white',
                          marginBottom: '0.5rem'
                        }}>
                          <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '1rem', letterSpacing: '0.15em' }}>KAIZEN 3D LABS</div>
                          <div style={{ letterSpacing: '0.2em', fontSize: '1.1rem', marginBottom: '1rem' }}>
                            {card.number || '•••• •••• •••• ••••'}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.8 }}>
                            <span>{card.name || 'CARDHOLDER NAME'}</span>
                            <span>{card.expiry || 'MM/YY'}</span>
                          </div>
                        </div>
                        <Field label="Card Number" value={card.number}
                          onChange={e => setCard({ ...card, number: formatCardNum(e.target.value) })}
                          required placeholder="1234 5678 9012 3456" maxLength={19}
                        />
                        <Field label="Name on Card" value={card.name}
                          onChange={e => setCard({ ...card, name: e.target.value })}
                          required placeholder="Ravi Kumar"
                        />
                        <div className="checkout__form-row">
                          <Field label="Expiry Date" value={card.expiry}
                            onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                            required placeholder="MM/YY" maxLength={5}
                          />
                          <Field label="CVV" type="password" value={card.cvv}
                            onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            required placeholder="•••" maxLength={4}
                          />
                        </div>
                      </motion.div>
                    )}

                    {payMethod === 'upi' && (
                      <motion.div key="upi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <Field label="UPI ID" value={upi.id}
                          onChange={e => setUpi({ id: e.target.value })}
                          required placeholder="ravi@upi"
                        />
                      </motion.div>
                    )}

                    {payMethod === 'cod' && (
                      <motion.div key="cod" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        style={{ padding: '1rem', background: 'rgba(58,111,247,0.08)', borderRadius: '8px', color: 'var(--silver-grey)', fontSize: '0.9rem' }}
                      >
                        💡 Pay in cash when your order arrives at your doorstep. Our team will contact you to confirm delivery details.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── 4. Promo Code ───── */}
                  <SectionLabel num="4" title="Promo Code" />
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={promo}
                      onChange={e => { setPromo(e.target.value); setPromoStatus(null) }}
                      placeholder="Enter promo code (e.g. KAIZEN10)"
                      style={{
                        flex: 1, padding: '0.75rem 1rem',
                        background: 'var(--graphite)', border: `1px solid ${promoStatus === 'valid' ? '#22c55e' : promoStatus === 'invalid' ? '#ef4444' : 'transparent'}`,
                        borderRadius: 'var(--radius-md)', color: 'var(--warm-white)', fontSize: '0.9rem'
                      }}
                    />
                    <button type="button" onClick={applyPromo}
                      style={{ padding: '0.75rem 1.25rem', background: 'var(--graphite)', border: '1px solid var(--cobalt-blue)', borderRadius: 'var(--radius-md)', color: 'var(--cobalt-blue)', fontWeight: 600, cursor: 'pointer' }}>
                      Apply
                    </button>
                  </div>
                  {promoStatus === 'valid' && <p style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ Promo applied! {(discount * 100).toFixed(0)}% off your order.</p>}
                  {promoStatus === 'invalid' && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>✗ Invalid promo code. Please try again.</p>}

                  {/* ── Submit ───── */}
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={status === 'submitting'}
                    style={{ justifyContent: 'center', marginTop: '2rem', padding: '1rem', fontSize: '1rem' }}
                  >
                    {status === 'submitting' ? (
                      <span>Processing...</span>
                    ) : status === 'error' ? (
                      <span>⚠ {errorMsg || 'Error. Try again.'}</span>
                    ) : (
                      <span>Place Order · ${finalTotal.toFixed(2)}</span>
                    )}
                  </button>

                  <p style={{ textAlign: 'center', color: 'var(--steel-grey)', fontSize: '0.75rem', marginTop: '1rem' }}>
                    🔒 Your information is secured and encrypted. We respect your privacy.
                  </p>
                </form>
              </div>
            ) : (
              /* ── Success State ── */
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: 'var(--graphite)', borderRadius: '16px', padding: '4rem 3rem',
                  textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎉</div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '1rem' }}>Order Placed!</h2>
                <p style={{ color: 'var(--silver-grey)', fontSize: '1rem', maxWidth: '360px', margin: '0 auto 2rem' }}>
                  Thank you, {info.name || 'valued customer'}! We've received your order and will contact you at <strong>{info.email}</strong> with the next steps.
                </p>
                <button className="btn btn--primary" onClick={() => { setIsCheckoutOpen(false); setStatus('idle') }} style={{ justifyContent: 'center' }}>
                  Back to Website
                </button>
              </motion.div>
            )}

            {/* ── RIGHT: Order Summary ─────────────────────────────── */}
            <div className="checkout__summary-panel" style={{
              background: 'var(--graphite)', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={item.image} alt={item.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '6px' }} />
                      <span style={{
                        position: 'absolute', top: '-6px', right: '-6px', background: 'var(--cobalt-blue)',
                        borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700
                      }}>{item.quantity}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--silver-grey)', margin: 0 }}>{item.price} each</p>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      ${(parseFloat(item.price.replace('$', '')) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--silver-grey)' }}>
                  <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#22c55e' }}>
                    <span>Discount ({(discount * 100).toFixed(0)}%)</span>
                    <span>-${discountAmt.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--silver-grey)' }}>
                  <span>Shipping</span><span style={{ color: '#22c55e' }}>Free</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <span>Total</span><span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(58,111,247,0.08)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--silver-grey)', textAlign: 'center' }}>
                🚚 Free shipping on all orders within India
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
