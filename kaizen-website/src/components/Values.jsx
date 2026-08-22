import React from 'react'
import { motion } from 'framer-motion'
import { Reveal, StaggerReveal, StaggerItem } from './animations'

const values = [
  {
    number: '01',
    title: 'Innovation',
    desc: "We embrace new technologies and approaches, constantly pushing the boundaries of what's possible in manufacturing.",
  },
  {
    number: '02',
    title: 'Integrity',
    desc: 'Transparent communication, honest timelines, and consistent delivery — no overpromising, ever.',
  },
  {
    number: '03',
    title: 'Quality',
    desc: 'Every part that leaves our facility meets rigorous quality standards. Details matter at every scale.',
  },
  {
    number: '04',
    title: 'Collaboration',
    desc: 'We partner closely with clients through every stage. Your success is our benchmark.',
  },
]

export default function Values() {
  return (
    <section className="values" id="values">
      <div className="values__inner">
        <div className="section-header">
          <div>
            <Reveal>
              <span className="tag">Why Kaizen</span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="section-title">
                Built on Values That Drive Results
              </h2>
            </Reveal>
          </div>
        </div>

        <StaggerReveal className="values__grid">
          {values.map((v) => (
            <StaggerItem key={v.number}>
              <motion.div
                className="value-card"
                id={`value-${v.number}`}
                whileHover={{ borderTopColor: 'var(--cobalt-blue)' }}
              >
                <div className="value-card__number">{v.number}</div>
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  )
}
