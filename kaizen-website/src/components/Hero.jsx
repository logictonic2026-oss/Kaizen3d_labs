import React from 'react'
import { motion, useAnimationFrame } from 'framer-motion'
import { Reveal, StaggerReveal, StaggerItem, fadeUp } from './animations'


// Rotating orbit ring
function OrbitRing({ size, delay, dotOffset = 0, showDot = false }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1px solid rgba(247,246,242,0.06)',
        left: '50%',
        top: '50%',
        x: '-50%',
        y: '-50%',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20 + delay * 5, repeat: Infinity, ease: 'linear', delay }}
    >
      {showDot && (
        <div style={{
          position: 'absolute',
          top: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#3A6FF7',
          boxShadow: '0 0 16px #3A6FF7',
        }} />
      )}
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section className="hero" id="home">
      {/* Glow effects */}
      <div className="glow-dot glow-dot--blue" style={{ top: '10%', right: '5%', opacity: 0.6 }} />
      <div className="glow-dot glow-dot--blue" style={{ bottom: '10%', left: '5%', opacity: 0.3 }} />

      {/* Content */}
      <div className="hero__content">
        <Reveal delay={0.1}>
          <div className="hero__tag tag">The First Mark</div>
        </Reveal>

        <Reveal delay={0.2}>
          <h1 className="hero__headline">
            If It Can Be<br />
            <em>Imagined,</em><br />
            It Can Be<br />
            Printed.
          </h1>
        </Reveal>

        <Reveal delay={0.35}>
          <p className="hero__sub">
            We transform ideas into real, functional products through 
            intelligent design, engineering and precision manufacturing.
          </p>
        </Reveal>

        <Reveal delay={0.45}>
          <div className="hero__actions">
            <motion.a
              href="#quote"
              className="btn btn--primary"
              id="hero-cta-quote"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Request Engineering Review
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.a>


          </div>
        </Reveal>


      </div>

      {/* Visual – Solar System */}
      <motion.div
        className="hero__visual"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      >
        {/* Center Logo – renders first so rings can go on top */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          zIndex: 1,
        }}>
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Clean transparent PNG — no hacks needed */}
            <img
              src="/kaizen-logo-transparent.png"
              alt="Kaizen 3D Labs Logo"
              className="hero__center-logo"
              style={{
                display: 'block',
                filter: 'drop-shadow(0 0 28px rgba(58,111,247,0.5))',
              }}
            />
          </motion.div>
        </div>

        {/* Orbit rings – rendered AFTER logo so they sit visually on top */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
          <OrbitRing size="90%" delay={0} showDot />
          <OrbitRing size="70%" delay={2} showDot />
          <OrbitRing size="50%" delay={4} />

          {/* Inner glow ring */}
          <div style={{
            position: 'absolute',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            border: '1px solid rgba(58,111,247,0.25)',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: 'inset 0 0 40px rgba(58,111,247,0.07)',
          }} />
        </div>

        {/* Orbiting tag pills – 6 items placed clockwise, above rings */}
        {[
          { label: '🤖 AI Powered',          cls: 'hero__floating-tag--1', delay: 1.0, init: { opacity: 0, y: -20 } },
          { label: '⚙️ Process Oriented',    cls: 'hero__floating-tag--2', delay: 1.2, init: { opacity: 0, x: 20 } },
          { label: '🎯 Precision Design',     cls: 'hero__floating-tag--3', delay: 1.4, init: { opacity: 0, y: 20 } },
          { label: '🔩 FDM Ready',            cls: 'hero__floating-tag--4', delay: 1.6, init: { opacity: 0, x: -20 } },
          { label: '⚡ Rapid Iteration',      cls: 'hero__floating-tag--5', delay: 1.8, init: { opacity: 0, y: -20 } },
          { label: '♻️ Zero Waste Design',   cls: 'hero__floating-tag--6', delay: 2.0, init: { opacity: 0, x: 20 } },
        ].map((tag) => (
          <motion.div
            key={tag.label}
            className={`hero__floating-tag ${tag.cls}`}
            style={{ zIndex: 3 }}
            initial={tag.init}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: tag.delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="dot" />
            {tag.label}
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
