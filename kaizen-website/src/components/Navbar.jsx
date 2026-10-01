import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { cartCount, setIsCartOpen, setIsTrackOrderOpen } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/shop' },
    { name: 'Custom & Bulk', path: '/custom-bulk' },
    { name: 'Design Services', path: '/design-enquiry', highlight: true },
    { name: 'About', path: '/about' },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setMenuOpen(false)
    }
  }

  return (
    <motion.nav
      className={`navbar${scrolled ? ' scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" id="nav-logo" onClick={() => setMenuOpen(false)}>
          <img
            src="/kaizen-logo-transparent.png"
            alt="Kaizen 3D Labs"
            style={{ 
              height: '40px', 
              width: '40px', 
              objectFit: 'cover',
              objectPosition: 'top',
              display: 'block' 
            }}
          />
          <span className="navbar__logo-text">
            KAIZEN <span>3D LABS</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="navbar__nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="navbar__link"
              id={`nav-link-${link.name.toLowerCase().replace(/ & | /g, '-')}`}
              style={link.highlight ? {
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 1rem', borderRadius: 8,
                background: 'rgba(58,111,247,0.1)',
                border: '1px solid rgba(58,111,247,0.35)',
                color: '#3A6FF7', fontSize: '0.82rem', fontWeight: 700,
                letterSpacing: '0.04em', whiteSpace: 'nowrap',
              } : {}}
              onMouseEnter={e => {
                if (link.highlight) {
                  e.currentTarget.style.background = 'rgba(58,111,247,0.2)';
                  e.currentTarget.style.color = '#60a5fa';
                }
              }}
              onMouseLeave={e => {
                if (link.highlight) {
                  e.currentTarget.style.background = 'rgba(58,111,247,0.1)';
                  e.currentTarget.style.color = '#3A6FF7';
                }
              }}
            >
              {link.highlight && <span>✦ </span>}
              {link.name}
            </Link>
          ))}
        </nav>

        {/* CTA and Cart — desktop */}
        <div className="navbar__actions-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-grey)', borderRadius: '20px', padding: '0.25rem 0.75rem' }}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--warm-white)', outline: 'none', fontSize: '0.85rem', width: '120px' }}
            />
            <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--silver-grey)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          <button 
            onClick={() => { navigate('/track-order'); setMenuOpen(false); }}
            style={{ background: 'none', border: 'none', color: 'var(--silver-grey)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--warm-white)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--silver-grey)'}
          >
            Track Order
          </button>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="navbar__cart-btn"
            aria-label="Open cart"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && (
              <span className="navbar__cart-badge">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="navbar__mobile-controls">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="navbar__cart-btn"
            aria-label="Open cart"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && (
              <span className="navbar__cart-badge">
                {cartCount}
              </span>
            )}
          </button>

          <button
            className={`navbar__menu-btn${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            id="nav-menu-toggle"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="navbar__mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-grey)', borderRadius: '20px', padding: '0.5rem 1rem', margin: '0 2rem 2rem' }}>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--warm-white)', outline: 'none', fontSize: '1rem', flex: 1 }}
              />
            </form>
            <div className="navbar__mobile-links">
              {navLinks.map((link, i) => (
                <motion.div key={link.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }}>
                  <Link
                    to={link.path}
                    className="navbar__mobile-link"
                    id={`nav-mobile-link-${link.name.toLowerCase().replace(/ & | /g, '-')}`}
                    onClick={() => setMenuOpen(false)}
                    style={link.highlight ? { color: '#3A6FF7', fontWeight: 700 } : {}}
                  >
                    {link.highlight && <span>✦ </span>}
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: navLinks.length * 0.06, duration: 0.3 }}>
                <Link
                  to="/track-order"
                  className="navbar__mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Track Order
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

