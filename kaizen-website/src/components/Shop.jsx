import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal, StaggerReveal, StaggerItem } from './animations'
import { useCart } from '../context/CartContext'
import { supabase } from '../supabase'

// Format number as INR currency
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── Per-card image carousel ───────────────────────────────────────────────
function ProductImageCarousel({ product, onZoomClick }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = (idx) => {
    setDirection(idx > activeIdx ? 1 : -1)
    setActiveIdx(idx)
  }

  const next = (e) => {
    e.stopPropagation()
    const nextIdx = (activeIdx + 1) % product.images.length
    setDirection(1)
    setActiveIdx(nextIdx)
  }

  const prev = (e) => {
    e.stopPropagation()
    const prevIdx = (activeIdx - 1 + product.images.length) % product.images.length
    setDirection(-1)
    setActiveIdx(prevIdx)
  }

  const variants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <div className="product-card__image-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Badge */}
      <div className="product-card__tag">{product.tag}</div>

      {/* Image label (Product / In Application) */}
      <div style={{
        position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        color: 'white', fontSize: '0.65rem', fontWeight: 700,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '3px 10px', borderRadius: '20px', zIndex: 5,
        border: '1px solid rgba(255,255,255,0.15)',
        whiteSpace: 'nowrap',
      }}>
        {product.imageLabels?.[activeIdx] ?? `${activeIdx + 1} / ${product.images.length}`}
      </div>

      {/* Animated Image */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={activeIdx}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          src={product.images[activeIdx]}
          alt={`${product.name} - ${product.imageLabels?.[activeIdx] ?? activeIdx + 1}`}
          className="product-card__image"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
          onClick={() => onZoomClick(product.images[activeIdx])}
        />
      </AnimatePresence>

      {/* Prev / Next arrows */}
      {product.images.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%', width: 32, height: 32, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 5, cursor: 'pointer', backdropFilter: 'blur(4px)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cobalt-blue)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
          >
            ‹
          </button>
          <button
            onClick={next}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%', width: 32, height: 32, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 5, cursor: 'pointer', backdropFilter: 'blur(4px)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cobalt-blue)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
          >
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, zIndex: 5,
      }}>
        {product.images.map((_, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); go(i) }}
            style={{
              width: i === activeIdx ? 20 : 6,
              height: 6,
              borderRadius: 4,
              background: i === activeIdx ? 'var(--cobalt-blue)' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main Shop component ───────────────────────────────────────────────────
export default function Shop() {
  const { addToCart } = useCart()
  const [zoomedImage, setZoomedImage] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        
      if (error) {
        console.error('Error fetching products:', error)
      } else {
        setProducts(data || [])
      }
      setLoading(false)
    }
    
    fetchProducts()
  }, [])

  return (
    <section className="shop" id="shop">
      <div className="shop__inner">
        <div className="section-header">
          <div>
            <Reveal>
              <span className="tag">Direct To Consumer</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="section-title">
                Shop Our Signature Products
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p style={{ color: 'var(--silver-grey)', fontSize: 'var(--text-base)', maxWidth: 400 }}>
              Buy our ready-to-ship designs directly. Click the images to see each product and its real-world application.
            </p>
          </Reveal>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--silver-grey)' }}>
            Loading products...
          </div>
        ) : (
          <StaggerReveal className="shop__grid">
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <motion.div
                className="product-card"
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Image Carousel */}
                <ProductImageCarousel product={product} onZoomClick={setZoomedImage} />

                <div className="product-card__body">
                  <div style={{ marginBottom: '8px' }}>
                    <h3 className="product-card__title">{product.name}</h3>
                    {product.subtitle && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--cobalt-blue)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
                        {product.subtitle}
                      </p>
                    )}
                  </div>
                  <p className="product-card__desc">{product.desc || product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div className="product-card__price">{formatINR(product.price)}</div>
                  </div>
                  <button
                    className="btn btn--primary"
                    style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }}
                    onClick={() => addToCart({ ...product, image: product.images[0] })}
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
          </StaggerReveal>
        )}
      </div>

      {/* ── Zoom Modal ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 3000,
              background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '2rem', cursor: 'zoom-out'
            }}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              src={zoomedImage}
              alt="Zoomed Product"
              style={{
                maxWidth: '100%', maxHeight: '100%',
                objectFit: 'contain', borderRadius: '8px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setZoomedImage(null)}
              style={{
                position: 'absolute', top: '2rem', right: '2rem',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                border: 'none', borderRadius: '50%', width: 48, height: 48,
                fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
