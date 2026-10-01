import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { supabase } from '../supabase'
import { Reveal, StaggerReveal, StaggerItem } from '../components/animations'

// ── Constants ─────────────────────────────────────────────────────────────────
const COLLECTIONS = {
  'car-dashboard-idol': {
    label:       'Car Dashboard Idol',
    icon:        '🚗',
    description: 'Bless every journey. Our car dashboard idols are precision 3D printed in premium PLA — lightweight, durable, and deeply spiritual. A daily companion on every road you travel.',
    accent:      '#2563EB',
    gradient:    'linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)',
  },
  'divine-idols': {
    label:       'Divine Idols',
    icon:        '🪔',
    description: 'Sacred art for your home temple. Each idol is printed with meticulous detail, capturing the divinity and grace of your chosen deity — a meaningful addition to any puja space.',
    accent:      '#D97706',
    gradient:    'linear-gradient(135deg, #1c1109 0%, #3b2005 100%)',
  },
  'gifting-elements': {
    label:       'Gifting Elements',
    icon:        '🎁',
    description: 'Give something truly unique. Our 3D-printed gifting pieces — from kumkum holders to decorative stands — make memorable, heartfelt gifts for every occasion and festival.',
    accent:      '#059669',
    gradient:    'linear-gradient(135deg, #051c11 0%, #0a3320 100%)',
  },
  'custom-products': {
    label:       'Custom Products',
    icon:        '⚙️',
    description: 'Have a design in mind? We bring your ideas to life with professional 3D printing. From prototypes to personalized gifts — if you can imagine it, we can print it.',
    accent:      '#7C3AED',
    gradient:    'linear-gradient(135deg, #150d24 0%, #2e1065 100%)',
  },
  'all': {
    label:       'All Collections',
    icon:        '✦',
    description: 'Browse our entire range of 3D-printed products.',
    accent:      'var(--cobalt-blue)',
    gradient:    'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },
}

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount)

// Resolve category from product (supports both slug and subtitle)
function resolveCategory(product) {
  if (product.category) return product.category
  const s = (product.subtitle || '').toLowerCase()
  if (s.includes('dashboard')) return 'car-dashboard-idol'
  if (s.includes('gift'))      return 'gifting-elements'
  if (s.includes('custom'))    return 'custom-products'
  return 'divine-idols'
}

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
          key={activeIdx} custom={direction} variants={variants}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          src={images[activeIdx]} alt={product.name}
          className="product-card__image"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
          onClick={() => onZoomClick(images[activeIdx])}
        />
      </AnimatePresence>
      {images.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: 32, height: 32, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background 0.2s', fontSize: '1.2rem' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cobalt-blue)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
          >‹</button>
          <button onClick={next} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '50%', width: 32, height: 32, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background 0.2s', fontSize: '1.2rem' }}
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

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onZoomClick }) {
  const { addToCart } = useCart()
  const isCustom = resolveCategory(product) === 'custom-products'

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
          <div className="product-card__price">{isCustom ? 'Get Quote' : formatINR(product.price)}</div>
        </div>
        {isCustom ? (
          <Link to="/custom-bulk" className="btn btn--primary"
            style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', textAlign: 'center', textDecoration: 'none', display: 'flex' }}
          >
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

// ── Main Collection Page ──────────────────────────────────────────────────────
export default function Collection() {
  const { slug }                      = useParams()
  const navigate                      = useNavigate()
  const [products, setProducts]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [zoomedImage, setZoomedImage] = useState(null)

  const collectionSlug = slug || 'all'
  const collection     = COLLECTIONS[collectionSlug] || COLLECTIONS['all']

  // If slug is unknown, redirect to shop
  useEffect(() => {
    if (slug && !COLLECTIONS[slug]) navigate('/shop', { replace: true })
  }, [slug, navigate])

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

  const filtered = useMemo(() => {
    if (collectionSlug === 'all') return products
    return products.filter(p => resolveCategory(p) === collectionSlug)
  }, [products, collectionSlug])

  return (
    <>
      {/* ── Hero Banner ── */}
      <section style={{
        paddingTop: '120px', paddingBottom: '4rem',
        background: collection.gradient,
        position: 'relative', overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Decorative circle */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: collection.accent, opacity: 0.06,
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>
          {/* Breadcrumb */}
          <Reveal>
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--silver-grey)', marginBottom: '1.5rem' }}>
              <Link to="/" style={{ color: 'var(--silver-grey)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--warm-white)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--silver-grey)'}
              >Home</Link>
              <span>›</span>
              <Link to="/shop" style={{ color: 'var(--silver-grey)', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--warm-white)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--silver-grey)'}
              >Shop</Link>
              <span>›</span>
              <span style={{ color: 'var(--warm-white)' }}>{collection.label}</span>
            </nav>
          </Reveal>

          <Reveal delay={0.08}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '3rem' }}>{collection.icon}</span>
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {collection.label}
              </h1>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <p style={{ color: 'var(--silver-grey)', fontSize: 'var(--text-base)', maxWidth: 560, lineHeight: 1.6 }}>
              {collection.description}
            </p>
          </Reveal>

          {/* Other collections */}
          <Reveal delay={0.2}>
            <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--silver-grey)', alignSelf: 'center', marginRight: '0.25rem' }}>Browse:</span>
              {Object.entries(COLLECTIONS).filter(([s]) => s !== 'all' && s !== collectionSlug).map(([s, c]) => (
                <Link key={s} to={`/collections/${s}`}
                  style={{
                    padding: '0.35rem 1rem', borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--silver-grey)', fontSize: 'var(--text-xs)',
                    fontWeight: 600, textDecoration: 'none',
                    transition: 'all 0.2s', backdropFilter: 'blur(6px)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = 'var(--warm-white)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--silver-grey)' }}
                >
                  {c.icon} {c.label}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section style={{ padding: '3rem 1.5rem 6rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {[...Array(4)].map((_, i) => (
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
              style={{ textAlign: 'center', padding: '6rem 2rem' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{collection.icon}</div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--warm-white)', marginBottom: '0.5rem' }}>
                No products in this collection yet
              </h3>
              <p style={{ color: 'var(--silver-grey)' }}>
                We're adding new products soon. Check back shortly!
              </p>
              <Link to="/shop"
                style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.6rem 1.5rem', background: 'var(--cobalt-blue)', color: '#fff', borderRadius: '100px', textDecoration: 'none', fontWeight: 600 }}
              >
                ← View All Products
              </Link>
            </motion.div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem', color: 'var(--silver-grey)', fontSize: 'var(--text-sm)' }}>
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} in {collection.label}
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
              src={zoomedImage} alt="Zoomed"
              style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setZoomedImage(null)}
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: 48, height: 48, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >&times;</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </>
  )
}
