import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../supabase'
import { Reveal, StaggerReveal, StaggerItem } from '../components/animations'

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { slug: 'all',                label: 'All Products',       icon: '✦' },
  { slug: 'car-dashboard-idol', label: 'Car Dashboard Idol', icon: '🚗' },
  { slug: 'divine-idols',       label: 'Divine Idols',       icon: '🪔' },
  { slug: 'gifting-elements',   label: 'Gifting Elements',   icon: '🎁' },
  { slug: 'custom-products',    label: 'Custom Products',    icon: '⚙️' },
]

const CATEGORY_DESCS = {
  all:                'Explore the full range of our 3D-printed creations.',
  'car-dashboard-idol':'Bless every journey with a beautifully crafted deity for your dashboard.',
  'divine-idols':      'Finely detailed idols for your home temple and sacred spaces.',
  'gifting-elements':  'Unique, meaningful gifts for every festival and occasion.',
  'custom-products':   'Bring your idea to life — we print anything, your way.',
}

// Format INR
const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount)

// ── Per-card image carousel ───────────────────────────────────────────────────
function ProductImageCarousel({ product, onZoomClick }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const images = Array.isArray(product.images) ? product.images : []

  const go = (idx) => { setDirection(idx > activeIdx ? 1 : -1); setActiveIdx(idx) }
  const next = (e) => { e.stopPropagation(); setDirection(1); setActiveIdx((activeIdx + 1) % images.length) }
  const prev = (e) => { e.stopPropagation(); setDirection(-1); setActiveIdx((activeIdx - 1 + images.length) % images.length) }

  const variants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  if (!images.length) return (
    <div className="product-card__image-wrap" style={{ background: 'var(--surface-grey)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--silver-grey)', fontSize: '3rem' }}>📦</span>
    </div>
  )

  return (
    <div className="product-card__image-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="product-card__tag">{product.tag}</div>
      {/* Image label */}
      <div style={{
        position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        color: 'white', fontSize: '0.65rem', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '3px 10px', borderRadius: '20px', zIndex: 5,
        border: '1px solid rgba(255,255,255,0.15)', whiteSpace: 'nowrap',
      }}>
        {product.image_labels?.[activeIdx] ?? `${activeIdx + 1} / ${images.length}`}
      </div>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={activeIdx}
          custom={direction}
          variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          src={images[activeIdx]}
          alt={`${product.name}`}
          className="product-card__image"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
          onClick={() => onZoomClick(images[activeIdx])}
        />
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button onClick={prev} style={arrowStyle('left')}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cobalt-blue)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
          >‹</button>
          <button onClick={next} style={arrowStyle('right')}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cobalt-blue)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
          >›</button>
        </>
      )}
      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 5 }}>
        {images.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); go(i) }}
            style={{ width: i === activeIdx ? 20 : 6, height: 6, borderRadius: 4, background: i === activeIdx ? 'var(--cobalt-blue)' : 'rgba(255,255,255,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }}
          />
        ))}
      </div>
    </div>
  )
}

const arrowStyle = (side) => ({
  position: 'absolute', [side]: 10, top: '50%', transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '50%', width: 32, height: 32, color: 'white',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 5, cursor: 'pointer', backdropFilter: 'blur(4px)',
  transition: 'background 0.2s', fontSize: '1.2rem',
})

