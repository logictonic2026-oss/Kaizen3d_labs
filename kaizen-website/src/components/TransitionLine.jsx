import React from 'react'
import { motion } from 'framer-motion'

export default function TransitionLine() {
  return (
    <div 
      className="transition-line"
      style={{
        width: '100%',
        height: '240px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '40px',
        gap: '16px',
        position: 'relative',
        zIndex: 10
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 0.5, y: 0 }}
        viewport={{ once: false, amount: 0.8 }}
        transition={{ duration: 0.6 }}
        style={{
          fontSize: '10px',
          letterSpacing: '0.3em',
          color: 'var(--silver-grey)',
          textTransform: 'uppercase'
        }}
      >
        The First Mark
      </motion.div>
      
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: false, amount: 0.8 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{
          width: '2px',
          height: '160px',
          background: 'linear-gradient(to bottom, var(--cobalt-blue), transparent)',
          boxShadow: '0 0 12px rgba(58,111,247,0.5)',
          transformOrigin: 'top'
        }}
      />
    </div>
  )
}

