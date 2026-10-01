import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const MAX_ATTEMPTS = 5
const LOCKOUT_MS   = 15 * 60 * 1000 // 15 minutes

export default function AdminLogin() {
  const { signIn, user } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [attempts, setAttempts] = useState(() => Number(localStorage.getItem('_adm_att') || 0))
  const [lockUntil,setLockUntil]= useState(() => Number(localStorage.getItem('_adm_lock') || 0))
  const [showPass, setShowPass] = useState(false)

  // If already logged in → go to dashboard
  useEffect(() => { if (user) navigate('/admin', { replace: true }) }, [user])

  const isLocked  = Date.now() < lockUntil
  const remaining = Math.ceil((lockUntil - Date.now()) / 60000)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLocked) return
    setError('')
    setLoading(true)

    try {
      await signIn(email.trim(), password)
      // Clear lockout on success
      localStorage.removeItem('_adm_att')
      localStorage.removeItem('_adm_lock')
      navigate('/admin', { replace: true })
    } catch (err) {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem('_adm_att', newAttempts)

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_MS
        setLockUntil(until)
        localStorage.setItem('_adm_lock', until)
        setError(`Too many failed attempts. Try again in ${LOCKOUT_MS / 60000} minutes.`)
      } else {
        setError(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? 's' : ''} remaining.`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 400, position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: 56, height: 56, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '0 auto 1rem',
            boxShadow: '0 0 40px rgba(99,102,241,0.3)',
          }}>K</div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
            Kaizen Admin
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Sign in to manage your store
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          {isLocked ? (
            <div style={{
              textAlign: 'center', padding: '1.5rem',
              background: 'rgba(239,68,68,0.08)', borderRadius: 12,
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔒</div>
              <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '0.25rem' }}>
                Account Locked
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                Too many failed attempts. Please wait {remaining} minute{remaining !== 1 ? 's' : ''} before trying again.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@kaizen3dlabs.com"
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
                    transition: 'border-color 0.2s', boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    style={{
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 1rem', borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
                      transition: 'border-color 0.2s', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem',
                    }}
                  >{showPass ? '🙈' : '👁'}</button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: 10,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444', fontSize: '0.8rem', lineHeight: 1.5,
                }}>
                  ⚠ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                style={{
                  width: '100%', padding: '0.875rem', borderRadius: 12, border: 'none',
                  background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.3)', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#334155', marginTop: '1.5rem' }}>
          This page is for authorized administrators only.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
