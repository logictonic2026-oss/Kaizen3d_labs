import React, { useEffect, useState } from 'react'

export default function CursorEffects() {
  const [drops, setDrops] = useState([])

  useEffect(() => {
    const handleMouseDown = (e) => {
      // Create a new drop of filament at the click position
      const newDrop = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      }
      setDrops((prev) => [...prev, newDrop])

      // Remove the drop after the animation finishes (1.5s)
      setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== newDrop.id))
      }, 1500)
    }

    // Listen for all clicks (left, middle, right)
    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99999 }}>
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="filament-drop"
          style={{
            left: drop.x,
            top: drop.y,
          }}
        />
      ))}
    </div>
  )
}
