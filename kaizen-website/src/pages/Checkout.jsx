import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../supabase'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
  // UTs
  'Delhi','Chandigarh','Puducherry','Jammu & Kashmir','Ladakh',
  'Andaman & Nicobar Islands','Dadra & Nagar Haveli and Daman & Diu','Lakshadweep',
]

const PAYMENT_METHODS = [
  { id: 'razorpay',      label: 'Pay via Razorpay (UPI, Cards)', icon: '⚡', desc: 'Secure online payment (Zero extra fees)' },
  { id: 'upi',           label: 'UPI Transfer',       icon: '📱', desc: 'We\'ll share UPI ID after order' },
  { id: 'bank_transfer', label: 'Bank Transfer',      icon: '🏦', desc: 'We\'ll share bank details after order' },
]

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

// ── Input component ────────────────────────────────────────────────────────────
function Input({ label, required, hint, error, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{
        fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        {hint && <span style={{ fontWeight: 400, textTransform: 'none', color: '#64748b', marginLeft: 4, letterSpacing: 'normal' }}>{hint}</span>}
      </label>
      <input
        {...props}
        style={{
          padding: '0.75rem 1rem', borderRadius: 10, boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
          color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
          transition: 'border-color 0.2s', width: '100%',
          fontFamily: 'inherit',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
        onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
      />
      {error && <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0 }}>{error}</p>}
    </div>
  )
}

function Select({ label, required, error, children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <select
        {...props}
        style={{
          padding: '0.75rem 1rem', borderRadius: 10, boxSizing: 'border-box',
          background: '#111118',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
          color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', cursor: 'pointer',
          width: '100%', fontFamily: 'inherit',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
        onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
      >
        {children}
      </select>
      {error && <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0 }}>{error}</p>}
    </div>
  )
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem',
    }}>
      <h3 style={{
        fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0',
        margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  )
}