// ── Category resolver ─────────────────────────────────────────────────────────
// Handles both slug-based and subtitle-based category assignment
function resolveCategory(product) {
  if (product.category) return product.category
  const s = (product.subtitle || '').toLowerCase()
  if (s.includes('dashboard')) return 'car-dashboard-idol'
  if (s.includes('gift'))      return 'gifting-elements'
  if (s.includes('custom'))    return 'custom-products'
  return 'divine-idols'
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onZoomClick }) {
  const { addToCart } = useCart()
  const cat = resolveCategory(product)
  const isCustom = cat === 'custom-products'

  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <ProductImageCarousel product={product} onZoomClick={onZoomClick} />
      <div className="product-card__body">
        <div style={{ marginBottom: '8px' }}>
          <h3 className="product-card__title">{product.name}</h3>
          {product.subtitle && (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cobalt-blue)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
              {product.subtitle}
            </p>
          )}
        </div>
        <p className="product-card__desc">{product.description || product.desc}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          {isCustom ? (
            <div className="product-card__price">Get Quote</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="product-card__price">{formatINR(product.price)}</div>
              {product.original_price && Number(product.original_price) > Number(product.price) && (
                <>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--silver-grey)', textDecoration: 'line-through' }}>
                    {formatINR(product.original_price)}
                  </div>
                  <div style={{
                    background: '#22c55e', color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                    padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em'
                  }}>
                    {product.discount_label || `${Math.round((1 - Number(product.price)/Number(product.original_price))*100)}% OFF`}
                  </div>
                </>
              )}
            </div>
          )}
          <Link
            to={`/collections/${resolveCategory(product)}`}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--silver-grey)', textDecoration: 'none', borderBottom: '1px solid var(--silver-grey)', paddingBottom: '1px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cobalt-blue)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--silver-grey)'}
          >
            {CATEGORIES.find(c => c.slug === resolveCategory(product))?.label}
          </Link>
        </div>
        {isCustom ? (
          <Link to="/custom-bulk" className="btn btn--primary" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', textAlign: 'center', textDecoration: 'none', display: 'flex' }}>
            Request Quote
          </Link>
        ) : (
          <button
            className="btn btn--primary"
            style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
            onClick={() => addToCart({ ...product, image: Array.isArray(product.images) ? product.images[0] : '' })}
          >
            Add to Cart
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Main Shop Page ────────────────────────────────────────────────────────────
export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [zoomedImage, setZoomedImage]   = useState(null)

  const activeSlug  = searchParams.get('category') || 'all'
  const searchQuery = searchParams.get('search')   || ''

  const setCategory = (slug) => {
    const p = new URLSearchParams(searchParams)
    if (slug === 'all') p.delete('category')
    else p.set('category', slug)
    setSearchParams(p)
  }

  // Fetch all active products
  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (!error) setProducts(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  // Filter by category + search
  const filtered = useMemo(() => {
    let list = products
    if (activeSlug !== 'all') list = list.filter(p => resolveCategory(p) === activeSlug)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.subtitle || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [products, activeSlug, searchQuery])

  const activeCat = CATEGORIES.find(c => c.slug === activeSlug) || CATEGORIES[0]

  return (
    <>
      {/* ── Hero ── */}
      <section style={{
        paddingTop: '120px', paddingBottom: '3rem',
        background: 'linear-gradient(180deg, var(--surface-grey) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <Reveal>
            <span className="tag">Our Products</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginTop: '0.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {activeCat.icon} {activeCat.label}
            </h1>
          </Reveal>
          <Reveal delay={0.14}>
            <p style={{ marginTop: '0.75rem', color: 'var(--silver-grey)', fontSize: 'var(--text-base)', maxWidth: 500 }}>
              {CATEGORY_DESCS[activeSlug]}
            </p>
          </Reveal>

          {/* Category Tabs */}
          <Reveal delay={0.2}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '2rem',
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '100px',
                    border: activeSlug === cat.slug
                      ? '1px solid var(--cobalt-blue)'
                      : '1px solid rgba(255,255,255,0.12)',
                    background: activeSlug === cat.slug
                      ? 'var(--cobalt-blue)'
                      : 'rgba(255,255,255,0.04)',
                    color: activeSlug === cat.slug ? '#fff' : 'var(--silver-grey)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(6px)',
                    letterSpacing: '0.02em',
                  }}
                  onMouseEnter={e => { if (activeSlug !== cat.slug) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'var(--warm-white)' } }}
                  onMouseLeave={e => { if (activeSlug !== cat.slug) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--silver-grey)' } }}
                >
                  <span style={{ marginRight: '0.4rem' }}>{cat.icon}</span>{cat.label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Search query indicator */}
          {searchQuery && (
            <Reveal delay={0.25}>
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--silver-grey)', fontSize: 'var(--text-sm)' }}>
                Showing results for: <strong style={{ color: 'var(--warm-white)' }}>"{searchQuery}"</strong>
                <button
                  onClick={() => { const p = new URLSearchParams(searchParams); p.delete('search'); setSearchParams(p) }}
                  style={{ background: 'none', border: 'none', color: 'var(--cobalt-blue)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}
                >
                  ✕ Clear
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section style={{ padding: '3rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  height: '420px', borderRadius: '16px',
                  background: 'linear-gradient(90deg, var(--surface-grey) 25%, rgba(255,255,255,0.04) 50%, var(--surface-grey) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--silver-grey)' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--warm-white)', marginBottom: '0.5rem' }}>No products found</h3>
              <p>Try a different category or search term.</p>
              <button
                onClick={() => { setSearchParams({}); }}
                style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', background: 'var(--cobalt-blue)', color: '#fff', border: 'none', borderRadius: '100px', cursor: 'pointer', fontWeight: 600 }}
              >
                View All Products
              </button>
            </motion.div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem', color: 'var(--silver-grey)', fontSize: 'var(--text-sm)' }}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''}
              </div>
              <StaggerReveal className="shop__grid">
                {filtered.map(product => (
                  <StaggerItem key={product.id}>
                    <ProductCard product={product} onZoomClick={setZoomedImage} />
                  </StaggerItem>
                ))}
              </StaggerReveal>
            </>
          )}
        </div>
      </section>

      {/* ── Zoom Modal ── */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 3000,
              background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2rem', cursor: 'zoom-out',
            }}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              src={zoomedImage} alt="Zoomed Product"
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setZoomedImage(null)}
              style={{
                position: 'absolute', top: '2rem', right: '2rem',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                border: 'none', borderRadius: '50%', width: 48, height: 48,
                fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', backdropFilter: 'blur(4px)',
              }}
            >&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* shimmer keyframe */}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </>
  )
}
