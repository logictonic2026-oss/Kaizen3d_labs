import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../supabase'

// ── Price display with original/sale + discount badge ─────────────────────────
function PriceDisplay({ product }) {
  const hasDiscount = product.original_price && Number(product.original_price) > Number(product.price)
  const pct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.875rem' }}>
          {formatINR(product.price)}
        </span>
        {hasDiscount && (
          <span style={{ background: '#22c55e', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '1px 5px', borderRadius: 4 }}>
            {product.discount_label || `${pct}% OFF`}
          </span>
        )}
      </div>
      {hasDiscount && (
        <span style={{ fontSize: '0.72rem', color: '#64748b', textDecoration: 'line-through' }}>
          {formatINR(product.original_price)}
        </span>
      )}
    </div>
  )
}

const CATS = {
  'car-dashboard-idol': { label: 'Car Dashboard', color: '#3b82f6' },
  'divine-idols':        { label: 'Divine Idols',  color: '#f59e0b' },
  'gifting-elements':    { label: 'Gifting',        color: '#22c55e' },
  'custom-products':     { label: 'Custom',         color: '#a855f7' },
}

const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

// ── Inline price cell ─────────────────────────────────────────────────────────
function PriceCell({ product, onSaved }) {
  const [editing,  setEditing]  = useState(false)
  const [value,    setValue]    = useState(String(product.price))
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const inputRef = useRef()

  const handleEdit = () => { setEditing(true); setTimeout(() => inputRef.current?.select(), 0) }

  const handleSave = async () => {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) { setValue(String(product.price)); setEditing(false); return }
    setSaving(true)
    const { error } = await supabase.from('products').update({ price: num }).eq('id', product.id)
    setSaving(false)
    if (!error) { setSaved(true); onSaved(product.id, num); setTimeout(() => setSaved(false), 1500) }
    setEditing(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter')  handleSave()
    if (e.key === 'Escape') { setValue(String(product.price)); setEditing(false) }
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>₹</span>
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKey}
          style={{
            width: 90, padding: '0.3rem 0.5rem', borderRadius: 8,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.5)',
            color: '#e2e8f0', fontSize: '0.875rem', outline: 'none',
          }}
        />
      </div>
    )
  }

  return (
    <button
      onClick={handleEdit}
      title="Click to edit price"
      style={{
        background: 'none', border: '1px solid transparent', borderRadius: 8,
        padding: '0.3rem 0.5rem', cursor: 'pointer',
        color: saved ? '#22c55e' : '#e2e8f0', fontSize: '0.875rem', fontWeight: 600,
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 4,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'none' }}
    >
      {saving ? '…' : saved ? '✓ Saved' : formatINR(product.price)}
      {!saving && !saved && <span style={{ fontSize: '0.65rem', color: '#475569' }}>✎</span>}
    </button>
  )
}

// ── Toggle active switch ──────────────────────────────────────────────────────
function ToggleSwitch({ product, onToggle }) {
  const [active,  setActive]  = useState(product.is_active)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const newVal = !active
    const { error } = await supabase.from('products').update({ is_active: newVal }).eq('id', product.id)
    if (!error) { setActive(newVal); onToggle(product.id, newVal) }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? 'Click to hide from shop' : 'Click to show in shop'}
      style={{
        width: 42, height: 24, borderRadius: 12, border: 'none',
        background: active ? '#22c55e' : '#374151',
        cursor: loading ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 0.25s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: active ? 21 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        display: 'block',
      }} />
    </button>
  )
}

