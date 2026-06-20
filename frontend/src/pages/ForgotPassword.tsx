import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const forgotPasswordRequest = useAuthStore((state) => state.forgotPasswordRequest);
  
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await forgotPasswordRequest(email);
    setIsLoading(false);

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 1500);
    } else {
      setError(result.error || 'Failed to send OTP code');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Recover Password</CardTitle>
          <CardDescription>We will send a validation code to verify your identity</CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <div className="text-primary text-xl font-bold">Verification Code Sent!</div>
              <p className="text-slate-500 text-sm">Please check your inbox. Directing you to the verification screen...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-650 rounded-xl flex items-center space-x-2 text-xs font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <Input
                type="email"
                label="Registered Email"
                placeholder="e.g. name@domain.com"
                leftIcon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full py-3" isLoading={isLoading}>Send Recovery Code</Button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-sm text-slate-500">
            <Link to="/login" className="text-slate-500 hover:text-primary font-medium inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
