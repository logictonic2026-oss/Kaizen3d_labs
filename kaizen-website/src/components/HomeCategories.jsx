import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Reveal, StaggerReveal, StaggerItem } from './animations'

const CATEGORIES = [
  {
    title: 'Car Dashboard Idol',
    slug: 'car-dashboard-idol',
    icon: '🚗',
    desc: 'A sacred companion for every journey',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
    border: 'rgba(59,130,246,0.3)',
  },
  {
    title: 'Divine Idols',
    slug: 'divine-idols',
    icon: '🪔',
    desc: 'For your home temple & sacred spaces',
    gradient: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
    border: 'rgba(217,119,6,0.3)',
  },
  {
    title: 'Gifting Elements',
    slug: 'gifting-elements',
    icon: '🎁',
    desc: 'Unique 3D-printed gifts for every occasion',
    gradient: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    border: 'rgba(5,150,105,0.3)',
  },
  {
    title: 'Custom Products',
    slug: 'custom-products',
    icon: '⚙️',
    desc: 'Your idea, printed to perfection',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)',
    border: 'rgba(124,58,237,0.3)',
  },
]

export default function HomeCategories() {
  return (
    <section style={{ padding: '5rem 1.5rem', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Reveal>
          <span className="tag">Shop by Category</span>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, marginTop: '0.5rem', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Four Collections, One Craft
          </h2>
        </Reveal>
        <Reveal delay={0.14}>
          <p style={{ color: 'var(--silver-grey)', fontSize: 'var(--text-base)', maxWidth: 480, marginBottom: '2.5rem' }}>
            Explore our curated product lines — each category crafted with precision and purpose.
          </p>
        </Reveal>

        <StaggerReveal style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {CATEGORIES.map((cat) => (
            <StaggerItem key={cat.slug}>
              <Link
                to={`/collections/${cat.slug}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    background: cat.gradient,
                    border: `1px solid ${cat.border}`,
                    borderRadius: '20px',
                    padding: '2rem 1.5rem',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    transition: 'box-shadow 0.3s',
                  }}
                >
                  {/* Decorative glow */}
                  <div style={{
                    position: 'absolute', top: '-20px', right: '-20px',
                    width: '120px', height: '120px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                    filter: 'blur(20px)',
                    pointerEvents: 'none',
                  }} />

                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', lineHeight: 1 }}>
                    {cat.icon}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
                      {cat.title}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', lineHeight: 1.4 }}>
                      {cat.desc}
                    </p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      fontSize: 'var(--text-xs)', fontWeight: 700,
                      color: 'rgba(255,255,255,0.9)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      Explore →
                    </span>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
