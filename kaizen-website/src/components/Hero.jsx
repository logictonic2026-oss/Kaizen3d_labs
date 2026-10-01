import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Reveal } from './animations'

export default function Hero() {
  return (
    <section className="hero" id="home" style={{ display: 'flex', alignItems: 'center', minHeight: '80vh', padding: '6rem 2rem 2rem' }}>
      {/* Glow effects */}
      <div className="glow-dot glow-dot--blue" style={{ top: '10%', right: '5%', opacity: 0.6 }} />
      <div className="glow-dot glow-dot--blue" style={{ bottom: '10%', left: '5%', opacity: 0.3 }} />

      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
        {/* Content */}
        <div className="hero__content" style={{ textAlign: 'left', margin: 0, padding: 0 }}>
          <Reveal delay={0.1}>
            <div className="hero__tag tag" style={{ margin: '0 0 1rem 0' }}>Kaizen 3D Labs</div>
          </Reveal>

          <Reveal delay={0.2}>
            <h1 className="hero__headline" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
              Find something<br />
              <em style={{ color: 'var(--kaizen-blue)', fontStyle: 'normal' }}>worth keeping.</em>
            </h1>
          </Reveal>

          <Reveal delay={0.35}>
            <p className="hero__sub" style={{ fontSize: '1.25rem', color: 'var(--silver-grey)', maxWidth: '400px', marginBottom: '2.5rem' }}>
              Explore products for your space, everyday use and gifting. Carefully crafted through precision manufacturing.
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <div className="hero__actions" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'flex-start' }}>
              <Link
                to="/shop"
                className="btn btn--primary"
              >
                Shop Products
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              <Link
                to="/collections/all"
                style={{ color: 'var(--warm-white)', fontWeight: 600, textDecoration: 'none', borderBottom: '1px solid var(--kaizen-blue)', paddingBottom: '0.25rem' }}
              >
                Explore Collections
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Visual – Product Image */}
        <motion.div
          className="hero__visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          style={{ position: 'relative', width: '100%', aspectRatio: '4/5', borderRadius: '16px', overflow: 'hidden' }}
        >
          <img 
            src="/product-venkateshwara-1.jpg" 
            alt="Lord Venkateshwara Dashboard Idol" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)', pointerEvents: 'none' }}></div>
        </motion.div>
      </div>
    </section>
  )
}

