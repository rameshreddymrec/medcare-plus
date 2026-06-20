import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      num: '01',
      label: 'Find Doctors',
      tag: 'Consultation',
      desc: 'Book in-clinic or video appointments with 15,000+ verified specialists across 37 specialities.',
      href: '/doctors',
      accent: 'group-hover:text-blue-600',
      bar: 'bg-blue-600',
    },
    {
      num: '02',
      label: 'Pharmacy',
      tag: 'Medicines',
      desc: 'Upload prescriptions, order branded & generic medicines with same-day doorstep delivery.',
      href: '/pharmacy',
      accent: 'group-hover:text-teal-600',
      bar: 'bg-teal-500',
    },
    {
      num: '03',
      label: 'Lab Tests',
      tag: 'Diagnostics',
      desc: 'Book 500+ lab tests online with home sample collection. Get reports within 6 hours.',
      href: '/lab-tests',
      accent: 'group-hover:text-emerald-600',
      bar: 'bg-emerald-500',
    },
    {
      num: '04',
      label: 'Insurance',
      tag: 'Health Plans',
      desc: 'Compare top health insurance plans, manage claims, and get cashless hospitalization benefits.',
      href: '/insurance',
      accent: 'group-hover:text-violet-600',
      bar: 'bg-violet-500',
    },
    {
      num: '05',
      label: 'AI Assistant',
      tag: 'Smart Health',
      desc: 'Check symptoms, calculate BMI, and get personalized wellness guidance — available 24/7.',
      href: '/ai-assistant',
      accent: 'group-hover:text-indigo-600',
      bar: 'bg-indigo-500',
    },
    {
      num: '06',
      label: 'Emergency',
      tag: 'SOS Support',
      desc: 'Trigger SOS alerts, find the nearest hospital, and access blood bank search instantly.',
      href: '/emergency',
      accent: 'group-hover:text-red-600',
      bar: 'bg-red-500',
    },
  ];

  return (
    <section className="py-16 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">What We Offer</p>
            <h2 className="text-3xl font-bold text-slate-900">Our Services</h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">Tap any service to explore</span>
        </div>

        {/* Numbered service rows */}
        <div className="divide-y divide-slate-100">
          {services.map((s) => (
            <Link
              key={s.num}
              to={s.href}
              className="group flex items-start sm:items-center gap-6 py-7 relative overflow-hidden transition-all duration-200 hover:pl-3"
            >
              {/* Accent bar on hover */}
              <span className={`absolute left-0 top-0 bottom-0 w-0.5 ${s.bar} opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full`} />

              {/* Number */}
              <span className={`text-sm font-bold text-slate-300 w-8 shrink-0 transition-colors duration-200 ${s.accent}`}>{s.num}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className={`text-xl font-bold text-slate-900 transition-colors duration-200 ${s.accent}`}>{s.label}</h3>
                  <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full uppercase tracking-widest">{s.tag}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{s.desc}</p>
              </div>

              {/* Arrow */}
              <ArrowRight className={`h-5 w-5 text-slate-300 shrink-0 transition-all duration-200 group-hover:translate-x-1 ${s.accent}`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
