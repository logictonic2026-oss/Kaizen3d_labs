import React from 'react'

const META = {
  business: 'Kaizen 3D Labs',
  email: 'orders@kaizen3dlabs.com',
  phone: '+91 79040 01514',
  city: 'Hosur, Tamil Nadu, India',
  lastUpdated: 'September 2025',
}

function PageHero({ badge, title, subtitle, note }) {
  return (
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
      }}>{badge}</span>
      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 800, color: 'var(--warm-white)', marginBottom: '0.75rem' }}>
        {title}
      </h1>
      <p style={{ color: 'var(--silver-grey)', fontSize: '0.9rem', maxWidth: 520, margin: '0 auto' }}>{subtitle}</p>
      {note && <p style={{ color: 'var(--steel-grey)', fontSize: '0.8rem', marginTop: '0.875rem' }}>{note}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{
        fontSize: '1.05rem', fontWeight: 700, color: 'var(--warm-white)',
        marginBottom: '0.875rem', paddingBottom: '0.625rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>{title}</h2>
      <div style={{ color: 'var(--silver-grey)', lineHeight: 1.85, fontSize: '0.925rem' }}>
        {children}
      </div>
    </div>
  )
}

function Li({ children }) {
  return (
    <li style={{ marginBottom: '0.5rem', paddingLeft: '1.25rem', position: 'relative' }}>
      <span style={{ position: 'absolute', left: 0, color: 'var(--cobalt-blue)', fontWeight: 700 }}>•</span>
      {children}
    </li>
  )
}

const CLink = ({ href, children }) => (
  <a href={href} style={{ color: 'var(--cobalt-blue)', textDecoration: 'underline' }}>{children}</a>
)

export default function RefundPolicy() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--matte-black)' }}>
      <PageHero
        badge="Legal"
        title="Refund & Cancellation Policy"
        subtitle="Our policy is designed to be fair to both customers and our business. Please read carefully before placing an order."
        note={`Last updated: ${META.lastUpdated}`}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        {/* Quick Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { icon: '✅', label: 'Refunds', desc: 'Damaged / defective items — 7 days from delivery', color: '#86efac', bg: 'rgba(34,197,94,0.05)', border: 'rgba(34,197,94,0.15)' },
            { icon: '❌', label: 'No Refund', desc: 'Custom & personalised prints once production starts', color: '#fca5a5', bg: 'rgba(239,68,68,0.05)', border: 'rgba(239,68,68,0.15)' },
            { icon: '⏱', label: 'Processing Time', desc: '5–7 business days to original payment method', color: '#93c5fd', bg: 'rgba(59,130,246,0.05)', border: 'rgba(59,130,246,0.15)' },
          ].map(c => (
            <div key={c.label} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: c.color, fontSize: '0.85rem', marginBottom: '0.3rem' }}>{c.label}</div>
              <div style={{ color: 'var(--silver-grey)', fontSize: '0.8rem', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        <Section title="1. Cancellations">
          <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>
            <strong>Custom / Personalised Orders:</strong> Once production has commenced, custom 3D printed orders
            <strong> cannot be cancelled or refunded</strong> under any circumstances.
          </div>
          <p><strong style={{ color: 'var(--warm-white)' }}>Standard (Shop) Orders:</strong></p>
          <ul style={{ marginTop: '0.75rem' }}>
            <Li>You may cancel within <strong style={{ color: 'var(--warm-white)' }}>24 hours of placing</strong> the order, provided it has not been dispatched.</Li>
            <Li>To cancel, email <CLink href={`mailto:${META.email}`}>{META.email}</CLink> with your order number and reason.</Li>
            <Li>If already dispatched, it cannot be cancelled — you may initiate a return after delivery.</Li>
          </ul>
        </Section>

        <Section title="2. Returns & Refunds — Eligibility">
          <p>We accept returns and provide refunds <strong style={{ color: 'var(--warm-white)' }}>only in the following cases:</strong></p>
          <ul style={{ marginTop: '0.75rem' }}>
            <Li>Item received is <strong style={{ color: 'var(--warm-white)' }}>damaged in transit</strong> (broken, crushed, or cracked).</Li>
            <Li>Item is <strong style={{ color: 'var(--warm-white)' }}>defective</strong> (wrong item, missing parts).</Li>
            <Li>Item is <strong style={{ color: 'var(--warm-white)' }}>significantly different</strong> from what was ordered.</Li>
          </ul>
          <div style={{ background: 'rgba(255,193,7,0.05)', border: '1px solid rgba(255,193,7,0.2)', borderRadius: 10, padding: '1rem 1.25rem', marginTop: '1rem', color: '#fde68a', fontSize: '0.9rem' }}>
            <strong>Not Eligible:</strong> Colour variations, minor texture differences (inherent to 3D printing), customer specification errors in custom orders, or change of mind after dispatch.
          </div>
        </Section>

        <Section title="3. How to Initiate a Return">
          <ol style={{ marginTop: '0.875rem' }}>
            {[
              { step: '01', title: 'Report within 7 days', desc: `Email ${META.email} within 7 days of delivery with your order number, a description of the issue, and clear photographs.` },
              { step: '02', title: 'We Review', desc: 'Our team will review your request within 2–3 business days and confirm if the return is approved.' },
              { step: '03', title: 'Return Shipment', desc: 'Return shipping is covered by us for verified defective/damaged items.' },
              { step: '04', title: 'Refund Processed', desc: 'Once we receive and inspect the returned item, refund is processed within 5–7 business days to your original payment method.' },
            ].map(s => (
              <li key={s.step} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'flex-start' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', flexShrink: 0, background: 'rgba(58,111,247,0.12)', border: '1px solid rgba(58,111,247,0.3)', color: 'var(--cobalt-blue)', fontWeight: 800, fontSize: '0.8rem' }}>{s.step}</span>
                <div>
                  <p style={{ color: 'var(--warm-white)', fontWeight: 700, marginBottom: '0.3rem' }}>{s.title}</p>
                  <p>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="4. Refund Timelines">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: '0.75rem' }}>
              <thead>
                <tr style={{ background: 'rgba(58,111,247,0.08)' }}>
                  {['Payment Method', 'Refund Timeline'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--warm-white)', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Razorpay (UPI / Cards / Net Banking)', '5–7 business days'],
                  ['Direct UPI Transfer', '3–5 business days'],
                  ['Bank Transfer (NEFT/IMPS)', '5–7 business days'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--warm-white)' }}>{r[0]}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '0.875rem', fontSize: '0.83rem', color: 'var(--steel-grey)' }}>Timelines are from the date we confirm your refund. Bank processing times may vary.</p>
        </Section>

        <Section title="5. Contact for Returns & Refunds">
          <div style={{ marginTop: '1rem', padding: '1.25rem 1.5rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.9rem' }}>
            <p><strong style={{ color: 'var(--warm-white)' }}>{META.business} — Customer Support</strong></p>
            <p style={{ marginTop: '0.5rem' }}>📧 <CLink href={`mailto:${META.email}`}>{META.email}</CLink></p>
            <p style={{ marginTop: '0.3rem' }}>📞 <CLink href={`tel:${META.phone}`}>{META.phone}</CLink></p>
            <p style={{ marginTop: '0.3rem' }}>📍 {META.city}</p>
            <p style={{ marginTop: '0.75rem', color: 'var(--steel-grey)', fontSize: '0.825rem' }}>Response time: Within 48 business hours.</p>
          </div>
        </Section>

      </div>
    </div>
  )
}
