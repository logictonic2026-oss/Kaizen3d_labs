import React from 'react';

export default function BuyingConfidence() {
  const features = [
    { icon: '🚚', title: 'Fast Dispatch', desc: 'Ships within 48 hours for in-stock items.' },
    { icon: '🛡️', title: 'Secure Packaging', desc: 'Ensuring your delicate products arrive safely.' },
    { icon: '💬', title: 'Customer Support', desc: 'We are here to help with your orders.' }
  ];

  return (
    <section style={{ padding: '4rem 2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
          {features.map(f => (
            <div key={f.title} style={{ padding: '2rem', backgroundColor: 'var(--surface-grey)', borderRadius: '12px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--silver-grey)', fontSize: '0.9rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
