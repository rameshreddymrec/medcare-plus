import React, { useState } from 'react';
import medicalHeroBanner from '../assets/medical_hero_banner.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope, Search, MapPin, Star, ArrowRight, ChevronDown,
  Clock, Users, Award, HeartPulse
} from 'lucide-react';
import Services from '../components/Services';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [specialty, setSpecialty] = useState('General Medicine');
  const [location, setLocation] = useState('');
  const [medQuery, setMedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'doctor' | 'medicine'>('doctor');
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  const handleDoctorSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/doctors?specialty=${encodeURIComponent(specialty)}&location=${encodeURIComponent(location)}`);
  };

  const handleMedicineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/pharmacy?search=${encodeURIComponent(medQuery)}`);
  };

  const specialties = [
    { value: 'General Medicine', label: 'General Medicine' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Orthopedics', label: 'Orthopedics' },
  ];

  const stats = [
    { icon: <Users className="h-5 w-5" />, value: '2M+', label: 'Patients Served' },
    { icon: <Stethoscope className="h-5 w-5" />, value: '15,000+', label: 'Verified Doctors' },
    { icon: <Award className="h-5 w-5" />, value: '4.9★', label: 'Average Rating' },
    { icon: <Clock className="h-5 w-5" />, value: '24/7', label: 'Available Support' },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Patient',
      quote: 'Got my diagnosis and prescription within 15 minutes via video call. Absolutely seamless experience.',
      rating: 5,
    },
    {
      name: 'Dr. Robert Carter',
      role: 'Cardiologist',
      quote: 'MedCare+ has simplified my clinical workflow significantly. The patient management tools are excellent.',
      rating: 5,
    },
    {
      name: 'David Henderson',
      role: 'Pharmacy User',
      quote: 'Uploaded my prescription and medicines arrived the next morning. Super reliable and fast.',
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: 'How does the AI Health Assistant work?',
      a: 'Our AI Assistant acts as an interactive symptom checker and wellness planner. It analyzes your symptoms to provide educational healthcare information. It is for informational use only and is not a replacement for professional advice.',
    },
    {
      q: 'How do I submit an insurance claim?',
      a: 'Go to your Patient Dashboard, navigate to Insurance Policies, select your active plan, click "File Claim," upload your invoices/prescriptions, and submit. The claim will be reviewed by our team.',
    },
    {
      q: 'Are home sample collections safe?',
      a: 'Yes. We partner with ISO-certified labs. Our technicians follow strict hygiene protocols, use sterile one-time collection kits, and transport samples in temperature-controlled boxes.',
    },
  ];

  return (
    <div className="bg-white min-h-screen text-slate-800">

      {/* ── HERO SECTION ── */}
      <section className="bg-white pt-16 pb-6 px-4">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-7 border border-slate-200">
            ✦ India's Trusted Digital Healthcare Platform
          </span>

          {/* Title — Helvetica Now Display Bold */}
          <h1
            style={{
              fontFamily: "'Helvetica Now Display', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
            }}
            className="text-[44px] md:text-[66px] text-slate-900 mb-5"
          >
            Find the Right Doctor,<br />
            <span className="text-primary">Right Now.</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: '13px' }} className="text-slate-400 whitespace-nowrap mx-auto mb-8">
            Book consultations, order medicines, schedule lab tests — all from one trusted platform.
          </p>

          {/* Search Panel — tab-style card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden max-w-3xl mx-auto mb-10">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('doctor')}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'doctor'
                    ? 'text-primary border-b-2 border-primary bg-blue-50/40'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Find a Doctor
              </button>
              <button
                onClick={() => setActiveTab('medicine')}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'medicine'
                    ? 'text-primary border-b-2 border-primary bg-blue-50/40'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Order Medicine
              </button>
            </div>

            {/* Form */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                {activeTab === 'doctor' ? (
                  <motion.form
                    key="doctor"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onSubmit={handleDoctorSearch}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <div className="flex items-center flex-1 border border-slate-200 rounded-xl px-4 py-2.5 gap-2.5 bg-slate-50 focus-within:border-primary focus-within:bg-white transition-all">
                      <Stethoscope className="h-4 w-4 text-slate-400 shrink-0" />
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full bg-transparent border-none text-sm text-slate-700 focus:outline-none cursor-pointer"
                      >
                        {specialties.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center flex-1 border border-slate-200 rounded-xl px-4 py-2.5 gap-2.5 bg-slate-50 focus-within:border-primary focus-within:bg-white transition-all">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="City or Pincode"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-transparent border-none text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    >
                      <Search className="h-4 w-4" />
                      Search
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="medicine"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onSubmit={handleMedicineSearch}
                    className="flex flex-col sm:flex-row gap-3"
                  >
                    <div className="flex items-center flex-1 border border-slate-200 rounded-xl px-4 py-2.5 gap-2.5 bg-slate-50 focus-within:border-primary focus-within:bg-white transition-all">
                      <Search className="h-4 w-4 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search medicines, e.g. Paracetamol..."
                        value={medQuery}
                        onChange={(e) => setMedQuery(e.target.value)}
                        className="w-full bg-transparent border-none text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    >
                      <Search className="h-4 w-4" />
                      Search
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── HERO BANNER IMAGE — full-width below title, like reference ── */}
        <div className="max-w-6xl mx-auto relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <img
            src={medicalHeroBanner}
            alt="Medical Specialists"
            className="w-full object-cover object-[center_30%] h-[240px] sm:h-[320px] md:h-[420px] lg:h-[480px]"
          />
          {/* Dark gradient overlay — bottom to top */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

          {/* Bottom label bar — clean, centered, professional */}
          <div className="absolute bottom-0 left-0 right-0 px-8 py-4 flex items-center justify-center gap-6 text-white">
            <span className="text-sm font-medium tracking-wide opacity-90">General Physician</span>
            <span className="text-white/30">|</span>
            <span className="text-sm font-medium tracking-wide opacity-90">Cardiologist</span>
            <span className="text-white/30">|</span>
            <span className="text-sm font-medium tracking-wide opacity-90">Dermatologist</span>
            <span className="text-white/30">|</span>
            <span className="text-sm font-medium tracking-wide opacity-90">Pediatrician</span>
            <span className="text-white/30">|</span>
            <span className="text-sm font-semibold text-blue-300 tracking-wide">⚡ 37 Specialities to consult</span>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="flex items-center justify-center gap-2 text-primary mb-1">
                {s.icon}
                <span className="text-2xl font-extrabold text-slate-900">{s.value}</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <Services />

      {/* ── HEALTH PACKAGES ── */}
      <section style={{ background: '#fff', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '5rem 0' }}>
        <div className="max-w-5xl mx-auto px-6">

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Diagnostics &amp; Lab Tests
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: 0 }}>
              Popular Health Packages
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
              Comprehensive diagnostics with home sample collection. Save up to 50%.
            </p>
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', alignItems: 'stretch' }}
               className="grid-cols-1 sm:grid-cols-3">
            {[
              {
                label: 'Essential',
                name: 'Essential Care Pack',
                desc: 'Ideal for routine annual health screening.',
                price: 999,
                original: 1999,
                savings: '50%',
                tests: ['Complete Blood Count', 'Random Blood Sugar', 'Urine Routine & Microscopy', 'Serum Cholesterol'],
                highlight: false,
                deliveryNote: 'Report ready in 24 hours',
              },
              {
                label: 'Most Popular',
                name: 'Comprehensive Health',
                desc: 'Full-body wellness panel for complete peace of mind.',
                price: 2499,
                original: 4999,
                savings: '50%',
                tests: ['Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Full Lipid Profile', 'Thyroid (T3/T4/TSH)', 'ECG & Chest Analysis'],
                highlight: true,
                deliveryNote: 'Priority report in 6 hours',
              },
              {
                label: 'Senior Care',
                name: 'Senior Citizen Pack',
                desc: 'Designed for 55+ with age-specific diagnostics.',
                price: 3499,
                original: 6999,
                savings: '50%',
                tests: ['All Comprehensive Tests', 'Vitamin D3 & B12', 'HbA1c (Diabetes Panel)', 'Rheumatoid Factor', 'Bone Density Scan'],
                highlight: false,
                deliveryNote: 'Report ready in 12 hours',
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                style={{
                  background: pkg.highlight ? '#EFF6FF' : '#FAFAFA',
                  border: pkg.highlight ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                  borderRadius: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '2rem 1.75rem',
                  position: 'relative',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = pkg.highlight
                    ? '0 12px 40px rgba(37,99,235,0.14)'
                    : '0 6px 24px rgba(0,0,0,0.07)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                {/* Label badge */}
                <span style={{
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  marginBottom: '1.25rem',
                  background: pkg.highlight ? '#2563EB' : '#E2E8F0',
                  color: pkg.highlight ? '#fff' : '#64748b',
                }}>
                  {pkg.label}
                </span>

                {/* Name + desc */}
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                  {pkg.name}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  {pkg.desc}
                </p>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    ₹{pkg.price.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    ₹{pkg.original.toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, marginBottom: '1.75rem' }}>
                  Save {pkg.savings} off MRP
                </p>

                {/* Divider */}
                <div style={{ height: '1px', background: pkg.highlight ? '#BFDBFE' : '#E2E8F0', marginBottom: '1.25rem' }} />

                {/* Tests */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                  {pkg.tests.map((t) => (
                    <li key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8125rem', color: '#334155' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="7" fill={pkg.highlight ? '#2563EB' : '#E2E8F0'} />
                        <path d="M4 7l2 2 4-4" stroke={pkg.highlight ? '#fff' : '#64748b'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>

                {/* CTA button */}
                <Link to="/lab-tests">
                  <button
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.625rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: pkg.highlight ? 'none' : '1px solid #CBD5E1',
                      background: pkg.highlight ? '#2563EB' : '#fff',
                      color: pkg.highlight ? '#fff' : '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      boxShadow: pkg.highlight ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
                      marginBottom: '0.75rem',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.9'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
                  >
                    Book Now  <ArrowRight style={{ height: '0.875rem', width: '0.875rem' }} />
                  </button>
                </Link>
                <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>
                  🏠 Home collection · {pkg.deliveryNote}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* ── TESTIMONIALS ── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">What Our Users Say</h2>
          <p className="text-slate-500 mt-2 text-sm">Trusted by patients and doctors across India.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">FAQ</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqExpanded(faqExpanded === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 ml-4 transition-transform duration-200 ${faqExpanded === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {faqExpanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="bg-primary py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <HeartPulse className="h-10 w-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Take Control of Your Health Today</h2>
          <p className="text-blue-100 text-sm mb-8">Join 2 million+ patients who trust MedCare+ for their healthcare needs.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <button className="bg-white text-primary font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer text-sm">
                Create Free Account
              </button>
            </Link>
            <Link to="/doctors">
              <button className="border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-sm">
                Find a Doctor →
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
