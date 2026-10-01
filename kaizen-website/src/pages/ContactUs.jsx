import React, { useState } from 'react'

const META = {
  business: 'Kaizen 3D Labs',
  email: 'orders@kaizen3dlabs.com',
  phone: '+91 79040 01514',
  whatsapp: '917904001514',
  instagram: 'https://instagram.com/kaizen3dlabs',
  // ⚠ TODO: Replace with your full registered physical address before Razorpay onboarding
  address: '[Your Registered Address Here],\nHosur, Tamil Nadu – [Pincode],\nIndia',
  // ⚠ TODO: Replace with grievance officer name
  grievanceOfficer: '[Grievance Officer Name]',
  grievanceTitle: 'Owner / Manager',
}

const CLink = ({ href, children, style }) => (
  <a href={href} style={{ color: 'var(--cobalt-blue)', textDecoration: 'none', ...style }}>{children}</a>
)

function ContactCard({ icon, label, value, href, copyable }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, padding: '1.25rem 1.5rem',
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, flexShrink: 0,
        background: 'rgba(58,111,247,0.1)', border: '1px solid rgba(58,111,247,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
      }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--steel-grey)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>{label}</div>
        {href ? (
          <CLink href={href} style={{ color: 'var(--warm-white)', fontWeight: 600, fontSize: '0.95rem' }}>{value}</CLink>
        ) : (
          <div style={{ color: 'var(--warm-white)', fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{value}</div>
        )}
        {copyable && (
          <button
            onClick={handleCopy}
            style={{
              marginTop: '0.4rem', fontSize: '0.75rem', color: copied ? '#86efac' : 'var(--cobalt-blue)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit',
            }}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ContactUs() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--matte-black)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(58,111,247,0.08) 0%, transparent 60%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '3rem 1.5rem', textAlign: 'center',
      }}>
        <span style={{
          display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.12em', color: 'var(--cobalt-blue)',
          background: 'rgba(58,111,247,0.1)', border: '1px solid rgba(58,111,247,0.25)',
          borderRadius: 20, padding: '0.3rem 0.875rem', marginBottom: '1rem', textTransform: 'uppercase',
        }}>Contact</span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--warm-white)', marginBottom: '0.75rem' }}>
          Get in Touch
        </h1>
        <p style={{ color: 'var(--silver-grey)', fontSize: '0.9rem', maxWidth: 520, margin: '0 auto' }}>
          We're here to help with your 3D printing needs, order queries, or any grievances.
          Reach out through any of the channels below.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        {/* Response time banner */}
        <div style={{
          background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)',
          borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '2.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          fontSize: '0.9rem', color: '#86efac',
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <span><strong>We typically respond within 24–48 business hours.</strong> For urgent order issues, WhatsApp is fastest.</span>
        </div>

        {/* Contact Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          <ContactCard
            icon="📧"
            label="Email (Orders & Support)"
            value={META.email}
            href={`mailto:${META.email}`}
            copyable
          />
          <ContactCard
            icon="📞"
            label="Phone"
            value={META.phone}
            href={`tel:${META.phone}`}
            copyable
          />
          <ContactCard
            icon="💬"
            label="WhatsApp"
            value="Chat with us on WhatsApp"
            href={`https://wa.me/${META.whatsapp}?text=Hi%20Kaizen%203D%20Labs%2C%20I%20have%20a%20query%20about`}
          />
          <ContactCard
            icon="📍"
            label="Registered Business Address"
            value={META.address}
          />
          <ContactCard
            icon="📸"
            label="Instagram"
            value="@kaizen3dlabs"
            href={META.instagram}
          />
          <ContactCard
            icon="🕐"
            label="Business Hours"
            value={`Monday – Saturday\n9:00 AM – 6:00 PM IST`}
          />
        </div>

        {/* Grievance Officer — Mandatory under Consumer Protection (E-Commerce) Rules 2020 */}
        <div style={{
          background: 'rgba(58,111,247,0.05)', border: '1px solid rgba(58,111,247,0.2)',
          borderRadius: 16, padding: '2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(58,111,247,0.15)', border: '1px solid rgba(58,111,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
            }}>⚖️</div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--warm-white)', margin: 0 }}>
                Grievance Officer
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--steel-grey)', margin: 0, marginTop: '0.2rem' }}>
                As required under Consumer Protection (E-Commerce) Rules, 2020
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ color: 'var(--steel-grey)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Name</div>
              <div style={{ color: 'var(--warm-white)', fontWeight: 600 }}>{META.grievanceOfficer}</div>
            </div>
            <div>
              <div style={{ color: 'var(--steel-grey)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Designation</div>
              <div style={{ color: 'var(--warm-white)', fontWeight: 600 }}>{META.grievanceTitle}</div>
            </div>
            <div>
              <div style={{ color: 'var(--steel-grey)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Email</div>
              <CLink href={`mailto:${META.email}`} style={{ fontWeight: 600 }}>{META.email}</CLink>
            </div>
            <div>
              <div style={{ color: 'var(--steel-grey)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Organisation</div>
              <div style={{ color: 'var(--warm-white)', fontWeight: 600 }}>{META.business}</div>
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem', padding: '1rem 1.25rem', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.85rem', color: 'var(--silver-grey)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--warm-white)' }}>Grievance Resolution Process:</strong>
            <ul style={{ marginTop: '0.5rem' }}>
              <li style={{ marginBottom: '0.4rem', paddingLeft: '1.2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--cobalt-blue)' }}>•</span>
                Email your grievance to <CLink href={`mailto:${META.email}`}>{META.email}</CLink> with subject: <strong style={{ color: 'var(--warm-white)' }}>"Grievance – [Your Order ID]"</strong>
              </li>
              <li style={{ marginBottom: '0.4rem', paddingLeft: '1.2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--cobalt-blue)' }}>•</span>
                We will <strong style={{ color: 'var(--warm-white)' }}>acknowledge within 48 hours</strong> of receipt.
              </li>
              <li style={{ paddingLeft: '1.2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--cobalt-blue)' }}>•</span>
                We aim to <strong style={{ color: 'var(--warm-white)' }}>resolve within 30 days</strong> of acknowledgement.
              </li>
            </ul>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ marginTop: '3rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--warm-white)', marginBottom: '1rem' }}>Quick References</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {[
              { label: 'Track Your Order', href: '/track-order' },
              { label: 'Refund & Cancellation Policy', href: '/refund' },
              { label: 'Shipping Policy', href: '/shipping' },
              { label: 'Terms & Conditions', href: '/terms' },
              { label: 'Privacy Policy', href: '/privacy' },
            ].map(l => (
              <a key={l.label} href={l.href} style={{
                padding: '0.5rem 1rem', borderRadius: 8,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
                color: 'var(--silver-grey)', fontSize: '0.85rem', textDecoration: 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(58,111,247,0.4)'; e.currentTarget.style.color = 'var(--warm-white)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'var(--silver-grey)' }}
              >
                {l.label} →
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