// ── Delete button ─────────────────────────────────────────────────────────────
function DeleteButton({ product, onDeleted }) {
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (!error) onDeleted(product.id)
    setDeleting(false)
    setConfirm(false)
  }

  if (confirm) {
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ padding: '0.25rem 0.6rem', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
        >
          {deleting ? '…' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          style={{ padding: '0.25rem 0.6rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      title="Delete product"
      style={{ padding: '0.375rem 0.625rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
    >
      🗑
    </button>
  )
}

// ── Main Products Page ────────────────────────────────────────────────────────
export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [catFilter,setCatFilter]= useState('all')

  const fetchProducts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  const updatePrice  = (id, price)     => setProducts(p => p.map(x => x.id === id ? { ...x, price }    : x))
  const updateActive = (id, is_active) => setProducts(p => p.map(x => x.id === id ? { ...x, is_active }: x))
  const removeItem   = (id)            => setProducts(p => p.filter(x => x.id !== id))

  const resolveCategory = (p) => {
    if (p.category) return p.category
    const s = (p.subtitle || '').toLowerCase()
    if (s.includes('dashboard')) return 'car-dashboard-idol'
    if (s.includes('gift'))      return 'gifting-elements'
    if (s.includes('custom'))    return 'custom-products'
    return 'divine-idols'
  }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter === 'all' || resolveCategory(p) === catFilter
    return matchSearch && matchCat
  })

  return (
    <AdminLayout title="Products">
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '0.9rem' }}>⌕</span>
          <input
            type="text"
            placeholder="Search products…"
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

        {/* Category filter */}
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{
            padding: '0.625rem 1rem', borderRadius: 10,
            background: '#111118', border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">All Categories</option>
          {Object.entries(CATS).map(([slug, { label }]) => (
            <option key={slug} value={slug}>{label}</option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#475569', alignSelf: 'center' }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </span>
          <Link to="/admin/products/new" style={{
            padding: '0.625rem 1.25rem', borderRadius: 10, textDecoration: 'none',
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', fontSize: '0.875rem', fontWeight: 700,
            boxShadow: '0 4px 12px rgba(99,102,241,0.3)', whiteSpace: 'nowrap',
          }}>
            + Add Product
          </Link>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
            <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#475569' }}>
            {search || catFilter !== 'all' ? 'No products match your filter.' : 'No products yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Image', 'Product', 'Category', 'Price (click to edit)', 'Visible', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(product => {
                  const cat     = resolveCategory(product)
                  const catInfo = CATS[cat] || { label: cat, color: '#64748b' }
                  const img     = Array.isArray(product.images) ? product.images[0] : null

                  return (
                    <tr
                      key={product.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Image */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: 10, overflow: 'hidden',
                          background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
                        }}>
                          {img ? (
                            <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '1.25rem' }}>📦</div>
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>{product.name}</div>
                        {product.subtitle && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{product.subtitle}</div>}
                      </td>

                      {/* Category */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{
                          padding: '0.25rem 0.6rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                          background: `${catInfo.color}18`, color: catInfo.color,
                          border: `1px solid ${catInfo.color}40`,
                        }}>{catInfo.label}</span>
                      </td>

                      {/* Price — inline editable + discount display */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <PriceCell product={product} onSaved={updatePrice} />
                          {product.original_price && Number(product.original_price) > Number(product.price) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', textDecoration: 'line-through' }}>{formatINR(product.original_price)}</span>
                              <span style={{ background: '#22c55e', color: '#fff', fontSize: '0.58rem', fontWeight: 800, padding: '1px 5px', borderRadius: 4 }}>
                                {product.discount_label || `${Math.round((1 - Number(product.price)/Number(product.original_price))*100)}% OFF`}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Toggle */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <ToggleSwitch product={product} onToggle={updateActive} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Link
                            to={`/admin/products/${product.id}`}
                            style={{
                              padding: '0.375rem 0.75rem', borderRadius: 8, textDecoration: 'none',
                              border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)',
                              color: '#818cf8', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                          >
                            Edit
                          </Link>
                          <DeleteButton product={product} onDeleted={removeItem} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#334155' }}>
        💡 Click any price to edit it inline. Toggle the switch to show/hide a product. To edit discount or images, click <strong style={{ color: '#475569' }}>Edit</strong>.
      </p>
    </AdminLayout>
  )
}
