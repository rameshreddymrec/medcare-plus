import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import type { UserRole } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Lock, Mail, ArrowRight, ShieldCheck, Stethoscope, Award, Users, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const loginWithCredentials = useAuthStore((state) => state.loginWithCredentials);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectByRole = (userRole: UserRole) => {
    if (userRole === 'DOCTOR') {
      navigate('/dashboard/doctor');
    } else if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      navigate('/dashboard/admin');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Don't send role as a constraint — let the backend return the actual user role.
    // This way admins can log in without needing an admin tab.
    const result = await loginWithCredentials(email, password, undefined);
    setIsLoading(false);

    if (result.success && result.user) {
      redirectByRole(result.user.role);
    } else {
      setError(result.error || 'Invalid credentials. Please check your email and password.');
    }
  };


  // Social login uses known demo credentials based on selected role tab
  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setError('');
    
    // Map the selected role tab to a real seeded demo account
    const demoCredentials: Record<string, { email: string; password: string; role: UserRole }> = {
      PATIENT: { email: 'patient@medcareplus.com', password: 'patient123', role: 'PATIENT' },
      DOCTOR: { email: 'dr.kumar@medcareplus.com', password: 'doctor123', role: 'DOCTOR' },
    };

    const demo = demoCredentials[role] || demoCredentials.PATIENT;

    setTimeout(async () => {
      const result = await loginWithCredentials(demo.email, demo.password, demo.role);
      setIsLoading(false);
      if (result.success && result.user) {
        redirectByRole(result.user.role);
      } else {
        setError(`${provider} sign-in failed. Please use email/password login instead.`);
      }
    }, 800);
  };

  const roles = [
    { value: 'PATIENT', label: 'Patient', desc: 'Book tests & consults', icon: <Users className="h-4 w-4" /> },
    { value: 'DOCTOR', label: 'Doctor', desc: 'Manage patients', icon: <Stethoscope className="h-4 w-4" /> },
  ];

  // Demo credentials hint (only for Patient & Doctor tabs)
  const demoHints: Record<string, string> = {
    PATIENT: 'Demo: patient@medcareplus.com / patient123',
    DOCTOR: 'Demo: dr.kumar@medcareplus.com / doctor123',
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      
      {/* Left panel: Clinical Brand Stats Hero */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          position: 'relative'
        }}
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 text-white overflow-hidden"
      >
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[120px]" />
        


        {/* Messaging */}
        <div className="space-y-6 relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Unified Healthcare,<br />
            <span className="text-blue-400">Simplified for You.</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Consolidate your diagnostic screening reports, prescriptions, insurance claims, and consultations in a single secure environment.
          </p>
        </div>


        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-6 pt-10 border-t border-slate-800 relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-blue-400 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">2 Million+</p>
              <p className="text-xs text-slate-500 font-semibold">Patients Served</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-blue-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">100% Secure</p>
              <p className="text-xs text-slate-500 font-semibold">ISO 27001 Certified</p>
            </div>
          </div>
        </div>

      </div>

      {/* Right panel: Login Form container */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md border-slate-200/80 shadow-md">
          <CardHeader className="text-center pb-4">
            <Badge variant="primary" pill className="w-fit mx-auto mb-2 px-2.5 py-0.5 bg-blue-600 text-white border-none shadow-sm">
              🔑 SECURE SESSION
            </Badge>
            <CardTitle className="text-2xl font-black text-slate-850">Welcome Back</CardTitle>
            <CardDescription className="text-xs">Log in to access your MedCare+ digital workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-650 rounded-xl flex items-center space-x-2 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              {/* Role selector - used for social login demo selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  I am a... <span className="font-normal normal-case">(for demo social login)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => {
                    const active = role === r.value;
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value as UserRole)}
                        style={{
                          border: active ? '1.5px solid #2563EB' : '1.5px solid #E2E8F0',
                          background: active ? '#EFF6FF' : '#fff',
                        }}
                        className="p-3 rounded-xl flex flex-col items-center text-center gap-1 transition-all cursor-pointer"
                      >
                        <div style={{ color: active ? '#2563EB' : '#64748b' }}>
                          {r.icon}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: active ? '#1E3A8A' : '#334155' }}>
                          {r.label}
                        </span>
                        <span className="text-[8px] text-slate-400 leading-none hidden sm:inline">
                          {r.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {/* Demo hint for selected tab */}
                <p className="text-[10px] text-slate-400 font-medium pl-1">
                  💡 {demoHints[role] || 'Enter your email and password below'}
                </p>
              </div>


              <Input
                type="email"
                label="Email Address"
                placeholder="e.g. user@medcareplus.com"
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border-slate-200"
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your account password"
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl border-slate-200"
              />

              <div className="flex justify-between items-center text-xs">
                <Link to="/forgot-password" className="text-blue-600 hover:underline font-semibold transition-all">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full text-center py-3 mt-1 font-bold rounded-xl cursor-pointer"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In to Ecosystem
              </Button>
            </form>

            <div className="relative my-5 text-center">
              <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-100" />
              <span className="relative bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Continue With</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading}
                className="flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-60"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                disabled={isLoading}
                className="flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-colors py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-60"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.79 16.2 3.5 9.77 7.03 9.47c1.72.15 2.76 1.12 3.65 1.12.87 0 2.22-1.22 4.28-1.02 1.64.15 2.92.93 3.58 2.06-3.25 1.96-2.52 6.14.93 7.55-.7 1.7-1.57 3.3-2.42 4.12zM15.1 6.8c.88-1.12.78-2.62.13-3.48-1.05.12-2.3 1.05-2.73 2.16-.48.98-.38 2.4.28 3.2 1.25-.13 2.16-.95 2.32-1.88z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 font-bold hover:underline ml-1">
                Create an account
              </Link>
            </div>

          </CardContent>
        </Card>
      </div>

    </div>
  );
};
