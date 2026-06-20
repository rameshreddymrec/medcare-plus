import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import { useAuthStore } from '../store/useAuthStore';
import { 
  ShieldCheck, ArrowRight, Phone, Clock, Users, TrendingUp, 
  CreditCard, Lock, AlertCircle, Check 
} from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

const plans = [
  {
    label: 'Individual',
    name: 'Basic Shield',
    desc: 'Essential coverage for individuals with low health risk.',
    price: 499,
    annual: 4999,
    coverage: '₹2 Lakh',
    features: ['Hospitalization Cover', 'Day Care Procedures', 'Ambulance Charges', 'Pre & Post Hospitalization'],
    highlight: false,
  },
  {
    label: 'Most Popular',
    name: 'Family Shield',
    desc: 'Complete family protection with cashless hospitalization.',
    price: 1299,
    annual: 12999,
    coverage: '₹10 Lakh',
    features: ['Everything in Basic +', 'Family Floater Cover', 'Maternity & Newborn', 'Critical Illness Rider', 'No Claim Bonus 10%', 'Cashless Network'],
    highlight: true,
  },
  {
    label: 'Senior Care',
    name: 'Senior Shield',
    desc: 'Tailored for 55+ with age-specific medical conditions.',
    price: 2199,
    annual: 21999,
    coverage: '₹20 Lakh',
    features: ['Everything in Family +', 'Pre-Existing Disease Cover', 'OPD & Dental Cover', 'Annual Health Check-up', 'Priority Claims Support'],
    highlight: false,
  },
];

const steps = [
  { icon: '📋', step: '01', title: 'Compare Plans', desc: 'Browse and compare plans based on coverage, premium, and network hospitals.' },
  { icon: '✅', step: '02', title: 'Buy Online', desc: 'Complete your KYC and pay securely online. Policy issued in minutes.' },
  { icon: '🏥', step: '03', title: 'Get Cashless Care', desc: 'Walk into any of 5,000+ network hospitals and get cashless treatment.' },
  { icon: '💰', step: '04', title: 'Easy Claims', desc: 'File a claim from your dashboard. Get reimbursement within 7 working days.' },
];

const stats = [
  { icon: <Users className="h-5 w-5" />, value: '2M+', label: 'Insured Members' },
  { icon: <ShieldCheck className="h-5 w-5" />, value: '5,000+', label: 'Network Hospitals' },
  { icon: <TrendingUp className="h-5 w-5" />, value: '98%', label: 'Claims Settled' },
  { icon: <Clock className="h-5 w-5" />, value: '7 Days', label: 'Avg. Reimbursement' },
];

