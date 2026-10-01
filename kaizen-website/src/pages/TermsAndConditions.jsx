import React from 'react'

const META = {
  business: 'Kaizen 3D Labs',
  email: 'orders@kaizen3dlabs.com',
  phone: '+91 79040 01514',
  city: 'Hosur, Tamil Nadu, India',
  website: 'www.kaizen3dlabs.com',
  lastUpdated: 'September 2025',
}

function PageHero({ badge, title, subtitle, note }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(58,111,247,0.08) 0%, transparent 60%)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '3rem 1.5rem',
      textAlign: 'center',
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

function InfoCard({ children }) {
  return (
    <div style={{
      marginTop: '1rem', padding: '1.25rem 1.5rem', borderRadius: 12,
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      fontSize: '0.9rem',
    }}>{children}</div>
  )
}

const CLink = ({ href, children }) => (
  <a href={href} style={{ color: 'var(--cobalt-blue)', textDecoration: 'underline' }}>{children}</a>
)

export default function TermsAndConditions() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--matte-black)' }}>
      <PageHero
        badge="Legal"
        title="Terms & Conditions"
        subtitle="Please read these terms carefully before using our website or placing an order."
        note={`Last updated: ${META.lastUpdated}`}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        <Section title="1. About Us">
          <p>
            <strong style={{ color: 'var(--warm-white)' }}>{META.business}</strong> is a 3D printing and rapid
            prototyping business operating from {META.city}. We sell 3D printed products, custom prints, and
            related services through our website <strong style={{ color: 'var(--warm-white)' }}>{META.website}</strong>.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            By accessing or using our website, placing an order, or engaging with our services, you agree to be
            bound by these Terms &amp; Conditions. If you do not agree, please do not use our website.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <ul>
            <Li>You must be at least 18 years of age to place an order on this website.</Li>
            <Li>By using this website, you represent that you are 18+ and legally capable of entering into a binding
              contract under the Indian Contract Act, 1872.</Li>
            <Li>If placing an order on behalf of a business entity, you confirm you have authority to do so.</Li>
          </ul>
        </Section>

        <Section title="3. Products & Services">
          <ul>
            <Li>We offer standard 3D printed products, custom 3D printing, bulk manufacturing, and prototyping services.</Li>
            <Li>Product images are representative. Minor variations in colour, finish, or texture may occur due to the
              nature of 3D printing.</Li>
            <Li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes unless stated otherwise.</Li>
            <Li>We reserve the right to modify, discontinue, or change prices at any time without prior notice.</Li>
            <Li>We reserve the right to refuse or cancel any order at our discretion (e.g., fraudulent activity,
              stock unavailability, pricing errors).</Li>
          </ul>
        </Section>

        <Section title="4. Orders & Payment">
          <ul>
            <Li>Placing an order constitutes an offer to purchase. Your order is accepted only upon our written
              email confirmation.</Li>
            <Li>We accept payments via Razorpay (UPI, Credit/Debit Cards, Net Banking), direct UPI transfer, and Bank Transfer.</Li>
            <Li>All online payments are processed securely through Razorpay, an RBI-authorised Payment Aggregator.
              We do not store your card or UPI credentials.</Li>
            <Li>For custom and bulk orders, an advance payment may be required before production begins.</Li>
            <Li>In case of a payment failure, please contact us at {META.email} before attempting another transaction.</Li>
          </ul>
        </Section>

        <Section title="5. Custom & Personalised Orders">
          <div style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1rem', color: '#fca5a5',
            fontSize: '0.9rem',
          }}>
            ⚠ <strong>Important:</strong> Custom and personalised 3D printed orders are <strong>non-refundable and
            non-cancellable</strong> once production has commenced. Please review your specifications carefully.
          </div>
          <ul>
            <Li>You are solely responsible for providing correct dimensions, files, and specifications.</Li>
            <Li>We are not liable for errors arising from incorrect specifications provided by the customer.</Li>
            <Li>Custom orders may require additional production time. Timelines are communicated at order confirmation.</Li>
          </ul>
        </Section>

        <Section title="6. Shipping & Delivery">
          <ul>
            <Li>We ship Pan India. Estimated delivery timelines are provided at checkout and in your confirmation email.</Li>
            <Li>Delivery timelines are estimates and not guaranteed. We are not liable for delays caused by courier
              partners, natural events, or other circumstances beyond our control.</Li>
            <Li>Risk of loss or damage passes to you upon delivery. We recommend inspecting your package upon receipt.</Li>
            <Li>See our <CLink href="/shipping">Shipping Policy</CLink> for complete details.</Li>
          </ul>
        </Section>

        <Section title="7. Returns, Refunds & Cancellations">
          <p>Please read our <CLink href="/refund">Refund &amp; Cancellation Policy</CLink> carefully before placing an order.</p>
          <ul style={{ marginTop: '0.75rem' }}>
            <Li>Returns are accepted only for damaged or defective items reported within 7 days of delivery.</Li>
            <Li>Custom and personalised orders are non-refundable once production has begun.</Li>
            <Li>Refunds (where applicable) are processed within 5–7 business days to the original payment method.</Li>
          </ul>
        </Section>

        <Section title="8. Intellectual Property">
          <ul>
            <Li>All website content — text, images, product designs, logos, and brand identity — belongs to {META.business}
              and is protected under applicable Indian intellectual property laws.</Li>
            <Li>You may not reproduce or distribute our content without express written permission.</Li>
            <Li>For custom orders, you confirm that files/designs you provide are owned by you or you hold the legal
              right to use them. We are not responsible for IP infringements from customer-provided files.</Li>
          </ul>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable Indian law, {META.business} shall not be liable for any
            indirect, incidental, special, or consequential damages arising from your use of our website or products.
            Our total liability shall not exceed the amount paid by you for the specific order in question.
          </p>
        </Section>

        <Section title="10. Governing Law & Dispute Resolution">
          <ul>
            <Li>These Terms are governed by and construed in accordance with the laws of India.</Li>
            <Li>Disputes shall be subject to the exclusive jurisdiction of courts in{' '}
              <strong style={{ color: 'var(--warm-white)' }}>Krishnagiri District, Tamil Nadu, India</strong>.</Li>
            <Li>We encourage customers to first contact us at {META.email} to resolve disputes amicably.</Li>
          </ul>
        </Section>

        <Section title="11. Changes to Terms">
          <p>
            We reserve the right to update these Terms at any time. Changes are effective immediately upon posting
            with an updated date. Continued use of the website after changes constitutes acceptance of the revised terms.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <InfoCard>
            <p><strong style={{ color: 'var(--warm-white)' }}>{META.business}</strong></p>
            <p style={{ marginTop: '0.5rem' }}>📧 <CLink href={`mailto:${META.email}`}>{META.email}</CLink></p>
            <p style={{ marginTop: '0.3rem' }}>📞 <CLink href={`tel:${META.phone}`}>{META.phone}</CLink></p>
            <p style={{ marginTop: '0.3rem' }}>📍 {META.city}</p>
          </InfoCard>
        </Section>

      </div>
    </div>
  )
}
