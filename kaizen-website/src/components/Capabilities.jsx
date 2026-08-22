import React from 'react'
import { motion } from 'framer-motion'
import { Reveal, StaggerReveal, StaggerItem } from './animations'

const capabilities = [
  {
    number: '01',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M16 4V28M4 10L28 22M28 10L4 22" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      </svg>
    ),
    title: 'FDM 3D Printing',
    desc: 'High-quality, fast FDM printing for functional parts, prototypes, and complex models.',
    tags: ['PLA', 'ABS', 'PETG', 'TPU', 'ASA'],
  },
  {
    number: '02',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 8V16L21 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Rapid Prototyping',
    desc: 'Test faster and iterate your designs with physical models delivered in 24–48 hours.',
    tags: ['24h Turnaround', 'Design Review', 'Iteration'],
  },
  {
    number: '03',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4C16 4 10 9 6 14C2 19 8 26 16 28C24 26 30 19 26 14C22 9 16 4 16 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M12 16L16 20L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Custom Creations',
    desc: 'Personalized gifts, home decor, cosplay props, and unique hobby projects brought to life.',
    tags: ['Cosplay', 'Figurines', 'Home Decor', 'Gifts'],
  },
  {
    number: '04',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 26L14 18L19 23L26 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="18" r="2.5" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
    title: 'Product Design',
    desc: 'Need help with a 3D model? We can design parts perfectly optimized for 3D printing.',
    tags: ['CAD', 'Fusion360', 'DFM', 'Prototyping'],
  },
  {
    number: '05',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M8 24L16 8L24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11 19H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Replacement Parts',
    desc: "Don't throw it away! We can design and print replacement parts for appliances and toys.",
    tags: ['Repair', 'Eco-friendly', 'Functional Parts'],
  },
  {
    number: '06',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="12" width="24" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 12V9C10 6.8 11.8 5 14 5H18C20.2 5 22 6.8 22 9V12" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="16" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Low-Volume Batch Production',
    desc: 'Small production runs (10-50 units) for startups and creators without expensive tooling costs.',
    tags: ['Small Batch', 'Startups', 'Creators'],
  },
]

export default function Capabilities() {
  return (
    <section className="capabilities" id="services">
      <div className="capabilities__inner">
        <div className="section-header">
          <div>
            <Reveal>
              <span className="tag">Core Capabilities</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="section-title">
                Everything You Need to Build Better Products
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <a href="#quote" className="btn btn--ghost" id="capabilities-cta">
              Get Started
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </Reveal>
        </div>

        <StaggerReveal className="capabilities__grid">
          {capabilities.map((cap) => (
            <StaggerItem key={cap.number}>
              <motion.div
                className="cap-card"
                id={`cap-${cap.number}`}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="cap-card__number">{cap.number}</div>
                <div className="cap-card__icon">{cap.icon}</div>
                <h3 className="cap-card__title">{cap.title}</h3>
                <p className="cap-card__desc">{cap.desc}</p>
                <div className="cap-card__tags">
                  {cap.tags.map((tag) => (
                    <span key={tag} className="cap-tag">{tag}</span>
                  ))}
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