// ── Main Checkout Page ─────────────────────────────────────────────────────────
export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    // Contact
    full_name: '', email: '', mobile: '', alt_mobile: '',
    // Address
    address: '', landmark: '', city: '', state: '', pincode: '', country: 'India',
    // GST
    gst_number: '', company_name: '',
    // Payment & Shipping
    payment_method: 'razorpay',
    shipping_method: 'standard', // 'standard' or 'priority'
  })
  const [showGST, setShowGST] = useState(false)
  const [errors, setErrors] = useState({})
  
  // Pincode lookup
  const [fetchingPincode, setFetchingPincode] = useState(false)
  const [pincodeError, setPincodeError] = useState('')

  // Promo code
  const [promoInput, setPromoInput]   = useState('')
  const [promoApplied, setPromoApplied] = useState(null)  // { code, discount_type, discount_value }
  const [promoStatus, setPromoStatus] = useState('')       // 'checking' | 'ok' | 'error'
  const [promoMsg, setPromoMsg]       = useState('')

  const [placing,  setPlacing]  = useState(false)
  const [placingErr, setPlacingErr] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  // Redirect if cart empty
  useEffect(() => {
    if (cartItems.length === 0) navigate('/shop')
  }, [cartItems])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  // ── Promo code logic ──
  const applyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoStatus('checking')
    setPromoMsg('')

    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoInput.trim().toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      setPromoStatus('error')
      setPromoMsg('Invalid or expired promo code.')
      setPromoApplied(null)
      return
    }

    // Check min order
    if (data.min_order_amount && cartTotal < Number(data.min_order_amount)) {
      setPromoStatus('error')
      setPromoMsg(`Min. order of ${formatINR(data.min_order_amount)} required.`)
      setPromoApplied(null)
      return
    }

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setPromoStatus('error')
      setPromoMsg('This promo code has expired.')
      setPromoApplied(null)
      return
    }

    setPromoApplied(data)
    setPromoStatus('ok')
    setPromoMsg(`${data.discount_type === 'percentage' ? data.discount_value + '%' : formatINR(data.discount_value)} discount applied!`)
  }

  const removePromo = () => {
    setPromoApplied(null)
    setPromoInput('')
    setPromoStatus('')
    setPromoMsg('')
  }

  // ── Discount & Shipping calculation ──
  const discount = promoApplied
    ? promoApplied.discount_type === 'percentage'
      ? Math.round(cartTotal * Number(promoApplied.discount_value) / 100)
      : Number(promoApplied.discount_value)
    : 0

  const shippingCost = form.shipping_method === 'priority' ? 100 : 0
  const total = Math.max(0, cartTotal - discount) + shippingCost

  const isTamilNadu = form.state === 'Tamil Nadu'
  
  // ── Pincode Lookup ──
  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setForm(f => ({ ...f, pincode: val }))
    
    if (val.length === 6) {
      setFetchingPincode(true)
      setPincodeError('')
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`)
        const data = await res.json()
        if (data && data[0] && data[0].Status === 'Success') {
          const po = data[0].PostOffice[0]
          setForm(f => ({ 
            ...f, 
            city: po.Block || po.District || po.Name, 
            state: po.State 
          }))
          // Clear pincode errors if any
          setErrors(e => ({ ...e, pincode: null, city: null, state: null }))
        } else {
          setPincodeError('Invalid PIN code')
        }
      } catch (err) {
        setPincodeError('Could not verify PIN code')
      } finally {
        setFetchingPincode(false)
      }
    }
  }

  // ── Form validation ──
  const validate = () => {
    const e = {}
    if (!form.full_name.trim())  e.full_name = 'Full name is required'
    if (!form.email.trim())      e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.mobile.trim())     e.mobile = 'Mobile number is required'
    else if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g, ''))) e.mobile = 'Enter a valid 10-digit Indian mobile number'
    if (!form.address.trim())    e.address = 'Address is required'
    if (!form.city.trim())       e.city = 'City is required'
    if (!form.state)             e.state = 'Please select a state'
    if (!form.pincode.trim())    e.pincode = 'PIN code is required'
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit PIN code'
    if (showGST && form.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst_number)) {
      e.gst_number = 'Enter a valid 15-character GST number'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Place Order ──
  const handlePlaceOrder = async () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setPlacing(true)
    setPlacingErr('')

    try {
      // 1. Insert order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          customer_name:    form.full_name.trim(),
          customer_email:   form.email.trim().toLowerCase(),
          customer_phone:   form.mobile.trim(),
          shipping_address: `${form.address.trim()}${form.landmark ? ', ' + form.landmark.trim() : ''}`,
          shipping_city:    form.city.trim(),
          shipping_state:   form.state,
          shipping_zip:     form.pincode.trim(),
          shipping_country: form.country,
          payment_method:   form.payment_method,
          promo_code:       promoApplied?.code || null,
          discount_amount:  discount,
          subtotal:         cartTotal,
          total:            total,
          status:           form.payment_method === 'razorpay' ? 'payment_pending' : 'pending',
        }])
        .select()
        .single()

      if (orderErr) throw orderErr

      // 2. Insert order items
      const items = cartItems.map(item => ({
        order_id:         order.id,
        product_id:       item.id,
        product_name:     item.name,
        price_at_purchase: Number(item.price),
        quantity:         item.quantity,
        image_url:        item.image || (Array.isArray(item.images) ? item.images[0] : '') || '',
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(items)
      if (itemsErr) throw itemsErr

      // 3. Increment promo code usage
      if (promoApplied) {
        await supabase
          .from('promo_codes')
          .update({ uses_count: (promoApplied.uses_count || 0) + 1 })
          .eq('id', promoApplied.id)
      }

      // 4. Send confirmation email via Google Apps Script (if configured)
      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL
      if (scriptUrl) {
        try {
          await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type:       'order_confirmation',
              orderId:    order.id.slice(0, 8).toUpperCase(),
              orderFull:  order.id,
              name:       form.full_name,
              email:      form.email,
              items:      cartItems.map(i => ({ name: i.name, qty: i.quantity, price: i.price })),
              total,
              paymentMethod: form.payment_method,
            }),
          })
        } catch (_) { /* email is optional, don't block order */ }
      }

      // 5. Clear cart and navigate
      clearCart()
      navigate(`/order-confirmation?id=${order.id}`)

    } catch (err) {
      setPlacingErr(err.message || 'Something went wrong. Please try again.')
      setPlacing(false)
    }
  }

  if (cartItems.length === 0) return null

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.25rem)', fontWeight: 800, margin: 0, color: '#e2e8f0' }}>
            Checkout
          </h1>
          <p style={{ color: '#64748b', marginTop: '0.35rem', fontSize: '0.875rem' }}>
            {cartItems.reduce((s, i) => s + i.quantity, 0)} item{cartItems.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''} in your order
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: '2rem', alignItems: 'start' }}>

          {/* ── LEFT: Form ── */}
          <div>
            {/* Validation summary */}
            {Object.keys(errors).length > 0 && (
              <div style={{
                padding: '0.875rem 1rem', borderRadius: 12, marginBottom: '1.25rem',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444', fontSize: '0.85rem',
              }}>
                ⚠ Please fix the highlighted fields before placing your order.
              </div>
            )}

            {/* Contact Details */}
            <SectionCard title="Contact Details" icon="👤">
              <div style={{ display: 'grid', gap: '1rem' }}>
                <Input label="Full Name" required value={form.full_name} onChange={set('full_name')} placeholder="Sanjay Kumar" error={errors.full_name} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input label="Email Address" required type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" error={errors.email} />
                  <Input label="Mobile Number" required type="tel" value={form.mobile} onChange={set('mobile')} placeholder="9876543210" hint="(10-digit)" error={errors.mobile} />
                </div>
                <Input label="Alternate Mobile" type="tel" value={form.alt_mobile} onChange={set('alt_mobile')} placeholder="Optional" />
              </div>
            </SectionCard>

            {/* Delivery Address */}
            <SectionCard title="Delivery Address" icon="📦">
              <div style={{ display: 'grid', gap: '1rem' }}>
                <Input label="Address Line 1" required value={form.address} onChange={set('address')} placeholder="Flat / House No., Street, Road" error={errors.address} />
                <Input label="Landmark / Area" value={form.landmark} onChange={set('landmark')} placeholder="Near XYZ temple, behind ABC school (helps delivery)" hint="(optional)" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', position: 'relative' }}>
                  <Input label="PIN Code" required value={form.pincode} onChange={handlePincodeChange} placeholder="600001" maxLength={6} error={errors.pincode || pincodeError} />
                  {fetchingPincode && (
                    <div style={{ position: 'absolute', left: '1rem', top: '2.5rem', color: '#3b82f6', fontSize: '0.75rem' }}>Looking up...</div>
                  )}
                  <Input label="City" required value={form.city} onChange={set('city')} placeholder="Chennai" error={errors.city} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Select label="State" required value={form.state} onChange={set('state')} error={errors.state}>
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <Input label="Country" value={form.country} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>
            </SectionCard>

            {/* Shipping Method */}
            {form.state && (
              <SectionCard title="Shipping Method" icon="🚚">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem', borderRadius: 12, cursor: 'pointer',
                    border: form.shipping_method === 'standard' ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: form.shipping_method === 'standard' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.15s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input type="radio" checked={form.shipping_method === 'standard'} onChange={() => setForm(f => ({ ...f, shipping_method: 'standard' }))} style={{ display: 'none' }} />
                      <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: form.shipping_method === 'standard' ? '5px solid #3b82f6' : '2px solid rgba(255,255,255,0.2)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>Standard Delivery</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isTamilNadu ? '2-3 business days' : '4-6 business days'}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#22c55e' }}>FREE</div>
                  </label>
                  
                  <label style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem 1.25rem', borderRadius: 12, cursor: 'pointer',
                    border: form.shipping_method === 'priority' ? '1px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    background: form.shipping_method === 'priority' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.15s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input type="radio" checked={form.shipping_method === 'priority'} onChange={() => setForm(f => ({ ...f, shipping_method: 'priority' }))} style={{ display: 'none' }} />
                      <div style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, border: form.shipping_method === 'priority' ? '5px solid #3b82f6' : '2px solid rgba(255,255,255,0.2)' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>Priority Delivery 🚀</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{isTamilNadu ? '1-2 business days' : '2-3 business days'}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0' }}>+₹100</div>
                  </label>
                </div>
              </SectionCard>
            )}

            {/* GST Details (toggle) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                onClick={() => setShowGST(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'none', border: '1px dashed rgba(255,255,255,0.15)',
                  borderRadius: 10, padding: '0.75rem 1.25rem',
                  color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer',
                  width: '100%', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.color = '#e2e8f0' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#94a3b8' }}
              >
                <span>{showGST ? '▼' : '▶'}</span>
                🧾 Add GST Details for Tax Invoice <span style={{ color: '#64748b', fontSize: '0.78rem' }}>(optional — for business customers)</span>
              </button>
              {showGST && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0 0 16px 16px', borderTop: 'none', padding: '1.25rem', marginTop: -1,
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Input label="Company Name" value={form.company_name} onChange={set('company_name')} placeholder="Acme Pvt Ltd" />
                    <Input label="GST Number" value={form.gst_number} onChange={set('gst_number')} placeholder="22AAAAA0000A1Z5" maxLength={15} error={errors.gst_number}
                      style={{ textTransform: 'uppercase' }}
                      onInput={e => e.target.value = e.target.value.toUpperCase()} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem' }}>
                    A GST invoice will be emailed to you after the order is processed.
                  </p>
                </div>
              )}
            </div>

            {/* Promo Code */}
            <SectionCard title="Promo Code" icon="🎟">
              {promoApplied ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.875rem 1rem', borderRadius: 10,
                  background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)',
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.9rem' }}>
                      {promoApplied.code}
                    </span>
                    <span style={{ color: '#4ade80', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                      — {promoMsg}
                    </span>
                  </div>
                  <button onClick={removePromo} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Remove ✕
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    placeholder="Enter promo code"
                    style={{
                      flex: 1, padding: '0.75rem 1rem', borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit',
                      letterSpacing: '0.06em',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button
                    onClick={applyPromo}
                    disabled={promoStatus === 'checking' || !promoInput}
                    style={{
                      padding: '0.75rem 1.5rem', borderRadius: 10, border: 'none',
                      background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                      color: '#60a5fa', fontWeight: 700, fontSize: '0.875rem',
                      cursor: promoInput ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                  >
                    {promoStatus === 'checking' ? 'Checking…' : 'Apply'}
                  </button>
                </div>
              )}
              {promoStatus === 'error' && (
                <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.5rem' }}>⚠ {promoMsg}</p>
              )}
            </SectionCard>

            {/* Payment Method */}
            <SectionCard title="Payment Method" icon="💳">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {PAYMENT_METHODS.map(pm => (
                  <label
                    key={pm.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem 1.25rem', borderRadius: 12, cursor: 'pointer',
                      border: form.payment_method === pm.id
                        ? '1px solid rgba(59,130,246,0.5)'
                        : '1px solid rgba(255,255,255,0.08)',
                      background: form.payment_method === pm.id
                        ? 'rgba(59,130,246,0.08)'
                        : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pm.id}
                      checked={form.payment_method === pm.id}
                      onChange={set('payment_method')}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      border: form.payment_method === pm.id ? '5px solid #3b82f6' : '2px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.15s',
                    }} />
                    <span style={{ fontSize: '1.25rem' }}>{pm.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{pm.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{pm.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '1rem', lineHeight: 1.5 }}>
                📧 After placing your order, we will email you payment details and confirm your order within 24 hours.
              </p>
            </SectionCard>

            {/* Terms Agreement Checkbox — required by Razorpay & Consumer Protection Rules */}
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
              padding: '1rem 1.25rem', borderRadius: 10, marginBottom: '1rem',
              background: agreeToTerms ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${agreeToTerms ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.2s',
            }}>
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreeToTerms}
                onChange={e => setAgreeToTerms(e.target.checked)}
                style={{ marginTop: '0.2rem', width: 16, height: 16, accentColor: '#3b82f6', cursor: 'pointer', flexShrink: 0 }}
              />
              <label htmlFor="agree-terms" style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, cursor: 'pointer' }}>
                I have read and agree to the{' '}
                <Link to="/terms" style={{ color: '#60a5fa', textDecoration: 'underline' }} target="_blank">Terms &amp; Conditions</Link>
                {', '}
                <Link to="/privacy" style={{ color: '#60a5fa', textDecoration: 'underline' }} target="_blank">Privacy Policy</Link>
                {', and '}
                <Link to="/refund" style={{ color: '#60a5fa', textDecoration: 'underline' }} target="_blank">Refund Policy</Link>
                {' of Kaizen 3D Labs.'}
              </label>
            </div>

            {/* Place Order */}
            {placingErr && (
              <div style={{ padding: '0.875rem 1rem', borderRadius: 10, marginBottom: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.875rem' }}>
                ⚠ {placingErr}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !agreeToTerms}
              style={{
                width: '100%', padding: '1.1rem 2rem', borderRadius: 14, border: 'none',
                background: (placing || !agreeToTerms) ? 'rgba(59,130,246,0.35)' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                color: '#fff', fontSize: '1rem', fontWeight: 800,
                cursor: (placing || !agreeToTerms) ? 'not-allowed' : 'pointer',
                boxShadow: agreeToTerms ? '0 6px 24px rgba(59,130,246,0.35)' : 'none',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {placing ? (
                <><span style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Placing your order…</>
              ) : (
                `🛡 Place Order · ${formatINR(total)}`
              )}
            </button>

            <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.75rem', marginTop: '0.75rem' }}>
              Secured by Razorpay · PCI-DSS Compliant
            </p>
          </div>

          {/* ── RIGHT: Order Summary (sticky) ── */}
          <div style={{ position: 'sticky', top: 110 }}>
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, overflow: 'hidden',
            }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0' }}>
                  Order Summary
                </h3>
              </div>

              {/* Items */}
              <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 10, overflow: 'hidden',
                      background: 'rgba(255,255,255,0.05)', flexShrink: 0, position: 'relative',
                    }}>
                      {(item.image || (Array.isArray(item.images) && item.images[0]))
                        ? <img src={item.image || item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📦</div>
                      }
                      <div style={{
                        position: 'absolute', top: -6, right: -6, background: '#6366f1',
                        color: '#fff', fontSize: '0.65rem', fontWeight: 800, width: 18, height: 18,
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{item.quantity}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                      {item.subtitle && <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '2px 0 0' }}>{item.subtitle}</p>}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0', flexShrink: 0 }}>
                      {formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ padding: '1rem 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span>Subtotal</span><span>{formatINR(cartTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#22c55e' }}>
                      <span>Promo ({promoApplied?.code})</span>
                      <span>− {formatINR(discount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span>Delivery</span>
                    <span style={{ color: shippingCost === 0 ? '#22c55e' : 'inherit' }}>
                      {shippingCost === 0 ? 'FREE' : `+${formatINR(shippingCost)}`}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0',
                  }}>
                    <span>Total</span><span>{formatINR(total)}</span>
                  </div>
                </div>

                <div style={{
                  marginTop: '1.25rem', padding: '0.875rem 1rem', borderRadius: 10,
                  background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)',
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600, marginBottom: '0.4rem' }}>
                    ✓ Ships from Hosur, Tamil Nadu
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600, marginBottom: '0.4rem' }}>
                    ✓ Order Confirmation by Email
                  </div>
                  {form.state && (
                    <div style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600 }}>
                      ✓ Est. delivery: {form.shipping_method === 'priority' ? (isTamilNadu ? '1-2' : '2-3') : (isTamilNadu ? '2-3' : '4-6')} business days
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
