import React from 'react'
import { motion } from 'framer-motion'
import { Reveal, StaggerReveal, StaggerItem } from './animations'

const industries = [
  { icon: '🚗', name: 'Automotive', desc: 'Jigs, fixtures, functional prototypes and custom parts for automotive R&D.', active: true },
  { icon: '🏗️', name: 'Architecture', desc: 'Scale models, facades, and complex geometric forms for design firms.', active: true },
  { icon: '🌱', name: 'Sustainability', desc: 'Eco-material printing and design for disassembly principles.', active: true },
  { icon: '🎨', name: 'Creative', desc: 'Art installations, sculptures, and custom props for creative studios.', active: true },
  { icon: '🚀', name: 'Aerospace', desc: 'Lightweight, high-strength components for UAVs and aerospace research.', active: false },
  { icon: '🏥', name: 'Medical', desc: 'Surgical guides, orthotics, prosthetics, and custom implant housings.', active: false },
  { icon: '🤖', name: 'Robotics', desc: 'Enclosures, brackets, and precision mechanical assemblies.', active: false },
  { icon: '🎮', name: 'Consumer Tech', desc: 'Enclosures, wearables, and consumer product housings at any volume.', active: false },
]

export default function Industries() {
  return (
    <section className="industries" id="industries">
      <div className="industries__inner">
        <div className="section-header">
          <div>
            <Reveal>
              <span className="tag">Our Focus Industries</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="section-title">
                Where We Apply 3D Printing
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <p style={{ color: 'var(--silver-grey)', fontSize: 'var(--text-base)', maxWidth: 380 }}>
              We have proven experience delivering for key sectors, while actively engineering solutions for new markets.
            </p>
          </Reveal>
        </div>

        <StaggerReveal className="industries__grid">
          {industries.map((ind) => (
            <StaggerItem key={ind.name}>
              <motion.div
                className="industry-card"
                id={`industry-${ind.name.toLowerCase().replace(/\s+/g, '-')}`}
                whileHover={ind.active ? { y: -4, borderColor: 'rgba(58,111,247,0.3)' } : {}}
                transition={{ type: 'spring', stiffness: 300 }}
                style={{
                  opacity: ind.active ? 1 : 0.4,
                  filter: ind.active ? 'none' : 'grayscale(100%)',
                  cursor: ind.active ? 'pointer' : 'default',
                  position: 'relative'
                }}
              >
                {!ind.active && (
                  <div style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--silver-grey)',
                    background: 'var(--graphite)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    Targeting
                  </div>
                )}
                <div className="industry-card__icon" style={{ opacity: ind.active ? 1 : 0.6 }}>{ind.icon}</div>
                <div className="industry-card__name">{ind.name}</div>
                <div className="industry-card__desc">{ind.desc}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
