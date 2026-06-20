import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Heart,
  Stethoscope, Pill, FlaskConical, ShieldCheck, Bot, AlertTriangle,
  Globe, Send, AtSign, Share2, ChevronRight
} from 'lucide-react';

export const Footer: React.FC = () => {

  const services = [
    { icon: <Stethoscope className="h-4 w-4" />, label: 'Find Doctors', href: '/doctors' },
    { icon: <Pill className="h-4 w-4" />, label: 'Pharmacy', href: '/pharmacy' },
    { icon: <FlaskConical className="h-4 w-4" />, label: 'Lab Tests', href: '/lab-tests' },
    { icon: <ShieldCheck className="h-4 w-4" />, label: 'Insurance', href: '/insurance' },
    { icon: <Bot className="h-4 w-4" />, label: 'AI Assistant', href: '/ai-assistant' },
    { icon: <AlertTriangle className="h-4 w-4" />, label: 'Emergency', href: '/emergency' },
  ];

  const company = [
    { label: 'About Us', href: '/about' },
    { label: 'Health Blogs', href: '/blogs' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Careers', href: '/careers' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
  ];

  const socials = [
    { icon: <Globe className="h-4 w-4" />, href: '#', label: 'Website' },
    { icon: <Send className="h-4 w-4" />, href: '#', label: 'Telegram' },
    { icon: <AtSign className="h-4 w-4" />, href: '#', label: 'Social' },
    { icon: <Share2 className="h-4 w-4" />, href: '#', label: 'Share' },
  ];

  return (
    <footer style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>


      {/* ── MAIN GRID ── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <img 
                src="/medcare-logo.png" 
                alt="MedCare+" 
                style={{ 
                  height: '36px', 
                  width: 'auto',
                  display: 'block'
                }} 
              />
            </Link>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.75, color: '#64748b', maxWidth: '20rem' }}>
              India's most trusted digital healthcare ecosystem — connecting patients with verified doctors, reliable pharmacies, and premium diagnostics.
            </p>

            {/* Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                { icon: <Phone className="h-3.5 w-3.5" />, text: '+91 1800-MED-CARE' },
                { icon: <Mail className="h-3.5 w-3.5" />, text: 'support@medcareplus.in' },
                { icon: <MapPin className="h-3.5 w-3.5" />, text: 'Bengaluru, Karnataka, India' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b' }}>
                  <span style={{ color: '#2563EB' }}>{c.icon}</span>
                  {c.text}
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '2rem', width: '2rem', borderRadius: '0.5rem',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#2563EB',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#2563EB';
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                    (e.currentTarget as HTMLElement).style.borderColor = '#2563EB';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#EFF6FF';
                    (e.currentTarget as HTMLElement).style.color = '#2563EB';
                    (e.currentTarget as HTMLElement).style.borderColor = '#BFDBFE';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Services column */}
          <div>
            <h4 style={{ color: '#0F172A', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Services
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {services.map((s) => (
                <li key={s.href}>
                  <Link
                    to={s.href}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#2563EB';
                      (e.currentTarget.querySelector('span') as HTMLElement).style.color = '#2563EB';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = '#64748b';
                      (e.currentTarget.querySelector('span') as HTMLElement).style.color = '#94a3b8';
                    }}
                  >
                    <span style={{ color: '#94a3b8', transition: 'color 0.2s' }}>{s.icon}</span>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 style={{ color: '#0F172A', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Company
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {company.map((r) => (
                <li key={r.href}>
                  <Link
                    to={r.href}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#2563EB'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#64748b'}
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency column */}
          <div>
            <h4 style={{ color: '#0F172A', fontWeight: 700, fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
              Emergency
            </h4>
            <div style={{
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)',
              border: '1px solid #FECACA',
              borderRadius: '0.875rem',
              padding: '1rem 1.25rem',
              marginBottom: '1rem',
            }}>
              <p style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.35rem' }}>🚨 24/7 Emergency</p>
              <p style={{ color: '#B91C1C', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.02em' }}>112 / 108</p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.35rem' }}>Ambulance · Fire · Police</p>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Nearby Hospitals', href: '/emergency#hospitals' },
                { label: 'Blood Inventory', href: '/emergency#blood-banks' },
                { label: 'Crisis Support', href: '/emergency#contacts' },
              ].map((r) => (
                <li key={r.href}>
                  <Link
                    to={r.href}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#DC2626'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#64748b'}
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{ borderTop: '1px solid #E2E8F0', background: '#fff' }}>
        <div
          className="max-w-7xl mx-auto px-6 py-5"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}
        >
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            © {new Date().getFullYear()} MedCare+ Platform. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {['Privacy', 'Terms', 'Cookies'].map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <span style={{ color: '#E2E8F0' }}>·</span>}
                <Link
                  to={`/${label.toLowerCase()}`}
                  style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#2563EB'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#94a3b8'}
                >
                  {label}
                </Link>
              </React.Fragment>
            ))}
          </div>
          <p style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            Made with <Heart style={{ height: '0.75rem', width: '0.75rem', color: '#ef4444', fill: '#ef4444' }} /> in India
          </p>
        </div>
      </div>

    </footer>
  );
};
