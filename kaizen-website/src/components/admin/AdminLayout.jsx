import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { path: '/admin',          label: 'Dashboard',  icon: '▦' },
  { path: '/admin/products', label: 'Products',   icon: '◈' },
  { path: '/admin/orders',   label: 'Orders',     icon: '◎' },
]

const SIDEBAR_W = 240

const S = {
  shell: {
    display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0',
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  sidebar: (open, isMobile) => ({
    width: SIDEBAR_W, background: '#111118', borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0,
    height: '100vh', zIndex: 200, transition: 'transform 0.3s ease',
    transform: isMobile && !open ? `translateX(-${SIDEBAR_W}px)` : 'translateX(0)',
  }),
  overlay: (open) => ({
    display: open ? 'block' : 'none',
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    zIndex: 150, backdropFilter: 'blur(2px)',
  }),
  logo: {
    padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex', alignItems: 'center', gap: '0.75rem',
  },
  logoIcon: {
    width: 32, height: 32, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1rem', fontWeight: 800, color: '#fff', flexShrink: 0,
  },
  logoText: { fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.2 },
  logoSub:  { fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' },
  nav: { flex: 1, padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4 },
  navLink: (active) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.625rem 0.875rem', borderRadius: 10, textDecoration: 'none',
    fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s ease',
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    color: active ? '#818cf8' : '#94a3b8',
    border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
  }),
  navIcon: { fontSize: '1.1rem', width: 20, textAlign: 'center' },
  bottom: { padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' },
  signOutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.625rem 0.875rem', borderRadius: 10, background: 'transparent',
    color: '#64748b', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
    border: '1px solid transparent', transition: 'all 0.15s ease',
  },
  main: (isMobile) => ({
    marginLeft: isMobile ? 0 : SIDEBAR_W,
    flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh',
    transition: 'margin-left 0.3s ease',
  }),
  topbar: {
    height: 64, padding: '0 1.5rem', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: '#0a0a0f', position: 'sticky', top: 0, zIndex: 50,
  },
  content: { flex: 1, padding: '2rem' },
  hamburger: {
    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5,
    background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem',
    borderRadius: 8,
  },
  bar: {
    width: 22, height: 2, background: '#94a3b8', borderRadius: 2,
    transition: 'all 0.2s',
  },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function AdminLayout({ children, title }) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  // Close sidebar on route change (mobile)
  useEffect(() => { if (isMobile) setSidebarOpen(false) }, [location.pathname])

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div style={S.shell}>
      {/* ── Mobile overlay ── */}
      <div style={S.overlay(isMobile && sidebarOpen)} onClick={() => setSidebarOpen(false)} />

      {/* ── Sidebar ── */}
      <aside style={S.sidebar(sidebarOpen, isMobile)}>
        <div style={S.logo}>
          <div style={S.logoIcon}>K</div>
          <div>
            <div style={S.logoText}>Kaizen 3D Labs</div>
            <div style={S.logoSub}>Admin Panel</div>
          </div>
        </div>

        <nav style={S.nav}>
          <div style={{ fontSize: '0.65rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 0.875rem', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
            Management
          </div>
          {NAV.map(item => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                style={S.navLink(active)}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e8f0' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' } }}
              >
                <span style={S.navIcon}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}

          <div style={{ fontSize: '0.65rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0 0.875rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
            Website
          </div>
          <Link
            to="/"
            target="_blank"
            style={S.navLink(false)}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#e2e8f0' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
          >
            <span style={S.navIcon}>↗</span>
            View Live Site
          </Link>
        </nav>

        <div style={S.bottom}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', padding: '0 0.875rem', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={S.signOutBtn}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
          >
            <span style={{ fontSize: '1rem' }}>⎋</span>
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={S.main(isMobile)}>
        {/* Topbar */}
        <header style={S.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                style={S.hamburger}
                onClick={() => setSidebarOpen(v => !v)}
                aria-label="Toggle menu"
              >
                <span style={{ ...S.bar, transform: sidebarOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
                <span style={{ ...S.bar, opacity: sidebarOpen ? 0 : 1 }} />
                <span style={{ ...S.bar, transform: sidebarOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
              </button>
            )}
            <h1 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>
              {title}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: '#fff',
            }}>
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={S.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
