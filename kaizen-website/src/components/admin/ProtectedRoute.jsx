import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0a0f',
        flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366f1', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Verifying access…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}
