import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Reveal } from './animations'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <>
      {/* Final CTA */}
      <section className="footer-cta" id="contact">
        <div className="footer-cta__inner">
          <Reveal>
            <span className="tag">Let's Build Together</span>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="footer-cta__headline">
              Your Idea Deserves to<br />
              <span className="text-cobalt">Become Real.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="footer-cta__sub">
              From a single prototype to large-scale production —<br />
              Kaizen 3D Labs is your trusted manufacturing partner.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="footer-cta__actions">
              <motion.a
                href="/design-enquiry"
                className="btn btn--primary"
                id="footer-cta-primary"
                whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(58,111,247,0.4)' }}
                whileTap={{ scale: 0.98 }}
              >
                Start Your Project
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.a>
            </div>
          </Reveal>

          {/* Contact Info Strip */}
          <Reveal delay={0.4}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-12)',
              flexWrap: 'wrap',
              padding: 'var(--space-8) 0',
              borderTop: 'var(--border-subtle)',
              borderBottom: 'var(--border-subtle)',
            }}>
              {/* Phone (Copy to clipboard) */}
              <button 
                onClick={() => copyToClipboard('+917904001514')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--silver-grey)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                title="Copy phone number"
              >
                <span>📞</span>
                <span>{copied ? 'Copied!' : '+91 79040 01514'}</span>
              </button>
              
              {/* Email (Mailto) */}
              <a 
                href="mailto:orders@kaizen3dlabs.com"
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--silver-grey)', textDecoration: 'none' }}
              >
                <span>📧</span>
                <span>orders@kaizen3dlabs.com</span>
              </a>

              {/* Website */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--silver-grey)' }}>
                <span>🌐</span>
                <span>www.kaizen3dlabs.com</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="footer">
        <div className="footer__inner">
          {/* Brand */}
          <div>
            <div className="footer__brand-name">KAIZEN 3D LABS</div>
            <div className="footer__brand-tagline">If it can be imagined, it can be printed.</div>
            <p className="footer__brand-desc">
              We bring people and ideas together to design and create anything that can be imagined.
              Trusted by startups, engineers, and enterprises.
            </p>
          </div>

          {/* Services */}
          <div>
            <div className="footer__col-title">Services</div>
            <ul className="footer__links">
              {['3D Printing', 'Rapid Prototyping', 'Product Design', 'Manufacturing'].map(s => (
                <li key={s}><a href="#services" className="footer__link" id={`footer-link-${s.toLowerCase().replace(/\s+/g, '-')}`}>{s}</a></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="footer__col-title">Company</div>
            <ul className="footer__links">
              {[
                { label: 'About', href: '/about' },
                { label: 'Shop', href: '/shop' },
                { label: 'Track Order', href: '/track-order' },
                { label: 'Contact', href: '/contact' },
              ].map(p => (
                <li key={p.label}>
                  <Link to={p.href} className="footer__link" id={`footer-link-${p.label.toLowerCase().replace(/\s+/g, '-')}`}>{p.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <div className="footer__col-title">Legal</div>
            <ul className="footer__links">
              {[
                { label: 'Terms & Conditions', href: '/terms' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Refund Policy', href: '/refund' },
                { label: 'Shipping Policy', href: '/shipping' },
              ].map(p => (
                <li key={p.label}>
                  <Link to={p.href} className="footer__link" id={`footer-link-${p.label.toLowerCase().replace(/[\s&]+/g, '-')}`}>{p.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <div className="footer__col-title">Connect</div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <a href="https://instagram.com/kaizen3dlabs" target="_blank" rel="noreferrer" className="footer__link" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="footer__link" aria-label="LinkedIn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href={`https://wa.me/917904001514`} target="_blank" rel="noreferrer" className="footer__link" aria-label="WhatsApp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <span className="footer__copyright">© 2025 Kaizen 3D Labs. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/terms" className="footer__link" style={{ fontSize: 'var(--text-xs)' }}>Terms</Link>
            <Link to="/privacy" className="footer__link" style={{ fontSize: 'var(--text-xs)' }}>Privacy</Link>
            <Link to="/refund" className="footer__link" style={{ fontSize: 'var(--text-xs)' }}>Refunds</Link>
            <Link to="/shipping" className="footer__link" style={{ fontSize: 'var(--text-xs)' }}>Shipping</Link>
            <Link to="/contact" className="footer__link" style={{ fontSize: 'var(--text-xs)' }}>Contact</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
