import React from 'react'
import { motion } from 'framer-motion'

const items = [
  'Precision Manufacturing',
  '3D Printing',
  'CNC Machining',
  'Rapid Prototyping',
  'Product Design',
  'Reverse Engineering',
  'End-Use Parts',
  'Engineering Excellence',
]

export default function Marquee() {
  const doubled = [...items, ...items]

  return (
    <div className="marquee-section" aria-hidden="true">
      <motion.div
        className="marquee-track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="marquee-item">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="3" fill="currentColor"/>
            </svg>
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
