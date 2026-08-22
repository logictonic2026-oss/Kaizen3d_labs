import React from 'react'
import { motion } from 'framer-motion'
import { Reveal, StaggerReveal, StaggerItem } from './animations'

const cases = [
  {
    badge: 'Aerospace',
    emoji: '🛸',
    title: 'UAV Structural Frame',
    problem: 'Standard aluminium frames were too heavy and slow to iterate.',
    solution: 'Redesigned for carbon-filled nylon SLS printing, reducing part count by 60%.',
    result: '42% weight reduction',
    metric: '–42%',
  },
  {
    badge: 'Medical',
    emoji: '🦴',
    title: 'Custom Surgical Guide',
    problem: 'Generic surgical guides causing alignment issues in orthopaedic procedures.',
    solution: 'Patient-specific guides from CT scan data, printed in biocompatible resin.',
    result: 'Procedure time reduced',
    metric: '–35min',
  },
  {
    badge: 'Consumer',
    emoji: '🎧',
    title: 'Smart Wearable Housing',
    problem: 'Startup needed 200 functional prototype units in under 3 weeks.',
    solution: 'Multi-material FDM printing with in-house post-processing and assembly.',
    result: 'Delivered in 14 days',
    metric: '14 days',
  },
]

export default function CaseStudies() {
  return (
    <section className="case-studies" id="work">
      <div className="case-studies__inner">
        <div className="section-header">
          <div>
            <Reveal>
              <span className="tag">Case Studies</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="section-title">
                Real Problems. Real Solutions.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <a href="#quote" className="btn btn--ghost" id="case-studies-cta">
              Work With Us
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </Reveal>
        </div>

        <StaggerReveal className="case-studies__grid">
          {cases.map((c) => (
            <StaggerItem key={c.title}>
              <motion.div
                className="case-card"
                id={`case-${c.title.toLowerCase().replace(/\s+/g, '-')}`}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="case-card__image">
                  <div className="case-card__image-placeholder">
                    <span style={{ fontSize: '4rem' }}>{c.emoji}</span>
                  </div>
                  <div className="case-card__overlay" />
                  <div className="case-card__badge">{c.badge}</div>
                </div>

                <div className="case-card__body">
                  <h3 className="case-card__title">{c.title}</h3>

                  <div className="case-card__problem">
                    <span className="case-card__label case-card__label--problem">Problem</span>
                    <p className="case-card__text">{c.problem}</p>
                  </div>

                  <div className="case-card__problem">
                    <span className="case-card__label" style={{ color: 'var(--silver-grey)' }}>Solution</span>
                    <p className="case-card__text">{c.solution}</p>
                  </div>

                  <div className="case-card__metric">{c.metric}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--cobalt-blue)', marginTop: 4 }}>
                    {c.result}
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
