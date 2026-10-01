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

export default function ShippingPolicy() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--matte-black)' }}>
      <PageHero
        badge="Legal"
        title="Shipping & Delivery Policy"
        subtitle="Everything you need to know about how we ship your 3D printed orders across India."
        note={`Last updated: ${META.lastUpdated}`}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        {/* At a glance cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { icon: '🚚', label: 'Standard Shipping', val: 'FREE', sub: '4–6 business days (outside Tamil Nadu)' },
            { icon: '⚡', label: 'Priority Shipping', val: '+₹100', sub: '2–3 business days (outside Tamil Nadu)' },
            { icon: '🏠', label: 'Tamil Nadu', val: 'Faster', sub: 'Standard: 2–3 days | Priority: 1–2 days' },
            { icon: '🏭', label: 'Ships From', val: 'Hosur', sub: 'Tamil Nadu, India' },
          ].map(c => (
            <div key={c.label} style={{
              background: 'rgba(58,111,247,0.05)', border: '1px solid rgba(58,111,247,0.15)',
              borderRadius: 14, padding: '1.25rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{c.icon}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--silver-grey)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
              <div style={{ fontWeight: 800, color: 'var(--cobalt-blue)', fontSize: '1.1rem', marginBottom: '0.3rem' }}>{c.val}</div>
              <div style={{ color: 'var(--steel-grey)', fontSize: '0.78rem', lineHeight: 1.5 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        <Section title="1. Shipping Areas">
          <ul>
            <Li>We ship to all states and union territories across <strong style={{ color: 'var(--warm-white)' }}>India</strong>.</Li>
            <Li>We currently do <strong style={{ color: 'var(--warm-white)' }}>not</strong> offer international shipping. For international enquiries, contact us at <CLink href={`mailto:${META.email}`}>{META.email}</CLink>.</Li>
            <Li>Deliveries to remote pincodes (North-East states, Ladakh, Andaman &amp; Nicobar, Lakshadweep) may take additional 2–5 days.</Li>
          </ul>
        </Section>

        <Section title="2. Dispatch Timeline">
          <ul>
            <Li>All orders are dispatched from <strong style={{ color: 'var(--warm-white)' }}>Hosur, Tamil Nadu</strong>.</Li>
            <Li>Standard shop orders are typically printed and dispatched within <strong style={{ color: 'var(--warm-white)' }}>3–7 business days</strong> of order confirmation.</Li>
            <Li>Custom orders may require additional production time. Estimated dispatch date is communicated at order confirmation.</Li>
            <Li>Orders placed on public holidays or weekends are processed the next working business day.</Li>
          </ul>
        </Section>

        <Section title="3. Delivery Timelines">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', marginTop: '0.75rem' }}>
              <thead>
                <tr style={{ background: 'rgba(58,111,247,0.08)' }}>
                  {['Region', 'Standard Shipping (Free)', 'Priority Shipping (+₹100)'].map(h => (
                    <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--warm-white)', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Tamil Nadu', '2–3 business days', '1–2 business days'],
                  ['South India (AP, KA, KL, TG)', '3–4 business days', '2–3 business days'],
                  ['Rest of India', '4–6 business days', '2–3 business days'],
                  ['Remote / North-East', '6–10 business days', '4–6 business days'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--warm-white)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{r[1]}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#93c5fd' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ marginTop: '0.875rem', fontSize: '0.83rem', color: 'var(--steel-grey)' }}>
            Timelines are counted from dispatch date. Business days exclude Sundays and public holidays.
          </p>
        </Section>

        <Section title="4. Shipping Charges">
          <ul>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Standard Shipping:</strong> FREE on all orders across India.</Li>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Priority Shipping:</strong> ₹100 flat fee, selected at checkout.</Li>
            <Li>Shipping charges are displayed at checkout before order confirmation.</Li>
          </ul>
        </Section>

        <Section title="5. Order Tracking">
          <ul>
            <Li>Once dispatched, you will receive a shipping confirmation email with your tracking number and courier details.</Li>
            <Li>You can track your order on our <CLink href="/track-order">Track Order</CLink> page.</Li>
            <Li>If you have not received tracking details within 7 business days of order confirmation, please contact us.</Li>
          </ul>
        </Section>

        <Section title="6. Damaged or Lost Packages">
          <ul>
            <Li>If your package arrives damaged, take photographs immediately and email us at <CLink href={`mailto:${META.email}`}>{META.email}</CLink> within <strong style={{ color: 'var(--warm-white)' }}>48 hours</strong> of delivery.</Li>
            <Li>If your package appears lost (no delivery update for 10+ days after dispatch), contact us and we will investigate with the courier.</Li>
            <Li>We will reship or refund orders confirmed as lost or damaged in transit.</Li>
            <Li>We are not responsible for delivery failures due to incorrect address information provided at checkout.</Li>
          </ul>
        </Section>

        <Section title="7. Contact for Shipping Queries">
          <div style={{ marginTop: '1rem', padding: '1.25rem 1.5rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.9rem' }}>
            <p><strong style={{ color: 'var(--warm-white)' }}>{META.business}</strong></p>
            <p style={{ marginTop: '0.5rem' }}>📧 <CLink href={`mailto:${META.email}`}>{META.email}</CLink></p>
            <p style={{ marginTop: '0.3rem' }}>📞 <CLink href={`tel:${META.phone}`}>{META.phone}</CLink></p>
            <p style={{ marginTop: '0.3rem' }}>📍 {META.city}</p>
          </div>
        </Section>

      </div>
    </div>
  )
}
