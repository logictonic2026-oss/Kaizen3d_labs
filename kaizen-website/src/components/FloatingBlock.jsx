import React from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function FloatingBlock() {
  const { scrollYProgress } = useScroll()

  // Map scroll progress (0 to 1) to screen positions
  // x: horizontal position offset from center
  const x = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['30vw', '-30vw', '25vw', '-25vw', '0vw']
  )

  // y: vertical position offset from center
  const y = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ['-30vh', '-10vh', '10vh', '30vh', '10vh']
  )

  // rotate: spins as it falls
  const rotate = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 720]
  )

  // scale: pulses in size
  const scale = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [1, 1.5, 0.8, 1.8, 1]
  )

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        x,
        y,
        rotate,
        scale,
        // Center the transform origin
        marginLeft: '-40px',
        marginTop: '-40px',
        width: '80px',
        height: '80px',
        zIndex: 50, // High enough to be over most things, but under nav (999)
        pointerEvents: 'none', // Don't block clicks
      }}
    >
      <IsometricCube />
    </motion.div>
  )
}

function IsometricCube() {
  return (
    <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="drop-shadow(0px 8px 16px rgba(58,111,247,0.3))">
        {/* Top Face */}
        <path d="M60 20L95 40L60 60L25 40L60 20Z" fill="rgba(247,246,242,0.15)" stroke="#3A6FF7" strokeWidth="2" strokeLinejoin="round"/>
        {/* Left Face */}
        <path d="M25 40V80L60 100V60L25 40Z" fill="rgba(58,111,247,0.1)" stroke="#3A6FF7" strokeWidth="2" strokeLinejoin="round"/>
        {/* Right Face */}
        <path d="M95 40V80L60 100V60L95 40Z" fill="rgba(58,111,247,0.2)" stroke="#3A6FF7" strokeWidth="2" strokeLinejoin="round"/>
        
        {/* Inner grid lines for a "3D printed infill" look */}
        <path d="M42.5 30L77.5 50" stroke="rgba(58,111,247,0.5)" strokeWidth="1"/>
        <path d="M42.5 50L77.5 30" stroke="rgba(58,111,247,0.5)" strokeWidth="1"/>
        <path d="M42.5 60V90" stroke="rgba(58,111,247,0.5)" strokeWidth="1"/>
        <path d="M77.5 60V90" stroke="rgba(58,111,247,0.5)" strokeWidth="1"/>
      </g>
    </svg>
  )
}
