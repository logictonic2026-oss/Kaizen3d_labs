import React from 'react'
import { motion } from 'framer-motion'
import { Reveal, StaggerReveal, StaggerItem } from './animations'

const pillars = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12.5 7H17.5L13.5 10.5L15 15.5L10 12.5L5 15.5L6.5 10.5L2.5 7H7.5L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Imagination',
    desc: 'We start with ideas and end with real products.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 10H13M10 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Engineering',
    desc: 'Intelligent design. Practical solutions.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <line x1="10" y1="3" x2="10" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="10" y1="19" x2="10" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="3" y1="10" x2="1" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="19" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Precision',
    desc: 'Quality you can trust. Details that matter.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 14L7 10L10 13L14 7L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Improvement',
    desc: 'Kaizen drives us to keep evolving, every day.',
  },
]

export default function Philosophy() {
  return (
    <section className="philosophy" id="about">
      {/* Glow */}
      <div className="glow-dot glow-dot--blue" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.05 }} />

      <div className="philosophy__inner">
        {/* Left */}
        <div className="philosophy__left">
          <Reveal>
            <span className="tag">Our Philosophy</span>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="philosophy__headline">
              From the First Mark<br />to Real Products
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="philosophy__body">
              Every great product begins with a single line. That first mark sparks the idea.
              We transform that idea into real, functional products through intelligent design,
              engineering and precision manufacturing.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="philosophy__body" style={{ marginTop: 0 }}>
              Our name, Kaizen, means continuous improvement. It's not just our name —
              it's how we work, how we think, and how we deliver.
            </p>
          </Reveal>


        </div>

        {/* Right – Pillars */}
        <StaggerReveal className="philosophy__right">
          {pillars.map((p, i) => (
            <StaggerItem key={p.title}>
              <motion.div
                className="pillar-card"
                id={`pillar-${p.title.toLowerCase()}`}
                whileHover={{ y: -4 }}
              >
                <div className="pillar-card__icon">{p.icon}</div>
                <div className="pillar-card__title">{p.title}</div>
                <div className="pillar-card__desc">{p.desc}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
