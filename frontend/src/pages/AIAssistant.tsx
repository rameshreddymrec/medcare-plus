import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Activity, Scale, Heart, Brain, Shield } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const suggestions = [
  'I have a headache and mild fever',
  'What is a healthy BMI range?',
  'Tips for better sleep',
  'Symptoms of high blood pressure',
];

const healthTips = [
  { icon: <Heart className="h-5 w-5" />, color: '#ef4444', bg: '#FEF2F2', title: 'Stay Hydrated', tip: 'Drink 8–10 glasses of water daily to keep your organs functioning optimally.' },
  { icon: <Activity className="h-5 w-5" />, color: '#2563EB', bg: '#EFF6FF', title: 'Exercise Daily', tip: '30 minutes of moderate activity per day reduces risk of chronic diseases by 35%.' },
  { icon: <Brain className="h-5 w-5" />, color: '#7c3aed', bg: '#F5F3FF', title: 'Mental Wellness', tip: 'Practise mindfulness for 10 minutes a day to reduce cortisol and improve focus.' },
  { icon: <Shield className="h-5 w-5" />, color: '#059669', bg: '#ECFDF5', title: 'Preventive Care', tip: 'Schedule annual health screenings — early detection saves lives.' },
];

function getBotReply(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('headache') || q.includes('fever'))
    return '🤒 For headache with mild fever, rest and stay hydrated. Take paracetamol (500–650mg) if needed. If fever exceeds 103°F or persists beyond 3 days, consult a doctor immediately.\n\n⚠️ This is educational guidance only — not a medical diagnosis.';
  if (q.includes('bmi'))
    return '📊 BMI (Body Mass Index) ranges:\n• Underweight: < 18.5\n• Normal: 18.5 – 24.9\n• Overweight: 25 – 29.9\n• Obese: ≥ 30\n\nUse our BMI calculator below for your precise score.';
  if (q.includes('sleep'))
    return '😴 Tips for better sleep:\n1. Maintain a consistent sleep schedule\n2. Avoid screens 1 hour before bed\n3. Keep your room cool (16–19°C)\n4. Avoid caffeine after 3 PM\n5. Try 4-7-8 breathing before sleep';
  if (q.includes('blood pressure') || q.includes('hypertension'))
    return '💓 Symptoms of high blood pressure:\n• Headaches (especially at the back)\n• Shortness of breath\n• Nosebleeds\n• Chest pain\n• Vision changes\n\nNote: Many people have NO symptoms. Regular monitoring is key.';
  return `Thank you for your question about "${query}". For accurate medical advice, I recommend booking a consultation with one of our verified specialists. I can help with general health information and symptom guidance.`;
}

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: '👋 Hello! I\'m your MedCare+ AI Health Assistant. I can help with symptom guidance, health tips, and general wellness advice.\n\nHow can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiResult, setBmiResult] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', text: text.trim() };
    const botMsg: Message = { role: 'assistant', text: getBotReply(text.trim()) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleBmi = () => {
    const w = parseFloat(bmiWeight);
    const h = parseFloat(bmiHeight) / 100;
    if (w > 0 && h > 0) setBmiResult(parseFloat((w / (h * h)).toFixed(1)));
  };

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
    if (bmi < 25) return { label: 'Normal', color: '#22c55e' };
    if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' };
    return { label: 'Obese', color: '#ef4444' };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Hero Header */}
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem',
          padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Bot style={{ height: '0.875rem', width: '0.875rem', color: '#2563EB' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em' }}>AI-Powered Health Tool</span>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 0.35rem' }}>AI Health Assistant</h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Symptom checker, BMI calculator &amp; personalised health tips — available 24/7.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['Symptom Checker', 'BMI Calculator', 'Health Tips'].map((tag) => (
              <span key={tag} style={{
                fontSize: '0.75rem', fontWeight: 600, color: '#2563EB',
                background: '#EFF6FF', padding: '0.3rem 0.875rem', borderRadius: '9999px',
              }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', alignItems: 'start' }}>

          {/* Chat Window */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {/* Chat header */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', background: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)', border: '2px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot style={{ height: '1rem', width: '1rem', color: '#2563EB' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>MedCare AI</p>
                <p style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600, margin: 0 }}>● Online · Always available</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.625rem' }}>
                  {msg.role === 'assistant' && (
                    <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem' }}>
                      <Bot style={{ height: '0.75rem', width: '0.75rem', color: '#2563EB' }} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '75%', padding: '0.75rem 1rem', borderRadius: '1rem',
                    background: msg.role === 'user' ? '#2563EB' : '#F8FAFC',
                    border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0',
                    color: msg.role === 'user' ? '#fff' : '#334155',
                    fontSize: '0.8125rem', lineHeight: 1.6, whiteSpace: 'pre-line',
                    borderTopRightRadius: msg.role === 'user' ? '0.25rem' : '1rem',
                    borderTopLeftRadius: msg.role === 'assistant' ? '0.25rem' : '1rem',
                  }}>
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '50%', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem' }}>
                      <User style={{ height: '0.75rem', width: '0.75rem', color: '#fff' }} />
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestion chips */}
            <div style={{ padding: '0 1.25rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {suggestions.map((s) => (
                <button key={s} onClick={() => handleSend(s)} style={{
                  fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: '9999px',
                  border: '1px solid #CBD5E1', background: '#fff', color: '#334155', cursor: 'pointer',
                }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.75rem' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe your symptoms or ask a health question..."
                style={{
                  flex: 1, padding: '0.625rem 1rem', border: '1px solid #E2E8F0', borderRadius: '0.625rem',
                  fontSize: '0.875rem', color: '#0F172A', outline: 'none', background: '#F8FAFC',
                }}
              />
              <button onClick={() => handleSend()} style={{
                padding: '0.625rem 1rem', background: '#2563EB', color: '#fff',
                border: 'none', borderRadius: '0.625rem', cursor: 'pointer', display: 'flex', alignItems: 'center',
              }}>
                <Send style={{ height: '1rem', width: '1rem' }} />
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* BMI Calculator */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Scale style={{ height: '1rem', width: '1rem', color: '#2563EB' }} />
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>BMI Calculator</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={bmiWeight}
                  onChange={(e) => setBmiWeight(e.target.value)}
                  style={{ padding: '0.625rem 0.875rem', border: '1px solid #E2E8F0', borderRadius: '0.625rem', fontSize: '0.875rem', outline: 'none', background: '#F8FAFC' }}
                />
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={bmiHeight}
                  onChange={(e) => setBmiHeight(e.target.value)}
                  style={{ padding: '0.625rem 0.875rem', border: '1px solid #E2E8F0', borderRadius: '0.625rem', fontSize: '0.875rem', outline: 'none', background: '#F8FAFC' }}
                />
                <button onClick={handleBmi} style={{
                  padding: '0.625rem', background: '#2563EB', color: '#fff',
                  border: 'none', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                }}>
                  Calculate BMI
                </button>
                {bmiResult !== null && (() => {
                  const cat = getBmiCategory(bmiResult);
                  return (
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '0.625rem', padding: '0.875rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '2rem', fontWeight: 800, color: cat.color, margin: 0 }}>{bmiResult}</p>
                      <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: cat.color, margin: '0.125rem 0 0' }}>{cat.label}</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Quick disclaimer */}
            <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '0.875rem', padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#92400e', lineHeight: 1.6, margin: 0 }}>
                ⚠️ <strong>Disclaimer:</strong> This AI provides general health information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified doctor.
              </p>
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.35rem' }}>Wellness</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>Daily Health Tips</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {healthTips.map((tip) => (
              <div key={tip.title} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: tip.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tip.color }}>
                  {tip.icon}
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{tip.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
