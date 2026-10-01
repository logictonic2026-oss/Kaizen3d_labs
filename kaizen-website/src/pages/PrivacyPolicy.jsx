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

function DataTable({ rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: 'rgba(58,111,247,0.08)' }}>
            {['Data Collected', 'Purpose', 'Retention'].map(h => (
              <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--warm-white)', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
              <td style={{ padding: '0.75rem 1rem', color: 'var(--warm-white)' }}>{r[0]}</td>
              <td style={{ padding: '0.75rem 1rem' }}>{r[1]}</td>
              <td style={{ padding: '0.75rem 1rem' }}>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function PrivacyPolicy() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--matte-black)' }}>
      <PageHero
        badge="Legal"
        title="Privacy Policy"
        subtitle="We respect your privacy. This policy explains how we collect, use, and protect your personal information."
        note={`Last updated: ${META.lastUpdated}`}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        <Section title="1. Who We Are">
          <p>
            <strong style={{ color: 'var(--warm-white)' }}>{META.business}</strong> ("we", "us", "our") is a 3D printing
            and rapid prototyping business based in {META.city}. We operate the website{' '}
            <strong style={{ color: 'var(--warm-white)' }}>{META.website}</strong>.
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            This Privacy Policy applies to all personal information collected through our website, during order processing,
            and through any customer communications. By using our website, you consent to the practices described here.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We collect the following types of personal information:</p>
          <DataTable rows={[
            ['Full name, email, phone number', 'Order processing, communication', 'Duration of account + 3 years'],
            ['Delivery address, pincode, state', 'Shipping and delivery', 'Duration of account + 3 years'],
            ['GST number, company name', 'Tax invoicing (if provided)', 'As required by law (7 years)'],
            ['Order details & payment status', 'Order fulfilment and records', '7 years (GST compliance)'],
            ['IP address, browser/device data', 'Security and analytics', '90 days'],
            ['Cookies and session data', 'Website functionality', 'Session / 30 days'],
          ]} />
          <p style={{ marginTop: '1rem' }}>
            We do <strong style={{ color: 'var(--warm-white)' }}>not</strong> collect or store credit card numbers, CVVs,
            or debit card details. All payment data is handled by Razorpay, an RBI-authorised Payment Aggregator,
            on their secure, PCI-DSS compliant servers.
          </p>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <Li>To process and fulfil your orders and communicate order status.</Li>
            <Li>To send order confirmation, shipping updates, and delivery notifications via email/SMS.</Li>
            <Li>To generate GST-compliant tax invoices where applicable.</Li>
            <Li>To respond to customer support queries and grievances.</Li>
            <Li>To improve our website, products, and services based on usage analytics.</Li>
            <Li>To comply with applicable Indian laws and regulatory requirements.</Li>
            <Li>To send promotional emails or offers — only if you have opted in. You may opt out at any time.</Li>
          </ul>
        </Section>

        <Section title="4. Data Sharing & Third Parties">
          <p>We do <strong style={{ color: 'var(--warm-white)' }}>not sell</strong> your personal data. We share it only with trusted partners required to fulfil your order:</p>
          <ul style={{ marginTop: '0.75rem' }}>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Razorpay</strong> — Payment processing. They receive your name, email, phone, and order amount. Razorpay's privacy policy applies to data processed by them.</Li>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Courier/Shipping Partners</strong> — Your name, address, phone number, and order details are shared for delivery.</Li>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Supabase</strong> — Our backend database provider, used to store order and customer data securely.</Li>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Government Authorities</strong> — We may disclose information if required by law, court order, or government regulation.</Li>
          </ul>
        </Section>

        <Section title="5. Cookies">
          <p>Our website uses cookies to provide a better experience. These include:</p>
          <ul style={{ marginTop: '0.75rem' }}>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Essential Cookies:</strong> Required for the website to function (e.g., cart data, session management).</Li>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Analytics Cookies:</strong> Help us understand how visitors use our site (page views, navigation patterns).</Li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            You can disable cookies in your browser settings, but this may affect website functionality
            (e.g., your cart may not be saved).
          </p>
        </Section>

        <Section title="6. Data Security">
          <ul>
            <Li>We implement reasonable technical and organisational security measures to protect your data from unauthorised access, loss, or misuse.</Li>
            <Li>All data is transmitted over HTTPS (encrypted connection).</Li>
            <Li>Our database (Supabase) uses row-level security and access controls.</Li>
            <Li>Despite our best efforts, no internet transmission is 100% secure. If you suspect a security breach, please contact us immediately at {META.email}.</Li>
          </ul>
        </Section>

        <Section title="7. Data Localisation">
          <p>
            In compliance with applicable Indian regulations, customer data related to Indian users is processed
            and stored on servers that comply with applicable data localisation requirements. Our database provider
            (Supabase) stores data in secure cloud infrastructure.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>As a user, you have the following rights regarding your personal data:</p>
          <ul style={{ marginTop: '0.75rem' }}>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Access:</strong> Request a copy of the personal data we hold about you.</Li>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Correction:</strong> Request correction of inaccurate or incomplete data.</Li>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Deletion:</strong> Request deletion of your data (subject to legal retention obligations).</Li>
            <Li><strong style={{ color: 'var(--warm-white)' }}>Opt-out:</strong> Opt out of marketing emails at any time by contacting us or using the unsubscribe link.</Li>
          </ul>
          <p style={{ marginTop: '0.875rem' }}>
            To exercise any of these rights, email us at{' '}
            <CLink href={`mailto:${META.email}`}>{META.email}</CLink> with the subject "Privacy Request".
            We will respond within 30 days.
          </p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>
            Our website and services are not directed at children under the age of 18. We do not knowingly collect
            personal information from minors. If you believe we have inadvertently collected such data, please contact
            us immediately and we will delete it.
          </p>
        </Section>

        <Section title="10. Links to External Websites">
          <p>
            Our website may contain links to third-party websites (e.g., payment gateways, social media). We are
            not responsible for the privacy practices of those websites and encourage you to review their privacy
            policies independently.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy periodically. When we do, we will update the "Last Updated" date at
            the top of this page. We encourage you to review this policy regularly. Continued use of our website
            after changes constitutes your acceptance of the revised policy.
          </p>
        </Section>

        <Section title="12. Grievance Officer & Contact">
          <p>
            As required under the Consumer Protection (E-Commerce) Rules 2020 and IT Act 2000, you may contact
            our Grievance Officer for any privacy-related concerns:
          </p>
          <div style={{
            marginTop: '1rem', padding: '1.25rem 1.5rem', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '0.9rem',
          }}>
            <p><strong style={{ color: 'var(--warm-white)' }}>Grievance Officer</strong></p>
            <p style={{ marginTop: '0.4rem', color: 'var(--silver-grey)' }}>{META.business}</p>
            <p style={{ marginTop: '0.4rem' }}>📧 <CLink href={`mailto:${META.email}`}>{META.email}</CLink></p>
            <p style={{ marginTop: '0.3rem' }}>📞 <CLink href={`tel:${META.phone}`}>{META.phone}</CLink></p>
            <p style={{ marginTop: '0.3rem' }}>📍 {META.city}</p>
            <p style={{ marginTop: '0.75rem', color: 'var(--steel-grey)', fontSize: '0.825rem' }}>
              We will acknowledge your grievance within <strong style={{ color: 'var(--silver-grey)' }}>48 hours</strong> and
              resolve it within <strong style={{ color: 'var(--silver-grey)' }}>30 days</strong> of receipt.
            </p>
          </div>
        </Section>

      </div>
    </div>
  )
}