export const Insurance: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [billingAnnual, setBillingAnnual] = useState(false);

  // Stripe & Purchase Checkout States
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [purchasedPolicyNumber, setPurchasedPolicyNumber] = useState('');

  // Handle plan purchase click
  const handleGetPlanClick = (plan: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedPlan(plan);
    setCardNumber('');
    setCardName(user.name || '');
    setCardExpiry('');
    setCardCvc('');
    setPaymentError('');
    setShowStripeModal(true);
  };

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted.substring(0, 19)); // 16 digits + 3 spaces
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length > 2) {
      formatted = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardExpiry(formatted.substring(0, 5));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCardCvc(val.substring(0, 4));
  };

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setPaymentError('Stripe transaction declined: Invalid credit card length');
      return;
    }
    if (!cardName.trim()) {
      setPaymentError('Cardholder name is required');
      return;
    }
    if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
      setPaymentError('Expiry date is invalid');
      return;
    }
    if (cardCvc.length < 3) {
      setPaymentError('CVC is invalid');
      return;
    }

    setProcessing(true);
    setPaymentError('');

    const premiumAmount = billingAnnual ? selectedPlan.annual : selectedPlan.price;
    const payload = {
      planName: selectedPlan.name,
      premiumAmount,
      billingCycle: billingAnnual ? 'annual' : 'monthly',
      cardNumber,
      cardName,
    };

    try {
      const response = await axios.post(`${API_BASE}/payment/checkout-insurance`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        setProcessing(false);
        setPurchasedPolicyNumber(response.data?.data?.policyNumber || 'MC-MOCK');
        setShowStripeModal(false);
        setCheckoutComplete(true);
        setOfflineMode(false);
      } else {
        setPaymentError(response.data?.message || 'Transaction failed');
        setProcessing(false);
      }
    } catch (err: any) {
      console.warn('[MedCare+ Insurance Checkout] Failed to connect to server. Simulating fallback offline transaction...');
      if (!err.response) {
        // Backend offline fallback mode
        setTimeout(() => {
          setProcessing(false);
          const policyNo = 'MC-' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
          setPurchasedPolicyNumber(policyNo);
          
          // Write simulated policy details to localStorage
          const simulatedPolicy = {
            id: `policy_${Math.random().toString(36).substring(2, 9)}`,
            policyNumber: policyNo,
            startDate: new Date().toISOString(),
            endDate: billingAnnual 
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            plan: {
              name: selectedPlan.name,
              providerName: 'MedCare+ Shield',
              description: `Health insurance policy for ${selectedPlan.name}`,
              premiumMonthly: billingAnnual ? Math.round(Number(premiumAmount) / 12) : Number(premiumAmount),
              coverageLimit: selectedPlan.name.includes('Basic') ? 200000.0 : selectedPlan.name.includes('Family') ? 1000000.0 : 2000000.0,
              coPayPercent: 10.0,
            },
            claims: []
          };
          localStorage.setItem('medcare-simulated-policy', JSON.stringify(simulatedPolicy));

          setShowStripeModal(false);
          setCheckoutComplete(true);
          setOfflineMode(true);
        }, 1500);
      } else {
        setPaymentError(err.response?.data?.message || 'Stripe card authorization failed.');
        setProcessing(false);
      }
    }
  };

  const getPlanPrice = (plan: any) => {
    return billingAnnual ? plan.annual : plan.price;
  };

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      {/* Checkout Success Overlay */}
      <AnimatePresence>
        {checkoutComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6"
            >
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800">Policy Activated!</h2>
                <p className="text-slate-500 text-sm">
                  Your payment for <strong>{selectedPlan?.name}</strong> has been processed successfully.
                </p>
              </div>

              {offlineMode && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600 animate-pulse" />
                  <span>Offline Sandbox Mode: Transaction simulated locally.</span>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-left space-y-3.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Policy Holder:</span>
                  <span className="font-bold text-slate-800">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Policy Number:</span>
                  <span className="font-mono font-bold text-blue-600 tracking-wider">{purchasedPolicyNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Coverage Limit:</span>
                  <span className="font-bold text-slate-800">{selectedPlan?.coverage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-semibold">Billing Cycle:</span>
                  <span className="font-bold text-slate-800 capitalize">{billingAnnual ? 'Annual' : 'Monthly'}</span>
                </div>
              </div>

              <Button size="lg" className="w-full" onClick={() => navigate('/dashboard/insurance')}>
                Manage Policy in Dashboard
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stripe Modal Checkout Overlay */}
      <AnimatePresence>
        {showStripeModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col"
            >
              {/* Stripe Header */}
              <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-[#635BFF] text-white rounded-lg flex items-center justify-center font-black text-lg tracking-tighter">
                    S
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-slate-800">Secure Checkout</h3>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Lock className="h-3 w-3 text-emerald-500" /> Powered by Stripe Gateway
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStripeModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
                <div className="flex justify-between items-center text-sm font-bold border-b border-dashed border-slate-100 pb-3">
                  <span className="text-slate-500 font-semibold">{selectedPlan.name} ({billingAnnual ? 'Annual' : 'Monthly'}):</span>
                  <span className="text-slate-800 text-lg">₹{getPlanPrice(selectedPlan).toLocaleString()}</span>
                </div>

                {/* Interactive Card Graphic */}
                <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-start">
                    <div className="w-11 h-8 rounded-lg bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center overflow-hidden">
                      <div className="w-7 h-5 border border-yellow-400/50 rounded flex flex-wrap opacity-85" />
                    </div>
                    <span className="font-bold tracking-widest text-xs text-white/95 uppercase italic flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MASTERCARD' : 'SECURE'}
                    </span>
                  </div>

                  <div className="text-lg font-mono tracking-widest text-center my-2 text-white">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-left">
                      <span className="text-[8px] uppercase tracking-wider text-slate-300 block">Card Holder</span>
                      <span className="font-semibold text-xs tracking-wide block truncate max-w-[170px]">
                        {cardName.toUpperCase() || 'YOUR NAME'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-wider text-slate-300 block">Expires</span>
                      <span className="font-semibold text-xs tracking-wide block">
                        {cardExpiry || 'MM/YY'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Input elements */}
                <form onSubmit={handleStripePayment} className="space-y-4">
                  {paymentError && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2 border border-red-200">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-left">{paymentError}</span>
                    </div>
                  )}

                  <Input
                    label="Cardholder Name"
                    placeholder="e.g. John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />

                  <Input
                    label="Card Number"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      required
                    />
                    <Input
                      label="CVC / CVV"
                      placeholder="e.g. 123"
                      type="password"
                      value={cardCvc}
                      onChange={handleCvcChange}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-[#635BFF] hover:bg-[#5249f0] border-none text-white text-sm"
                      isLoading={processing}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Pay ₹{getPlanPrice(selectedPlan).toLocaleString()} securely</span>
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">

        {/* Hero Header */}
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem',
          padding: '2.5rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '2rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <ShieldCheck style={{ height: '0.875rem', width: '0.875rem', color: '#2563EB' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Health Insurance</span>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 0.4rem' }}>
              Health Insurance Ecosystem
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, maxWidth: '28rem' }}>
              Compare, buy, and manage health insurance plans from India's top providers. Cashless treatment at 5,000+ hospitals.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a href="tel:1800-XXX-XXXX">
              <button style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1.25rem', background: '#F1F5F9', color: '#334155',
                border: '1px solid #CBD5E1', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              }}>
                <Phone style={{ height: '0.875rem', width: '0.875rem' }} />
                Talk to Expert
              </button>
            </a>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.625rem 1.25rem', background: '#2563EB', color: '#fff',
              border: 'none', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            }} onClick={() => handleGetPlanClick(plans[1])}>
              Get Free Quote <ArrowRight style={{ height: '0.875rem', width: '0.875rem' }} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, index) => (
            <div key={index} style={{
              background: '#fff', border: '1px solid #E2E8F0', borderRadius: '0.875rem',
              padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
            }}>
              <div style={{ color: '#2563EB', background: '#EFF6FF', padding: '0.625rem', borderRadius: '0.625rem', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div>
          {/* Section heading + billing toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.35rem' }}>Plans & Pricing</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Choose Your Plan</h2>
            </div>
            {/* Billing toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F1F5F9', padding: '0.375rem 0.875rem', borderRadius: '9999px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: billingAnnual ? '#94a3b8' : '#0F172A' }}>Monthly</span>
              <button
                onClick={() => setBillingAnnual(!billingAnnual)}
                style={{
                  width: '2.5rem', height: '1.4rem', borderRadius: '9999px', border: 'none', cursor: 'pointer', position: 'relative',
                  background: billingAnnual ? '#2563EB' : '#CBD5E1', transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '0.175rem', left: billingAnnual ? '1.175rem' : '0.175rem',
                  width: '1.05rem', height: '1.05rem', background: '#fff', borderRadius: '50%', transition: 'left 0.2s',
                }} />
              </button>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: billingAnnual ? '#0F172A' : '#94a3b8' }}>
                Annual <span style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 700 }}>Save 17%</span>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
            {plans.map((plan) => (
              <div key={plan.name} style={{
                background: plan.highlight ? '#EFF6FF' : '#fff',
                border: plan.highlight ? '1.5px solid #BFDBFE' : '1px solid #E2E8F0',
                borderRadius: '1rem', padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column',
                transform: plan.highlight ? 'translateY(-6px)' : 'none',
                boxShadow: plan.highlight ? '0 12px 40px rgba(37,99,235,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <span style={{
                  alignSelf: 'flex-start', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.1em', padding: '0.2rem 0.65rem', borderRadius: '9999px', marginBottom: '1.25rem',
                  background: plan.highlight ? '#2563EB' : '#E2E8F0', color: plan.highlight ? '#fff' : '#64748b',
                }}>{plan.label}</span>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>{plan.name}</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.6 }}>{plan.desc}</p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    ₹{getPlanPrice(plan).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>/{billingAnnual ? 'yr' : 'mo'}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Coverage up to <strong>{plan.coverage}</strong>
                </p>
                <div style={{ height: '1px', background: plan.highlight ? '#BFDBFE' : '#E2E8F0', margin: '1.25rem 0' }} />

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8125rem', color: '#334155' }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="7" fill={plan.highlight ? '#2563EB' : '#E2E8F0'} />
                        <path d="M4 7l2 2 4-4" stroke={plan.highlight ? '#fff' : '#64748b'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleGetPlanClick(plan)}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '0.625rem', fontSize: '0.875rem', fontWeight: 700,
                    cursor: 'pointer', border: plan.highlight ? 'none' : '1px solid #CBD5E1',
                    background: plan.highlight ? '#2563EB' : '#fff', color: plan.highlight ? '#fff' : '#0F172A',
                    boxShadow: plan.highlight ? '0 4px 14px rgba(37,99,235,0.28)' : 'none',
                    display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '0.4rem',
                    textAlign: 'center', justifyContent: 'center'
                  }}
                >
                  Get This Plan <ArrowRight style={{ height: '0.875rem', width: '0.875rem' }} />
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.75rem' }}>
                  No hidden fees · Cancel anytime
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.35rem' }}>How It Works</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Simple 4-Step Process</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {steps.map((s) => (
              <div key={s.step} style={{
                background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem',
                padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
              }}>
                <div style={{ fontSize: '1.75rem' }}>{s.icon}</div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Step {s.step}</span>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{s.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
