import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Reveal, StaggerReveal, StaggerItem } from './animations'

const steps = [
  {
    num: '01',
    label: 'Idea',
    desc: 'Share your concept, brief, or problem statement.',
    icon: '💡',
    active: false,
  },
  {
    num: '02',
    label: 'Design',
    desc: 'Our engineers create or refine your 3D model.',
    icon: '✏️',
    active: false,
  },
  {
    num: '03',
    label: 'Engineer',
    desc: 'DFM analysis & material selection.',
    icon: '⚙️',
    active: true,
  },
  {
    num: '04',
    label: 'Prototype',
    desc: 'First physical part in your hands within 48h.',
    icon: '🧱',
    active: false,
  },
  {
    num: '05',
    label: 'Manufacture',
    desc: 'Scale to volume with consistent quality.',
    icon: '🏭',
    active: false,
  },
  {
    num: '06',
    label: 'Deliver',
    desc: 'Fast, secure shipping with full documentation.',
    icon: '🚀',
    active: false,
  },
]

export default function Workflow() {
  const [activeStep, setActiveStep] = useState(2)

  return (
    <section className="workflow" id="process">
      <div className="workflow__inner">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          <Reveal>
            <span className="tag">Our Process</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="section-title" style={{ maxWidth: '100%', textAlign: 'center', margin: 'var(--space-4) auto 0' }}>
              From Idea to Product in 6 Steps
            </h2>
          </Reveal>
        </div>

        <StaggerReveal className="workflow__steps">
          {steps.map((step, i) => (
            <StaggerItem key={step.num}>
              <motion.div
                className={`step${i === activeStep ? ' active' : ''}`}
                id={`step-${step.num}`}
                onClick={() => setActiveStep(i)}
                style={{ cursor: 'pointer' }}
                whileHover={{ y: -4 }}
              >
                <motion.div
                  className="step__circle"
                  animate={{
                    background: i === activeStep ? 'var(--cobalt-blue)' : 'var(--graphite)',
                    borderColor: i === activeStep ? 'var(--cobalt-blue)' : 'rgba(107, 115, 124, 0.3)',
                    color: i === activeStep ? '#fff' : 'var(--silver-grey)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step.num}
                </motion.div>
                <div className="step__label">{step.label}</div>
                <div className="step__desc">{step.desc}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerReveal>

        {/* Active step detail panel */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 'var(--space-12)',
            background: 'var(--graphite)',
            border: 'var(--border-subtle)',
            borderLeft: '3px solid var(--cobalt-blue)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-6)',
          }}
          id="workflow-detail-panel"
        >
          <span style={{ fontSize: '2.5rem' }}>{steps[activeStep].icon}</span>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--cobalt-blue)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              Step {steps[activeStep].num}
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
              {steps[activeStep].label}
            </h3>
            <p style={{ color: 'var(--silver-grey)', fontSize: 'var(--text-base)' }}>
              {steps[activeStep].desc}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
