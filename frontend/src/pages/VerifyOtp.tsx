import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { AlertCircle } from 'lucide-react';

export const VerifyOtp: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verifyOtpRequest = useAuthStore((state) => state.verifyOtpRequest);
  
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await verifyOtpRequest(email, otp);
    setIsLoading(false);

    if (result.success && result.resetToken) {
      navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(result.resetToken)}`);
    } else {
      setError(result.error || 'Incorrect code. Check verification log.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verify Code</CardTitle>
          <CardDescription>Enter the 6-digit confirmation code sent to {email || 'your email'}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-650 rounded-xl flex items-center space-x-2 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Input
              type="text"
              label="Verification Code"
              placeholder="e.g. 123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center tracking-widest text-lg font-bold"
              required
            />
            <Button type="submit" className="w-full py-3" isLoading={isLoading}>Confirm Code</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
