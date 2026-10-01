import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    supabase.from('products').select('*').limit(4).then(({ data }) => {
      if (data) setProducts(data);
    });
  }, []);

  return (
    <section style={{ padding: '4rem 2rem', backgroundColor: 'var(--surface-dark)' }}>
      <div className="container">
        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Featured Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
          {products.map(p => (
            <Link to={`/products/${p.slug}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
              <div style={{ aspectRatio: '4/5', backgroundColor: 'var(--surface-grey)', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                {p.images && p.images[0] && (
                   <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{p.name}</h3>
              <p style={{ color: 'var(--silver-grey)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{p.subtitle}</p>
              <p style={{ fontWeight: 600, color: 'var(--kaizen-blue)', marginTop: 'auto' }}>₹{p.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
